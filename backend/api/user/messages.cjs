// backend/api/user/messages.cjs
const { connectToDatabase } = require("../lib/db.cjs");
const { getUserFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");
const { ObjectId } = require("mongodb");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const { db } = await connectToDatabase();
  const messages = db.collection("contact_messages");

  try {
    if (req.method === "GET") {
      // Get user's email so we can also match messages they sent while logged out
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(decoded.id) }, { projection: { email: 1 } });
      if (!user) return res.status(404).json({ message: "User not found" });

      const list = await messages
        .find({
          $or: [
            { userId: decoded.id },
            { email: user.email },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      return res.status(200).json(list);
    }

    if (req.method === "POST") {
      // User follows up in an existing thread
      const { threadId, text } = req.body || {};
      if (!threadId || !ObjectId.isValid(threadId)) {
        return res.status(400).json({ message: "Invalid thread ID" });
      }
      if (!text || String(text).trim().length < 2) {
        return res.status(400).json({ message: "Message is too short" });
      }

      const msg = await messages.findOne({ _id: new ObjectId(threadId) });
      if (!msg) return res.status(404).json({ message: "Thread not found" });

      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(decoded.id) }, { projection: { email: 1 } });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Only the owner can append
      if (msg.userId !== decoded.id && msg.email !== user.email) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const now = new Date();
      await messages.updateOne(
        { _id: msg._id },
        {
          $push: {
            thread: { from: "user", text: String(text).trim().slice(0, 4000), at: now, adminName: null },
          },
          $set: { status: "new", updatedAt: now },
        }
      );

      const updated = await messages.findOne({ _id: msg._id });
      return res.status(200).json(updated);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("User messages error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};