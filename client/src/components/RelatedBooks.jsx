// client/src/components/RelatedBooks.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function RelatedBooks({ category, excludeId }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    (async () => {
      try {
        const { data } = await api.get("/public/books");
        const related = data
          .filter((b) => b.category === category && b._id !== excludeId)
          .slice(0, 8);
        setBooks(related);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [category, excludeId]);

  if (loading || books.length === 0) return null;

  return (
    <div className="mt-12 pt-10 border-t border-gray-200">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-700">
            More like this
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-1 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-yellow-400 rounded-full" />
            Related Books
          </h2>
        </div>
        <Link
          to="/books"
          className="text-sm font-semibold text-red-700 hover:text-red-800 hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {books.map((b) => (
          <Link
            key={b._id}
            to={`/books/${b._id}`}
            className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border-t-4 border-t-yellow-400 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="relative aspect-[3/4] bg-gradient-to-br from-red-100 via-yellow-50 to-green-100 flex items-center justify-center overflow-hidden">
              {b.images?.[0]?.url ? (
                <img
                  src={b.images[0].url}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-20 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-red-200">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              )}

              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-red-700 text-[10px] font-bold uppercase px-2 py-1 rounded-full shadow">
                {b.category || "General"}
              </span>
            </div>

            <div className="p-3 flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-red-700 transition">
                {b.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                by {b.author}
              </p>
              <p className="text-base font-extrabold text-green-700 mt-auto">
                NPR {Number(b.price).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}