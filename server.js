require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set true with HTTPS in production
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ------------------- In-Memory Stores -------------------
const users = new Map(); // key: mobileNumber, qrId, or googleId → value: { id, name, role, email }
const otps = new Map();  // key: mobileNumber → value: { otp, expiresAt }

// ------------------- Helper: Generate JWT -------------------
function generateJWT(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ------------------- Google OAuth Strategy -------------------
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = users.get(profile.id);
    
    if (!user) {
      user = {
        id: uuidv4(),
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        role: 'Tourist',
        avatar: profile.photos[0].value
      };
      users.set(profile.id, user);
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.googleId || user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.get(id) || Array.from(users.values()).find(u => u.id === id);
  done(null, user);
});

// ------------------- 1. QR Pairing -------------------
app.post('/auth/pair', (req, res) => {
  const { qrCodeData } = req.body;
  if (!qrCodeData) return res.status(400).json({ error: 'qrCodeData required' });

  let user = users.get(qrCodeData);
  if (!user) {
    user = { id: uuidv4(), name: 'Guest User', role: 'Tourist' };
    users.set(qrCodeData, user);
  }
  const token = generateJWT(user);
  return res.json({ token, user });
});

// ------------------- 2. Request OTP -------------------
app.post('/auth/otp/request', (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) return res.status(400).json({ error: 'mobileNumber required' });

  let user = users.get(mobileNumber);
  if (!user) {
    user = { id: uuidv4(), name: 'Tourist User', role: 'Tourist' };
    users.set(mobileNumber, user);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60000;
  otps.set(mobileNumber, { otp, expiresAt });

  // For demo only — log OTP
  console.log(`OTP for ${mobileNumber}: ${otp}`);

  return res.json({ message: 'OTP sent successfully.' });
});

// ------------------- 3. Verify OTP -------------------
app.post('/auth/otp/verify', (req, res) => {
  const { mobileNumber, otp } = req.body;
  if (!mobileNumber || !otp) return res.status(400).json({ error: 'mobileNumber and otp required' });

  const record = otps.get(mobileNumber);
  if (!record) return res.status(400).json({ error: 'No OTP requested' });

  if (Date.now() > record.expiresAt) {
    otps.delete(mobileNumber);
    return res.status(400).json({ error: 'OTP expired' });
  }

  if (record.otp !== otp) {
    otps.delete(mobileNumber);
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  otps.delete(mobileNumber);
  let user = users.get(mobileNumber);

  const token = generateJWT(user);
  return res.json({ token, user });
});

// ------------------- 4. Google OAuth Routes -------------------
// Initiate Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/google/failure' }),
  (req, res) => {
    const token = generateJWT(req.user);
    res.json({
      success: true,
      token,
      user: req.user,
      message: 'Google authentication successful'
    });
});

// Google OAuth failure route
app.get('/auth/google/failure', (req, res) => {
  res.status(401).json({
    error: 'Google authentication failed',
    message: 'Unable to authenticate with Google'
  });
});

// ------------------- 5. Get User Profile (Protected Route) -------------------
app.get('/auth/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// ------------------- Middleware: Authenticate JWT Token -------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// ------------------- Google ID Token Verify Endpoint -------------------
app.post('/auth/google/callback', async (req, res) => {
  const { idToken } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const user = { id: payload.sub, name: payload.name, email: payload.email, role: 'Tourist' };
    const token = generateJWT(user);
    res.json({ token, user });
  } catch (e) {
    console.error('Google token verify failed', e);
    res.status(401).json({ error: 'Invalid Google ID token' });
  }
});

// ------------------- Error Handler -------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth API running on ${PORT}`));