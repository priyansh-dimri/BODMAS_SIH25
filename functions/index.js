const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();
app.use(express.json());

// Session configuration for Firebase Functions
app.use(session({
  secret: process.env.SESSION_SECRET || "fallbackSessionSecret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true } // HTTPS in production
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Secret (we'll set from Firebase later)
const jwtSecret = process.env.JWT_SECRET || "fallbackSecret";

// In-memory OTP storage (later move to Firestore)
let otpStore = {};
let userStore = {};

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = userStore[profile.id];
    
    if (!user) {
      user = {
        id: uuidv4(),
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        role: 'Tourist',
        avatar: profile.photos[0].value
      };
      userStore[profile.id] = user;
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
  const user = userStore[id] || Object.values(userStore).find(u => u.id === id);
  done(null, user);
});

// Helper function to generate JWT
function generateJWT(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: '7d' }
  );
}

// Pairing endpoint
app.post("/auth/pair", (req, res) => {
  const { qrCodeData } = req.body;
  if (!qrCodeData) {
    return res.status(400).json({ error: "QR code data missing" });
  }
  const user = { id: uuidv4(), name: "Guest User", role: "Tourist" };
  const token = generateJWT(user);
  res.json({ token, user });
});

// OTP request
app.post("/auth/otp/request", (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) {
    return res.status(400).json({ error: "Mobile number required" });
  }
  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore[mobileNumber] = otp;
  console.log(`OTP for ${mobileNumber}: ${otp}`);
  res.json({ message: "OTP sent successfully." });
});

// OTP verify
app.post("/auth/otp/verify", (req, res) => {
  const { mobileNumber, otp } = req.body;
  if (otpStore[mobileNumber] === otp) {
    const user = { id: uuidv4(), name: "Tourist User", role: "Tourist" };
    const token = generateJWT(user);
    delete otpStore[mobileNumber];
    return res.json({ token, user });
  }
  res.status(401).json({ error: "Invalid OTP" });
});

// Google OAuth routes
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

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
  }
);

app.get('/auth/google/failure', (req, res) => {
  res.status(401).json({ 
    error: 'Google authentication failed',
    message: 'Unable to authenticate with Google' 
  });
});

// Export Firebase Function
exports.api = onRequest(app);
