// backend/api/auth/me.cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../lib/db.cjs");
const { getAdminFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getAdminFromRequest(req);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { db } = await connectToDatabase();
    const admin = await db
      .collection("admins")
      .findOne({ _id: new ObjectId(decoded.id) });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.status(200).json({
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};