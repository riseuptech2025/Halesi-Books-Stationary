// backend/api/lib/auth.cjs
const jwt = require("jsonwebtoken");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// ---------- ADMIN ----------
function getAdminFromRequest(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "admin") return null;
  return decoded;
}

// ---------- USER (customer) ----------
function getUserFromRequest(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.role !== "user") return null;
  return decoded;
}

// ---------- EITHER ----------
function getAnyAuthFromRequest(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  return verifyToken(token);
}

module.exports = {
  signToken,
  verifyToken,
  getAdminFromRequest,
  getUserFromRequest,
  getAnyAuthFromRequest,
};