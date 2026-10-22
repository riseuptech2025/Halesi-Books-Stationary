// frontend/src/components/ContentEditorPage.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "./Layout";
import RichTextEditor from "./RichTextEditor";
import PdfUploader from "./PdfUploader";
import api from "../utils/api";
import { CATEGORY_OPTIONS } from "../utils/categories";

const EMPTY = {
  title: "",
  category: "nijamati",
  description: "",
  content: "",
  image: null,
  websiteUrl: "",
  status: "draft",
  documents: [],
};

export default function ContentEditorPage({
  pageTitle,
  editTitle,
  apiBase,
  routeBase,
  uploadFolder,
  showWebsiteUrl = false,
  allowDocuments = false,
  contentLabel = "Content",
  contentPlaceholder = "Write the full details here...",
}) {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`${apiBase}/${id}`);
        if (cancelled) return;
        setForm({
          title: data.title || "",
          category: data.category || "nijamati",
          description: data.description || "",
          content: data.content || "",
          image: data.image || null,
          websiteUrl: data.websiteUrl || "",
          status: data.status || "draft",
          documents: Array.isArray(data.documents) ? data.documents : [],
        });
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Failed to load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEditing, apiBase]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }

    setUploadingImage(true);
    setError("");
    try {
      const { data: sign } = await api.post("/upload/content-sign", {
        folder: uploadFolder,
      });
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
        image: { url: result.secure_url, publicId: result.public_id },
      }));
    } catch (err) {
      setError("Failed to upload image. Try again.");
    } finally {
      setUploadingImage(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!form.description.trim() && !form.content) {
      setError("Add a description or content.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      content: form.content,
      image: form.image,
      status: form.status,
      ...(showWebsiteUrl && { websiteUrl: form.websiteUrl.trim() }),
      ...(allowDocuments && { documents: form.documents }),
    };

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`${apiBase}/${id}`, payload);
      } else {
        await api.post(apiBase, payload);
      }
      navigate(routeBase, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title={editTitle} subtitle="Loading...">
        <div className="bg-white rounded-2xl shadow-md p-16 flex justify-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={isEditing ? editTitle : pageTitle}
      subtitle={isEditing ? "Update details." : "Fill in the details below."}
    >
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Basic info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Nijamati Bibidh Sewa Vacancy 2081"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:bg-white transition"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Short Description
              <span className="text-xs font-normal text-gray-400 ml-1">
                (shown on list page, max 500 chars)
              </span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value.slice(0, 500),
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.description.length}/500
            </p>
          </div>

          {showWebsiteUrl && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Official Website Link
              </label>
              <input
                type="url"
                value={form.websiteUrl}
                onChange={(e) =>
                  setForm({ ...form, websiteUrl: e.target.value })
                }
                placeholder="https://psc.gov.np/..."
                className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:bg-white transition"
              />
            </div>
          )}
        </div>

        {/* Image */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Cover Image
          </label>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-56 aspect-video rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
              {form.image?.url ? (
                <img
                  src={form.image.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-xs text-gray-400 px-4 text-center">
                  No image
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingImage}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-700 to-red-600 text-white text-sm font-semibold shadow-md transition disabled:opacity-60 flex items-center gap-2"
              >
                {uploadingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : form.image ? (
                  "Replace Image"
                ) : (
                  "Upload Image"
                )}
              </button>
              {form.image && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: null })}
                  className="px-4 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PDF Attachments */}
        {allowDocuments && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <PdfUploader
              documents={form.documents}
              onChange={(documents) => setForm({ ...form, documents })}
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {contentLabel}
          </label>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
            placeholder={contentPlaceholder}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to={routeBase}
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
              "Update"
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </form>
    </Layout>
  );
}