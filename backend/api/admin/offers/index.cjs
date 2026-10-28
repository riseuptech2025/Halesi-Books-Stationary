// backend/api/admin/offers/index.cjs
const { connectToDatabase } = require("../../lib/db.cjs");
const { getAdminFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");
const { VALID_CATEGORY_IDS } = require("../../lib/categories.cjs");

function cleanOffer(body) {
  const {
    name,
    percent,
    startsAt,
    endsAt,
    categories,
    active,
  } = body || {};

  if (!name || !String(name).trim()) return { error: "Name is required" };
  const p = Number(percent);
  if (!p || p < 1 || p > 90) return { error: "Percent must be 1–90" };

  const s = new Date(startsAt);
  const e = new Date(endsAt);
  if (isNaN(s) || isNaN(e)) return { error: "Invalid dates" };
  if (e <= s) return { error: "End date must be after start date" };

  const cats = Array.isArray(categories)
    ? categories.filter((c) => VALID_CATEGORY_IDS.includes(c))
    : [];

  return {
    data: {
      name: String(name).trim().slice(0, 80),
      percent: p,
      startsAt: s,
      endsAt: e,
      categories: cats,
      active: active !== false,
    },
  };
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (!getAdminFromRequest(req))
    return res.status(401).json({ message: "Unauthorized" });

  const { db } = await connectToDatabase();
  const offers = db.collection("offers");

  try {
    if (req.method === "GET") {
      const list = await offers.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(list);
    }

    if (req.method === "POST") {
      const { data, error } = cleanOffer(req.body);
      if (error) return res.status(400).json({ message: error });

      const now = new Date();
      const doc = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      const result = await offers.insertOne(doc);
      return res.status(201).json({ _id: result.insertedId, ...doc });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Admin offers error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};