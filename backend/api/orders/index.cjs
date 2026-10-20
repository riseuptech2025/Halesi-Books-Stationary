// backend/api/orders/index.cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../lib/db.cjs");
const { getUserFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");
const { getSettings } = require("../lib/settings.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const { db } = await connectToDatabase();
  const orders = db.collection("orders");
  const books = db.collection("books");
  const settings = await getSettings();

  try {
    // ---------- GET my orders ----------
    if (req.method === "GET") {
      const list = await orders
        .find({ userId: decoded.id })
        .sort({ createdAt: -1 })
        .toArray();
      return res.status(200).json(list);
    }

    // ---------- POST create order ----------
    if (req.method === "POST") {
      console.log("📥 POST /api/orders body:", JSON.stringify(req.body));

      const {
        items,
        shippingAddress,
        notes,
        paymentMethod,
        deliveryZoneId,
      } = req.body || {};

      // ---------- Validate items ----------
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // ---------- Validate address ----------
      if (
        !shippingAddress ||
        !shippingAddress.name ||
        !shippingAddress.phone ||
        !shippingAddress.address
      ) {
        return res
          .status(400)
          .json({ message: "Shipping address is required" });
      }

      // ---------- Payment method ----------
      const method = paymentMethod === "cod" ? "cod" : "qr";
      const allowQR = settings.paymentMethods?.qr !== false;
      const allowCOD = settings.paymentMethods?.cod !== false;

      if (method === "qr" && !allowQR) {
        return res.status(400).json({
          message: "QR payment is currently disabled. Please choose COD.",
        });
      }
      if (method === "cod" && !allowCOD) {
        return res.status(400).json({
          message: "Cash on Delivery is currently disabled. Please choose QR.",
        });
      }

      // ---------- Delivery zone (LENIENT) ----------
      const zones = Array.isArray(settings.deliveryZones)
        ? settings.deliveryZones
        : [];

      let chosenZone = null;
      if (zones.length > 0) {
        if (deliveryZoneId) {
          chosenZone = zones.find((z) => z.id === deliveryZoneId);
          if (!chosenZone) {
            return res
              .status(400)
              .json({ message: "Invalid delivery zone" });
          }
        } else {
          // Fallback: use first zone so old clients don't break
          console.warn(
            "⚠️ No deliveryZoneId received — using first zone:",
            zones[0]?.id
          );
          chosenZone = zones[0];
        }
      }

      const deliveryFee = chosenZone
        ? Number(chosenZone.charge) || 0
        : Number(settings.deliveryCharge) || 0;

      // ---------- Enrich items + validate stock ----------
      const validBookIds = items
        .filter((i) => i && i.bookId && ObjectId.isValid(i.bookId))
        .map((i) => new ObjectId(i.bookId));

      if (validBookIds.length === 0) {
        return res.status(400).json({ message: "No valid books in order" });
      }

      const bookDocs = await books
        .find(
          { _id: { $in: validBookIds } },
          {
            projection: {
              title: 1,
              author: 1,
              price: 1,
              images: 1,
              stock: 1,
            },
          }
        )
        .toArray();

      const byId = new Map(bookDocs.map((b) => [b._id.toString(), b]));

      for (const item of items) {
        const b = byId.get(item.bookId);
        if (!b) {
          return res
            .status(400)
            .json({ message: `Book not found: ${item.bookId}` });
        }
        const qty = Number(item.quantity) || 1;
        if (qty < 1) {
          return res.status(400).json({ message: "Invalid quantity" });
        }
        if (b.stock < qty) {
          return res.status(400).json({
            message: `Not enough stock for "${b.title}". Available: ${b.stock}`,
          });
        }
      }

      const enrichedItems = items.map((i) => {
        const b = byId.get(i.bookId);
        return {
          bookId: i.bookId,
          title: b.title,
          author: b.author,
          price: b.price,
          image: b.images?.[0]?.url || null,
          quantity: Number(i.quantity) || 1,
        };
      });

      const subtotal = enrichedItems.reduce(
        (s, i) => s + i.price * i.quantity,
        0
      );
      const total = subtotal + deliveryFee;

      const orderNumber = `HBC-${Date.now()
        .toString()
        .slice(-8)}-${Math.floor(Math.random() * 9000 + 1000)}`;

      const doc = {
        orderNumber,
        userId: decoded.id,
        items: enrichedItems,
        subtotal,
        deliveryFee,
        deliveryZone: chosenZone
          ? {
              id: chosenZone.id,
              name: chosenZone.name,
              charge: Number(chosenZone.charge) || 0,
            }
          : null,
        total,
        shippingAddress: {
          name: String(shippingAddress.name).trim(),
          phone: String(shippingAddress.phone).trim(),
          address: String(shippingAddress.address).trim(),
          city: String(shippingAddress.city || "").trim(),
        },
        notes: String(notes || "").trim(),
        status: "pending",
        paymentMethod: method,
        paymentStatus: method === "cod" ? "cod-pending" : "unpaid",
        paymentProof: null,
        statusHistory: [
          {
            status: "pending",
            at: new Date(),
            note: chosenZone
              ? `Order placed via ${
                  method === "cod" ? "Cash on Delivery" : "QR Payment"
                } — Zone: ${chosenZone.name}`
              : `Order placed via ${
                  method === "cod" ? "Cash on Delivery" : "QR Payment"
                }`,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // ---------- Decrement stock ----------
      for (const item of enrichedItems) {
        await books.updateOne(
          { _id: new ObjectId(item.bookId) },
          {
            $inc: { stock: -item.quantity },
            $set: { updatedAt: new Date() },
          }
        );
      }

      const result = await orders.insertOne(doc);

      // Clear cart
      await db
        .collection("carts")
        .updateOne(
          { userId: decoded.id },
          { $set: { items: [], updatedAt: new Date() } }
        );

      return res.status(201).json({ _id: result.insertedId, ...doc });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Orders error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};