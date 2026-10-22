// backend/api/public/blogs/index.cjs
const { connectToDatabase } = require("../../lib/db.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();
    const { tag, search, limit } = req.query || {};

    const filter = { status: "published" };
    if (tag) filter.tags = String(tag).toLowerCase();
    if (search) {
      const rx = new RegExp(String(search).trim(), "i");
      filter.$or = [{ title: rx }, { excerpt: rx }, { tags: rx }];
    }

    const max = Math.min(Number(limit) || 20, 50);

    const list = await db
      .collection("blogs")
      .find(filter, {
        projection: {
          title: 1, slug: 1, excerpt: 1, cover: 1, author: 1,
          tags: 1, publishedAt: 1, views: 1,
        },
      })
      .sort({ publishedAt: -1 })
      .limit(max)
      .toArray();

    return res.status(200).json(list);
  } catch (err) {
    console.error("Public blogs error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};