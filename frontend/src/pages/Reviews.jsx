// frontend/src/pages/Reviews.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/admin/reviews");
        setReviews(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete this review?")) return;
    setBusy(id);
    try {
      await api.delete("/admin/reviews", { data: { reviewId: id } });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Layout title="Reviews" subtitle="Moderate customer reviews.">
      {loading ? (
        <div className="bg-white rounded-2xl shadow-md p-16 flex justify-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-16 text-center">
          <p className="text-lg font-bold text-gray-800">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold flex-shrink-0">
                  {(r.userName || "A").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">
                      {r.userName || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleString("en-GB")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4"
                        fill={i < r.rating ? "#facc15" : "#e5e7eb"}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                      {r.comment}
                    </p>
                  )}
                  {r.book && (
                    <p className="text-xs text-gray-500 mt-2">
                      On:{" "}
                      <span className="font-semibold text-gray-700">
                        {r.book.title}
                      </span>{" "}
                      by {r.book.author}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => remove(r._id)}
                  disabled={busy === r._id}
                  className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center transition disabled:opacity-60"
                  title="Delete review"
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
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}