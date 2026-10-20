// backend/api/settings/public.cjs
const { setCors, handleOptions } = require("../lib/cors.cjs");
const { getSettings } = require("../lib/settings.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const settings = await getSettings();
  return res.status(200).json({
    deliveryZones: settings.deliveryZones || [],
    deliveryCharge: settings.deliveryCharge || 0, // fallback
    paymentQR: settings.paymentQR,
    paymentMethods: settings.paymentMethods,
  });
};