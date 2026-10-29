// backend/api/admin/back-editions/index.cjs
const { connectToDatabase } = require("../../lib/db.cjs");
const { getAdminFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");
const { withActiveOffers } = require("../../lib/discount.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (!getAdminFromRequest(req))
    return res.status(401).json({ message: "Unauthorized" });

  try {
    const { db } = await connectToDatabase();
    const books = db.collection("books");

    const list = await books
      .find({ isBackEdition: true })
      .sort({ createdAt: -1 })
      .toArray();

    const priced = await withActiveOffers(db, list);
    return res.status(200).json(priced);
  } catch (err) {
    console.error("Admin back-editions error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};