// backend/api/admin/blogs/[id].cjs
const { ObjectId } = require("mongodb");
const sanitizeHtml = require("sanitize-html");
const { connectToDatabase } = require("../../lib/db.cjs");
const { getAdminFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");
const { slugify, ensureUniqueSlug } = require("../../lib/blogSlug.cjs");
const { deleteImage } = require("../../lib/cloudinary.cjs");

// same sanitize config as index.cjs — extract to lib/sanitize.cjs if you want DRY
const SANITIZE_OPTS = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s",
    "h1", "h2", "h3", "ul", "ol", "li",
    "blockquote", "code", "pre", "a", "hr", "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel", "data"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer",
    }),
  },
};

function cleanHtml(html) {
  if (!html) return "";
  return sanitizeHtml(String(html), SANITIZE_OPTS);
}

function cleanTags(tags) {
  if (!Array.isArray(tags)) return [];
  return [
    ...new Set(
      tags
        .map((t) => String(t || "").trim().toLowerCase())
        .filter((t) => t && t.length <= 30)
    ),
  ].slice(0, 10);
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getAdminFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const id = req.query?.id || req.params?.id;
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid blog ID" });
  }

  const { db } = await connectToDatabase();
  const blogs = db.collection("blogs");
  const _id = new ObjectId(id);

  try {
    const existing = await blogs.findOne({ _id });
    if (!existing) return res.status(404).json({ message: "Blog not found" });

    // ---------- GET ----------
    if (req.method === "GET") {
      return res.status(200).json(existing);
    }

    // ---------- UPDATE ----------
    if (req.method === "PUT" || req.method === "PATCH") {
      const {
        title, excerpt, content, cover, author, tags, status,
      } = req.body || {};

      const update = { updatedAt: new Date() };

      if (title !== undefined) {
        const trimmed = String(title).trim();
        if (!trimmed) {
          return res.status(400).json({ message: "Title cannot be empty" });
        }
        update.title = trimmed;
        // Re-slug only if the title actually changed
        if (trimmed !== existing.title) {
          const base = slugify(trimmed);
          update.slug = await ensureUniqueSlug(db, base, _id);
        }
      }

      if (excerpt !== undefined) {
        update.excerpt = String(excerpt).trim().slice(0, 300);
      }
      if (content !== undefined) {
        update.content = cleanHtml(content);
      }
      if (author !== undefined) {
        update.author = String(author || "").trim().slice(0, 60);
      }
      if (tags !== undefined) {
        update.tags = cleanTags(tags);
      }

      if (cover !== undefined) {
        update.cover = cover
          ? {
              url: String(cover.url || ""),
              publicId: String(cover.publicId || ""),
            }
          : null;

        // Delete old cover from Cloudinary if it changed
        if (
          existing.cover?.publicId &&
          existing.cover.publicId !== update.cover?.publicId
        ) {
          deleteImage(existing.cover.publicId).catch((e) =>
            console.error("Cloudinary cleanup error:", e)
          );
        }
      }

      if (status !== undefined) {
        const isPublished = status === "published";
        update.status = isPublished ? "published" : "draft";
        // Set publishedAt only the first time it goes live
        if (isPublished && !existing.publishedAt) {
          update.publishedAt = new Date();
        }
        // If moving back to draft, keep the old publishedAt (so re-publish keeps history)
      }

      await blogs.updateOne({ _id }, { $set: update });
      const updated = await blogs.findOne({ _id });
      return res.status(200).json(updated);
    }

    // ---------- DELETE ----------
    if (req.method === "DELETE") {
      if (existing.cover?.publicId) {
        deleteImage(existing.cover.publicId).catch((e) =>
          console.error("Cloudinary cleanup error:", e)
        );
      }
      await blogs.deleteOne({ _id });
      return res.status(200).json({ message: "Blog deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Admin blog [id] error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};