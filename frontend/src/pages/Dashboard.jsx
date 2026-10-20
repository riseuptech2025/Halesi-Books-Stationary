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
  counts: { books: 0, users: 0, reviews: 0 },
  orders: {
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  },
  revenue: { total: 0, last7Days: [] },
  payment: { pendingVerification: 0 },
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
        setData(EMPTY_DATA); // 👈 prevents null access
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
          {[...Array(4)].map((_, i) => (
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

  // ... the rest of the component (return JSX) stays exactly as before,
  // but every `data.` reference becomes `d.`.
  //
  // Easiest approach: rename `data` to `d` throughout the JSX, OR keep
  // the variable name `data` by doing:
  //   const data = d;
  // after the error check above.
  const data_ = d;

  return (
    <Layout
      title={`Welcome back, ${admin?.name || "Admin"}`}
      subtitle="Here's what's happening at Halesi Books Centre today."
    >
      {/* === Everything below is IDENTICAL to your existing Dashboard JSX === */}
      {/* Just make sure every reference uses `data_` instead of `data`  */}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KPI
          label="Total Revenue"
          value={`NPR ${Number(data_.revenue.total).toLocaleString()}`}
          icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          accent="green"
          sub={`${data_.orders.total} orders placed`}
        />
        <KPI
          label="Total Orders"
          value={data_.orders.total}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          accent="red"
          sub={`${data_.orders.pending} pending`}
        />
        <KPI
          label="Total Books"
          value={data_.counts.books}
          icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          accent="yellow"
          sub={`${data_.lowStock.length} low stock`}
        />
        <KPI
          label="Customers"
          value={data_.counts.users}
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          accent="red"
          sub={`${data_.counts.reviews} reviews`}
        />
      </div>

      {/* Payment alert */}
      {data_.payment.pendingVerification > 0 && (
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
                {data_.payment.pendingVerification} payment proof
                {data_.payment.pendingVerification > 1 ? "s" : ""} waiting for
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

      {/* Revenue + status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
            <span className="w-1.5 h-5 bg-green-600 rounded-full" />
            Revenue (Last 7 Days)
          </h3>
          <div className="flex items-end gap-3 h-40">
            {data_.revenue.last7Days.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                No revenue data yet
              </div>
            ) : (
              data_.revenue.last7Days.map((day, i) => {
                const h = maxRev > 0 ? (day.total / maxRev) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="relative flex-1 w-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-red-600 to-red-500 rounded-t-lg transition-all"
                        style={{ height: `${Math.max(h, 4)}%` }}
                        title={`NPR ${Number(day.total).toLocaleString()}`}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">
                      {day.label}
                    </span>
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
          <div className="space-y-2">
            {[
              { key: "pending", label: "Pending", color: "bg-yellow-500" },
              { key: "confirmed", label: "Confirmed", color: "bg-blue-500" },
              { key: "shipped", label: "Shipped", color: "bg-purple-500" },
              { key: "delivered", label: "Delivered", color: "bg-green-500" },
              { key: "cancelled", label: "Cancelled", color: "bg-red-500" },
            ].map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.color}`} />
                  <span className="text-sm text-gray-600">{s.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {data_.orders[s.key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders + low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          {data_.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No orders yet
            </p>
          ) : (
            <div className="space-y-3">
              {data_.recentOrders.map((o) => (
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
                      {new Date(o.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-yellow-400 rounded-full" />
              Low Stock Books
            </h3>
            <Link
              to="/books"
              className="text-xs font-semibold text-yellow-700 hover:underline"
            >
              Manage →
            </Link>
          </div>
          {data_.lowStock.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              All books are well stocked ✨
            </p>
          ) : (
            <div className="space-y-3">
              {data_.lowStock.map((b) => (
                <div
                  key={b._id}
                  className="flex items-center gap-3 p-2 rounded-lg border border-gray-100"
                >
                  <div className="w-10 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                    {b.images?.[0]?.url ? (
                      <img
                        src={b.images[0].url}
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
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      b.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {b.stock === 0 ? "Out of stock" : `${b.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function KPI({ label, value, icon, accent, sub }) {
  const colors = {
    red: { bg: "bg-red-50", icon: "text-red-600", val: "text-red-700" },
    green: { bg: "bg-green-50", icon: "text-green-600", val: "text-green-700" },
    yellow: {
      bg: "bg-yellow-50",
      icon: "text-yellow-600",
      val: "text-yellow-700",
    },
  }[accent];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
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