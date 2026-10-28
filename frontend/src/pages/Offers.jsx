import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../utils/api";

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/offers");
      setOffers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete this offer? All books revert to normal price.")) return;
    setBusy(id);
    try {
      await api.delete(`/admin/offers/${id}`);
      setOffers((p) => p.filter((o) => o._id !== id));
    } finally {
      setBusy(null);
    }
  };

  const toggleActive = async (offer) => {
    setBusy(offer._id);
    try {
      const { data } = await api.patch(`/admin/offers/${offer._id}`, {
        active: !offer.active,
      });
      setOffers((p) => p.map((o) => (o._id === offer._id ? data : o)));
    } finally {
      setBusy(null);
    }
  };

  const statusOf = (o) => {
    const now = new Date();
    if (!o.active) return { label: "Disabled", cls: "bg-gray-100 text-gray-600" };
    if (new Date(o.startsAt) > now) return { label: "Scheduled", cls: "bg-blue-100 text-blue-700" };
    if (new Date(o.endsAt) < now) return { label: "Expired", cls: "bg-red-100 text-red-700" };
    return { label: "Active now", cls: "bg-green-100 text-green-700" };
  };

  return (
    <Layout title="Offers & Sales" subtitle="Run store-wide discounts for a period of time.">
      <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-yellow-400 p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-gray-600">
          {offers.length} offer{offers.length !== 1 ? "s" : ""}
        </p>
        <Link
          to="/offers/new"
          className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-red-500/30 transition"
        >
          + New Offer
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow p-16 flex justify-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-16 text-center">
          <p className="font-semibold text-gray-800">No offers yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Create a store-wide sale that applies to all books.
          </p>
          <Link to="/offers/new" className="inline-flex bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold">
            Create First Offer
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((o) => {
            const s = statusOf(o);
            return (
              <div key={o._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900">{o.name}</h3>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${s.cls}`}>
                        {s.label}
                      </span>
                      <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                        {o.percent}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(o.startsAt).toLocaleString("en-GB")} →{" "}
                      {new Date(o.endsAt).toLocaleString("en-GB")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {o.categories?.length > 0
                        ? `Categories: ${o.categories.join(", ")}`
                        : "Applies to all books"}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(o)}
                      disabled={busy === o._id}
                      className="px-3 py-2 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs font-semibold hover:bg-yellow-100 disabled:opacity-60"
                    >
                      {o.active ? "Disable" : "Enable"}
                    </button>
                    <Link
                      to={`/offers/${o._id}/edit`}
                      className="px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-semibold hover:bg-green-100"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => remove(o._id)}
                      disabled={busy === o._id}
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold hover:bg-red-100 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}