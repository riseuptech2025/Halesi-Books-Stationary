// client/src/pages/MaterialList.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { CATEGORY_OPTIONS, categoryLabel } from "../utils/categories";

export default function MaterialList() {
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
        const { data } = await api.get("/public/materials", { params });
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
    category === "all" ? "All Study Materials" : categoryLabel(category);

  return (
    <div className="container-x py-10 animate-fade-in">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-green-700">
          Study Materials
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 font-display">
          {activeLabel}
        </h1>
        <p className="text-gray-600 mt-2">
          Notes and study guides for exam preparation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => navigate("/materials/all")}
          className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition ${
            category === "all"
              ? "bg-green-700 text-white border-green-700"
              : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
          }`}
        >
          All
        </button>
        {CATEGORY_OPTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/materials/${c.id}`)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition ${
              category === c.id
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
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
            No study materials in this category yet
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Check back soon for new notes and guides.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((m) => (
            <Link
              key={m._id}
              to={`/materials/detail/${m._id}`}
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border-t-4 border-t-green-400 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-video bg-gradient-to-br from-green-100 via-yellow-50 to-red-100 overflow-hidden">
                {m.image?.url ? (
                  <img
                    src={m.image.url}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-green-300">
                    <svg
                      className="w-16 h-16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-green-700 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow">
                  {categoryLabel(m.category)}
                </span>

                {/* PDF badge */}
                {m.documents?.length > 0 && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1 shadow">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                    </svg>
                    {m.documents.length} PDF
                    {m.documents.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-green-700 transition">
                  {m.title}
                </h3>
                {m.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {m.description}
                  </p>
                )}
                <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {m.publishedAt
                      ? new Date(m.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                  <span className="font-semibold text-green-700 group-hover:underline">
                    Read →
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