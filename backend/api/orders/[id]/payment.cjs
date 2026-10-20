// backend/api/orders/[id]/payment.cjs
const { ObjectId } = require("mongodb");
const { connectToDatabase } = require("../../lib/db.cjs");
const { getUserFromRequest } = require("../../lib/auth.cjs");
const { setCors, handleOptions } = require("../../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getUserFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  const id = req.query?.id || req.params?.id;
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { files } = req.body || {};
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: "No files provided" });
    }

    const { db } = await connectToDatabase();
    const orders = db.collection("orders");

    const order = await orders.findOne({
      _id: new ObjectId(id),
      userId: decoded.id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const proof = files.slice(0, 5).map((f) => ({
      url: String(f.url || ""),
      publicId: String(f.publicId || ""),
      name: String(f.name || ""),
    }));

    await orders.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          paymentProof: proof,
          paymentStatus: "pending-verification",
          updatedAt: new Date(),
        },
        $push: {
          statusHistory: {
            status: "payment-submitted",
            at: new Date(),
            note: `${proof.length} file(s) uploaded`,
          },
        },
      }
    );

    return res.status(200).json({ message: "Payment proof uploaded", proof });
  } catch (err) {
    console.error("Payment upload error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};