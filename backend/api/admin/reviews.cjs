// backend/api/admin/reviews.cjs — ONE "../"
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../lib/db.cjs");
const { getAdminFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getAdminFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const { db } = await connectToDatabase();
  const reviews = db.collection("reviews");

  try {
    if (req.method === "GET") {
      const list = await reviews
        .find({})
        .sort({ createdAt: -1 })
        .limit(500)
        .toArray();

      const bookIds = [...new Set(list.map((r) => r.bookId))];
      const books = await db
        .collection("books")
        .find(
          { _id: { $in: bookIds } },
          { projection: { title: 1, author: 1, images: 1 } }
        )
        .toArray();

      const byId = new Map(books.map((b) => [b._id.toString(), b]));

      return res.status(200).json(
        list.map((r) => ({
          ...r,
          book: byId.get(r.bookId?.toString?.() || "") || null,
        }))
      );
    }

    if (req.method === "DELETE") {
      const { reviewId } = req.body || {};
      if (!reviewId || !ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: "Invalid review ID" });
      }
      await reviews.deleteOne({ _id: new ObjectId(reviewId) });
      return res.status(200).json({ message: "Review deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Admin reviews error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};