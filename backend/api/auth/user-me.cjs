// backend/api/auth/user-me.cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../lib/db.cjs");
const { getUserFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { db } = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.id) });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: "user",
    });
  } catch (err) {
    console.error("User me error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};