// backend/api/reviews/[bookId].cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../lib/db.cjs");
const { getUserFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const bookId = req.query?.bookId || req.params?.bookId;
  if (!bookId || !ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  const { db } = await connectToDatabase();
  const reviews = db.collection("reviews");

  try {
    // ---------- GET reviews ----------
    if (req.method === "GET") {
      const list = await reviews
        .find({ bookId: new ObjectId(bookId) })
        .sort({ createdAt: -1 })
        .toArray();

      const count = list.length;
      const avg =
        count === 0
          ? 0
          : list.reduce((s, r) => s + (r.rating || 0), 0) / count;

      return res.status(200).json({
        reviews: list.map((r) => ({
          _id: r._id,
          userId: r.userId,
          userName: r.userName,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
        averageRating: Number(avg.toFixed(1)),
        totalReviews: count,
      });
    }

    // ---------- POST a review ----------
    if (req.method === "POST") {
      const decoded = getUserFromRequest(req);
      if (!decoded) return res.status(401).json({ message: "Unauthorized" });

      const { rating, comment } = req.body || {};
      const numRating = Number(rating);
      if (!numRating || numRating < 1 || numRating > 5) {
        return res
          .status(400)
          .json({ message: "Rating must be between 1 and 5" });
      }

      // One review per user per book
      const existing = await reviews.findOne({
        bookId: new ObjectId(bookId),
        userId: decoded.id,
      });
      if (existing) {
        return res
          .status(409)
          .json({ message: "You have already reviewed this book" });
      }

      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(decoded.id) });

      const doc = {
        bookId: new ObjectId(bookId),
        userId: decoded.id,
        userName: user?.name || "Anonymous",
        rating: numRating,
        comment: String(comment || "").trim(),
        createdAt: new Date(),
      };

      const result = await reviews.insertOne(doc);

      return res.status(201).json({
        _id: result.insertedId,
        ...doc,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Reviews error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};