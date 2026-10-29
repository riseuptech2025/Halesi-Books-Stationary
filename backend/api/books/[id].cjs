// backend/api/books/[id].cjs — ADMIN
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../lib/db.cjs");
const { getAdminFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");
const { deleteImages } = require("../lib/cloudinary.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getAdminFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const id = req.query?.id || req.params?.id;
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  const { db } = await connectToDatabase();
  const books = db.collection("books");
  const _id = new ObjectId(id);

  try {
    if (req.method === "GET") {
      const book = await books.findOne({ _id });
      if (!book) return res.status(404).json({ message: "Book not found" });
      return res.status(200).json(book);
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const {
        title,
        author,
        isbn,
        price,
        stock,
        category,
        images,
        discountPercent,
        discountEndsAt,
        isBackEdition,
        backEditionNote,
      } = req.body || {};

      const existing = await books.findOne({ _id });
      if (!existing) return res.status(404).json({ message: "Book not found" });

      let removedPublicIds = [];
      if (Array.isArray(images)) {
        const incomingIds = images.map((i) => i.publicId).filter(Boolean);
        removedPublicIds = (existing.images || [])
          .map((i) => i.publicId)
          .filter((pid) => pid && !incomingIds.includes(pid));
      }

      const update = {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(author !== undefined && { author: String(author).trim() }),
        ...(isbn !== undefined && { isbn: String(isbn).trim() }),
        ...(price !== undefined && { price: Number(price) || 0 }),
        ...(stock !== undefined && { stock: Number(stock) || 0 }),
        ...(category !== undefined && { category }),
        ...(images !== undefined && {
          images: Array.isArray(images)
            ? images.slice(0, 3).map((img) => ({
                url: String(img.url || ""),
                publicId: String(img.publicId || ""),
              }))
            : [],
        }),

        // 💡 per-book discount
        ...(discountPercent !== undefined && {
          discountPercent: Math.max(
            0,
            Math.min(90, Number(discountPercent) || 0)
          ),
        }),
        ...(discountEndsAt !== undefined && {
          discountEndsAt: discountEndsAt
            ? new Date(discountEndsAt)
            : null,
        }),

        // 💡 Back Edition / clearance
        ...(isBackEdition !== undefined && {
          isBackEdition: !!isBackEdition,
        }),
        ...(backEditionNote !== undefined && {
          backEditionNote: String(backEditionNote || "").trim().slice(0, 200),
        }),

        updatedAt: new Date(),
      };

      const result = await books.updateOne({ _id }, { $set: update });
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      if (removedPublicIds.length > 0) {
        deleteImages(removedPublicIds).catch((e) =>
          console.error("Cloudinary cleanup error:", e)
        );
      }

      const updated = await books.findOne({ _id });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      const book = await books.findOne({ _id });
      if (!book) return res.status(404).json({ message: "Book not found" });

      const publicIds = (book.images || []).map((i) => i.publicId);
      if (publicIds.length > 0) {
        deleteImages(publicIds).catch((e) =>
          console.error("Cloudinary cleanup error:", e)
        );
      }

      await books.deleteOne({ _id });
      return res.status(200).json({ message: "Book deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Book [id] error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};