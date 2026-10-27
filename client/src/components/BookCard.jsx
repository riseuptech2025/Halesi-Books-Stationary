// client/src/components/BookCard.jsx
import { Link } from "react-router-dom";

export default function BookCard({ book }) {
  const cover = book.images?.[0]?.url;

  const stockStatus =
    book.stock === 0
      ? { label: "Out of Stock", cls: "bg-red-100 text-red-700" }
      : book.stock <= 5
      ? { label: "Only few left", cls: "bg-yellow-100 text-yellow-800" }
      : { label: "In Stock", cls: "bg-green-100 text-green-700" };

  return (
    <Link
      to={`/books/${book._id}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl border-t-4 border-t-yellow-400 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* 5:7 portrait cover */}
      <div className="relative aspect-[5/7] bg-gradient-to-br from-red-100 via-yellow-50 to-green-100 flex items-center justify-center overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-20 h-28 bg-white rounded-lg shadow-xl flex items-center justify-center border-2 border-red-200">
            <svg
              className="w-10 h-10 text-red-600"
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

        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-red-700 text-[11px] font-bold uppercase px-2.5 py-1 rounded-full shadow">
          {book.category || "General"}
        </span>

        {book.images?.length > 1 && (
          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-[11px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {book.images.length}
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3
          className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-1 group-hover:text-red-700 transition"
          title={book.title}
        >
          {book.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-1 mb-3">
          by {book.author}
        </p>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-lg font-extrabold text-green-700">
              NPR {Number(book.price).toLocaleString()}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${stockStatus.cls}`}
          >
            {stockStatus.label}
          </span>
        </div>
      </div>
    </Link>
  );
}