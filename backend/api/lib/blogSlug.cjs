// backend/api/lib/blogSlug.cjs
function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")     // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "")        // keep letters/digits/space/dash
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

async function ensureUniqueSlug(db, baseSlug, excludeId = null) {
  const blogs = db.collection("blogs");
  let slug = baseSlug || `post-${Date.now()}`;
  let n = 1;
  // Collision-safe loop
  while (
    await blogs.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${n++}`;
  }
  return slug;
}

module.exports = { slugify, ensureUniqueSlug };