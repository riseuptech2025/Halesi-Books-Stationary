// backend/api/auth/register.cjs
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

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    const existing = await users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const doc = {
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      phone: phone ? String(phone).trim() : "",
      password: hashed,
      role: "user",
      wishlist: [],
      cart: [],
      createdAt: new Date(),
    };

    const result = await users.insertOne(doc);

    const token = signToken({
      id: result.insertedId.toString(),
      email: doc.email,
      role: "user",
    });

    return res.status(201).json({
      token,
      user: {
        id: result.insertedId.toString(),
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        role: "user",
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};