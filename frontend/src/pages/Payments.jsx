// frontend/src/pages/Payments.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";

export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/orders?payment=pending-verification");
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const updatePayment = async (id, paymentStatus) => {
    setBusy(id);
    try {
      await api.put(`/admin/orders/${id}`, { paymentStatus });
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Layout
      title="Payments"
      subtitle="Verify customer payment proofs."
    >
      {loading ? (
        <div className="bg-white rounded-2xl shadow-md p-16 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-3">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-800">All caught up!</p>
          <p className="text-sm text-gray-500 mt-1">
            No payments waiting for verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-yellow-50 to-red-50 p-4 border-b border-yellow-200">
                <p className="font-bold text-gray-900">
                  #{order.orderNumber}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString("en-GB")}
                </p>
              </div>

              <div className="p-4">
                <p className="text-sm font-semibold text-gray-800">
                  {order.shippingAddress?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {order.shippingAddress?.phone}
                </p>

                <p className="text-2xl font-extrabold text-green-700 mt-3">
                  NPR {Number(order.total).toLocaleString()}
                </p>

                {order.paymentProof?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase text-gray-500 mb-2">
                      Proof ({order.paymentProof.length})
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {order.paymentProof.map((p, i) => (
                        <a
                          key={i}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-red-500 transition"
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
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 p-4 pt-0">
                <button
                  onClick={() => updatePayment(order._id, "rejected")}
                  disabled={busy === order._id}
                  className="flex-1 py-2.5 rounded-lg border-2 border-red-200 text-red-700 hover:bg-red-50 font-semibold text-sm transition disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  onClick={() => updatePayment(order._id, "verified")}
                  disabled={busy === order._id}
                  className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold text-sm shadow-md transition disabled:opacity-60"
                >
                  {busy === order._id ? "..." : "Verify"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}