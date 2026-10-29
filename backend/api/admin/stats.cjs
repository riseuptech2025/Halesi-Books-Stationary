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

    const [
      booksCount,
      usersCount,
      orders,
      reviewsCount,
      blogsCount,
      announcementsCount,
      materialsCount,
      backEditionsCount,
    ] = await Promise.all([
      db.collection("books").countDocuments({ isBackEdition: { $ne: true } }),
      db.collection("users").countDocuments(),
      db.collection("orders").find({}).toArray(),
      db.collection("reviews").countDocuments(),
      db.collection("blogs").countDocuments().catch(() => 0),
      db.collection("announcements").countDocuments().catch(() => 0),
      db.collection("materials").countDocuments().catch(() => 0),
      db.collection("books").countDocuments({ isBackEdition: true }),
    ]);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
    const shippedOrders = orders.filter((o) => o.status === "shipped").length;
    const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;

    // 💡 Revenue = orders NOT cancelled and NOT delivered (in the pipeline)
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled" && o.status !== "delivered")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // 💰 Earning = only delivered orders (money actually earned)
    const totalEarning = orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // 📈 Total sales of all non-cancelled orders (delivered + in pipeline)
    const grossSales = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const paymentPending = orders.filter(
      (o) => o.paymentStatus === "pending-verification"
    ).length;

    // Today's stats
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todaysOrders = orders.filter(
      (o) =>
        new Date(o.createdAt) >= todayStart &&
        new Date(o.createdAt) < todayEnd &&
        o.status !== "cancelled"
    );
    const todayRevenue = todaysOrders.reduce(
      (s, o) => s + (Number(o.total) || 0),
      0
    );
    const todayOrdersCount = todaysOrders.length;

    // 7-day chart
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayOrders = orders.filter(
        (o) =>
          o.status !== "cancelled" &&
          new Date(o.createdAt) >= dayStart &&
          new Date(o.createdAt) < dayEnd
      );
      const dayTotal = dayOrders.reduce(
        (sum, o) => sum + (Number(o.total) || 0),
        0
      );

      dailyRevenue.push({
        date: dayStart.toISOString().slice(0, 10),
        label: dayStart.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
        total: dayTotal,
        orders: dayOrders.length,
      });
    }

    // Low stock
    const lowStock = await db
      .collection("books")
      .find({ stock: { $lte: 5 }, isBackEdition: { $ne: true } })
      .project({ title: 1, stock: 1, author: 1, images: 1 })
      .limit(10)
      .toArray();

    // 💡 Top selling books (by quantity across non-cancelled orders)
    const salesMap = new Map();
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      for (const item of o.items || []) {
        const key = item.bookId || item.title;
        if (!salesMap.has(key)) {
          salesMap.set(key, {
            bookId: item.bookId,
            title: item.title,
            author: item.author,
            image: item.image,
            quantity: 0,
            revenue: 0,
          });
        }
        const agg = salesMap.get(key);
        agg.quantity += Number(item.quantity) || 0;
        agg.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
      }
    }
    const topBooks = Array.from(salesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 💡 Top customers by total spent
    const userSpend = new Map();
    for (const o of orders) {
      if (o.status === "cancelled") continue;
      if (!o.userId) continue;
      const prev = userSpend.get(o.userId) || { spent: 0, orders: 0 };
      userSpend.set(o.userId, {
        spent: prev.spent + (Number(o.total) || 0),
        orders: prev.orders + 1,
      });
    }
    const topUserIds = Array.from(userSpend.entries())
      .sort((a, b) => b[1].spent - a[1].spent)
      .slice(0, 5);

    let topCustomers = [];
    if (topUserIds.length > 0) {
      const { ObjectId } = require("mongodb");
      const validIds = topUserIds
        .map(([id]) => (ObjectId.isValid(id) ? new ObjectId(id) : null))
        .filter(Boolean);
      const users = await db
        .collection("users")
        .find(
          { _id: { $in: validIds } },
          { projection: { name: 1, email: 1, avatar: 1 } }
        )
        .toArray();
      const byId = new Map(users.map((u) => [u._id.toString(), u]));
      topCustomers = topUserIds.map(([id, stats]) => ({
        _id: id,
        name: byId.get(id)?.name || "Unknown",
        email: byId.get(id)?.email || "",
        avatar: byId.get(id)?.avatar || null,
        spent: stats.spent,
        orderCount: stats.orders,
      }));
    }

    // 💡 Stock value (cost of inventory at current prices)
    const allBooks = await db
      .collection("books")
      .find({}, { projection: { price: 1, stock: 1, isBackEdition: 1 } })
      .toArray();
    const inventoryValue = allBooks.reduce(
      (sum, b) => sum + (Number(b.price) || 0) * (Number(b.stock) || 0),
      0
    );
    const totalStock = allBooks.reduce(
      (sum, b) => sum + (Number(b.stock) || 0),
      0
    );
    const outOfStock = allBooks.filter((b) => b.stock === 0).length;

    // 💡 Category breakdown
    const categoryMap = new Map();
    for (const b of allBooks) {
      const c = b.category || "General";
      categoryMap.set(c, (categoryMap.get(c) || 0) + 1);
    }
    const categories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const recentOrders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .project({
        orderNumber: 1,
        total: 1,
        status: 1,
        createdAt: 1,
        shippingAddress: 1,
        items: 1,
        paymentStatus: 1,
      })
      .toArray();

    return res.status(200).json({
      counts: {
        books: booksCount,
        users: usersCount,
        reviews: reviewsCount,
        blogs: blogsCount,
        announcements: announcementsCount,
        materials: materialsCount,
        backEditions: backEditionsCount,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        confirmed: confirmedOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      revenue: {
        total: totalRevenue,
        gross: grossSales,
        last7Days: dailyRevenue,
        today: todayRevenue,
        todayOrders: todayOrdersCount,
      },
      earning: {
        total: totalEarning,
      },
      payment: { pendingVerification: paymentPending },
      inventory: {
        totalStock,
        value: inventoryValue,
        outOfStock,
      },
      topBooks,
      topCustomers,
      categories,
      lowStock,
      recentOrders,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};