require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// ----------------- In-Memory Stores -----------------
const users = new Map(); // key: mobileNumber or qrId → value: { id, name, role }
const otps = new Map();  // key: mobileNumber → value: { otp, expiresAt }

// ----------------- Helper: Generate JWT -----------------
function generateJWT(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ----------------- 1. QR Pairing -----------------
app.post('/auth/pair', (req, res) => {
  const { qrCodeData } = req.body;
  if (!qrCodeData) return res.status(400).json({ error: 'qrCodeData required' });

  // Fake validation (for hackathon, any string works)
  let user = users.get(qrCodeData);
  if (!user) {
    user = { id: uuidv4(), name: 'Guest User', role: 'Tourist' };
    users.set(qrCodeData, user);
  }

  const token = generateJWT(user);
  return res.json({ token, user });
});

// ----------------- 2. Request OTP -----------------
app.post('/auth/otp/request', (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) return res.status(400).json({ error: 'mobileNumber required' });

  // Create/fetch user
  let user = users.get(mobileNumber);
  if (!user) {
    user = { id: uuidv4(), name: 'Tourist User', role: 'Tourist' };
    users.set(mobileNumber, user);
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES) * 60000;
  otps.set(mobileNumber, { otp, expiresAt });

  // For hackathon demo → just log OTP
  console.log(`OTP for ${mobileNumber}: ${otp}`);

  return res.json({ message: 'OTP sent successfully.' });
});

// ----------------- 3. Verify OTP -----------------
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
    otps.delete(mobileNumber); // delete on failure too
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  otps.delete(mobileNumber); // delete after success
  let user = users.get(mobileNumber);

  const token = generateJWT(user);
  return res.json({ token, user });
});

// ----------------- Error Handler -----------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 4000;   // changed default
app.listen(PORT, () => console.log(`Auth API running on ${PORT}`));