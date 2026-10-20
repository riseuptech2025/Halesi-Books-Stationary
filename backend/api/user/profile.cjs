// backend/api/user/profile.cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../lib/db.cjs");
const { getUserFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const { db } = await connectToDatabase();
  const users = db.collection("users");
  const _id = new ObjectId(decoded.id);

  try {
    if (req.method === "GET") {
      const user = await users.findOne({ _id });
      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || null, // 👈 new
        role: "user",
        createdAt: user.createdAt,
        wishlistCount: (user.wishlist || []).length,
      });
    }

    if (req.method === "PUT") {
      const { name, phone, avatar } = req.body || {};

      const update = {
        ...(name !== undefined && { name: String(name).trim() }),
        ...(phone !== undefined && { phone: String(phone).trim() }),
        ...(avatar !== undefined && {
          avatar: avatar
            ? {
                url: String(avatar.url || ""),
                publicId: String(avatar.publicId || ""),
              }
            : null,
        }),
        updatedAt: new Date(),
      };

      await users.updateOne({ _id }, { $set: update });

      const user = await users.findOne({ _id });
      return res.status(200).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar: user.avatar || null,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};