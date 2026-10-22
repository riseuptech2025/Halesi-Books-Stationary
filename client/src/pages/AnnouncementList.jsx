// client/src/pages/AnnouncementList.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { CATEGORY_OPTIONS, categoryLabel } from "../utils/categories";

export default function AnnouncementList() {
  const { category = "all" } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const params = category === "all" ? {} : { category };
        const { data } = await api.get("/public/announcements", { params });
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Failed to load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category]);

  const activeLabel =
    category === "all" ? "All Notices" : categoryLabel(category);

  return (
    <div className="container-x py-10 animate-fade-in">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-red-700">
          Announcements
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 font-display">
          {activeLabel}
        </h1>
        <p className="text-gray-600 mt-2">
          Latest official notices and job vacancies.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => navigate("/announcements/all")}
          className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition ${
            category === "all"
              ? "bg-red-700 text-white border-red-700"
              : "bg-white text-gray-700 border-gray-200 hover:border-red-300"
          }`}
        >
          All
        </button>
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/announcements/${c.id}`)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition ${
              category === c.id
                ? "bg-red-700 text-white border-red-700"
                : "bg-white text-gray-700 border-gray-200 hover:border-red-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow animate-pulse">
              <div className="aspect-video bg-gray-100 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md p-16 text-center">
          <p className="text-base font-semibold text-gray-800">
            No announcements in this category yet
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Check back soon for new notices.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((a) => (
            <Link
              key={a._id}
              to={`/announcements/detail/${a._id}`}
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border-t-4 border-t-yellow-400 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-video bg-gradient-to-br from-red-100 via-yellow-50 to-green-100 overflow-hidden">
                {a.image?.url ? (
                  <img
                    src={a.image.url}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-red-300">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-red-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow">
                  {categoryLabel(a.category)}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-red-700 transition">
                  {a.title}
                </h3>
                {a.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {a.description}
                  </p>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {a.publishedAt
                      ? new Date(a.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                  <span className="font-semibold text-red-700 group-hover:underline">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}