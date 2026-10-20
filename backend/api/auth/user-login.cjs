// backend/api/auth/user-login.cjs
const bcrypt = require("bcryptjs");
const { connectToDatabase } = require("../lib/db.cjs");
const { signToken } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const { db } = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: "user",
    });

    return res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: "user",
      },
    });
  } catch (err) {
    console.error("User login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};