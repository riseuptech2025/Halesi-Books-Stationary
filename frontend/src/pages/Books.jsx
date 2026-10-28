// frontend/src/pages/Books.jsx
import { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import BookFormModal from "../components/BookFormModal";
import api from "../utils/api";

const CATEGORIES = [
  "General",
  "Academic",
  "Literature",
  "Religion",
  "Children",
  "Competitive",
  "Reference",
];

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/books");
      setBooks(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load books. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesSearch =
        !search ||
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.author?.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || b.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [books, search, categoryFilter]);

  const handleSave = async (formData) => {
    if (editingBook) {
      const { data } = await api.put(`/books/${editingBook._id}`, formData);
      setBooks((prev) =>
        prev.map((b) => (b._id === editingBook._id ? data : b))
      );
      return data;
    } else {
      const { data } = await api.post("/books", formData);
      setBooks((prev) => [data, ...prev]);
      return data;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/books/${id}`);
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete book");
    } finally {
      setDeletingId(null);
    }
  };

  const openAddModal = () => {
    setEditingBook(null);
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBook(null);
  };

  return (
    <Layout
      title="Books Management"
      subtitle="Manage your book inventory — add, edit, or remove books."
    >
      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-md border-l-4 border-l-red-600 p-4 mb-6">
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-gray-800 placeholder-amber-700/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-gray-800 font-medium focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:bg-white transition"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Book
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {filteredBooks.length} of {books.length} books
          </span>
          {(search || categoryFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setCategoryFilter("All");
              }}
              className="text-red-600 hover:text-red-800 font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl shadow-md p-16 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-medium">Loading books...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="font-semibold">Failed to load</p>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchBooks}
            className="text-sm font-semibold text-red-800 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filteredBooks.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md p-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          {books.length === 0 ? (
            <>
              <p className="text-base font-semibold text-gray-800">No books added yet</p>
              <p className="text-sm text-gray-500 mt-1 mb-5">
                Start by adding your first book to the inventory.
              </p>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-red-500/30 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Book
              </button>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-gray-800">No books match your filters</p>
              <p className="text-sm text-gray-500 mt-1">
                Try adjusting your search or category filter.
              </p>
            </>
          )}
        </div>
      )}

      {!loading && !error && filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onEdit={() => openEditModal(book)}
              onDelete={() => handleDelete(book._id)}
              deleting={deletingId === book._id}
            />
          ))}
        </div>
      )}

      {showModal && (
        <BookFormModal
          book={editingBook}
          categories={CATEGORIES}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </Layout>
  );
}

// ================= BOOK CARD =================
function BookCard({ book, onEdit, onDelete, deleting }) {
  const cover = book.images?.[0]?.url;

  const stockStatus =
    book.stock === 0
      ? { label: "Out of stock", cls: "bg-red-100 text-red-700" }
      : book.stock <= 5
      ? { label: `Low stock (${book.stock})`, cls: "bg-yellow-100 text-yellow-800" }
      : { label: `In stock (${book.stock})`, cls: "bg-green-100 text-green-700" };

  // Determine what price to show (works whether or not admin GET is decorated)
  const discountPercent = Number(book.discountPercent) || 0;
  const hasPerBookDiscount = discountPercent > 0;
  const finalPrice = hasPerBookDiscount
    ? Math.round(book.price * (1 - discountPercent / 100) * 100) / 100
    : Number(book.price) || 0;

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl border-t-4 border-t-yellow-400 hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="relative h-48 bg-gradient-to-br from-red-100 via-yellow-50 to-green-100 flex items-center justify-center overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="w-16 h-20 bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-red-200">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}

        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow">
          {book.category || "General"}
        </span>

        {hasPerBookDiscount && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-lg">
            -{discountPercent}%
          </span>
        )}

        {!hasPerBookDiscount && book.images?.length > 1 && (
          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-1"
          title={book.title}
        >
          {book.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-1">
          by {book.author}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            {hasPerBookDiscount ? (
              <div>
                <p className="text-lg font-bold text-green-700">
                  NPR {finalPrice.toLocaleString()}
                </p>
                <p className="text-xs line-through text-gray-400">
                  NPR {Number(book.price).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold text-green-700">
                NPR {Number(book.price).toLocaleString()}
              </p>
            )}
          </div>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${stockStatus.cls}`}
          >
            {stockStatus.label}
          </span>
        </div>

        {book.isbn && (
          <p className="text-[11px] text-gray-400 mb-3 truncate">ISBN: {book.isbn}</p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 py-2 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-700 rounded-full animate-spin" />
                Deleting
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}