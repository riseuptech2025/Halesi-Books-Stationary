// backend/api/admin/users/index.cjs
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
    const { search } = req.query || {};

    const filter = {};
    if (search) {
      const rx = new RegExp(String(search).trim(), "i");
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }

    const users = await db
      .collection("users")
      .find(filter, {
        projection: {
          name: 1, email: 1, phone: 1, avatar: 1, createdAt: 1,
          wishlist: 1, addresses: 1, blocked: 1,
        },
      })
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    // For each user, count orders + total spent
    const orders = await db
      .collection("orders")
      .find({})
      .project({ userId: 1, total: 1, status: 1 })
      .toArray();

    const orderStats = {};
    orders.forEach((o) => {
      if (!o.userId) return;
      if (!orderStats[o.userId]) {
        orderStats[o.userId] = { count: 0, spent: 0 };
      }
      orderStats[o.userId].count += 1;
      if (o.status !== "cancelled") {
        orderStats[o.userId].spent += Number(o.total) || 0;
      }
    });

    const enriched = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone || "",
      avatar: u.avatar || null,
      createdAt: u.createdAt,
      blocked: !!u.blocked,
      wishlistCount: (u.wishlist || []).length,
      addressesCount: (u.addresses || []).length,
      orderCount: orderStats[u._id.toString()]?.count || 0,
      totalSpent: orderStats[u._id.toString()]?.spent || 0,
    }));

    return res.status(200).json(enriched);
  } catch (err) {
    console.error("Admin users error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};