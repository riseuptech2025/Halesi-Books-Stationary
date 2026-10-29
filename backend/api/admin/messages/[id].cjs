// backend/api/admin/messages/[id].cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../../lib/db.cjs");
const { getAdminFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");
const { sendReplyToUser } = require("../../lib/mailer.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getAdminFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const id = req.query?.id || req.params?.id;
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const { db } = await connectToDatabase();
  const messages = db.collection("contact_messages");
  const _id = new ObjectId(id);

  try {
    const msg = await messages.findOne({ _id });
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (req.method === "GET") {
      // Mark as read when opened (only if not already replied)
      if (msg.status === "new") {
        await messages.updateOne(
          { _id },
          { $set: { status: "read", updatedAt: new Date() } }
        );
        msg.status = "read";
      }
      return res.status(200).json(msg);
    }

    if (req.method === "POST") {
      // Admin reply
      const { reply } = req.body || {};
      if (!reply || String(reply).trim().length < 2) {
        return res.status(400).json({ message: "Reply is required" });
      }

      const now = new Date();
      const entry = {
        from: "admin",
        text: String(reply).trim().slice(0, 4000),
        at: now,
        adminName: decoded.name || decoded.email || "Admin",
      };

      await messages.updateOne(
        { _id },
        {
          $push: { thread: entry },
          $set: { status: "replied", updatedAt: now },
        }
      );

      // Email the user
      sendReplyToUser({
        to: msg.email,
        userName: msg.name,
        subject: msg.subject,
        replyText: entry.text,
        originalMessage: msg.message,
      }).catch((err) => console.error("Reply email failed:", err));

      const updated = await messages.findOne({ _id });
      return res.status(200).json(updated);
    }

    if (req.method === "PATCH") {
      const { status } = req.body || {};
      if (!["new", "read", "replied"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      await messages.updateOne(
        { _id },
        { $set: { status, updatedAt: new Date() } }
      );
      const updated = await messages.findOne({ _id });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await messages.deleteOne({ _id });
      return res.status(200).json({ message: "Deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Admin message [id] error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};