// client/src/components/ReviewSection.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import StarRating from "./StarRating";

export default function ReviewSection({ bookId }) {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reviews/${bookId}`);
      setData(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post(`/reviews/${bookId}`, { rating, comment });
      setComment("");
      setRating(5);
      await fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyReviewed = data.reviews.some((r) => r.userId === user?.id);

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-red-600 rounded-full" />
            Customer Reviews
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {data.totalReviews === 0
              ? "No reviews yet"
              : `${data.totalReviews} review${data.totalReviews > 1 ? "s" : ""}`}
          </p>
        </div>

        {data.totalReviews > 0 && (
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2">
            <div className="text-3xl font-extrabold text-yellow-600">
              {data.averageRating}
            </div>
            <div>
              <StarRating value={data.averageRating} size={16} />
              <p className="text-xs text-gray-500 mt-0.5">
                out of 5 stars
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add review form */}
      {isAuthenticated ? (
        alreadyReviewed ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm mb-6">
            ✅ Thanks for your review! You can only submit one review per book.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-50 rounded-2xl border border-gray-100 p-5 mb-6"
          >
            <h3 className="text-base font-bold text-gray-900 mb-3">
              Write a Review
            </h3>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded text-sm mb-3">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Rating *
              </label>
              <StarRating
                value={rating}
                size={28}
                readOnly={false}
                onChange={setRating}
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Comment
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this book..."
                className="w-full px-3 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition resize-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md transition disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-xl p-4 text-sm mb-6 flex items-center justify-between flex-wrap gap-3">
          <span>Please sign in to write a review.</span>
          <Link
            to={`/login?redirect=${encodeURIComponent(
              window.location.pathname
            )}`}
            className="font-semibold text-red-700 hover:underline"
          >
            Sign In →
          </Link>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-xl p-4 animate-pulse h-20"
            />
          ))}
        </div>
      ) : data.reviews.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5h6a2 2 0 012 2v11a2 2 0 01-2 2h-6M11 5a2 2 0 100-4 2 2 0 000 4zm-5 8a2 2 0 100-4 2 2 0 000 4zm0 8a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            Be the first to review this book
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.reviews.map((r) => (
            <div
              key={r._id}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {(r.userName || "A").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">
                      {r.userName || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="mt-1">
                    <StarRating value={r.rating} size={14} />
                  </div>
                  {r.comment && (
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}