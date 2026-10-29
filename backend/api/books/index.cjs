// backend/api/books/index.cjs — ADMIN
const sanitizeHtml = require("sanitize-html");
const { connectToDatabase } = require("../lib/db.cjs");
const { getAdminFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

const SANITIZE_OPTS = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s",
    "h1", "h2", "h3", "ul", "ol", "li",
    "blockquote", "code", "pre", "a", "hr",
  ],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer",
    }),
  },
};

function cleanDescription(html) {
  if (!html) return "";
  return sanitizeHtml(String(html), SANITIZE_OPTS);
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getAdminFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const { db } = await connectToDatabase();
  const books = db.collection("books");

  try {
    if (req.method === "GET") {
      const list = await books.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(list);
    }

    if (req.method === "POST") {
      const {
        title,
        author,
        isbn,
        price,
        stock,
        category,
        images,
        publishedYear,
        edition,
        language,
        colorFormat,
        description,
        discountPercent,
        discountEndsAt,
        isBackEdition,
        backEditionNote,
      } = req.body || {};

      if (!title || !author) {
        return res
          .status(400)
          .json({ message: "Title and author are required" });
      }

      const doc = {
        title: String(title).trim(),
        author: String(author).trim(),
        isbn: isbn ? String(isbn).trim() : "",
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        category: category || "General",

        publishedYear: publishedYear ? Number(publishedYear) : null,
        edition: edition ? String(edition).trim() : "",
        language: language ? String(language).trim() : "",
        colorFormat: colorFormat ? String(colorFormat).trim() : "",
        description: cleanDescription(description),

        // 💡 per-book discount
        discountPercent: Math.max(
          0,
          Math.min(90, Number(discountPercent) || 0)
        ),
        discountEndsAt: discountEndsAt
          ? new Date(discountEndsAt)
          : null,

        // 💡 Back Edition / clearance
        isBackEdition: !!isBackEdition,
        backEditionNote: backEditionNote
          ? String(backEditionNote).trim().slice(0, 200)
          : "",

        images: Array.isArray(images)
          ? images.slice(0, 3).map((img) => ({
              url: String(img.url || ""),
              publicId: String(img.publicId || ""),
            }))
          : [],

        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await books.insertOne(doc);
      return res.status(201).json({ _id: result.insertedId, ...doc });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Books error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};