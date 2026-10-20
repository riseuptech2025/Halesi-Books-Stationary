// frontend/src/components/BookFormModal.jsx
import { useEffect, useState } from "react";
import ImageUploader from "./ImageUploader";
import RichTextEditor from "./RichTextEditor";

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  price: "",
  stock: "",
  category: "General",
  images: [],
  publishedYear: "",
  edition: "",
  language: "",
  colorFormat: "",
  description: "",
};

const LANGUAGES = [
  "English",
  "Nepali",
  "Hindi",
  "Sanskrit",
  "Tibetan",
  "Other",
];

const FORMATS = [
  "Paperback",
  "Hardcover",
  "E-Book",
  "Audiobook",
  "Spiral",
  "Other",
];

export default function BookFormModal({ book, categories, onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!book;

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        price: book.price ?? "",
        stock: book.stock ?? "",
        category: book.category || "General",
        images: Array.isArray(book.images) ? book.images : [],
        publishedYear: book.publishedYear ?? "",
        edition: book.edition || "",
        language: book.language || "",
        colorFormat: book.colorFormat || "",
        description: book.description || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [book]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImagesChange = (images) => {
    setForm((prev) => ({ ...prev, images }));
  };

  const handleDescriptionChange = (html) => {
    setForm((prev) => ({ ...prev, description: html }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.author.trim()) {
      setError("Title and author are required.");
      return;
    }
    if (form.price === "" || Number(form.price) < 0) {
      setError("Please enter a valid price.");
      return;
    }
    if (form.stock === "" || Number(form.stock) < 0) {
      setError("Please enter a valid stock quantity.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        author: form.author.trim(),
        isbn: form.isbn.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        images: form.images,
        publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
        edition: form.edition.trim(),
        language: form.language.trim(),
        colorFormat: form.colorFormat.trim(),
        description: form.description,
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save book. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl border-t-4 border-t-red-600 border-b-4 border-b-yellow-400 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isEditing
                      ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      : "M12 4v16m8-8H4"
                  }
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEditing ? "Edit Book" : "Add New Book"}
              </h2>
              <p className="text-xs text-gray-500">
                {isEditing
                  ? "Update the book details below."
                  : "Fill in the book details below."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ---- BASIC INFO ---- */}
          <SectionLabel>Basic Information</SectionLabel>

          <Field label="Title *" accent="red">
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Wings of Fire"
              className="input-base border-red-focus"
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Author *" accent="red">
              <input
                type="text"
                name="author"
                value={form.author}
                onChange={handleChange}
                required
                placeholder="e.g. A.P.J. Abdul Kalam"
                className="input-base border-red-focus"
              />
            </Field>

            <Field label="ISBN" accent="red">
              <input
                type="text"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                placeholder="978-81-7371-146-6"
                className="input-base border-red-focus"
              />
            </Field>
          </div>

          {/* ---- PUBLISHING DETAILS ---- */}
          <SectionLabel>Publishing Details</SectionLabel>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Published Year" accent="green">
              <input
                type="number"
                name="publishedYear"
                value={form.publishedYear}
                onChange={handleChange}
                placeholder="2024"
                min="1500"
                max="2100"
                className="input-base border-green-focus"
              />
            </Field>

            <Field label="Edition" accent="green">
              <input
                type="text"
                name="edition"
                value={form.edition}
                onChange={handleChange}
                placeholder="1st, 2nd..."
                className="input-base border-green-focus"
              />
            </Field>

            <Field label="Language" accent="green">
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                className="input-base border-green-focus"
              >
                <option value="">Select...</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Format" accent="green">
              <select
                name="colorFormat"
                value={form.colorFormat}
                onChange={handleChange}
                className="input-base border-green-focus"
              >
                <option value="">Select...</option>
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* ---- PRICING & STOCK ---- */}
          <SectionLabel>Pricing & Stock</SectionLabel>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Price (NPR) *" accent="green">
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="input-base border-green-focus"
              />
            </Field>

            <Field label="Stock *" accent="green">
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                min="0"
                step="1"
                placeholder="0"
                className="input-base border-green-focus"
              />
            </Field>

            <Field label="Category" accent="yellow" className="col-span-2">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input-base border-red-focus"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* ---- IMAGES ---- */}
          <SectionLabel>Book Images</SectionLabel>
          <ImageUploader images={form.images} onChange={handleImagesChange} />

          {/* ---- DESCRIPTION ---- */}
          <SectionLabel>Description</SectionLabel>
          <RichTextEditor
            value={form.description}
            onChange={handleDescriptionChange}
            placeholder="Write a detailed description — use headings, bullet points, links, and more."
          />
          <p className="text-[11px] text-gray-400 -mt-3">
            Tip: use the toolbar for headings, bullet lists, links, quotes, and more.
          </p>

          {/* ---- ACTIONS ---- */}
          <div className="flex gap-3 pt-3 sticky bottom-0 bg-white border-t border-gray-100 -mx-6 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {isEditing ? "Update Book" : "Add Book"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- helpers ----------

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="w-1.5 h-4 bg-red-600 rounded-full" />
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
        {children}
      </h3>
      <span className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function Field({ label, accent = "red", className = "", children }) {
  const dotColor = {
    red: "text-red-500",
    green: "text-green-600",
    yellow: "text-yellow-500",
  }[accent];

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        <span className={`${dotColor} mr-1`}>●</span>
        {label}
      </label>
      {children}
    </div>
  );
}