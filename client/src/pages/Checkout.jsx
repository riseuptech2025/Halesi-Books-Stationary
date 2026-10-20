// client/src/pages/Checkout.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { refresh: refreshCart } = useCart();

  const bookId = params.get("bookId");
  const initialQty = Math.max(1, parseInt(params.get("qty") || "1", 10));

  // ---------- STATE ----------
  const [book, setBook] = useState(null);
  const [quantity, setQuantity] = useState(initialQty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Address
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    name: "",
    phone: "",
    address: "",
    city: "",
    isDefault: false,
  });

  // Order
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);

  // Payment proof
  const [paymentFiles, setPaymentFiles] = useState([]);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const fileInputRef = useRef(null);

  // Settings
  const [settings, setSettings] = useState({
    deliveryZones: [],
    deliveryCharge: 0,
    paymentQR: null,
    paymentMethods: { qr: true, cod: true },
  });
  const [paymentMethod, setPaymentMethod] = useState("qr");
  const [deliveryZoneId, setDeliveryZoneId] = useState(null);

  // ---------- AUTH GUARD ----------
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(
        `/login?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`,
        { replace: true }
      );
    }
  }, [authLoading, isAuthenticated, navigate]);

  // ---------- FETCH DATA ----------
  useEffect(() => {
    if (!bookId || !isAuthenticated) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const [bookRes, addrRes, settingsRes] = await Promise.all([
          api.get(`/public/books/${bookId}`),
          api.get("/user/addresses"),
          api.get("/settings/public"),
        ]);

        if (cancelled) return;

        setBook(bookRes.data);
        setAddresses(addrRes.data || []);

        const s = settingsRes.data || {};
        const fetched = {
          deliveryZones: Array.isArray(s.deliveryZones)
            ? s.deliveryZones
            : [],
          deliveryCharge: Number(s.deliveryCharge) || 0,
          paymentQR: s.paymentQR || null,
          paymentMethods: s.paymentMethods || { qr: true, cod: true },
        };
        setSettings(fetched);
        console.log("✅ Checkout settings:", fetched);

        // Payment method default
        if (!fetched.paymentMethods.qr && fetched.paymentMethods.cod) {
          setPaymentMethod("cod");
        }

        // 👇 Auto-select first delivery zone — CRITICAL
        if (fetched.deliveryZones.length > 0) {
          setDeliveryZoneId(fetched.deliveryZones[0].id);
        }

        // Address default
        const def =
          (addrRes.data || []).find((a) => a.isDefault) ||
          (addrRes.data || [])[0];
        if (def) {
          setSelectedAddressId(def._id);
          setShowAddressForm(false);
        } else {
          setShowAddressForm(true);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Checkout load error:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load checkout data. Please refresh."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookId, isAuthenticated]);

  // ---------- QUANTITY CLAMP ----------
  const maxQty = book?.stock || 99;
  useEffect(() => {
    if (quantity > maxQty) setQuantity(maxQty);
    if (quantity < 1) setQuantity(1);
  }, [maxQty]); // eslint-disable-line

  // ---------- LIVE PRICING ----------
  const pricing = useMemo(() => {
    if (!book)
      return { unit: 0, subtotal: 0, delivery: 0, total: 0, zone: null };

    const unit = Number(book.price) || 0;
    const subtotal = unit * quantity;

    const zones = settings.deliveryZones || [];
    const zone =
      zones.find((z) => z.id === deliveryZoneId) || zones[0] || null;

    const delivery = zone
      ? Number(zone.charge) || 0
      : Number(settings.deliveryCharge) || 0;

    return { unit, subtotal, delivery, total: subtotal + delivery, zone };
  }, [book, quantity, settings, deliveryZoneId]);

  // ---------- PLACE ORDER ----------
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError("");

    // Address payload
    let addressPayload = null;

    if (showAddressForm || addresses.length === 0) {
      if (
        !newAddress.name.trim() ||
        !newAddress.phone.trim() ||
        !newAddress.address.trim()
      ) {
        setError("Please fill in name, phone and address");
        return;
      }
      addressPayload = { ...newAddress };

      if (saveAddressToProfile) {
        try {
          await api.post("/user/addresses", newAddress);
        } catch {
          /* ignore */
        }
      }
    } else {
      const selected = addresses.find((a) => a._id === selectedAddressId);
      if (!selected) {
        setError("Please select an address");
        return;
      }
      addressPayload = {
        name: selected.name,
        phone: selected.phone,
        address: selected.address,
        city: selected.city || "",
      };
    }

    // Compute zone fallback at submit time
    const zones = settings.deliveryZones || [];
    const zoneToSend =
      deliveryZoneId || (zones.length > 0 ? zones[0].id : null);

    console.log("📦 Submitting order:", {
      bookId,
      quantity,
      paymentMethod,
      deliveryZoneId: zoneToSend,
      zonesAvailable: zones.map((z) => z.id),
    });

    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", {
        items: [{ bookId, quantity }],
        shippingAddress: addressPayload,
        notes,
        paymentMethod,
        deliveryZoneId: zoneToSend,
      });

      setOrder(data);
      await refreshCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Order failed:", err);
      setError(
        err.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- PAYMENT PROOF ----------
  const handlePaymentFiles = (files) => {
    const arr = Array.from(files || []);
    if (arr.length === 0) return;

    const valid = arr.filter((f) => {
      const isImage = f.type.startsWith("image/");
      const isPdf = f.type === "application/pdf";
      return (isImage || isPdf) && f.size <= 10 * 1024 * 1024;
    });

    if (valid.length !== arr.length) {
      setError(
        "Some files were skipped — only images or PDF under 10 MB are allowed."
      );
    } else {
      setError("");
    }

    setPaymentFiles((prev) => [...prev, ...valid].slice(0, 5));
  };

  const removePaymentFile = (idx) => {
    setPaymentFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadPaymentProof = async () => {
    if (paymentFiles.length === 0) {
      setError("Please add at least one file");
      return;
    }

    setUploadingProof(true);
    setError("");

    try {
      const { data: sign } = await api.post("/upload/payment-sign");

      const uploaded = [];
      for (const file of paymentFiles) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", sign.apiKey);
        fd.append("timestamp", sign.timestamp);
        fd.append("signature", sign.signature);
        fd.append("folder", sign.folder);

        const endpoint = file.type === "application/pdf" ? "raw" : "image";
        const url = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${endpoint}/upload`;

        const resp = await fetch(url, { method: "POST", body: fd });
        if (!resp.ok) throw new Error("Upload failed");
        const result = await resp.json();

        uploaded.push({
          url: result.secure_url,
          publicId: result.public_id,
          name: file.name,
        });
      }

      await api.post(`/orders/${order._id}/payment`, { files: uploaded });
      setProofUploaded(true);
    } catch (err) {
      console.error(err);
      setError("Failed to upload payment proof. Try again.");
    } finally {
      setUploadingProof(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================
  if (loading || authLoading) {
    return (
      <div className="container-x py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================
  if (!book) {
    return (
      <div className="container-x py-20 text-center">
        <h2 className="text-xl font-bold text-gray-900">Book not found</h2>
        <Link
          to="/books"
          className="inline-block mt-4 bg-red-600 text-white font-semibold py-2.5 px-5 rounded-xl"
        >
          Browse Books
        </Link>
      </div>
    );
  }

  // ==========================================================
  // PAYMENT SCREEN
  // ==========================================================
  if (order) {
    const isCOD = order.paymentMethod === "cod";

    return (
      <div className="container-x py-8 md:py-12 animate-fade-in">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6"
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
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-green-900">
              Order Placed!
            </h1>
            <p className="text-sm text-green-800 mt-1">
              Order{" "}
              <span className="font-mono font-bold">#{order.orderNumber}</span>{" "}
              {isCOD
                ? "— pay in cash when your order arrives."
                : "— please complete your payment to confirm."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div>
            {!isCOD ? (
              <>
                <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-200 p-6 mb-6">
                  <div className="text-center mb-4">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                      Scan to Pay
                    </p>
                    <p className="text-3xl font-extrabold text-green-700 mt-1">
                      NPR {Number(order.total).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white border-4 border-gray-100 rounded-2xl p-3 max-w-sm mx-auto aspect-square flex items-center justify-center">
                    {settings.paymentQR?.url ? (
                      <img
                        src={settings.paymentQR.url}
                        alt="Payment QR"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement.innerHTML =
                            '<p class="text-sm text-red-500 text-center px-4">Failed to load QR. Contact the store.</p>';
                        }}
                      />
                    ) : (
                      <p className="text-sm text-gray-400 text-center px-4">
                        QR not available. Please contact the store.
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Scan with your banking / eSewa / Khalti app to pay{" "}
                    <span className="font-bold text-gray-800">
                      NPR {Number(order.total).toLocaleString()}
                    </span>
                    .
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-red-600 rounded-full" />
                    Upload Payment Proof
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Upload a screenshot or PDF of your payment confirmation.
                  </p>

                  {proofUploaded ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5"
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
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-900">
                          Payment proof submitted!
                        </p>
                        <p className="text-xs text-green-800">
                          Our team will verify within 24 hours.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <label className="block border-2 border-dashed border-yellow-400 hover:border-red-500 bg-yellow-50/50 rounded-xl p-6 cursor-pointer text-center transition mb-3">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,application/pdf"
                          multiple
                          hidden
                          onChange={(e) => handlePaymentFiles(e.target.files)}
                        />
                        <svg
                          className="w-10 h-10 text-yellow-600 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-sm font-semibold text-gray-700">
                          Click to upload files
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, PDF up to 10 MB
                        </p>
                      </label>

                      {paymentFiles.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {paymentFiles.map((f, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 border border-gray-100"
                            >
                              <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {f.type.startsWith("image/") ? (
                                  <img
                                    src={URL.createObjectURL(f)}
                                    alt={f.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <svg
                                    className="w-5 h-5 text-red-500"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                  </svg>
                                )}
                              </div>
                              <p className="flex-1 text-sm text-gray-700 truncate">
                                {f.name}
                              </p>
                              <button
                                type="button"
                                onClick={() => removePaymentFile(i)}
                                className="w-7 h-7 rounded-full hover:bg-red-100 text-red-600 flex items-center justify-center transition"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {error && (
                        <p className="text-xs text-red-600 font-semibold mb-2">
                          {error}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={uploadPaymentProof}
                        disabled={
                          paymentFiles.length === 0 || uploadingProof
                        }
                        className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-bold py-3 rounded-xl shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {uploadingProof ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Submit Payment Proof"
                        )}
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-4">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">
                  Cash on Delivery
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Please have{" "}
                  <span className="font-bold text-gray-900">
                    NPR {Number(order.total).toLocaleString()}
                  </span>{" "}
                  ready in cash when your order arrives.
                </p>
                <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg text-xs">
                  💡 Please ensure someone is available to receive the order.
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: SUMMARY */}
          <div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-green-600 rounded-full" />
                Order Summary
              </h3>

              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 pb-3 mb-3 border-b border-gray-100 last:border-0"
                >
                  <div className="w-14 h-18 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
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
                            d="M12 6.253v13"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity} × NPR{" "}
                      {Number(item.price).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-700">
                    NPR {Number(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}

              <div className="space-y-2 pt-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    NPR {Number(order.subtotal).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    Delivery
                    {order.deliveryZone?.name && (
                      <span className="block text-[10px] text-gray-400 font-medium mt-0.5">
                        {order.deliveryZone.name}
                      </span>
                    )}
                  </span>
                  <span className="font-semibold">
                    {Number(order.deliveryFee) === 0
                      ? "Free"
                      : `NPR ${Number(order.deliveryFee).toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-extrabold text-green-700 text-lg">
                    NPR {Number(order.total).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between text-xs">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-bold text-gray-700">
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "QR Code"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-yellow-400 rounded-full" />
                Shipping To
              </h3>
              <p className="text-sm font-bold text-gray-900">
                {order.shippingAddress.name}
              </p>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.phone}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {order.shippingAddress.address}
                {order.shippingAddress.city &&
                  `, ${order.shippingAddress.city}`}
              </p>
              {order.deliveryZone?.name && (
                <p className="text-xs text-gray-500 mt-2 inline-flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {order.deliveryZone.name}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Link
                to="/profile?tab=orders"
                className="w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl transition"
              >
                View My Orders
              </Link>
              <Link
                to="/books"
                className="w-full text-center bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-md transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CHECKOUT FORM
  // ==========================================================
  return (
    <div className="container-x py-8 md:py-12 animate-fade-in">
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link to="/" className="hover:text-red-700">
          Home
        </Link>
        <span>/</span>
        <Link to={`/books/${bookId}`} className="hover:text-red-700">
          Book Details
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Checkout</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-8">
        Checkout
      </h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-7 space-y-6">
            {/* QUANTITY */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-red-600 rounded-full" />
                Quantity
              </h2>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm hover:bg-red-50 hover:text-red-600 disabled:opacity-40 transition"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={maxQty}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Math.min(maxQty, Number(e.target.value)))
                      )
                    }
                    className="w-16 text-center font-bold text-lg bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                    disabled={quantity >= maxQty}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-gray-700 shadow-sm hover:bg-green-50 hover:text-green-600 disabled:opacity-40 transition"
                  >
                    +
                  </button>
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    Stock available:{" "}
                    <span className="font-bold text-gray-800">{maxQty}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Unit price:{" "}
                    <span className="font-bold text-gray-800">
                      NPR {Number(book.price).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* DELIVERY ZONE */}
            {(settings.deliveryZones || []).length > 0 && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-green-600 rounded-full" />
                  Delivery Zone
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Choose the area where you want your order delivered.
                </p>

                <div className="space-y-2">
                  {settings.deliveryZones.map((zone) => {
                    const selected = deliveryZoneId === zone.id;
                    return (
                      <label
                        key={zone.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                          selected
                            ? "border-red-500 bg-red-50/50"
                            : "border-gray-200 hover:border-yellow-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryZone"
                          checked={selected}
                          onChange={() => setDeliveryZoneId(zone.id)}
                          className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-bold text-gray-900">
                              {zone.name}
                            </p>
                            <span className="text-sm font-extrabold text-green-700">
                              {Number(zone.charge) === 0
                                ? "Free"
                                : `NPR ${Number(zone.charge).toLocaleString()}`}
                            </span>
                          </div>
                          {zone.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {zone.description}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PAYMENT METHOD */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-yellow-400 rounded-full" />
                Payment Method
              </h2>

              <div className="space-y-3">
                {settings.paymentMethods?.qr && (
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === "qr"
                        ? "border-red-500 bg-red-50/50"
                        : "border-gray-200 hover:border-yellow-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "qr"}
                      onChange={() => setPaymentMethod("qr")}
                      className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        QR Code Payment
                        <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Scan the QR shown on the next step and upload payment
                        proof.
                      </p>
                    </div>
                  </label>
                )}

                {settings.paymentMethods?.cod && (
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                      paymentMethod === "cod"
                        ? "border-red-500 bg-red-50/50"
                        : "border-gray-200 hover:border-yellow-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Pay in cash when your order is delivered.
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* ADDRESS */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-green-600 rounded-full" />
                  Shipping Address
                </h2>
                {addresses.length > 0 && !showAddressForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs font-semibold text-red-700 hover:underline"
                  >
                    + Add new
                  </button>
                )}
              </div>

              {addresses.length > 0 && !showAddressForm && (
                <div className="space-y-3 mb-2">
                  {addresses.map((a) => (
                    <label
                      key={a._id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                        selectedAddressId === a._id
                          ? "border-red-500 bg-red-50/50"
                          : "border-gray-200 hover:border-yellow-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === a._id}
                        onChange={() => setSelectedAddressId(a._id)}
                        className="mt-1 w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-900">
                            {a.name}
                          </span>
                          <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {a.label}
                          </span>
                          {a.isDefault && (
                            <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{a.phone}</p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {a.address}
                          {a.city && `, ${a.city}`}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {(showAddressForm || addresses.length === 0) && (
                <div className="space-y-4">
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="text-xs font-semibold text-gray-500 hover:text-red-700"
                    >
                      ← Back to saved addresses
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Label"
                      value={newAddress.label}
                      onChange={(v) =>
                        setNewAddress({ ...newAddress, label: v })
                      }
                      placeholder="Home / Office"
                    />
                    <Field
                      label="Full Name *"
                      value={newAddress.name}
                      onChange={(v) =>
                        setNewAddress({ ...newAddress, name: v })
                      }
                      placeholder="John Doe"
                      required
                    />
                    <Field
                      label="Phone *"
                      value={newAddress.phone}
                      onChange={(v) =>
                        setNewAddress({ ...newAddress, phone: v })
                      }
                      placeholder="+977-98XXXXXXXX"
                      required
                    />
                    <Field
                      label="City"
                      value={newAddress.city}
                      onChange={(v) =>
                        setNewAddress({ ...newAddress, city: v })
                      }
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
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition resize-none text-sm"
                      placeholder="Street, ward, landmark..."
                    />
                  </div>

                  <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddressToProfile}
                      onChange={(e) =>
                        setSaveAddressToProfile(e.target.checked)
                      }
                      className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span>
                      Save this address to my profile for future orders
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* NOTES */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-yellow-400 rounded-full" />
                Order Notes (optional)
              </h2>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition resize-none text-sm"
                placeholder="Any special instructions for delivery..."
              />
            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-red-600 rounded-full" />
                Order Summary
              </h2>

              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                <div className="w-16 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {book.images?.[0]?.url ? (
                    <img
                      src={book.images[0].url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
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
                          d="M12 6.253v13"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 line-clamp-2">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    by {book.author}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Quantity: <span className="font-bold">{quantity}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Unit Price × {quantity}</span>
                  <span className="font-semibold">
                    NPR {Number(pricing.unit * quantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>
                    Delivery
                    {pricing.zone?.name && (
                      <span className="block text-[10px] text-gray-400 font-medium mt-0.5">
                        {pricing.zone.name}
                      </span>
                    )}
                  </span>
                  <span className="font-semibold">
                    {pricing.delivery === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `NPR ${Number(pricing.delivery).toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <span className="font-bold text-gray-900 text-base">
                    Total
                  </span>
                  <span className="font-extrabold text-green-700 text-xl">
                    NPR {Number(pricing.total).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-xs text-yellow-800">
                {paymentMethod === "cod"
                  ? "Pay in cash on delivery"
                  : "Pay via QR after placing the order"}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <p className="text-[11px] text-gray-400 text-center mt-3">
                {paymentMethod === "cod"
                  ? "Pay in cash when your order arrives."
                  : "You'll see a QR code to complete payment next."}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ==========================================================
// HELPERS
// ==========================================================
function Field({
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
        className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition text-sm"
      />
    </div>
  );
}