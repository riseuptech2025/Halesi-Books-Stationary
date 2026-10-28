// backend/api/auth/signup-verify.cjs
const { connectToDatabase } = require("../lib/db.cjs");
const { signToken } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");
const { verifyOtp, consumeOtp } = require("../lib/otp.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const result = await verifyOtp({ email, code });
    if (!result.ok) {
      const map = {
        "no-code": "No verification code found. Please request a new one.",
        expired: "Verification code has expired. Please request a new one.",
        "too-many-attempts":
          "Too many incorrect attempts. Please request a new code.",
        "wrong-code": "Incorrect code. Please try again.",
      };
      return res
        .status(400)
        .json({ message: map[result.reason] || "Invalid code" });
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    const pu = result.pendingUser;
    if (!pu || !pu.email) {
      return res.status(400).json({ message: "Invalid pending signup" });
    }

    // Email might have been claimed in the meantime
    const existing = await users.findOne({ email: pu.email });
    if (existing) {
      await consumeOtp(result.otpId);
      return res.status(409).json({ message: "Email already registered" });
    }

    const doc = {
      name: pu.name,
      email: pu.email,
      phone: pu.phone || "",
      password: pu.passwordHash,
      role: "user",
      emailVerified: true,
      wishlist: [],
      cart: [],
      createdAt: new Date(),
    };

    const insert = await users.insertOne(doc);
    await consumeOtp(result.otpId);

    const token = signToken({
      id: insert.insertedId.toString(),
      email: doc.email,
      role: "user",
    });

    return res.status(201).json({
      token,
      user: {
        id: insert.insertedId.toString(),
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        role: "user",
      },
    });
  } catch (err) {
    console.error("signup-verify error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};