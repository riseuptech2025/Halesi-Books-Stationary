// client/src/pages/BackEditions.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import BookCard from "../components/BookCard";

export default function BackEditions() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/public/back-editions");
        setBooks(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load back editions."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container-x py-10 animate-fade-in">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-yellow-500 text-white p-8 md:p-12 mb-8 shadow-xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/20 backdrop-blur px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
            Clearance Collection
          </span>
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1]">
            Back Editions
          </h1>
          <p className="mt-3 text-red-50 max-w-2xl text-sm md:text-base leading-relaxed">
            Old stock, previous editions and gently used books — now available
            at <strong>heavy discounts</strong>. Once sold, they&apos;re gone.
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse"
            >
              <div className="aspect-[5/7] bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl">
          {error}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-yellow-50 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-base font-semibold text-gray-800">
            No back editions right now
          </p>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Check back soon — new clearance stock lands regularly.
          </p>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md transition"
          >
            Browse All Books
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-800">{books.length}</span>{" "}
              book{books.length !== 1 ? "s" : ""} on clearance
            </p>
            <Link
              to="/books"
              className="text-sm font-semibold text-red-700 hover:underline"
            >
              Browse full collection →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {books.map((b) => (
              <BookCard key={b._id} book={b} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}