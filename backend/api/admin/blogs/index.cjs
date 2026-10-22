// backend/api/admin/blogs/index.cjs
const sanitizeHtml = require("sanitize-html");
const { connectToDatabase } = require("../../lib/db.cjs");
const { getAdminFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");
const { slugify, ensureUniqueSlug } = require("../../lib/blogSlug.cjs");

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

  try {
    const { db } = await connectToDatabase();
    const blogs = db.collection("blogs");

    // ---------- LIST ----------
    if (req.method === "GET") {
      const { status, search } = req.query || {};
      const filter = {};
      if (status && status !== "all") filter.status = status;
      if (search) {
        const rx = new RegExp(String(search).trim(), "i");
        filter.$or = [{ title: rx }, { excerpt: rx }, { tags: rx }];
      }

      const list = await blogs
        .find(filter, {
          projection: {
            title: 1, slug: 1, excerpt: 1, cover: 1, status: 1,
            tags: 1, author: 1, publishedAt: 1, createdAt: 1, views: 1,
          },
        })
        .sort({ createdAt: -1 })
        .limit(500)
        .toArray();

      return res.status(200).json(list);
    }

    // ---------- CREATE ----------
    if (req.method === "POST") {
      const {
        title, excerpt, content, cover, author, tags, status,
      } = req.body || {};

      if (!title || !String(title).trim()) {
        return res.status(400).json({ message: "Title is required" });
      }
      const trimmedTitle = String(title).trim();
      const baseSlug = slugify(trimmedTitle);
      const slug = await ensureUniqueSlug(db, baseSlug);

      const now = new Date();
      const isPublished = status === "published";

      const doc = {
        title: trimmedTitle,
        slug,
        excerpt: String(excerpt || "").trim().slice(0, 300),
        content: cleanHtml(content),
        cover: cover
          ? {
              url: String(cover.url || ""),
              publicId: String(cover.publicId || ""),
            }
          : null,
        author: String(author || "Halesi Books Team").trim().slice(0, 60),
        tags: cleanTags(tags),
        status: isPublished ? "published" : "draft",
        publishedAt: isPublished ? now : null,
        views: 0,
        createdAt: now,
        updatedAt: now,
      };

      const result = await blogs.insertOne(doc);
      return res.status(201).json({ _id: result.insertedId, ...doc });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Admin blogs error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};