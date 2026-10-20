// backend/api/user/password.cjs
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const { connectToDatabase } = require("../lib/db.cjs");
const { getUserFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }
    if (String(newPassword).length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");
    const _id = new ObjectId(decoded.id);

    const user = await users.findOne({ _id });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await users.updateOne(
      { _id },
      { $set: { password: hashed, updatedAt: new Date() } }
    );

    return res.status(200).json({ message: "Password updated" });
  } catch (err) {
    console.error("Password error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};