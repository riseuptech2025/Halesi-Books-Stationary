// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json({ limit: "10mb" }));

// Build allowed origins from env — dev + LAN
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  process.env.LAN_FRONTEND_URL,
  process.env.LAN_CLIENT_URL,
].filter(Boolean);

console.log("✅ CORS allowed origins:");
allowedOrigins.forEach((o) => console.log("   -", o));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, mobile apps)
      if (!origin) return callback(null, true);

      // Allow any localhost/127.0.0.1 port
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow any private LAN IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      if (
        /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(
          origin
        )
      ) {
        return callback(null, true);
      }

      // Allow explicit whitelist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("⛔ CORS blocked origin:", origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Adapter for Vercel-style handlers
function adapt(handler) {
  return async (req, res) => {
    req.query = { ...req.query, ...req.params };
    try {
      await handler(req, res);
    } catch (err) {
      console.error("Handler error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };
}

// AUTH
app.all("/api/auth/login", adapt(require("./api/auth/login.cjs")));
app.all("/api/auth/logout", adapt(require("./api/auth/logout.cjs")));
app.all("/api/auth/me", adapt(require("./api/auth/me.cjs")));
// AUTH — user
app.all("/api/auth/register", adapt(require("./api/auth/register.cjs")));
app.all("/api/auth/user-login", adapt(require("./api/auth/user-login.cjs")));
app.all("/api/auth/user-me", adapt(require("./api/auth/user-me.cjs")));

// REVIEWS
app.all("/api/reviews/:bookId", adapt(require("./api/reviews/[bookId].cjs")));

// WISHLIST
app.all("/api/wishlist", adapt(require("./api/wishlist/index.cjs")));
app.all(
  "/api/wishlist/check/:bookId",
  adapt(require("./api/wishlist/check/[bookId].cjs"))
);

// CART
app.all("/api/cart", adapt(require("./api/cart/index.cjs")));
// ADMIN BOOKS
app.all("/api/books", adapt(require("./api/books/index.cjs")));
app.all("/api/books/:id", adapt(require("./api/books/[id].cjs")));

// PUBLIC BOOKS
app.all(
  "/api/public/books",
  adapt(require("./api/public/books/index.cjs"))
);
app.all(
  "/api/public/books/:id",
  adapt(require("./api/public/books/[id].cjs"))
);

// UPLOAD
app.all("/api/upload/sign", adapt(require("./api/upload/sign.cjs")));

// USER PROFILE
app.all("/api/user/profile", adapt(require("./api/user/profile.cjs")));
app.all("/api/user/password", adapt(require("./api/user/password.cjs")));
app.all("/api/user/addresses", adapt(require("./api/user/addresses.cjs")));

// ORDERS
app.all("/api/orders", adapt(require("./api/orders/index.cjs")));
app.all("/api/orders/:id", adapt(require("./api/orders/[id].cjs")));
app.all("/api/upload/avatar-sign", adapt(require("./api/upload/avatar-sign.cjs")));
// ADMIN STATS
app.all("/api/admin/stats", adapt(require("./api/admin/stats.cjs")));

// ADMIN ORDERS
app.all("/api/admin/orders", adapt(require("./api/admin/orders/index.cjs")));
app.all(
  "/api/admin/orders/:id",
  adapt(require("./api/admin/orders/[id].cjs"))
);

// ADMIN USERS
app.all("/api/admin/users", adapt(require("./api/admin/users/index.cjs")));
app.all(
  "/api/admin/users/:id",
  adapt(require("./api/admin/users/[id].cjs"))
);

// ADMIN REVIEWS
app.all("/api/admin/reviews", adapt(require("./api/admin/reviews.cjs")));
app.all(
  "/api/orders/:id/payment",
  adapt(require("./api/orders/[id]/payment.cjs"))
);
app.all(
  "/api/upload/payment-sign",
  adapt(require("./api/upload/payment-sign.cjs"))
);

// PUBLIC SETTINGSapi/settings/public
app.all("/api/settings/public", adapt(require("./api/settings/public.cjs")));

// ADMIN SETTINGS
app.all("/api/admin/settings", adapt(require("./api/admin/settings.cjs")));

// QR UPLOAD
app.all("/api/upload/qr-sign", adapt(require("./api/upload/qr-sign.cjs")));
// Health
app.get("/", (_req, res) =>
  res.json({ ok: true, service: "Halesi Books API" })
);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0"; // 👈 listen on ALL interfaces

app.listen(PORT, HOST, () => {
  console.log(`🚀 API server running on http://${HOST}:${PORT}`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://10.76.182.216:${PORT}   👈 use this from other devices`);
});