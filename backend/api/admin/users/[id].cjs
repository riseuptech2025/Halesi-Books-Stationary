// backend/api/admin/users/[id].cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../../lib/db.cjs");
const { getAdminFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getAdminFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const id = req.query?.id || req.params?.id;
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const { db } = await connectToDatabase();
  const users = db.collection("users");
  const _id = new ObjectId(id);

  try {
    if (req.method === "PUT") {
      const { blocked } = req.body || {};
      await users.updateOne(
        { _id },
        { $set: { blocked: !!blocked, updatedAt: new Date() } }
      );
      const user = await users.findOne({ _id });
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        blocked: !!user.blocked,
      });
    }

    if (req.method === "DELETE") {
      await users.deleteOne({ _id });
      return res.status(200).json({ message: "User deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Admin user [id] error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};