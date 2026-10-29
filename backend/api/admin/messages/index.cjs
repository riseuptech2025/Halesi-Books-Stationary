// backend/api/admin/messages/index.cjs
const { connectToDatabase } = require("../../lib/db.cjs");
const { getAdminFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (!getAdminFromRequest(req))
    return res.status(401).json({ message: "Unauthorized" });

  const { db } = await connectToDatabase();
  const messages = db.collection("contact_messages");

  try {
    if (req.method === "GET") {
      const { status, search } = req.query || {};
      const filter = {};
      if (status && status !== "all") filter.status = status;
      if (search) {
        const rx = new RegExp(String(search).trim(), "i");
        filter.$or = [
          { name: rx },
          { email: rx },
          { subject: rx },
          { message: rx },
        ];
      }

      const list = await messages
        .find(filter)
        .sort({ status: 1, createdAt: -1 }) // new first
        .limit(500)
        .toArray();

      const counts = {
        new: await messages.countDocuments({ status: "new" }),
        read: await messages.countDocuments({ status: "read" }),
        replied: await messages.countDocuments({ status: "replied" }),
        total: await messages.countDocuments({}),
      };

      return res.status(200).json({ messages: list, counts });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Admin messages error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};