// frontend/src/pages/Settings.jsx
import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { admin } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [uploadingQR, setUploadingQR] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/settings");
      setSettings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (patch) => {
    setSaving(true);
    try {
      const { data } = await api.put("/admin/settings", patch);
      setSettings(data);
      showToast("Settings saved");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ---------- QR upload ----------
  const handleQRUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be under 5 MB");
      return;
    }

    setUploadingQR(true);
    try {
      const { data: sign } = await api.post("/upload/qr-sign");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sign.apiKey);
      fd.append("timestamp", sign.timestamp);
      fd.append("signature", sign.signature);
      fd.append("folder", sign.folder);

      const resp = await fetch(sign.uploadUrl, { method: "POST", body: fd });
      if (!resp.ok) throw new Error("Cloudinary upload failed");
      const result = await resp.json();

      await save({
        paymentQR: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to upload QR");
    } finally {
      setUploadingQR(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeQR = async () => {
    if (!confirm("Remove the QR code? Customers won't be able to pay by QR.")) return;
    await save({ paymentQR: null });
  };

  if (loading || !settings) {
    return (
      <Layout title="Settings" subtitle="Loading...">
        <div className="bg-white rounded-2xl shadow-md p-16 flex justify-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Settings"
      subtitle="Configure payment, delivery and store preferences."
    >
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---------- DELIVERY ZONES ---------- */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-green-600 rounded-full" />
            Delivery Zones & Charges
          </h3>
          <p className="text-xs text-gray-500 mb-5">
            Define delivery zones with their charges. Customers pick a zone at
            checkout and the fee is applied automatically.
          </p>

          <ZoneManager
            zones={settings.deliveryZones || []}
            onChange={(zones) => save({ deliveryZones: zones })}
            saving={saving}
          />
        </div>

        {/* ---------- PAYMENT METHODS ---------- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-red-600 rounded-full" />
            Payment Methods
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Enable or disable payment options for customers.
          </p>

          <div className="space-y-3">
            <ToggleRow
              label="QR Code Payment"
              desc="Customer scans QR and uploads proof."
              enabled={settings.paymentMethods?.qr}
              onToggle={(v) =>
                save({
                  paymentMethods: { ...settings.paymentMethods, qr: v },
                })
              }
              disabled={saving}
            />
            <ToggleRow
              label="Cash on Delivery"
              desc="Customer pays in cash when the order arrives."
              enabled={settings.paymentMethods?.cod}
              onToggle={(v) =>
                save({
                  paymentMethods: { ...settings.paymentMethods, cod: v },
                })
              }
              disabled={saving}
            />
          </div>
        </div>

        {/* ---------- ADMIN INFO ---------- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-red-600 rounded-full" />
            Admin Account
          </h3>
          <div className="space-y-3 text-sm">
            <InfoRow label="Name" value={admin?.name} />
            <InfoRow label="Email" value={admin?.email} />
            <InfoRow label="Role" value={admin?.role} />
          </div>
        </div>

        {/* ---------- PAYMENT QR ---------- */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-yellow-400 rounded-full" />
            Payment QR Code
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Upload the QR code customers will scan to pay. Recommended: square
            PNG, at least 400×400 px.
          </p>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-56 flex-shrink-0">
              <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center overflow-hidden">
                {settings.paymentQR?.url ? (
                  <img
                    src={settings.paymentQR.url}
                    alt="Payment QR"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-400 px-4">
                    <svg
                      className="w-12 h-12 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    <p className="text-xs">No QR uploaded</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleQRUpload(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingQR}
                className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-3 px-5 rounded-xl shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2 max-w-xs"
              >
                {uploadingQR ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {settings.paymentQR?.url ? "Replace QR" : "Upload QR"}
                  </>
                )}
              </button>

              {settings.paymentQR?.url && (
                <button
                  type="button"
                  onClick={removeQR}
                  disabled={saving}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold py-2.5 px-5 rounded-xl transition max-w-xs disabled:opacity-60"
                >
                  Remove QR
                </button>
              )}

              <p className="text-xs text-gray-400 max-w-md">
                The uploaded image is hosted on Cloudinary and shown to
                customers on the payment step after checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ============================================================
// ZONE MANAGER
// ============================================================
function ZoneManager({ zones, onChange, saving }) {
  const [draft, setDraft] = useState(zones);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    setDraft(zones);
  }, [zones]);

  const update = (i, patch) => {
    setDraft((prev) =>
      prev.map((z, idx) => (idx === i ? { ...z, ...patch } : z))
    );
  };

  const addZone = () => {
    setDraft((prev) => [
      ...prev,
      {
        id: `zone-${Date.now()}`,
        name: "",
        description: "",
        charge: 0,
      },
    ]);
    setEditingIndex(draft.length);
  };

  const removeZone = (i) => {
    if (!confirm("Remove this zone?")) return;
    const next = draft.filter((_, idx) => idx !== i);
    setDraft(next);
    onChange(next);
    setEditingIndex(null);
  };

  const saveZones = () => {
    for (const z of draft) {
      if (!z.name?.trim()) {
        alert("Every zone must have a name.");
        return;
      }
      if (z.charge < 0 || Number.isNaN(Number(z.charge))) {
        alert("Charge must be zero or a positive number.");
        return;
      }
    }
    onChange(
      draft.map((z) => ({
        id: z.id,
        name: z.name.trim(),
        description: (z.description || "").trim(),
        charge: Number(z.charge) || 0,
      }))
    );
    setEditingIndex(null);
  };

  return (
    <div className="space-y-3">
      {draft.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-sm text-gray-500">
            No zones defined yet. Click "Add Zone" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {draft.map((zone, i) => {
            const isEditing = editingIndex === i;
            return (
              <div
                key={zone.id || i}
                className={`rounded-xl border-2 transition ${
                  isEditing
                    ? "border-red-400 bg-red-50/40"
                    : "border-gray-100 bg-white hover:border-yellow-300"
                }`}
              >
                {!isEditing ? (
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {zone.name}
                      </p>
                      {zone.description && (
                        <p className="text-xs text-gray-500 truncate">
                          {zone.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-extrabold text-green-700 flex-shrink-0">
                      {Number(zone.charge) === 0
                        ? "Free"
                        : `NPR ${Number(zone.charge).toLocaleString()}`}
                    </span>
                    <button
                      onClick={() => setEditingIndex(i)}
                      className="w-8 h-8 rounded-lg hover:bg-green-50 text-green-700 flex items-center justify-center transition"
                      title="Edit"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeZone(i)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center transition"
                      title="Delete"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Zone Name *
                        </label>
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => update(i, { name: e.target.value })}
                          placeholder="e.g. Inside Halesi"
                          className="w-full px-3 py-2 rounded-lg border-2 border-yellow-300 bg-yellow-50/50 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Charge (NPR) *
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={zone.charge}
                          onChange={(e) =>
                            update(i, { charge: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border-2 border-yellow-300 bg-yellow-50/50 text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:bg-white transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={zone.description || ""}
                        onChange={(e) =>
                          update(i, { description: e.target.value })
                        }
                        placeholder="e.g. Free delivery within Halesi town"
                        className="w-full px-3 py-2 rounded-lg border-2 border-yellow-300 bg-yellow-50/50 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingIndex(null)}
                        className="flex-1 py-2 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition"
                      >
                        Done
                      </button>
                      <button
                        type="button"
                        onClick={() => removeZone(i)}
                        className="py-2 px-4 rounded-lg bg-red-50 text-red-700 font-semibold text-xs hover:bg-red-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={addZone}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-green-300 text-green-700 font-semibold text-sm hover:bg-green-50 transition"
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
          Add Zone
        </button>
        <button
          type="button"
          onClick={saveZones}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white font-semibold py-2.5 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Zones"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SHARED HELPERS
// ============================================================
function ToggleRow({ label, desc, enabled, onToggle, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl">
      <div>
        <p className="text-sm font-bold text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        disabled={disabled}
        className={`relative w-12 h-7 rounded-full transition ${
          enabled ? "bg-green-500" : "bg-gray-300"
        } disabled:opacity-60`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide font-bold text-gray-500">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 break-all">
        {value || "—"}
      </p>
    </div>
  );
}