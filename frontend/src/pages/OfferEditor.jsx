import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../utils/api";

const CATEGORIES = [
  { id: "General", label: "General" },
  { id: "Academic", label: "Academic" },
  { id: "Literature", label: "Literature" },
  { id: "Religion", label: "Religion" },
  { id: "Children", label: "Children" },
  { id: "Competitive", label: "Competitive" },
  { id: "Reference", label: "Reference" },
];

const EMPTY = {
  name: "",
  percent: 10,
  startsAt: new Date().toISOString().slice(0, 10),
  endsAt: "",
  categories: [],
  active: true,
};

export default function OfferEditor() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        const { data } = await api.get(`/admin/offers/${id}`);
        setForm({
          name: data.name || "",
          percent: data.percent ?? 10,
          startsAt: new Date(data.startsAt).toISOString().slice(0, 10),
          endsAt: new Date(data.endsAt).toISOString().slice(0, 10),
          categories: Array.isArray(data.categories) ? data.categories : [],
          active: data.active !== false,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEditing]);

  const toggleCat = (cid) => {
    setForm((p) => ({
      ...p,
      categories: p.categories.includes(cid)
        ? p.categories.filter((c) => c !== cid)
        : [...p.categories, cid],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Name is required.");
    if (form.percent < 1 || form.percent > 90) return setError("Percent 1–90.");
    if (!form.startsAt || !form.endsAt) return setError("Both dates required.");
    if (new Date(form.endsAt) <= new Date(form.startsAt))
      return setError("End date must be after start date.");

    const payload = {
      name: form.name.trim(),
      percent: Number(form.percent),
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      categories: form.categories,
      active: form.active,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await api.patch(`/admin/offers/${id}`, payload);
      } else {
        await api.post("/admin/offers", payload);
      }
      navigate("/offers", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Offer" subtitle="Loading...">
        <div className="bg-white rounded-2xl shadow p-16 flex justify-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isEditing ? "Edit Offer" : "New Offer"} subtitle="Store-wide sale campaign.">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Offer Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Dashain Sale 2026"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount % *</label>
            <input
              type="number"
              min="1"
              max="90"
              value={form.percent}
              onChange={(e) => setForm({ ...form, percent: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Starts *</label>
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ends *</label>
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Apply to Categories (leave empty = ALL books)
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CATEGORIES.map((c) => {
                const on = form.categories.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCat(c.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
                      on
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-white text-gray-700 border-gray-200 hover:border-red-300"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4"
            />
            Enabled (starts automatically on the start date)
          </label>
        </div>

        <div className="flex gap-3">
          <Link
            to="/offers"
            className="flex-1 text-center py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold py-2.5 rounded-xl shadow-lg disabled:opacity-60"
          >
            {saving ? "Saving..." : isEditing ? "Update Offer" : "Create Offer"}
          </button>
        </div>
      </form>
    </Layout>
  );
}