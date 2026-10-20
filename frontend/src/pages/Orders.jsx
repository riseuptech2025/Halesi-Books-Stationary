// frontend/src/pages/Orders.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const PAYMENT_STYLES = {
  unpaid: "bg-gray-100 text-gray-700 border-gray-200",
  "pending-verification": "bg-yellow-100 text-yellow-800 border-yellow-200",
  verified: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/orders");
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (paymentFilter !== "all" && o.paymentStatus !== paymentFilter)
      return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber?.toLowerCase().includes(q) ||
        o.shippingAddress?.name?.toLowerCase().includes(q) ||
        o.shippingAddress?.phone?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const updateOrder = async (id, patch) => {
    setUpdating(id);
    try {
      const { data } = await api.put(`/admin/orders/${id}`, patch);
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, ...data } : o)));
      showToast("Order updated");
    } catch {
      showToast("Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Layout
      title="Orders"
      subtitle="Manage customer orders and verify payments."
    >
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-red-600 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 relative">
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by order #, name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm font-medium focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:bg-white transition"
          >
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm font-medium focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:bg-white transition"
          >
            <option value="all">All Payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending-verification">Pending Verification</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <p className="mt-3 text-xs text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          {filtered.length} of {orders.length} orders
        </p>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-md p-16 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500">Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-16 text-center">
          <p className="text-lg font-bold text-gray-800">No orders found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              expanded={expanded === order._id}
              onToggle={() =>
                setExpanded(expanded === order._id ? null : order._id)
              }
              onUpdate={(patch) => updateOrder(order._id, patch)}
              updating={updating === order._id}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}

function OrderRow({ order, expanded, onToggle, onUpdate, updating }) {
  const [statusChange, setStatusChange] = useState(order.status);
  const [paymentChange, setPaymentChange] = useState(order.paymentStatus);

  useEffect(() => {
    setStatusChange(order.status);
    setPaymentChange(order.paymentStatus);
  }, [order.status, order.paymentStatus]);

  const hasChanges =
    statusChange !== order.status || paymentChange !== order.paymentStatus;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex flex-wrap items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-extrabold text-xs flex-shrink-0">
          #{order.orderNumber?.slice(-4)}
        </div>

        <div className="flex-1 min-w-[200px]">
          <p className="font-bold text-gray-900 text-sm">
            {order.shippingAddress?.name || "Customer"}
          </p>
          <p className="text-xs text-gray-500">
            {order.shippingAddress?.phone}
            {order.user?.email && ` · ${order.user.email}`}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleString("en-GB")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
              STATUS_STYLES[order.status]
            }`}
          >
            {order.status}
          </span>
          <span
            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
              PAYMENT_STYLES[order.paymentStatus] || PAYMENT_STYLES.unpaid
            }`}
          >
            {order.paymentStatus?.replace("-", " ") || "unpaid"}
          </span>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-extrabold text-green-700">
            NPR {Number(order.total).toLocaleString()}
          </p>
        </div>

        <button
          onClick={onToggle}
          className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
        >
          <svg
            className={`w-4 h-4 text-gray-500 transition ${
              expanded ? "rotate-180" : ""
            }`}
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
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-5">
          {/* Items */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-3">
              Items ({order.items?.length || 0})
            </h4>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
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
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                        No img
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                Shipping Address
              </h4>
              <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                <p className="font-semibold text-gray-800">
                  {order.shippingAddress?.name}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress?.phone}
                </p>
                <p className="text-gray-600 mt-0.5">
                  {order.shippingAddress?.address}
                  {order.shippingAddress?.city &&
                    `, ${order.shippingAddress.city}`}
                </p>
              </div>
            </div>

            {/* Payment proof */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                Payment Proof
              </h4>
              {order.paymentProof?.length > 0 ? (
                <div className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {order.paymentProof.map((p, i) => (
                      <a
                        key={i}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 hover:ring-2 hover:ring-red-400 transition relative group"
                      >
                        {p.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                          <img
                            src={p.url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-red-500">
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                            </svg>
                          </div>
                        )}
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                          View
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-3 border border-gray-100 text-sm text-gray-500 italic">
                  No payment proof uploaded
                </div>
              )}
            </div>
          </div>

          {/* Update controls */}
          <div className="bg-white rounded-lg p-4 border-2 border-dashed border-red-200">
            <h4 className="text-xs font-bold uppercase tracking-wide text-red-700 mb-3">
              Update Order
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={statusChange}
                onChange={(e) => setStatusChange(e.target.value)}
                className="px-3 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-medium focus:outline-none focus:border-red-500 transition"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <select
                value={paymentChange}
                onChange={(e) => setPaymentChange(e.target.value)}
                className="px-3 py-2.5 rounded-lg border-2 border-gray-200 text-sm font-medium focus:outline-none focus:border-red-500 transition"
              >
                <option value="unpaid">Unpaid</option>
                <option value="pending-verification">
                  Pending Verification
                </option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                disabled={!hasChanges || updating}
                onClick={() => onUpdate({ status: statusChange, paymentStatus: paymentChange })}
                className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Timeline */}
          {order.statusHistory?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                History
              </h4>
              <div className="space-y-2">
                {order.statusHistory.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-gray-600"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <span className="font-semibold capitalize">
                      {h.status?.replace("-", " ")}
                    </span>
                    <span className="text-gray-400">·</span>
                    <span>{h.note}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-400">
                      {new Date(h.at).toLocaleString("en-GB")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}