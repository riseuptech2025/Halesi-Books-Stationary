// backend/api/auth/logout.cjs
const { setCors, handleOptions } = require("../lib/cors.cjs");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  return res.status(200).json({ message: "Logged out" });
};