// backend/api/public/blogs/[slug].cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../../lib/db.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const slug = req.query?.slug || req.params?.slug;
  if (!slug) {
    return res.status(400).json({ message: "Missing slug" });
  }

  try {
    const { db } = await connectToDatabase();
    const blogs = db.collection("blogs");

    const blog = await blogs.findOne({ slug, status: "published" });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Increment views (fire-and-forget, don't block the response)
    blogs
      .updateOne({ _id: blog._id }, { $inc: { views: 1 } })
      .catch((e) => console.error("views inc error:", e));

    return res.status(200).json(blog);
  } catch (err) {
    console.error("Public blog detail error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};