// frontend/src/components/ContentAdminPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import api from "../utils/api";
import { CATEGORY_OPTIONS, categoryLabel } from "../utils/categories";

const STATUS_STYLES = {
  published: "bg-green-100 text-green-800 border-green-200",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export default function ContentAdminPage({
  title,
  subtitle,
  apiBase,          // "/admin/announcements" or "/admin/materials"
  routeBase,        // "/announcements" or "/materials"
  showWebsiteUrl = false,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const { data } = await api.get(apiBase, { params });
      setItems(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleDelete = async (id, itemTitle) => {
    if (!confirm(`Delete "${itemTitle}"?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`${apiBase}/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout title={title} subtitle={subtitle}>
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
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm font-medium focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:bg-white transition"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm font-medium focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:bg-white transition"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <Link
            to={`${routeBase}/new`}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-red-500/30 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </Link>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* States */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-md p-16 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl">
          <p className="font-semibold">Failed to load</p>
          <p className="text-sm mt-0.5">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-16 text-center">
          <p className="text-base font-semibold text-gray-800">
            No items yet
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Create your first entry.
          </p>
          <Link
            to={`${routeBase}/new`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-600 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-red-500/30 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create First Item
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              <div className="flex items-start gap-4 p-4">
                <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {it.image?.url ? (
                    <img
                      src={it.image.url}
                      alt={it.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                      {categoryLabel(it.category)}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        STATUS_STYLES[it.status] || ""
                      }`}
                    >
                      {it.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 truncate">{it.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                    {it.description || "No description"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 flex-wrap">
                    <span>
                      {new Date(it.publishedAt || it.createdAt).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </span>
                    <span>·</span>
                    <span>{it.views || 0} views</span>
                    {showWebsiteUrl && it.websiteUrl && (
                      <>
                        <span>·</span>
                        <a
                          href={it.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 font-semibold hover:underline truncate max-w-[200px]"
                        >
                          Official site ↗
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  <Link
                    to={`${routeBase}/${it._id}/edit`}
                    className="px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-xs font-semibold transition text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(it._id, it.title)}
                    disabled={deletingId === it._id}
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold transition disabled:opacity-60"
                  >
                    {deletingId === it._id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}