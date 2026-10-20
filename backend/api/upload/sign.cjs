// backend/api/upload/qr-sign.cjs
const crypto = require("crypto");
const { getAdminFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const decoded = getAdminFromRequest(req);
  if (!decoded) return res.status(401).json({ message: "Unauthorized" });

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ message: "Cloudinary not configured" });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "halesi-books/payment-qr";
    const paramsToSign = { folder, timestamp };
    const stringToSign = Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join("&");

    const signature = crypto
      .createHash("sha1")
      .update(stringToSign + apiSecret)
      .digest("hex");

    return res.status(200).json({
      signature,
      timestamp,
      folder,
      apiKey,
      cloudName,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    });
  } catch (err) {
    console.error("QR sign error:", err);
    return res.status(500).json({ message: "Failed to sign upload" });
  }
};