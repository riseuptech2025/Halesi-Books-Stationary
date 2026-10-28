// backend/api/admin/offers/[id].cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../../lib/db.cjs");
const { getAdminFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");
const { VALID_CATEGORY_IDS } = require("../../lib/categories.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (!getAdminFromRequest(req))
    return res.status(401).json({ message: "Unauthorized" });

  const id = req.query?.id || req.params?.id;
  if (!id || !ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid ID" });

  const { db } = await connectToDatabase();
  const offers = db.collection("offers");
  const _id = new ObjectId(id);

  try {
    const existing = await offers.findOne({ _id });
    if (!existing) return res.status(404).json({ message: "Offer not found" });

    if (req.method === "GET") return res.status(200).json(existing);

    if (req.method === "PATCH" || req.method === "PUT") {
      const {
        name,
        percent,
        startsAt,
        endsAt,
        categories,
        active,
      } = req.body || {};
      const update = { updatedAt: new Date() };

      if (name !== undefined) {
        const t = String(name).trim();
        if (!t) return res.status(400).json({ message: "Name required" });
        update.name = t.slice(0, 80);
      }
      if (percent !== undefined) {
        const p = Number(percent);
        if (!p || p < 1 || p > 90)
          return res.status(400).json({ message: "Percent must be 1–90" });
        update.percent = p;
      }
      if (startsAt !== undefined) {
        const s = new Date(startsAt);
        if (isNaN(s)) return res.status(400).json({ message: "Invalid start" });
        update.startsAt = s;
      }
      if (endsAt !== undefined) {
        const e = new Date(endsAt);
        if (isNaN(e)) return res.status(400).json({ message: "Invalid end" });
        update.endsAt = e;
      }
      if (update.startsAt && update.endsAt && update.endsAt <= update.startsAt) {
        return res
          .status(400)
          .json({ message: "End must be after start" });
      }
      if (categories !== undefined) {
        update.categories = Array.isArray(categories)
          ? categories.filter((c) => VALID_CATEGORY_IDS.includes(c))
          : [];
      }
      if (active !== undefined) update.active = !!active;

      await offers.updateOne({ _id }, { $set: update });
      const updated = await offers.findOne({ _id });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await offers.deleteOne({ _id });
      return res.status(200).json({ message: "Offer deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Admin offer [id] error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};