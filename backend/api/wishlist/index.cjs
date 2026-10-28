// backend/api/wishlist/index.cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../lib/db.cjs");
const { getUserFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");
const { withActiveOffers } = require("../lib/discount.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const { db } = await connectToDatabase();
  const users = db.collection("users");
  const _id = new ObjectId(decoded.id);

  try {
    if (req.method === "GET") {
      const user = await users.findOne({ _id });
      const ids = (user?.wishlist || [])
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

      if (ids.length === 0) return res.status(200).json([]);

      const books = await db
        .collection("books")
        .find(
          { _id: { $in: ids } },
          {
            projection: {
              title: 1,
              author: 1,
              price: 1,
              category: 1,
              images: 1,
              stock: 1,
              isbn: 1,
              discountPercent: 1,
              discountEndsAt: 1,
            },
          }
        )
        .toArray();

      const priced = await withActiveOffers(db, books);
      return res.status(200).json(priced);
    }

    if (req.method === "POST") {
      const { bookId } = req.body || {};
      if (!bookId || !ObjectId.isValid(bookId)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }

      const user = await users.findOne({ _id });
      const current = user?.wishlist || [];
      const exists = current.includes(bookId);

      if (exists) {
        await users.updateOne({ _id }, { $pull: { wishlist: bookId } });
      } else {
        await users.updateOne({ _id }, { $addToSet: { wishlist: bookId } });
      }

      return res.status(200).json({
        inWishlist: !exists,
        message: exists ? "Removed from wishlist" : "Added to wishlist",
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Wishlist error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};