// client/src/pages/BlogDetail.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/public/blogs/${slug}`);
        if (!cancelled) setBlog(data);
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Post not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container-x py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container-x py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Post not found
        </h2>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 bg-red-700 text-white font-semibold py-2.5 px-5 rounded-xl"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="animate-fade-in">
      {/* Hero */}
      {blog.cover?.url && (
        <div className="w-full h-64 md:h-96 bg-gray-100 overflow-hidden">
          <img
            src={blog.cover.url}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container-x max-w-3xl py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-red-700">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-red-700">Blog</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px]">
            {blog.title}
          </span>
        </nav>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-gray-500 mt-4 flex-wrap">
          <span className="font-semibold text-red-700">{blog.author}</span>
          <span>·</span>
          <span>
            {new Date(blog.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span>·</span>
          <span>{blog.views || 0} views</span>
        </div>

        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {blog.tags.map((t) => (
              <span
                key={t}
                className="text-xs font-semibold bg-yellow-50 border border-yellow-200 text-yellow-800 px-2.5 py-1 rounded-full"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {blog.excerpt && (
          <p className="text-lg text-gray-600 mt-6 leading-relaxed italic border-l-4 border-red-500 pl-4">
            {blog.excerpt}
          </p>
        )}

        <div
          className="prose prose-sm sm:prose-base max-w-none text-gray-800 mt-8
                     prose-headings:text-gray-900 prose-headings:font-bold
                     prose-a:text-red-700 prose-a:underline
                     prose-ul:list-disc prose-ul:pl-5
                     prose-ol:list-decimal prose-ol:pl-5
                     prose-li:marker:text-red-600
                     prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:pl-4 prose-blockquote:italic
                     prose-img:rounded-xl prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-center gap-4 flex-wrap">
          <Link
            to="/blog"
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            ← Back to all posts
          </Link>
          <Link
            to="/books"
            className="text-sm font-semibold text-green-700 hover:underline"
          >
            Browse books →
          </Link>
        </div>
      </div>
    </article>
  );
}