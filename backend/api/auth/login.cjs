// backend/api/auth/login.cjs
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
    const admins = db.collection("admins");

    let admin = await admins.findOne({ email: email.toLowerCase() });

    // Bootstrap first admin
    if (!admin) {
      const count = await admins.countDocuments();
      if (count === 0 && email.toLowerCase() === process.env.ADMIN_EMAIL) {
        const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
        const doc = {
          name: "Super Admin",
          email: process.env.ADMIN_EMAIL,
          password: hashed,
          role: "admin",
          createdAt: new Date(),
        };
        const result = await admins.insertOne(doc);
        admin = { ...doc, _id: result.insertedId };
      }
    }

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    return res.status(200).json({
      token,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};