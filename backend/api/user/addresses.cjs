// backend/api/user/addresses.cjs
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
  const users = db.collection("users");
  const _id = new ObjectId(decoded.id);

  try {
    // ---------- GET ----------
    if (req.method === "GET") {
      const user = await users.findOne({ _id });
      return res.status(200).json(user?.addresses || []);
    }

    // ---------- POST add ----------
    if (req.method === "POST") {
      const { label, name, phone, address, city, isDefault } = req.body || {};
      if (!name || !phone || !address) {
        return res
          .status(400)
          .json({ message: "Name, phone and address are required" });
      }

      const newAddress = {
        _id: new ObjectId(),
        label: String(label || "Home").trim(),
        name: String(name).trim(),
        phone: String(phone).trim(),
        address: String(address).trim(),
        city: String(city || "").trim(),
        isDefault: !!isDefault,
        createdAt: new Date(),
      };

      const user = await users.findOne({ _id });
      let addresses = user?.addresses || [];

      if (newAddress.isDefault) {
        addresses = addresses.map((a) => ({ ...a, isDefault: false }));
      }
      addresses.push(newAddress);

      await users.updateOne(
        { _id },
        { $set: { addresses, updatedAt: new Date() } }
      );

      return res.status(201).json(newAddress);
    }

    // ---------- DELETE ----------
    if (req.method === "DELETE") {
      const { addressId } = req.body || {};
      if (!addressId) {
        return res.status(400).json({ message: "addressId is required" });
      }

      await users.updateOne(
        { _id },
        { $pull: { addresses: { _id: new ObjectId(addressId) } } }
      );

      return res.status(200).json({ message: "Address removed" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Addresses error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};