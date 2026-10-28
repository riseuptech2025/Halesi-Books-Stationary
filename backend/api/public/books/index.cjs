// backend/api/public/books/index.cjs — PUBLIC
const { connectToDatabase } = require("../../lib/db.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");
const { withActiveOffers } = require("../../lib/discount.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");

    const { search, category, sort } = req.query || {};

    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) {
      const rx = new RegExp(String(search).trim(), "i");
      filter.$or = [{ title: rx }, { author: rx }, { isbn: rx }];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { price: 1 };
    if (sort === "price-desc") sortOption = { price: -1 };
    if (sort === "title-asc") sortOption = { title: 1 };
    if (sort === "title-desc") sortOption = { title: -1 };

    const list = await books
      .find(filter, {
        projection: {
          title: 1,
          author: 1,
          isbn: 1,
          price: 1,
          category: 1,
          images: 1,
          createdAt: 1,
          stock: 1,
          // 💡 needed by the discount helper
          discountPercent: 1,
          discountEndsAt: 1,
        },
      })
      .sort(sortOption)
      .limit(200)
      .toArray();

    const priced = await withActiveOffers(db, list);
    return res.status(200).json(priced);
  } catch (err) {
    console.error("Public books error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};