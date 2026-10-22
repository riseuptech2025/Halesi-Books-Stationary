// client/src/pages/BlogList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/public/blogs");
        setBlogs(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load posts.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container-x py-10 animate-fade-in">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-red-700">
          Blog
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 font-display">
          Stories & Reads
        </h1>
        <p className="text-gray-600 mt-2">
          Reading lists, tips, and updates from Halesi Books Centre.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {!loading && !error && blogs.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md p-16 text-center">
          <p className="text-base font-semibold text-gray-800">
            No posts yet
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Check back soon for reading tips and updates.
          </p>
        </div>
      )}

      {!loading && !error && blogs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <Link
              key={b._id}
              to={`/blog/${b.slug}`}
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border-t-4 border-t-yellow-400 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-video bg-gradient-to-br from-red-100 via-yellow-50 to-green-100 overflow-hidden">
                {b.cover?.url ? (
                  <img
                    src={b.cover.url}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-red-300">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m0 0a2 2 0 012 2v9a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span>{b.author}</span>
                  <span>·</span>
                  <span>
                    {new Date(b.publishedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 group-hover:text-red-700 transition">
                  {b.title}
                </h3>
                {b.excerpt && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {b.excerpt}
                  </p>
                )}
                <span className="mt-4 text-sm font-semibold text-red-700 group-hover:underline">
                  Read more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}