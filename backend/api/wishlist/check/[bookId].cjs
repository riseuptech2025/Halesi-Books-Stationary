// backend/api/wishlist/check/[bookId].cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../../lib/db.cjs");
const { getUserFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(200).json({ inWishlist: false });

  const bookId = req.query?.bookId || req.params?.bookId;
  if (!bookId || !ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const { db } = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.id) });

    const inWishlist = (user?.wishlist || []).includes(bookId);
    return res.status(200).json({ inWishlist });
  } catch (err) {
    console.error("Wishlist check error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};