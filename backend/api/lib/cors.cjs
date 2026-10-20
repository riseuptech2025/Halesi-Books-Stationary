// backend/api/lib/cors.cjs
function setCors(req, res) {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
  ].filter(Boolean);

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS,PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    setCors(req, res);
    res.status(204).end();
    return true;
  }
  return false;
}

module.exports = { setCors, handleOptions };