// client/src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import BookCard from "../components/BookCard";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offerBanner, setOfferBanner] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/public/books", {
          params: { sort: "createdAt" },
        });
        setFeatured(data.slice(0, 8));

        // Pick a live offer to announce
        const withOffer = data.find((b) => b.offerName && b.hasDiscount);
        if (withOffer) {
          setOfferBanner({
            name: withOffer.offerName,
            percent: withOffer.discountPercent,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* 💡 Offer banner */}
      {offerBanner && (
        <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white text-center py-2.5 px-4 text-sm font-bold">
          🎉 {offerBanner.name} — {offerBanner.percent}% OFF on selected books!{" "}
          <Link to="/books" className="underline">
            Shop now →
          </Link>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-yellow-50 to-green-50">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />

        <div className="container-x relative py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-700 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              Welcome to Halesi Books Centre
            </span>

            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] font-display">
              <span className="text-red-700">Books</span> that
              <br />
              <span className="text-green-700">inspire</span> every
              <br />
              <span className="text-yellow-500">reader</span>.
            </h1>

            <p className="mt-5 text-gray-700 text-base md:text-lg leading-relaxed max-w-lg">
              Browse our curated collection of academic, literature, and
              reference books — carefully selected for students, teachers, and
              readers in Halesi.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/books" className="btn-primary inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Browse Collection
              </Link>
              <Link to="/contact" className="btn-outline inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Visit Us
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div>
                <p className="text-2xl font-extrabold text-red-700">1000+</p>
                <p className="text-xs text-gray-500 font-medium">Books</p>
              </div>
              <div className="w-px h-10 bg-gray-300" />
              <div>
                <p className="text-2xl font-extrabold text-green-700">10+</p>
                <p className="text-xs text-gray-500 font-medium">Years Experience</p>
              </div>
              <div className="w-px h-10 bg-gray-300" />
              <div>
                <p className="text-2xl font-extrabold text-yellow-500">5000+</p>
                <p className="text-xs text-gray-500 font-medium">Happy Readers</p>
              </div>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="relative w-full max-w-md mx-auto aspect-square">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-200 via-yellow-100 to-green-200 rotate-6 shadow-2xl" />
              <div className="absolute inset-0 rounded-3xl bg-white -rotate-3 shadow-xl flex items-center justify-center border-4 border-yellow-400 overflow-hidden">
                <img
                  src="/logo.jpeg"
                  alt="Halesi Books Centre"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      '<span class="text-8xl font-extrabold text-green-700">HB</span>';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED BOOKS */}
      <section className="container-x py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-red-700">
              Newly Added
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 font-display">
              Featured Books
            </h2>
          </div>
          <Link
            to="/books"
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-red-700 hover:text-red-800 hover:underline"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-5 bg-gray-100 rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <p className="font-semibold text-gray-800">No books available yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Check back soon — we're adding new books regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((b) => (
              <BookCard key={b._id} book={b} />
            ))}
          </div>
        )}
      </section>

      {/* CTA BANNER */}
      <section className="container-x pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-700 via-red-600 to-red-800 p-8 md:p-12 shadow-2xl">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-yellow-400/20 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white font-display">
                Can't find what you're looking for?
              </h3>
              <p className="text-red-100 mt-2 max-w-lg">
                We can order any book for you — just drop by the store or give us a call. Special orders arrive within 3–5 days.
              </p>
            </div>
            <Link
              to="/contact"
              className="bg-white text-red-700 font-bold py-3 px-6 rounded-xl hover:bg-yellow-50 transition shadow-lg whitespace-nowrap"
            >
              Contact Us →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}