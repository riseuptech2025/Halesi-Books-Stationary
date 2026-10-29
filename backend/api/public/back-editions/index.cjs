// backend/api/public/back-editions/index.cjs
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

    const list = await books
      .find(
        { isBackEdition: true },
        {
          projection: {
            title: 1,
            author: 1,
            isbn: 1,
            price: 1,
            category: 1,
            images: 1,
            stock: 1,
            publishedYear: 1,
            edition: 1,
            language: 1,
            backEditionNote: 1,
            discountPercent: 1,
            discountEndsAt: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const priced = await withActiveOffers(db, list);

    // Sort highest discount first — better for a clearance page
    priced.sort(
      (a, b) => (b.discountPercent || 0) - (a.discountPercent || 0)
    );

    return res.status(200).json(priced);
  } catch (err) {
    console.error("Public back-editions error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};