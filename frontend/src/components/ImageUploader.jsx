// src/components/ImageUploader.jsx
import { useRef, useState } from "react";
import api from "../utils/api";

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 5;

export default function ImageUploader({ images = [], onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const openPicker = () => {
    if (images.length >= MAX_IMAGES) return;
    inputRef.current?.click();
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError("");

    const remaining = MAX_IMAGES - images.length;
    const toUpload = files.slice(0, remaining);

    // Validate
    for (const f of toUpload) {
      if (!f.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Each image must be under ${MAX_SIZE_MB} MB.`);
        return;
      }
    }

    setUploading(true);
    try {
      // 1) Get signature from our backend
      const { data: sign } = await api.post("/upload/sign");

      // 2) Upload each file directly to Cloudinary
      const uploaded = [];
      for (const file of toUpload) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sign.apiKey);
        formData.append("timestamp", sign.timestamp);
        formData.append("signature", sign.signature);
        formData.append("folder", sign.folder);

        const resp = await fetch(sign.uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!resp.ok) {
          throw new Error("Upload to Cloudinary failed");
        }

        const result = await resp.json();
        uploaded.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      onChange([...images, ...uploaded].slice(0, MAX_IMAGES));
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to upload images. Try again."
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (publicId) => {
    onChange(images.filter((img) => img.publicId !== publicId));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        <span className="text-yellow-500 mr-1">●</span> Book Images{" "}
        <span className="text-xs font-normal text-gray-400">
          (up to {MAX_IMAGES} images, {MAX_SIZE_MB} MB each)
        </span>
      </label>

      {/* Image grid */}
      <div className="grid grid-cols-3 gap-3">
        {images.map((img, idx) => (
          <div
            key={img.publicId || idx}
            className="relative group aspect-square rounded-xl overflow-hidden border-2 border-yellow-300 bg-yellow-50"
          >
            <img
              src={img.url}
              alt={`Book ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Primary badge */}
            {idx === 0 && (
              <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">
                Cover
              </span>
            )}
            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeImage(img.publicId)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg"
              aria-label="Remove image"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}

        {/* Add tile */}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-yellow-400 hover:border-red-500 bg-yellow-50/50 hover:bg-red-50 flex flex-col items-center justify-center gap-1 text-yellow-700 hover:text-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-6 h-6 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                <span className="text-[10px] font-semibold">Uploading</span>
              </>
            ) : (
              <>
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-[10px] font-semibold">Add Image</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFiles}
      />

      {error && (
        <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>
      )}

      {images.length > 0 && (
        <p className="text-[11px] text-gray-400 mt-2">
          First image is used as the book cover.
        </p>
      )}
    </div>
  );
}