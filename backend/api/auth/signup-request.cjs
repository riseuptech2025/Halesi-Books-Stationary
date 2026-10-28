// backend/api/auth/signup-request.cjs
const bcrypt = require("bcryptjs");
const { connectToDatabase } = require("../lib/db.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");
const { sendOtpEmail } = require("../lib/mailer.cjs");
const { issueOtp } = require("../lib/otp.cjs");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, password, phone } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }
    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    if (!EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    const existing = await users.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const pendingUser = {
      name: String(name).trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : "",
      passwordHash,
      role: "user",
    };

    const { code, expiresAt, ttlMin } = await issueOtp({
      email: cleanEmail,
      pendingUser,
    });

    // Send the OTP email
    try {
      await sendOtpEmail({ to: cleanEmail, name: pendingUser.name, code });
    } catch (mailErr) {
      console.error("OTP email send failed:", mailErr);
      return res.status(500).json({
        message:
          "Failed to send verification email. Please check your email address or try again shortly.",
      });
    }

    return res.status(200).json({
      message: "Verification code sent to your email",
      email: cleanEmail,
      expiresAt,
      ttlMinutes: ttlMin,
    });
  } catch (err) {
    console.error("signup-request error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};