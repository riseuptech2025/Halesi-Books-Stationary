// client/src/pages/BookDetail.jsx
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useProtectedAction } from "../hooks/useProtectedAction";
import StarRating from "../components/StarRating";
import ReviewSection from "../components/ReviewSection";
import RelatedBooks from "../components/RelatedBooks";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { has: inWishlist, toggle: toggleWishlist } = useWishlist();
  const { add: addToCart } = useCart();
  const withAuth = useProtectedAction();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [copied, setCopied] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [toast, setToast] = useState("");
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/public/books/${id}`);
        if (cancelled) return;
        setBook(data);
        setActiveImage(0);
        setActiveTab("details");

        try {
          const rev = await api.get(`/reviews/${id}`);
          if (!cancelled) {
            setReviewSummary({
              averageRating: rev.data.averageRating || 0,
              totalReviews: rev.data.totalReviews || 0,
            });
          }
        } catch {
          /* ignore */
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err.response?.data?.message || "Failed to load book details."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // ---------- SHARE ----------
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = book
    ? `Check out "${book.title}" by ${book.author} at Halesi Books Centre!`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  // ---------- ACTIONS ----------
  const handleWishlist = () =>
    withAuth(async () => {
      try {
        const added = await toggleWishlist(id);
        showToast(added ? "Added to wishlist" : "Removed from wishlist");
      } catch {
        showToast("Failed to update wishlist");
      }
    });

  const handleAddToCart = () =>
    withAuth(async () => {
      setAddingCart(true);
      try {
        await addToCart(id, 1);
        showToast("Added to cart");
      } catch {
        showToast("Failed to add to cart");
      } finally {
        setAddingCart(false);
      }
    });

  const handleBuyNow = () =>
    withAuth(() => {
      navigate(`/checkout?bookId=${id}&qty=1`);
    });

  // ---------- LOADING ----------
  if (loading) {
    return (
      <div className="container-x py-10 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-56 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6">
            <div className="aspect-[3/4] bg-gray-100 rounded-3xl" />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-5 bg-gray-100 rounded w-1/2" />
            <div className="h-24 bg-gray-100 rounded-xl mt-6" />
            <div className="h-40 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ---------- ERROR ----------
  if (error || !book) {
    return (
      <div className="container-x py-20">
        <div className="bg-white rounded-2xl shadow-md p-12 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Book Not Found
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {error || "The book you're looking for may have been removed."}
          </p>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md transition"
          >
            Browse All Books
          </Link>
        </div>
      </div>
    );
  }

  // ---------- DERIVED ----------
  const images = book.images || [];
  const mainImage = images[activeImage]?.url;
  const hasMultipleImages = images.length > 1;
  const wishlisted = inWishlist(id);

  // 💡 Discount fields
  const hasDiscount =
    !!book.hasDiscount && Number(book.discountPercent) > 0;
  const unitPrice = hasDiscount
    ? Number(book.finalPrice)
    : Number(book.price);
  const originalPrice = hasDiscount
    ? Number(book.originalPrice)
    : Number(book.price);
  const savings = originalPrice - unitPrice;

  const stockInfo = (() => {
    if (book.stock === 0)
      return {
        label: "Out of Stock",
        cls: "bg-red-100 text-red-700 border-red-200",
        dot: "bg-red-500",
        msg: "Currently unavailable — check back soon.",
      };
    if (book.stock <= 5)
      return {
        label: `Only ${book.stock} left`,
        cls: "bg-yellow-100 text-yellow-800 border-yellow-200",
        dot: "bg-yellow-500",
        msg: "Hurry, only a few copies remain!",
      };
    return {
      label: "In Stock",
      cls: "bg-green-100 text-green-700 border-green-200",
      dot: "bg-green-500",
      msg: "Available for immediate pickup.",
    };
  })();

  // ---------- RENDER ----------
  return (
    <div className="animate-fade-in relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 border-b border-yellow-100">
        <div className="container-x py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
            <Link to="/" className="hover:text-red-700 font-medium transition">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link
              to="/books"
              className="hover:text-red-700 font-medium transition"
            >
              Books
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-red-700 font-semibold">
              {book.category || "General"}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-800 font-medium truncate max-w-[180px] sm:max-w-[300px]">
              {book.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container-x py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* ============ LEFT: IMAGES (STICKY) ============ */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 lg:self-start">
            <div className="relative bg-gradient-to-br from-red-50 via-yellow-50 to-green-50 rounded-3xl border-4 border-yellow-400 overflow-hidden aspect-[3/4] shadow-xl">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-32 h-40 bg-white rounded-xl shadow-xl flex items-center justify-center border-2 border-red-200">
                    <svg
                      className="w-16 h-16 text-red-600"
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
                </div>
              )}

              <div className="absolute top-4 left-0 bg-red-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-r-full shadow-lg">
                {book.category || "General"}
              </div>

              {/* 💡 Discount ribbon */}
              {hasDiscount && (
                <div className="absolute top-4 right-16 bg-red-600 text-white text-sm font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                  -{book.discountPercent}% OFF
                </div>
              )}

              {hasMultipleImages && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5"
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
                  {activeImage + 1} / {images.length}
                </div>
              )}
            </div>

            {hasMultipleImages && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <button
                    key={img.publicId || i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                      activeImage === i
                        ? "border-red-600 ring-2 ring-red-200"
                        : "border-gray-200 hover:border-yellow-400"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${book.title} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Share row */}
            <div className="mt-6 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
                Share
              </span>
              <button
                onClick={handleCopy}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
                title="Copy link"
              >
                {copied ? (
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
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
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  shareText + " " + shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-700 transition"
                title="Share on WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-700 transition"
                title="Share on Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ============ RIGHT: INFO PANEL ============ */}
          <div className="lg:col-span-6">
            <h1 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.1] text-gray-900">
              {book.title}
            </h1>
            <p className="text-lg text-gray-600 mt-3">
              by{" "}
              <span className="font-semibold text-red-700">
                {book.author}
              </span>
            </p>

            {/* Rating + reviews summary */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <StarRating value={reviewSummary.averageRating} size={18} />
              <span className="text-sm font-semibold text-gray-700">
                {reviewSummary.averageRating || 0}
              </span>
              <a
                href="#reviews"
                className="text-sm text-gray-500 hover:text-red-700 hover:underline"
              >
                ({reviewSummary.totalReviews} review
                {reviewSummary.totalReviews !== 1 ? "s" : ""})
              </a>
            </div>

            {/* Stock + ISBN row */}
            <div className="flex items-center gap-2 flex-wrap mt-5">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border ${stockInfo.cls}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${stockInfo.dot} ${
                    book.stock > 0 && book.stock <= 5 ? "animate-pulse" : ""
                  }`}
                />
                {stockInfo.label}
              </span>
              {book.isbn && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                  ISBN: {book.isbn}
                </span>
              )}
              {book.language && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                  {book.language}
                </span>
              )}
            </div>

            {/* 💡 Price card */}
            <div className="bg-gradient-to-br from-red-50 to-yellow-50 rounded-2xl border-2 border-yellow-200 p-5 my-6">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {hasDiscount ? "Sale Price" : "Price"}
                  </p>
                  {hasDiscount ? (
                    <div>
                      <p className="text-4xl font-extrabold text-green-700 leading-none">
                        NPR {unitPrice.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <p className="text-sm line-through text-gray-400">
                          NPR {originalPrice.toLocaleString()}
                        </p>
                        <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                          Save {book.discountPercent}%
                        </span>
                        {book.offerName && (
                          <span className="text-xs font-bold bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                            {book.offerName}
                          </span>
                        )}
                      </div>
                      {book.discountEndsAt && (
                        <p className="text-xs text-red-700 font-semibold mt-2">
                          ⏰ Offer ends{" "}
                          {new Date(book.discountEndsAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-4xl font-extrabold text-green-700 leading-none">
                      NPR {originalPrice.toLocaleString()}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-600 max-w-[180px] text-right">
                  {stockInfo.msg}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingCart || book.stock === 0}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 font-bold py-3.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {addingCart ? (
                    <div className="w-4 h-4 border-2 border-red-300 border-t-red-700 rounded-full animate-spin" />
                  ) : (
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  )}
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={book.stock === 0}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Buy Now
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleWishlist}
                  className={`flex items-center justify-center gap-2 font-bold py-3 rounded-xl border-2 transition ${
                    wishlisted
                      ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                      : "bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:text-red-700"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill={wishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {wishlisted ? "Wishlisted" : "Add to Wishlist"}
                </button>

                <a
                  href="tel:+9779863958892"
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition"
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Call to Order
                </a>
              </div>

              {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-800 flex items-center justify-between gap-2 flex-wrap">
                  <span>
                    🔒 Sign in to add to cart, wishlist and review this book.
                  </span>
                  <div className="flex gap-2">
                    <Link
                      to={`/login?redirect=${encodeURIComponent(
                        window.location.pathname
                      )}`}
                      className="font-bold text-red-700 hover:underline"
                    >
                      Sign In
                    </Link>
                    <span className="text-yellow-400">·</span>
                    <Link
                      to={`/signup?redirect=${encodeURIComponent(
                        window.location.pathname
                      )}`}
                      className="font-bold text-green-700 hover:underline"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* TABS */}
            <div className="border-b border-gray-200 mb-4">
              <div className="flex gap-1">
                {[
                  { id: "details", label: "Details" },
                  { id: "description", label: "Description" },
                  { id: "shipping", label: "Shipping" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-3 text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? "text-red-700"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-red-600 rounded-t" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[180px]">
              {activeTab === "details" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailRow label="Title" value={book.title} />
                  <DetailRow label="Author" value={book.author} />
                  {book.isbn && <DetailRow label="ISBN" value={book.isbn} />}
                  <DetailRow
                    label="Category"
                    value={book.category || "General"}
                  />
                  {book.publishedYear && (
                    <DetailRow
                      label="Published Year"
                      value={book.publishedYear}
                    />
                  )}
                  {book.edition && (
                    <DetailRow label="Edition" value={book.edition} />
                  )}
                  {book.language && (
                    <DetailRow label="Language" value={book.language} />
                  )}
                  {book.colorFormat && (
                    <DetailRow label="Format" value={book.colorFormat} />
                  )}
                  <DetailRow
                    label="Availability"
                    value={
                      book.stock > 0
                        ? `${book.stock} copies in stock`
                        : "Out of stock"
                    }
                  />
                </div>
              )}

              {activeTab === "description" && (
                <div>
                  {book.description ? (
                    <div
                      className="prose prose-sm sm:prose-base max-w-none text-gray-700
                                 prose-headings:text-gray-900 prose-headings:font-bold
                                 prose-a:text-red-700 prose-a:underline
                                 prose-ul:list-disc prose-ul:pl-5
                                 prose-ol:list-decimal prose-ol:pl-5
                                 prose-li:marker:text-red-600
                                 prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:pl-4 prose-blockquote:italic"
                      dangerouslySetInnerHTML={{ __html: book.description }}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 py-6 text-center">
                      No description provided yet.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-3">
                  <ShipItem
                    icon="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    title="Local Delivery"
                    desc="Free delivery within Halesi for orders above NPR 1,000."
                  />
                  <ShipItem
                    icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                    title="Nationwide Shipping"
                    desc="We ship anywhere in Nepal via trusted couriers (2–5 days)."
                  />
                  <ShipItem
                    icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    title="Quality Guarantee"
                    desc="Every book is inspected before shipping."
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <div id="reviews">
          <ReviewSection bookId={id} />
        </div>

        {/* RELATED */}
        <RelatedBooks category={book.category} excludeId={book._id} />
      </div>
    </div>
  );
}

// =================== HELPERS ===================
function DetailRow({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
      <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
    </div>
  );
}

function ShipItem({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
      <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
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
            d={icon}
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800">{title}</p>
        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}