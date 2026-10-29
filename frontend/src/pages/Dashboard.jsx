// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const EMPTY_DATA = {
  counts: {
    books: 0,
    users: 0,
    reviews: 0,
    blogs: 0,
    announcements: 0,
    materials: 0,
    backEditions: 0,
  },
  orders: {
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  },
  revenue: {
    total: 0,
    gross: 0,
    today: 0,
    todayOrders: 0,
    last7Days: [],
  },
  earning: { total: 0 },
  payment: { pendingVerification: 0 },
  inventory: { totalStock: 0, value: 0, outOfStock: 0 },
  topBooks: [],
  topCustomers: [],
  categories: [],
  lowStock: [],
  recentOrders: [],
};

export default function Dashboard() {
  const { admin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: res } = await api.get("/admin/stats");
        if (!cancelled) setData(res);
      } catch (err) {
        if (cancelled) return;
        console.error("Dashboard fetch error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load dashboard. Check that the backend is running."
        );
        setData(EMPTY_DATA);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard" subtitle="Loading...">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-2xl shadow animate-pulse"
            />
          ))}
        </div>
      </Layout>
    );
  }

  const d = data || EMPTY_DATA;

  if (error) {
    return (
      <Layout title="Dashboard" subtitle="Something went wrong">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl p-6 max-w-2xl">
          <h3 className="font-bold mb-1">Cannot load dashboard</h3>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const maxRev = Math.max(
    ...(d.revenue.last7Days.map((x) => x.total) || [1]),
    1
  );

  return (
    <Layout
      title={`Welcome back, ${admin?.name || "Admin"}`}
      subtitle="Here's a complete snapshot of Halesi Books Centre."
    >
      {/* ===== PRIMARY KPIs ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {/* Total Revenue — pipeline (not cancelled, not delivered) */}
        <KPI
          label="Total Revenue"
          value={`NPR ${Number(d.revenue.total).toLocaleString()}`}
          icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          accent="blue"
          sub={`In pipeline · ${d.orders.pending + d.orders.confirmed + d.orders.shipped} order${d.orders.pending + d.orders.confirmed + d.orders.shipped !== 1 ? "s" : ""}`}
          tooltip="Revenue from orders currently in the pipeline (pending, confirmed, shipped). Not yet earned."
        />
        {/* Total Earning — delivered only */}
        <KPI
          label="Total Earning"
          value={`NPR ${Number(d.earning.total).toLocaleString()}`}
          icon="M5 13l4 4L19 7"
          accent="green"
          sub={`${d.orders.delivered} delivered order${d.orders.delivered !== 1 ? "s" : ""} · money earned`}
          tooltip="Only counts delivered orders. This is money actually earned."
        />
        {/* Today */}
        <KPI
          label="Today's Revenue"
          value={`NPR ${Number(d.revenue.today || 0).toLocaleString()}`}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          accent="yellow"
          sub={`${d.revenue.todayOrders || 0} order${d.revenue.todayOrders !== 1 ? "s" : ""} today`}
          tooltip="Orders placed today that aren't cancelled."
        />
        {/* Gross Sales */}
        <KPI
          label="Gross Sales"
          value={`NPR ${Number(d.revenue.gross).toLocaleString()}`}
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          accent="red"
          sub={`All orders except cancelled`}
          tooltip="Total sales across all orders that haven't been cancelled (delivered + in pipeline)."
        />
      </div>

      {/* ===== SECONDARY COUNTERS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <MiniStat
          label="Orders"
          value={d.orders.total}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          to="/orders"
          accent="red"
        />
        <MiniStat
          label="Books"
          value={d.counts.books}
          icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13"
          to="/books"
          accent="yellow"
        />
        <MiniStat
          label="Back Editions"
          value={d.counts.backEditions}
          icon="M12 8v13m0-13c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"
          to="/back-editions"
          accent="red"
        />
        <MiniStat
          label="Customers"
          value={d.counts.users}
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          to="/users"
          accent="green"
        />
        <MiniStat
          label="Reviews"
          value={d.counts.reviews}
          icon="M11 5h6a2 2 0 012 2v11a2 2 0 01-2 2h-6M11 5a2 2 0 100-4 2 2 0 000 4zm-5 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4z"
          to="/reviews"
          accent="yellow"
        />
        <MiniStat
          label="Blogs"
          value={d.counts.blogs}
          icon="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m0 0a2 2 0 012 2v9a2 2 0 01-2 2z"
          to="/blogs"
          accent="green"
        />
      </div>

      {/* ===== PAYMENT ALERT ===== */}
      {d.payment.pendingVerification > 0 && (
        <Link
          to="/payments"
          className="block bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4 mb-6 hover:bg-yellow-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-yellow-900">
                {d.payment.pendingVerification} payment proof
                {d.payment.pendingVerification > 1 ? "s" : ""} waiting for
                verification
              </p>
              <p className="text-sm text-yellow-800">
                Click to review and approve
              </p>
            </div>
            <svg
              className="w-5 h-5 text-yellow-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      )}

      {/* ===== REVENUE CHART + ORDER STATUS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-green-600 rounded-full" />
              Revenue — Last 7 Days
            </h3>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wide">
                7-Day Total
              </p>
              <p className="text-sm font-extrabold text-green-700">
                NPR{" "}
                {Number(
                  d.revenue.last7Days.reduce((s, x) => s + x.total, 0)
                ).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-end gap-3 h-44">
            {d.revenue.last7Days.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                No revenue data yet
              </div>
            ) : (
              d.revenue.last7Days.map((day, i) => {
                const h = maxRev > 0 ? (day.total / maxRev) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2 group"
                  >
                    <div className="relative flex-1 w-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-red-600 to-red-500 rounded-t-lg transition-all hover:from-red-700 hover:to-red-600 cursor-pointer"
                        style={{ height: `${Math.max(h, 4)}%` }}
                        title={`NPR ${Number(day.total).toLocaleString()} · ${day.orders} order${day.orders !== 1 ? "s" : ""}`}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-semibold text-gray-500 block">
                        {day.label}
                      </span>
                      {day.total > 0 && (
                        <span className="text-[9px] font-bold text-gray-700 block">
                          {day.total >= 1000
                            ? `${(day.total / 1000).toFixed(1)}k`
                            : day.total}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-yellow-400 rounded-full" />
            Order Status
          </h3>
          <div className="space-y-3">
            {[
              { key: "pending", label: "Pending", color: "bg-yellow-500" },
              { key: "confirmed", label: "Confirmed", color: "bg-blue-500" },
              { key: "shipped", label: "Shipped", color: "bg-purple-500" },
              { key: "delivered", label: "Delivered", color: "bg-green-500" },
              { key: "cancelled", label: "Cancelled", color: "bg-red-500" },
            ].map((s) => {
              const count = d.orders[s.key] || 0;
              const pct =
                d.orders.total > 0 ? (count / d.orders.total) * 100 : 0;
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-sm text-gray-600">{s.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {count}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-medium">Total orders</span>
              <span className="font-extrabold text-gray-900">
                {d.orders.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== INVENTORY + CATEGORY ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
            Inventory
          </h3>
          <div className="space-y-3">
            <InfoRow
              label="Total stock"
              value={`${Number(d.inventory.totalStock).toLocaleString()} copies`}
            />
            <InfoRow
              label="Inventory value"
              value={`NPR ${Number(d.inventory.value).toLocaleString()}`}
              strong
            />
            <InfoRow
              label="Out of stock books"
              value={d.inventory.outOfStock}
              danger={d.inventory.outOfStock > 0}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-purple-500 rounded-full" />
            Categories
          </h3>
          {d.categories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No categories yet
            </p>
          ) : (
            <div className="space-y-2">
              {d.categories.slice(0, 6).map((c) => {
                const total = d.counts.books || 1;
                const pct = (c.count / total) * 100;
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-gray-700 capitalize truncate">
                        {c.name}
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {c.count}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-yellow-400 rounded-full" />
            Low Stock Alert
          </h3>
          {d.lowStock.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              All books are well stocked ✨
            </p>
          ) : (
            <div className="space-y-2">
              {d.lowStock.slice(0, 5).map((b) => (
                <div
                  key={b._id}
                  className="flex items-center gap-2 p-2 rounded-lg border border-gray-100"
                >
                  <div className="w-8 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                    {b.images?.[0]?.url ? (
                      <img
                        src={b.images[0].url}
                        alt={b.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 flex-1 min-w-0 truncate">
                    {b.title}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      b.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {b.stock === 0 ? "OUT" : `${b.stock}`}
                  </span>
                </div>
              ))}
              <Link
                to="/books"
                className="block text-center text-xs font-semibold text-red-700 hover:underline pt-2"
              >
                Manage inventory →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ===== TOP BOOKS + TOP CUSTOMERS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-green-600 rounded-full" />
              Top Selling Books
            </h3>
            <span className="text-[10px] uppercase font-bold text-gray-400">
              Bestsellers
            </span>
          </div>
          {d.topBooks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No sales yet
            </p>
          ) : (
            <div className="space-y-2">
              {d.topBooks.map((b, i) => (
                <div
                  key={b.bookId || i}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-xs font-extrabold text-gray-400 w-5">
                    #{i + 1}
                  </span>
                  <div className="w-8 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                    {b.image ? (
                      <img
                        src={b.image}
                        alt={b.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {b.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      by {b.author}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-extrabold text-green-700">
                      {b.quantity} sold
                    </p>
                    <p className="text-[10px] text-gray-500">
                      NPR {Number(b.revenue).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-red-600 rounded-full" />
              Top Customers
            </h3>
            <Link
              to="/users"
              className="text-xs font-semibold text-red-700 hover:underline"
            >
              View all →
            </Link>
          </div>
          {d.topCustomers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No customers yet
            </p>
          ) : (
            <div className="space-y-2">
              {d.topCustomers.map((u, i) => (
                <div
                  key={u._id || i}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-xs font-extrabold text-gray-400 w-5">
                    #{i + 1}
                  </span>
                  {u.avatar?.url ? (
                    <img
                      src={u.avatar.url}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover border-2 border-red-500 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center text-xs font-extrabold flex-shrink-0">
                      {(u.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {u.orderCount} order{u.orderCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="text-sm font-extrabold text-green-700 flex-shrink-0">
                    NPR {Number(u.spent).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== RECENT ORDERS ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-red-600 rounded-full" />
            Recent Orders
          </h3>
          <Link
            to="/orders"
            className="text-xs font-semibold text-red-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        {d.recentOrders.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No orders yet
          </p>
        ) : (
          <div className="space-y-2">
            {d.recentOrders.map((o) => (
              <Link
                key={o._id}
                to={`/orders?highlight=${o._id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-red-700">
                    #{o.orderNumber?.slice(-4)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {o.shippingAddress?.name || "Customer"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleString("en-GB")}
                    {" · "}
                    {o.items?.length || 0} item
                    {o.items?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-green-700">
                    NPR {Number(o.total).toLocaleString()}
                  </p>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      STATUS_COLORS[o.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

/* ============== HELPERS ============== */

function KPI({ label, value, icon, accent = "red", sub, tooltip }) {
  const colors = {
    red: { bg: "bg-red-50", icon: "text-red-600", val: "text-red-700" },
    green: { bg: "bg-green-50", icon: "text-green-600", val: "text-green-700" },
    yellow: {
      bg: "bg-yellow-50",
      icon: "text-yellow-600",
      val: "text-yellow-700",
    },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", val: "text-blue-700" },
  }[accent];

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
      title={tooltip}
    >
      <div
        className={`w-11 h-11 rounded-xl ${colors.bg} ${colors.icon} flex items-center justify-center mb-3`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={icon}
          />
        </svg>
      </div>
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-2xl font-extrabold mt-1 ${colors.val}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniStat({ label, value, icon, to, accent = "red" }) {
  const colors = {
    red: "text-red-600",
    green: "text-green-600",
    yellow: "text-yellow-600",
  }[accent];

  return (
    <Link
      to={to}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-2 mb-1">
        <svg
          className={`w-4 h-4 ${colors}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={icon}
          />
        </svg>
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 truncate">
          {label}
        </p>
      </div>
      <p className="text-xl font-extrabold text-gray-900">{value}</p>
    </Link>
  );
}

function InfoRow({ label, value, strong, danger }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span
        className={`text-sm ${
          danger
            ? "font-bold text-red-600"
            : strong
            ? "font-extrabold text-gray-900"
            : "font-semibold text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}