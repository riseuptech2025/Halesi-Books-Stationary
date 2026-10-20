// backend/api/orders/[id].cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../lib/db.cjs");
const { getUserFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const id = req.query?.id || req.params?.id;
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  const { db } = await connectToDatabase();
  const orders = db.collection("orders");
  const _id = new ObjectId(id);

  try {
    const order = await orders.findOne({ _id, userId: decoded.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ---------- GET ----------
    if (req.method === "GET") {
      return res.status(200).json(order);
    }

    // ---------- DELETE (cancel) ----------
    if (req.method === "DELETE") {
      if (order.status !== "pending" && order.status !== "confirmed") {
        return res
          .status(400)
          .json({ message: "Only pending or confirmed orders can be cancelled" });
      }

      await orders.updateOne(
        { _id },
        {
          $set: {
            status: "cancelled",
            updatedAt: new Date(),
          },
          $push: {
            statusHistory: {
              status: "cancelled",
              at: new Date(),
              note: "Cancelled by customer",
            },
          },
        }
      );

      return res.status(200).json({ message: "Order cancelled" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Order [id] error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};