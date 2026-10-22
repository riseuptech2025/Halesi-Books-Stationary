// frontend/src/components/PdfUploader.jsx
import { useRef, useState } from "react";
import api from "../utils/api";

const MAX_FILES = 10;
const MAX_SIZE_MB = 20;

// 🆕 Allowed MIME types (PDF + Word + PowerPoint + Excel)
const ALLOWED_TYPES = [
  "application/pdf",
  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// 🆕 Fallback extension check (some browsers give empty/odd MIME types)
const ALLOWED_EXT = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i;

export default function PdfUploader({ documents = [], onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const openPicker = () => {
    if (documents.length >= MAX_FILES) return;
    inputRef.current?.click();
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError("");

    const remaining = MAX_FILES - documents.length;
    const toUpload = files.slice(0, remaining);

    for (const f of toUpload) {
      const okType =
        ALLOWED_TYPES.includes(f.type) || ALLOWED_EXT.test(f.name);
      if (!okType) {
        setError("Only PDF, Word, PowerPoint, or Excel files are allowed.");
        return;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Each file must be under ${MAX_SIZE_MB} MB.`);
        return;
      }
    }

    setUploading(true);
    try {
      // 🆕 use /docs folder for non-PDFs, /pdf for PDFs
      const hasNonPdf = toUpload.some(
        (f) => !f.name.toLowerCase().endsWith(".pdf")
      );
      const folder = hasNonPdf
        ? "halesi-books/materials/docs"
        : "halesi-books/materials/pdf";

      const { data: sign } = await api.post("/upload/content-sign", {
        folder,
        resourceType: "raw",
      });

      const uploaded = [];
      for (const file of toUpload) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", sign.apiKey);
        fd.append("timestamp", sign.timestamp);
        fd.append("signature", sign.signature);
        fd.append("folder", sign.folder);
        fd.append("resource_type", sign.resourceType); // must be "raw"

        const resp = await fetch(sign.uploadUrl, {
          method: "POST",
          body: fd,
        });

        if (!resp.ok) {
          const txt = await resp.text();
          throw new Error(`Upload failed (${resp.status}): ${txt}`);
        }
        const result = await resp.json();

        uploaded.push({
          url: result.secure_url,
          publicId: result.public_id,
          name: file.name,
          size: file.size,
        });
      }

      onChange([...documents, ...uploaded].slice(0, MAX_FILES));
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to upload files. Try again."
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeDocument = (publicId) => {
    onChange(documents.filter((d) => d.publicId !== publicId));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        <span className="text-green-500 mr-1">●</span> Attachments{" "}
        <span className="text-xs font-normal text-gray-400">
          (up to {MAX_FILES} files, {MAX_SIZE_MB} MB each — PDF, Word,
          PowerPoint, Excel)
        </span>
      </label>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.publicId}
            className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200"
          >
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-gray-800 hover:text-red-700 truncate block"
              >
                {doc.name}
              </a>
              <p className="text-xs text-gray-500">
                {doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeDocument(doc.publicId)}
              className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition"
              title="Remove"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}

        {documents.length < MAX_FILES && (
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-green-400 hover:border-red-500 bg-green-50/50 hover:bg-red-50 text-green-700 hover:text-red-600 font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Upload File
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
        multiple
        hidden
        onChange={handleFiles}
      />

      {error && (
        <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>
      )}
    </div>
  );
}