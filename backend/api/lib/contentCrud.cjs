// backend/api/lib/contentCrud.cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("./db.cjs");
const { getAdminFromRequest } = require("./auth.cjs");
const { setCors, handleOptions } = require("./cors.cjs");
const { cleanHtml } = require("./contentSanitize.cjs");
const { VALID_CATEGORY_IDS } = require("./categories.cjs");
const { deleteImage } = require("./cloudinary.cjs");

// ------------------------------------------------------------
// Helper — sanitize a `documents` array (PDFs)
// ------------------------------------------------------------
function cleanDocuments(documents) {
  if (!Array.isArray(documents)) return [];
  return documents
    .slice(0, 10)
    .map((d) => ({
      url: String(d?.url || ""),
      publicId: String(d?.publicId || ""),
      name: String(d?.name || "file.pdf").slice(0, 200),
      size: Math.max(0, Number(d?.size) || 0),
    }))
    .filter((d) => d.url && d.publicId);
}

// ------------------------------------------------------------
// ADMIN: LIST + CREATE
// ------------------------------------------------------------
function buildAdminListHandler(
  collectionName,
  { allowWebsiteUrl = false, allowDocuments = false } = {}
) {
  return async function handler(req, res) {
    if (handleOptions(req, res)) return;
    setCors(req, res);

    const decoded = getAdminFromRequest(req);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    try {
      const { db } = await connectToDatabase();
      const col = db.collection(collectionName);

      if (req.method === "GET") {
        const { category, status, search } = req.query || {};
        const filter = {};
        if (category && category !== "all") filter.category = category;
        if (status && status !== "all") filter.status = status;
        if (search) {
          const rx = new RegExp(String(search).trim(), "i");
          filter.$or = [{ title: rx }, { description: rx }];
        }
        const list = await col
          .find(filter, {
            projection: {
              title: 1,
              category: 1,
              description: 1,
              image: 1,
              ...(allowWebsiteUrl && { websiteUrl: 1 }),
              ...(allowDocuments && { documents: 1 }),
              status: 1,
              publishedAt: 1,
              createdAt: 1,
              views: 1,
            },
          })
          .sort({ createdAt: -1 })
          .limit(500)
          .toArray();
        return res.status(200).json(list);
      }

      if (req.method === "POST") {
        const {
          title,
          category,
          description,
          content,
          image,
          websiteUrl,
          status,
          documents,
        } = req.body || {};

        if (!title || !String(title).trim()) {
          return res.status(400).json({ message: "Title is required" });
        }
        if (!VALID_CATEGORY_IDS.includes(category)) {
          return res.status(400).json({ message: "Invalid category" });
        }

        const now = new Date();
        const isPublished = status === "published";

        const doc = {
          title: String(title).trim().slice(0, 200),
          category,
          description: String(description || "").trim().slice(0, 500),
          content: cleanHtml(content),
          image: image
            ? {
                url: String(image.url || ""),
                publicId: String(image.publicId || ""),
              }
            : null,
          ...(allowWebsiteUrl && {
            websiteUrl: websiteUrl
              ? String(websiteUrl).trim().slice(0, 500)
              : "",
          }),
          ...(allowDocuments && { documents: cleanDocuments(documents) }),
          status: isPublished ? "published" : "draft",
          publishedAt: isPublished ? now : null,
          views: 0,
          createdAt: now,
          updatedAt: now,
        };

        const result = await col.insertOne(doc);
        return res.status(201).json({ _id: result.insertedId, ...doc });
      }

      return res.status(405).json({ message: "Method not allowed" });
    } catch (err) {
      console.error(`Admin ${collectionName} error:`, err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

// ------------------------------------------------------------
// ADMIN: GET ONE / UPDATE / DELETE
// ------------------------------------------------------------
function buildAdminDetailHandler(
  collectionName,
  { allowWebsiteUrl = false, allowDocuments = false } = {}
) {
  return async function handler(req, res) {
    if (handleOptions(req, res)) return;
    setCors(req, res);

    const decoded = getAdminFromRequest(req);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    const id = req.query?.id || req.params?.id;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const { db } = await connectToDatabase();
    const col = db.collection(collectionName);
    const _id = new ObjectId(id);

    try {
      const existing = await col.findOne({ _id });
      if (!existing) return res.status(404).json({ message: "Not found" });

      if (req.method === "GET") {
        return res.status(200).json(existing);
      }

      if (req.method === "PUT" || req.method === "PATCH") {
        const {
          title,
          category,
          description,
          content,
          image,
          websiteUrl,
          status,
          documents,
        } = req.body || {};

        const update = { updatedAt: new Date() };

        if (title !== undefined) {
          const t = String(title).trim();
          if (!t)
            return res.status(400).json({ message: "Title cannot be empty" });
          update.title = t.slice(0, 200);
        }
        if (category !== undefined) {
          if (!VALID_CATEGORY_IDS.includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
          }
          update.category = category;
        }
        if (description !== undefined) {
          update.description = String(description).trim().slice(0, 500);
        }
        if (content !== undefined) {
          update.content = cleanHtml(content);
        }
        if (allowWebsiteUrl && websiteUrl !== undefined) {
          update.websiteUrl = String(websiteUrl || "").trim().slice(0, 500);
        }
        if (image !== undefined) {
          update.image = image
            ? {
                url: String(image.url || ""),
                publicId: String(image.publicId || ""),
              }
            : null;

          if (
            existing.image?.publicId &&
            existing.image.publicId !== update.image?.publicId
          ) {
            deleteImage(existing.image.publicId).catch((e) =>
              console.error("Cloudinary cleanup (image):", e)
            );
          }
        }

        // -------- PDF documents --------
        if (allowDocuments && documents !== undefined) {
          const incoming = cleanDocuments(documents);
          const incomingIds = new Set(incoming.map((d) => d.publicId));
          const removed = (existing.documents || []).filter(
            (d) => d.publicId && !incomingIds.has(d.publicId)
          );
          for (const doc of removed) {
            deleteImage(doc.publicId, "raw").catch((e) =>
              console.error("Cloudinary cleanup (doc):", e)
            );
          }
          update.documents = incoming;
        }

        if (status !== undefined) {
          const isPublished = status === "published";
          update.status = isPublished ? "published" : "draft";
          if (isPublished && !existing.publishedAt) {
            update.publishedAt = new Date();
          }
        }

        await col.updateOne({ _id }, { $set: update });
        const updated = await col.findOne({ _id });
        return res.status(200).json(updated);
      }

      if (req.method === "DELETE") {
        if (existing.image?.publicId) {
          deleteImage(existing.image.publicId).catch((e) =>
            console.error("Cloudinary cleanup (image):", e)
          );
        }
        for (const doc of existing.documents || []) {
          if (doc.publicId) {
            deleteImage(doc.publicId, "raw").catch((e) =>
              console.error("Cloudinary cleanup (doc):", e)
            );
          }
        }
        await col.deleteOne({ _id });
        return res.status(200).json({ message: "Deleted" });
      }

      return res.status(405).json({ message: "Method not allowed" });
    } catch (err) {
      console.error(`Admin ${collectionName} [id] error:`, err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

// ------------------------------------------------------------
// PUBLIC: LIST (published only)
// ------------------------------------------------------------
function buildPublicListHandler(
  collectionName,
  { allowWebsiteUrl = false, allowDocuments = false } = {}
) {
  return async function handler(req, res) {
    if (handleOptions(req, res)) return;
    setCors(req, res);

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    try {
      const { db } = await connectToDatabase();
      const { category, limit, search } = req.query || {};
      const filter = { status: "published" };
      if (category && category !== "all") filter.category = category;
      if (search) {
        const rx = new RegExp(String(search).trim(), "i");
        filter.$or = [{ title: rx }, { description: rx }];
      }
      const max = Math.min(Number(limit) || 50, 100);

      const list = await db
        .collection(collectionName)
        .find(filter, {
          projection: {
            title: 1,
            category: 1,
            description: 1,
            image: 1,
            ...(allowWebsiteUrl && { websiteUrl: 1 }),
            ...(allowDocuments && { documents: 1 }),
            publishedAt: 1,
            views: 1,
          },
        })
        .sort({ publishedAt: -1 })
        .limit(max)
        .toArray();
      return res.status(200).json(list);
    } catch (err) {
      console.error(`Public ${collectionName} error:`, err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

// ------------------------------------------------------------
// PUBLIC: GET ONE
// ------------------------------------------------------------
function buildPublicDetailHandler(collectionName) {
  return async function handler(req, res) {
    if (handleOptions(req, res)) return;
    setCors(req, res);

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const id = req.query?.id || req.params?.id;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    try {
      const { db } = await connectToDatabase();
      const col = db.collection(collectionName);
      const doc = await col.findOne({
        _id: new ObjectId(id),
        status: "published",
      });
      if (!doc) return res.status(404).json({ message: "Not found" });

      col
        .updateOne({ _id: doc._id }, { $inc: { views: 1 } })
        .catch((e) => console.error("views inc:", e));

      return res.status(200).json(doc);
    } catch (err) {
      console.error(`Public ${collectionName} detail error:`, err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

module.exports = {
  buildAdminListHandler,
  buildAdminDetailHandler,
  buildPublicListHandler,
  buildPublicDetailHandler,
};