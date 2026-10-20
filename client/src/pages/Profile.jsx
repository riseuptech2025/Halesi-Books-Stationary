// client/src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import StarRating from "../components/StarRating";

const TABS = [
  { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "orders", label: "My Orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { id: "cart", label: "My Cart", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
  { id: "wishlist", label: "Wishlist", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { id: "addresses", label: "Addresses", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { id: "security", label: "Security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
];

export default function Profile() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const activeTab = params.get("tab") || "overview";
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const { items: cartItems, total: cartTotal, refresh: refreshCart } = useCart();
  const { items: wishItems, refresh: refreshWish } = useWishlist();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const setTab = (id) => {
    setParams({ tab: id });
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login?redirect=/profile", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prof, ord, addr] = await Promise.all([
        api.get("/user/profile").then((r) => r.data),
        api.get("/orders").then((r) => r.data),
        api.get("/user/addresses").then((r) => r.data),
      ]);
      setProfile(prof);
      setOrders(ord);
      setAddresses(addr);
      await refreshWish();
      await refreshCart();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="container-x py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Order stats
  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white">
        <div className="container-x py-8 md:py-10">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur border-2 border-white/40 flex items-center justify-center text-3xl md:text-4xl font-extrabold shadow-lg">
              {(profile?.name || user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest text-red-100 font-semibold">
                My Account
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 truncate">
                {profile?.name || user?.name}
              </h1>
              <p className="text-sm text-red-100 mt-0.5 truncate">
                {profile?.email || user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2"
            >
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container-x py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ---------- SIDEBAR ---------- */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 lg:sticky lg:top-24">
              <nav className="space-y-1">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const badge =
                    tab.id === "cart"
                      ? cartItems.length
                      : tab.id === "wishlist"
                      ? wishItems.length
                      : tab.id === "orders"
                      ? orders.length
                      : 0;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                        isActive
                          ? "bg-red-50 text-red-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={tab.icon}
                        />
                      </svg>
                      <span className="flex-1 text-left">{tab.label}</span>
                      {badge > 0 && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? "bg-red-600 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* ---------- MAIN ---------- */}
          <main className="lg:col-span-9 min-w-0">
            {loading ? (
              <LoadingCard />
            ) : (
              <>
                {activeTab === "overview" && (
                  <OverviewTab
                    profile={profile}
                    orders={orders}
                    cartItems={cartItems}
                    wishItems={wishItems}
                    cartTotal={cartTotal}
                    orderStats={orderStats}
                    setTab={setTab}
                  />
                )}
                {activeTab === "orders" && (
                  <OrdersTab orders={orders} onRefresh={fetchData} showToast={showToast} />
                )}
                {activeTab === "cart" && (
                  <CartTab
                    items={cartItems}
                    total={cartTotal}
                    onRefresh={fetchData}
                    showToast={showToast}
                  />
                )}
                {activeTab === "wishlist" && (
                  <WishlistTab
                    items={wishItems}
                    onRefresh={fetchData}
                    showToast={showToast}
                  />
                )}
                {activeTab === "addresses" && (
                  <AddressesTab
                    addresses={addresses}
                    onRefresh={fetchData}
                    showToast={showToast}
                  />
                )}
                {activeTab === "profile" && (
                  <ProfileInfoTab
                    profile={profile}
                    onRefresh={fetchData}
                    showToast={showToast}
                  />
                )}
                {activeTab === "security" && (
                  <SecurityTab showToast={showToast} />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// =================== OVERVIEW ===================
function OverviewTab({ profile, orders, cartItems, wishItems, cartTotal, orderStats, setTab }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-900">Overview</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={orderStats.total}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          accent="red"
          onClick={() => setTab("orders")}
        />
        <StatCard
          label="Delivered"
          value={orderStats.delivered}
          icon="M5 13l4 4L19 7"
          accent="green"
          onClick={() => setTab("orders")}
        />
        <StatCard
          label="In Cart"
          value={cartItems.length}
          icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          accent="yellow"
          onClick={() => setTab("cart")}
        />
        <StatCard
          label="Wishlist"
          value={wishItems.length}
          icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          accent="red"
          onClick={() => setTab("wishlist")}
        />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-red-600 rounded-full" />
            Recent Orders
          </h3>
          <button
            onClick={() => setTab("orders")}
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            View all →
          </button>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            title="No orders yet"
            desc="Start browsing our collection"
            cta={{ to: "/books", label: "Browse Books" }}
          />
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((o) => (
              <OrderMiniCard key={o._id} order={o} onClick={() => setTab("orders")} />
            ))}
          </div>
        )}
      </div>

      {/* Cart preview */}
      {cartItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-yellow-400 rounded-full" />
              In Your Cart
            </h3>
            <button
              onClick={() => setTab("cart")}
              className="text-sm font-semibold text-red-700 hover:underline"
            >
              View cart →
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {cartItems.length} item{cartItems.length > 1 ? "s" : ""} · NPR{" "}
            {Number(cartTotal).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, accent, onClick }) {
  const accentStyles = {
    red: { bg: "bg-red-50", text: "text-red-700", icon: "text-red-600" },
    green: { bg: "bg-green-50", text: "text-green-700", icon: "text-green-600" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-700", icon: "text-yellow-600" },
  };
  const a = accentStyles[accent];

  return (
    <button
      onClick={onClick}
      className={`text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl ${a.bg} ${a.icon} flex items-center justify-center mb-3`}
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
      <p className={`text-3xl font-extrabold ${a.text} mt-1`}>{value}</p>
    </button>
  );
}

function OrderMiniCard({ order, onClick }) {
  const status = getStatusStyle(order.status);
  const firstItem = order.items?.[0];
  const extra = (order.items?.length || 0) - 1;

  return (
    <button
      onClick={onClick}
      className="w-full text-left flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
    >
      <div className="w-14 h-14 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
        {firstItem?.image ? (
          <img
            src={firstItem.image}
            alt={firstItem.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-500">
            #{order.orderNumber}
          </span>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${status.cls}`}
          >
            {status.label}
          </span>
        </div>
        <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">
          {firstItem?.title || "Order"}
          {extra > 0 && (
            <span className="text-gray-500 font-normal"> +{extra} more</span>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date(order.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-extrabold text-green-700">
          NPR {Number(order.total).toLocaleString()}
        </p>
      </div>
    </button>
  );
}

// =================== ORDERS ===================
function OrdersTab({ orders, onRefresh, showToast }) {
  const [expanded, setExpanded] = useState(null);
  const [busy, setBusy] = useState(null);

  const cancelOrder = async (orderId) => {
    if (!confirm("Cancel this order?")) return;
    setBusy(orderId);
    try {
      await api.delete(`/orders/${orderId}`);
      showToast("Order cancelled");
      await onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cancel");
    } finally {
      setBusy(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
        <EmptyState
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          title="No orders yet"
          desc="Your orders will appear here once you place one."
          cta={{ to: "/books", label: "Start Shopping" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-gray-900">My Orders</h2>

      {orders.map((order) => {
        const status = getStatusStyle(order.status);
        const isOpen = expanded === order._id;
        const canCancel =
          order.status === "pending" || order.status === "confirmed";

        return (
          <div
            key={order._id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${status.cls}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-xl font-extrabold text-green-700">
                    NPR {Number(order.total).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Items preview */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {order.items.slice(0, 5).map((item, i) => (
                  <div
                    key={i}
                    className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200"
                    title={item.title}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                {order.items.length > 5 && (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                    +{order.items.length - 5}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setExpanded(isOpen ? null : order._id)}
                  className="text-xs font-semibold text-red-700 hover:underline flex items-center gap-1"
                >
                  {isOpen ? "Hide details" : "View details"}
                  <svg
                    className={`w-3 h-3 transition ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {canCancel && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    disabled={busy === order._id}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition disabled:opacity-60"
                  >
                    {busy === order._id ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>

            {/* Expanded details */}
            {isOpen && (
              <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-5">
                {/* Timeline */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
                    Order Timeline
                  </h4>
                  <div className="space-y-3">
                    {order.statusHistory?.map((h, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg
                            className="w-3.5 h-3.5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 capitalize">
                            {h.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {h.note} ·{" "}
                            {new Date(h.at).toLocaleString("en-GB")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items list */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
                    Items ({order.items.length})
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100"
                      >
                        <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
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
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            by {item.author}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500">
                            {item.quantity} × NPR{" "}
                            {Number(item.price).toLocaleString()}
                          </p>
                          <p className="text-sm font-bold text-green-700">
                            NPR{" "}
                            {Number(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping address */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    Shipping Address
                  </h4>
                  <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                    <p className="font-semibold text-gray-800">
                      {order.shippingAddress.name}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.phone}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.address}
                      {order.shippingAddress.city &&
                        `, ${order.shippingAddress.city}`}
                    </p>
                  </div>
                </div>

                {/* Total summary */}
                <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      NPR {Number(order.subtotal).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery</span>
                    <span className="font-semibold">
                      NPR {Number(order.deliveryFee).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-extrabold text-green-700">
                      NPR {Number(order.total).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =================== CART ===================
function CartTab({ items, total, onRefresh, showToast }) {
  const [busy, setBusy] = useState(null);
  const navigate = useNavigate();

  const updateQty = async (bookId, quantity) => {
    if (quantity < 1) return;
    setBusy(bookId);
    try {
      await api.put("/cart", { bookId, quantity });
      await onRefresh();
    } catch {
      showToast("Failed to update");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (bookId) => {
    if (!confirm("Remove this item from cart?")) return;
    setBusy(bookId);
    try {
      await api.delete("/cart", { data: { bookId } });
      showToast("Removed from cart");
      await onRefresh();
    } catch {
      showToast("Failed to remove");
    } finally {
      setBusy(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
        <EmptyState
          icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          title="Your cart is empty"
          desc="Add books to your cart to see them here."
          cta={{ to: "/books", label: "Browse Books" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-gray-900">My Cart</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.bookId} className="p-4 flex items-center gap-4">
            <Link
              to={`/books/${item.bookId}`}
              className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"
                    />
                  </svg>
                </div>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                to={`/books/${item.bookId}`}
                className="text-sm font-bold text-gray-900 hover:text-red-700 line-clamp-2 transition"
              >
                {item.title}
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">by {item.author}</p>
              <p className="text-base font-extrabold text-green-700 mt-1">
                NPR {Number(item.price).toLocaleString()}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => updateQty(item.bookId, item.quantity - 1)}
                  disabled={item.quantity <= 1 || busy === item.bookId}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-lg disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-800">
                  {busy === item.bookId ? "…" : item.quantity}
                </span>
                <button
                  onClick={() => updateQty(item.bookId, item.quantity + 1)}
                  disabled={busy === item.bookId || item.quantity >= item.stock}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-lg disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => remove(item.bookId)}
                disabled={busy === item.bookId}
                className="text-xs text-red-600 hover:text-red-800 font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="p-5 bg-gradient-to-br from-red-50 to-yellow-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-700">
              Subtotal
            </span>
            <span className="text-2xl font-extrabold text-green-700">
              NPR {Number(total).toLocaleString()}
            </span>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

// =================== WISHLIST ===================
function WishlistTab({ items, onRefresh, showToast }) {
  const { toggle } = useWishlist();

  const remove = async (bookId) => {
    try {
      await toggle(bookId);
      showToast("Removed from wishlist");
      await onRefresh();
    } catch {
      showToast("Failed to remove");
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
        <EmptyState
          icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          title="Your wishlist is empty"
          desc="Tap the heart on any book to save it here."
          cta={{ to: "/books", label: "Discover Books" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-extrabold text-gray-900">
        My Wishlist ({items.length})
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((book) => (
          <div
            key={book._id}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition flex flex-col"
          >
            <Link
              to={`/books/${book._id}`}
              className="relative aspect-[3/4] bg-gradient-to-br from-red-50 via-yellow-50 to-green-50 overflow-hidden"
            >
              {book.images?.[0]?.url ? (
                <img
                  src={book.images[0].url}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-red-300">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"
                    />
                  </svg>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  remove(book._id);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition shadow"
                title="Remove from wishlist"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </Link>
            <div className="p-3 flex-1 flex flex-col">
              <Link
                to={`/books/${book._id}`}
                className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-red-700 transition"
              >
                {book.title}
              </Link>
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                by {book.author}
              </p>
              <p className="text-base font-extrabold text-green-700 mt-2">
                NPR {Number(book.price).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =================== ADDRESSES ===================
function AddressesTab({ addresses, onRefresh, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    name: "",
    phone: "",
    address: "",
    city: "",
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/user/addresses", form);
      showToast("Address added");
      setShowForm(false);
      setForm({
        label: "Home",
        name: "",
        phone: "",
        address: "",
        city: "",
        isDefault: false,
      });
      await onRefresh();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Remove this address?")) return;
    try {
      await api.delete("/user/addresses", { data: { addressId: id } });
      showToast("Address removed");
      await onRefresh();
    } catch {
      showToast("Failed to remove");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-gray-900">
          Saved Addresses
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Address
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Label"
              value={form.label}
              onChange={(v) => setForm({ ...form, label: v })}
              placeholder="Home / Office / Other"
            />
            <FormInput
              label="Full Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="John Doe"
              required
            />
            <FormInput
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="+977-9863958892"
              required
            />
            <FormInput
              label="City"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
              placeholder="Halesi"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Full Address *
            </label>
            <textarea
              rows={3}
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition resize-none text-sm"
              placeholder="Street, ward, landmark..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
            />
            Set as default address
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold shadow-md transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <EmptyState
            icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            title="No addresses yet"
            desc="Add your shipping address for faster checkout."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div
              key={a._id}
              className={`bg-white rounded-2xl shadow-sm border p-5 relative ${
                a.isDefault ? "border-red-300 ring-1 ring-red-100" : "border-gray-100"
              }`}
            >
              {a.isDefault && (
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
              <p className="text-xs font-bold uppercase text-gray-500 tracking-wide">
                {a.label}
              </p>
              <p className="font-bold text-gray-900 mt-2">{a.name}</p>
              <p className="text-sm text-gray-600">{a.phone}</p>
              <p className="text-sm text-gray-600 mt-1">
                {a.address}
                {a.city && `, ${a.city}`}
              </p>

              <button
                onClick={() => remove(a._id)}
                className="mt-3 text-xs font-semibold text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== PROFILE INFO ===================
function ProfileInfoTab({ profile, onRefresh, showToast }) {
  const { user, ...auth } = useAuth(); // we only need setter, not exposed
  const [form, setForm] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: profile?.name || "",
      phone: profile?.phone || "",
    });
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/user/profile", form);
      // Update localStorage user
      const stored = JSON.parse(localStorage.getItem("hbc_user") || "{}");
      localStorage.setItem(
        "hbc_user",
        JSON.stringify({ ...stored, name: data.name, phone: data.phone })
      );
      showToast("Profile updated");
      await onRefresh();
    } catch {
      showToast("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-900">My Profile</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center text-2xl font-extrabold">
            {(profile?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {profile?.name}
            </p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              Member since{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <FormInput
            label="Full Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            required
          />
          <FormInput
            label="Phone"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
            placeholder="+977-9863958892"
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email (cannot be changed)
            </label>
            <input
              type="email"
              disabled
              value={profile?.email || ""}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

// =================== SECURITY ===================
function SecurityTab({ showToast }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setSaving(true);
    try {
      await api.put("/user/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      showToast("Password changed");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-gray-900">Security</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-lg">
        <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Current Password"
            type="password"
            value={form.currentPassword}
            onChange={(v) => setForm({ ...form, currentPassword: v })}
            required
          />
          <FormInput
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={(v) => setForm({ ...form, newPassword: v })}
            placeholder="At least 6 characters"
            required
          />
          <FormInput
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => setForm({ ...form, confirmPassword: v })}
            required
          />

          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

// =================== SHARED HELPERS ===================
function getStatusStyle(status) {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        cls: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    case "confirmed":
      return {
        label: "Confirmed",
        cls: "bg-blue-100 text-blue-800 border-blue-200",
      };
    case "shipped":
      return {
        label: "Shipped",
        cls: "bg-purple-100 text-purple-800 border-purple-200",
      };
    case "delivered":
      return {
        label: "Delivered",
        cls: "bg-green-100 text-green-800 border-green-200",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        cls: "bg-red-100 text-red-800 border-red-200",
      };
    default:
      return {
        label: status || "Unknown",
        cls: "bg-gray-100 text-gray-700 border-gray-200",
      };
  }
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition text-sm"
      />
    </div>
  );
}

function EmptyState({ icon, title, desc, cta }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-500"
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
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
      {cta && (
        <Link
          to={cta.to}
          className="inline-flex items-center gap-2 mt-5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md transition"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-100 rounded-2xl" />
    </div>
  );
}