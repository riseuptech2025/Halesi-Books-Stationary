// backend/api/lib/cloudinary.cjs
const crypto = require("crypto");

async function deleteImage(publicId) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret || !publicId) return;

  const timestamp = Math.round(Date.now() / 1000);
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(stringToSign + apiSecret)
    .digest("hex");

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
  });

  const resp = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Cloudinary delete failed: ${resp.status} ${text}`);
  }

  return resp.json();
}

async function deleteImages(publicIds = []) {
  await Promise.all(
    publicIds.filter(Boolean).map((id) => deleteImage(id).catch(() => {}))
  );
}

module.exports = { deleteImage, deleteImages };