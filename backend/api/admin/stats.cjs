// backend/api/admin/stats.cjs
const { connectToDatabase } = require("../lib/db.cjs");
const { getAdminFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getAdminFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { db } = await connectToDatabase();

    const [booksCount, usersCount, orders, reviews] = await Promise.all([
      db.collection("books").countDocuments(),
      db.collection("users").countDocuments(),
      db.collection("orders").find({}).toArray(),
      db.collection("reviews").countDocuments(),
    ]);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
    const shippedOrders = orders.filter((o) => o.status === "shipped").length;
    const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

    // 💡 Total Revenue = all orders NOT cancelled and NOT delivered
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled" && o.status !== "delivered")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // 💰 Total Earning = only delivered orders
    const totalEarning = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const paymentPending = orders.filter(
      (o) => o.paymentStatus === "pending-verification"
    ).length;

    const lowStock = await db
      .collection("books")
      .find({ stock: { $lte: 5 } })
      .project({ title: 1, stock: 1, author: 1, images: 1 })
      .limit(10)
      .toArray();

    const now = new Date();
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayTotal = orders
        .filter(
          (o) =>
            o.status !== "cancelled" &&
            new Date(o.createdAt) >= dayStart &&
            new Date(o.createdAt) < dayEnd
        )
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      dailyRevenue.push({
        date: dayStart.toISOString().slice(0, 10),
        label: dayStart.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        total: dayTotal,
      });
    }

    const recentOrders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .project({
        orderNumber: 1, total: 1, status: 1, createdAt: 1,
        shippingAddress: 1, items: 1, paymentStatus: 1,
      })
      .toArray();

    return res.status(200).json({
      counts: { books: booksCount, users: usersCount, reviews },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      revenue: { total: totalRevenue, last7Days: dailyRevenue },
      earning: { total: totalEarning },
      payment: { pendingVerification: paymentPending },
      lowStock,
      recentOrders,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};