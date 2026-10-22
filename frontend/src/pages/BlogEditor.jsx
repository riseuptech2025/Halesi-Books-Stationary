// frontend/src/pages/BlogEditor.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import RichTextEditor from "../components/RichTextEditor";
import api from "../utils/api";

const EMPTY = {
  title: "",
  excerpt: "",
  content: "",
  cover: null,
  author: "Halesi Books Team",
  tagsInput: "",
  status: "draft",
};

export default function BlogEditor() {
  const { id } = useParams();             // undefined for "new"
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileRef = useRef(null);

  // ---------- LOAD (edit) ----------
  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/admin/blogs/${id}`);
        if (cancelled) return;
        setForm({
          title: data.title || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          cover: data.cover || null,
          author: data.author || "Halesi Books Team",
          tagsInput: (data.tags || []).join(", "),
          status: data.status || "draft",
        });
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || "Failed to load post.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  // ---------- COVER UPLOAD ----------
  const handleCoverUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Cover must be an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Cover must be under 5 MB.");
      return;
    }

    setUploadingCover(true);
    setError("");
    try {
      const { data: sign } = await api.post("/upload/blog-sign");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sign.apiKey);
      fd.append("timestamp", sign.timestamp);
      fd.append("signature", sign.signature);
      fd.append("folder", sign.folder);

      const resp = await fetch(sign.uploadUrl, { method: "POST", body: fd });
      if (!resp.ok) throw new Error("Upload failed");
      const result = await resp.json();
      setForm((prev) => ({
        ...prev,
        cover: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      }));
    } catch (err) {
      setError("Failed to upload cover. Try again.");
    } finally {
      setUploadingCover(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ---------- SAVE ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.content || form.content === "<p></p>") {
      setError("Content cannot be empty.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      cover: form.cover,
      author: form.author.trim(),
      tags: form.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: form.status,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/admin/blogs/${id}`, payload);
      } else {
        await api.post("/admin/blogs", payload);
      }
      navigate("/blogs", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save post.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title={isEditing ? "Edit Post" : "New Post"} subtitle="Loading...">
        <div className="bg-white rounded-2xl shadow-md p-16 flex justify-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={isEditing ? "Edit Post" : "New Post"}
      subtitle={isEditing ? "Update your blog post." : "Write a new blog post."}
    >
      <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. 5 tips to build a reading habit"
            className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Author
              </label>
              <input
                type="text"
                value={form.author}
                onChange={(e) =>
                  setForm({ ...form, author: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:bg-white transition"
              >
                <option value="draft">Draft (not visible)</option>
                <option value="published">Published (live)</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Excerpt
              <span className="text-xs font-normal text-gray-400 ml-1">
                (short summary shown on the list page, max 300 chars)
              </span>
            </label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) =>
                setForm({ ...form, excerpt: e.target.value.slice(0, 300) })
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.excerpt.length}/300
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tags
              <span className="text-xs font-normal text-gray-400 ml-1">
                (comma-separated, e.g. reading, tips)
              </span>
            </label>
            <input
              type="text"
              value={form.tagsInput}
              onChange={(e) =>
                setForm({ ...form, tagsInput: e.target.value })
              }
              placeholder="reading, tips, students"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Cover */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Cover Image
          </label>

          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-56 aspect-video rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
              {form.cover?.url ? (
                <img
                  src={form.cover.url}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-xs text-gray-400 px-4 text-center">
                  No cover uploaded
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleCoverUpload(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingCover}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 text-white text-sm font-semibold shadow-md transition disabled:opacity-60 flex items-center gap-2"
              >
                {uploadingCover ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : form.cover ? (
                  "Replace Cover"
                ) : (
                  "Upload Cover"
                )}
              </button>
              {form.cover && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, cover: null })}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition"
                >
                  Remove
                </button>
              )}
              <p className="text-xs text-gray-400 max-w-xs">
                Recommended 1200×630 px (16:9). Under 5 MB.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Content *
          </label>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
            placeholder="Write your blog post..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to="/blogs"
            className="flex-1 text-center py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-red-500/30 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              "Update Post"
            ) : (
              "Create Post"
            )}
          </button>
        </div>
      </form>
    </Layout>
  );
}