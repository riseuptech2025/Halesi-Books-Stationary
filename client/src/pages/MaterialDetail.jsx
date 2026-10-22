// client/src/pages/MaterialDetail.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";
import { categoryLabel } from "../utils/categories";

export default function MaterialDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/public/materials/${id}`);
        if (!cancelled) setItem(data);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-x py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container-x py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Study material not found
        </h2>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <Link
          to="/materials/all"
          className="inline-flex items-center gap-2 bg-green-700 text-white font-semibold py-2.5 px-5 rounded-xl"
        >
          Back to Study Materials
        </Link>
      </div>
    );
  }

  return (
    <article className="animate-fade-in">
      {item.image?.url && (
        <div className="w-full h-64 md:h-96 bg-gray-100 overflow-hidden">
          <img
            src={item.image.url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container-x max-w-3xl py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-green-700">
            Home
          </Link>
          <span>/</span>
          <Link to="/materials/all" className="hover:text-green-700">
            Study Materials
          </Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">
            {item.title}
          </span>
        </nav>

        <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full">
          {categoryLabel(item.category)}
        </span>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight mt-4">
          {item.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-gray-500 mt-4">
          <span>
            {item.publishedAt
              ? new Date(item.publishedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : ""}
          </span>
          <span>·</span>
          <span>{item.views || 0} views</span>
        </div>

        {item.description && (
          <p className="text-lg text-gray-600 mt-6 leading-relaxed italic border-l-4 border-green-500 pl-4">
            {item.description}
          </p>
        )}

        {item.content && (
          <div
            className="prose prose-sm sm:prose-base max-w-none text-gray-800 mt-8
                       prose-headings:text-gray-900 prose-headings:font-bold
                       prose-a:text-green-700 prose-a:underline
                       prose-ul:list-disc prose-ul:pl-5
                       prose-ol:list-decimal prose-ol:pl-5
                       prose-li:marker:text-green-600
                       prose-blockquote:border-l-4 prose-blockquote:border-green-500 prose-blockquote:pl-4 prose-blockquote:italic
                       prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}

        {/* ---------- PDF DOWNLOADS ---------- */}
        {item.documents?.length > 0 && (
          <div className="mt-10 bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-green-600 rounded-full" />
              Download Study Materials
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              {item.documents.length} file
              {item.documents.length !== 1 ? "s" : ""} available.
            </p>

            <div className="space-y-2">
              {item.documents.map((doc) => (
                <a
                  key={doc.publicId}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white rounded-xl p-3 border border-green-200 hover:border-green-400 hover:shadow-md transition"
                >
                  <div className="w-10 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.size
                        ? `${(doc.size / 1024 / 1024).toFixed(2)} MB · `
                        : ""}
                      PDF
                    </p>
                  </div>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full flex items-center gap-1">
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-gray-200">
          <Link
            to={`/materials/${item.category}`}
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            ← More {categoryLabel(item.category)} materials
          </Link>
        </div>
      </div>
    </article>
  );
}