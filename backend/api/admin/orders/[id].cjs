// backend/api/admin/orders/[id].cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../../lib/db.cjs");
const { getAdminFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const VALID_PAYMENT = [
  "unpaid",
  "cod-pending",
  "pending-verification",
  "verified",
  "rejected",
  "cod-paid",
];

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getAdminFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const id = req.query?.id || req.params?.id;
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  const { db } = await connectToDatabase();
  const orders = db.collection("orders");
  const books = db.collection("books");
  const _id = new ObjectId(id);

  try {
    const order = await orders.findOne({ _id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (req.method === "GET") {
      return res.status(200).json(order);
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const { status, paymentStatus, note } = req.body || {};
      const update = { updatedAt: new Date() };
      const historyPush = [];

      // ---------- STATUS CHANGE ----------
      if (status !== undefined) {
        if (!VALID_STATUSES.includes(status)) {
          return res.status(400).json({ message: "Invalid status" });
        }

        // 💡 If cancelling, restore stock (only if it was NOT already cancelled)
        if (status === "cancelled" && order.status !== "cancelled") {
          for (const item of order.items || []) {
            if (!ObjectId.isValid(item.bookId)) continue;
            await books.updateOne(
              { _id: new ObjectId(item.bookId) },
              {
                $inc: { stock: item.quantity },
                $set: { updatedAt: new Date() },
              }
            );
          }
        }

        // 💡 If un-cancelling (moving out of cancelled), decrement stock again
        if (status !== "cancelled" && order.status === "cancelled") {
          for (const item of order.items || []) {
            if (!ObjectId.isValid(item.bookId)) continue;
            await books.updateOne(
              { _id: new ObjectId(item.bookId) },
              {
                $inc: { stock: -item.quantity },
                $set: { updatedAt: new Date() },
              }
            );
          }
        }

        update.status = status;

        // 💡 When delivered, if payment was COD, mark as paid
        if (status === "delivered" && order.paymentMethod === "cod") {
          update.paymentStatus = "cod-paid";
        }

        historyPush.push({
          status,
          at: new Date(),
          note: note || "Status updated by admin",
        });
      }

      // ---------- PAYMENT STATUS CHANGE ----------
      if (paymentStatus !== undefined) {
        if (!VALID_PAYMENT.includes(paymentStatus)) {
          return res.status(400).json({ message: "Invalid payment status" });
        }
        update.paymentStatus = paymentStatus;
        historyPush.push({
          status: `payment-${paymentStatus}`,
          at: new Date(),
          note: note || `Payment marked ${paymentStatus}`,
        });
      }

      const updateOp = { $set: update };
      if (historyPush.length > 0) {
        updateOp.$push = { statusHistory: { $each: historyPush } };
      }

      await orders.updateOne({ _id }, updateOp);

      const updated = await orders.findOne({ _id });
      return res.status(200).json(updated);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Admin order update error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};