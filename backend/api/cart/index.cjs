// backend/api/cart/index.cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../lib/db.cjs");
const { getUserFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const { db } = await connectToDatabase();
  const carts = db.collection("carts");

  try {
    // ---------- GET cart ----------
    if (req.method === "GET") {
      const cart = await carts.findOne({ userId: decoded.id });
      const items = cart?.items || [];

      if (items.length === 0) {
        return res.status(200).json({ items: [], total: 0, count: 0 });
      }

      const ids = items
        .filter((i) => ObjectId.isValid(i.bookId))
        .map((i) => new ObjectId(i.bookId));

      const books = await db
        .collection("books")
        .find(
          { _id: { $in: ids } },
          {
            projection: {
              title: 1, author: 1, price: 1, images: 1, stock: 1,
            },
          }
        )
        .toArray();

      const byId = new Map(books.map((b) => [b._id.toString(), b]));

      const enriched = items
        .map((i) => {
          const b = byId.get(i.bookId);
          if (!b) return null;
          return {
            bookId: i.bookId,
            quantity: i.quantity,
            title: b.title,
            author: b.author,
            price: b.price,
            image: b.images?.[0]?.url || null,
            stock: b.stock,
          };
        })
        .filter(Boolean);

      const total = enriched.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const count = enriched.reduce((sum, i) => sum + i.quantity, 0);

      return res.status(200).json({ items: enriched, total, count });
    }

    // ---------- POST add to cart ----------
    if (req.method === "POST") {
      const { bookId, quantity = 1 } = req.body || {};
      if (!bookId || !ObjectId.isValid(bookId)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }
      const qty = Math.max(1, Number(quantity) || 1);

      const cart = await carts.findOne({ userId: decoded.id });
      const items = cart?.items || [];

      const existingIdx = items.findIndex((i) => i.bookId === bookId);
      if (existingIdx >= 0) {
        items[existingIdx].quantity += qty;
      } else {
        items.push({ bookId, quantity: qty });
      }

      if (cart) {
        await carts.updateOne(
          { userId: decoded.id },
          { $set: { items, updatedAt: new Date() } }
        );
      } else {
        await carts.insertOne({
          userId: decoded.id,
          items,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return res.status(200).json({ message: "Added to cart", items });
    }

    // ---------- PUT update quantity ----------
    if (req.method === "PUT") {
      const { bookId, quantity } = req.body || {};
      if (!bookId || !ObjectId.isValid(bookId)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }
      const qty = Number(quantity);
      if (!qty || qty < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      await carts.updateOne(
        { userId: decoded.id, "items.bookId": bookId },
        {
          $set: {
            "items.$.quantity": qty,
            updatedAt: new Date(),
          },
        }
      );

      return res.status(200).json({ message: "Cart updated" });
    }

    // ---------- DELETE remove from cart ----------
    if (req.method === "DELETE") {
      const { bookId } = req.body || {};
      if (!bookId || !ObjectId.isValid(bookId)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }

      await carts.updateOne(
        { userId: decoded.id },
        {
          $pull: { items: { bookId } },
          $set: { updatedAt: new Date() },
        }
      );

      return res.status(200).json({ message: "Removed from cart" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Cart error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};