// backend/api/public/back-editions/[id].cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../../lib/db.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");
const { withActiveOffers } = require("../../lib/discount.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const id = req.query?.id || req.params?.id;
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid book ID" });
  }

  try {
    const { db } = await connectToDatabase();
    const book = await db
      .collection("books")
      .findOne({ _id: new ObjectId(id), isBackEdition: true });

    if (!book) {
      return res.status(404).json({ message: "Back edition not found" });
    }

    const priced = await withActiveOffers(db, book);
    return res.status(200).json(priced);
  } catch (err) {
    console.error("Public back-edition detail error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};