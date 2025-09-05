const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

// Secret (we’ll set from Firebase later)
const jwtSecret = process.env.JWT_SECRET || "fallbackSecret";

// In-memory OTP storage (later move to Firestore)
let otpStore = {};

// Pairing endpoint
app.post("/auth/pair", (req, res) => {
  const { qrCodeData } = req.body;
  if (!qrCodeData) {
    return res.status(400).json({ error: "QR code data missing" });
  }
  const user = { id: uuidv4(), name: "Guest User", role: "Tourist" };
  const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn: "7d" });
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
    const token = jwt.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn: "7d" });
    delete otpStore[mobileNumber];
    return res.json({ token, user });
  }
  res.status(401).json({ error: "Invalid OTP" });
});

// Export Firebase Function
exports.api = onRequest(app);