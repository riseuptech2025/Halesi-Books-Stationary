// backend/api/admin/orders/index.cjs
const { connectToDatabase } = require("../../lib/db.cjs");
const { getAdminFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getAdminFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();
    const { status, payment, search } = req.query || {};

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (payment && payment !== "all") filter.paymentStatus = payment;
    if (search) {
      const rx = new RegExp(String(search).trim(), "i");
      filter.$or = [
        { orderNumber: rx },
        { "shippingAddress.name": rx },
        { "shippingAddress.phone": rx },
      ];
    }

    const orders = await db
      .collection("orders")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Attach user info (name + email) by joining users
    const userIds = [...new Set(orders.map((o) => o.userId).filter(Boolean))];
    const users = await db
      .collection("users")
      .find(
        { _id: { $in: userIds.map((id) => {
          const { ObjectId } = require("mongodb");
          return ObjectId.isValid(id) ? new ObjectId(id) : null;
        }).filter(Boolean) } },
        { projection: { name: 1, email: 1, phone: 1, avatar: 1 } }
      )
      .toArray();

    const usersById = new Map(users.map((u) => [u._id.toString(), u]));

    const enriched = orders.map((o) => ({
      ...o,
      user: usersById.get(o.userId) || null,
    }));

    return res.status(200).json(enriched);
  } catch (err) {
    console.error("Admin orders error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};