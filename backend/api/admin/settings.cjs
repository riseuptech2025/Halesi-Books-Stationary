// backend/api/admin/settings.cjs
const { getAdminFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");
const { getSettings, updateSettings } = require("../lib/settings.cjs");

function sanitizeZones(zones) {
  if (!Array.isArray(zones)) return null;
  return zones
    .slice(0, 30) // max 30 zones
    .map((z, i) => ({
      id:
        String(z.id || "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "") || `zone-${i + 1}`,
      name: String(z.name || "").trim().slice(0, 60),
      description: String(z.description || "").trim().slice(0, 160),
      charge: Math.max(0, Number(z.charge) || 0),
    }))
    .filter((z) => z.name);
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  const decoded = getAdminFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const settings = await getSettings();
      return res.status(200).json(settings);
    }

    if (req.method === "PUT") {
      const { deliveryZones, deliveryCharge, paymentQR, paymentMethods } =
        req.body || {};

      const patch = {};

      if (deliveryZones !== undefined) {
        const clean = sanitizeZones(deliveryZones);
        if (!clean || clean.length === 0) {
          return res
            .status(400)
            .json({ message: "At least one delivery zone is required" });
        }
        // Ensure unique ids
        const seen = new Set();
        clean.forEach((z, i) => {
          let base = z.id || `zone-${i + 1}`;
          let id = base;
          let n = 1;
          while (seen.has(id)) {
            id = `${base}-${n++}`;
          }
          z.id = id;
          seen.add(id);
        });
        patch.deliveryZones = clean;
      }

      if (deliveryCharge !== undefined) {
        patch.deliveryCharge = Math.max(0, Number(deliveryCharge) || 0);
      }

      if (paymentQR !== undefined) {
        patch.paymentQR = paymentQR
          ? {
              url: String(paymentQR.url || ""),
              publicId: String(paymentQR.publicId || ""),
            }
          : null;
      }

      if (paymentMethods !== undefined && typeof paymentMethods === "object") {
        patch.paymentMethods = {
          qr: !!paymentMethods.qr,
          cod: !!paymentMethods.cod,
        };
      }

      const updated = await updateSettings(patch);
      return res.status(200).json(updated);
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("Admin settings error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};