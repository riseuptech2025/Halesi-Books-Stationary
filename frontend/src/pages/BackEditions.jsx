// frontend/src/pages/BackEditions.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../utils/api";

export default function BackEditions() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/back-editions");
      setBooks(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unflag = async (id) => {
    if (!confirm("Remove this book from Back Editions?")) return;
    setBusy(id);
    try {
      await api.put(`/books/${id}`, { isBackEdition: false });
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove");
    } finally {
      setBusy(null);
    }
  };

  const filtered = books.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.isbn?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout
      title="Back Editions"
      subtitle="Old stock with heavy offers — shown to customers as a clearance collection."
    >
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
              placeholder="Search by title, author, or ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
            />
          </div>

          <Link
            to="/books"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-red-500/30 transition"
          >
            + Add from Books
          </Link>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {filtered.length} of {books.length} back-edition books
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-md p-16 flex justify-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-16 text-center">
          <p className="text-base font-semibold text-gray-800">
            No back-edition books yet
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Open any book from <strong>Books</strong> and tick
            &quot;Back Edition&quot;.
          </p>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-red-500/30 transition"
          >
            Go to Books
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const cover = b.images?.[0]?.url;
            const hasDisc = Number(b.discountPercent) > 0;
            const finalPrice = hasDisc ? b.finalPrice : b.price;
            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-start gap-4"
              >
                <div className="w-20 h-28 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {cover ? (
                    <img
                      src={cover}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg
                        className="w-8 h-8"
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
                  <h3 className="font-bold text-gray-900 truncate">{b.title}</h3>
                  <p className="text-sm text-gray-500">by {b.author}</p>
                  {b.backEditionNote && (
                    <p className="text-xs text-red-700 font-semibold mt-1">
                      📌 {b.backEditionNote}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {hasDisc ? (
                      <>
                        <span className="text-lg font-extrabold text-green-700">
                          NPR {Number(finalPrice).toLocaleString()}
                        </span>
                        <span className="text-xs line-through text-gray-400">
                          NPR {Number(b.originalPrice).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">
                          -{b.discountPercent}%
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-extrabold text-green-700">
                        NPR {Number(b.price).toLocaleString()}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      · Stock: {b.stock}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link
                    to="/books"
                    className="px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-xs font-semibold transition text-center"
                  >
                    Edit Price/Discount
                  </Link>
                  <button
                    onClick={() => unflag(b._id)}
                    disabled={busy === b._id}
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold transition disabled:opacity-60"
                  >
                    {busy === b._id ? "..." : "Remove from Back Edition"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}