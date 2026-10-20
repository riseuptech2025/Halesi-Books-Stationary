// backend/api/lib/settings.cjs
const { connectToDatabase } = require("./db.cjs");

const DEFAULT_ZONES = [
  {
    id: "inside-halesi",
    name: "Inside Halesi",
    description: "Free delivery within Halesi town",
    charge: 0,
  },
  {
    id: "nearby-vdc",
    name: "Nearby VDCs",
    description: "Delivery within 10 km of Halesi",
    charge: 100,
  },
  {
    id: "khotang",
    name: "Khotang District",
    description: "Anywhere in Khotang district",
    charge: 200,
  },
  {
    id: "outside-khotang",
    name: "Outside Khotang",
    description: "Other districts — ships via courier",
    charge: 350,
  },
];

const DEFAULTS = {
  deliveryZones: DEFAULT_ZONES,
  deliveryCharge: 0, // fallback for backward compat
  paymentQR: null,
  paymentMethods: { qr: true, cod: true },
};

async function getSettings() {
  const { db } = await connectToDatabase();
  const settings = db.collection("settings");
  let doc = await settings.findOne({ _id: "store" });
  if (!doc) {
    doc = {
      _id: "store",
      ...DEFAULTS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await settings.insertOne(doc);
  }

  // Backfill deliveryZones if missing (migration)
  if (!Array.isArray(doc.deliveryZones) || doc.deliveryZones.length === 0) {
    doc.deliveryZones = DEFAULT_ZONES;
    await settings.updateOne(
      { _id: "store" },
      { $set: { deliveryZones: DEFAULT_ZONES, updatedAt: new Date() } }
    );
  }

  return doc;
}

async function updateSettings(patch) {
  const { db } = await connectToDatabase();
  const settings = db.collection("settings");
  await settings.updateOne(
    { _id: "store" },
    { $set: { ...patch, updatedAt: new Date() } },
    { upsert: true }
  );
  return getSettings();
}

module.exports = { getSettings, updateSettings, DEFAULTS, DEFAULT_ZONES };