// backend/api/lib/otp.cjs
const crypto = require("crypto");
const { connectToDatabase } = require("./db.cjs");

const COLLECTION = "signup_otps";

function generateCode() {
  // 6-digit numeric
  return String(crypto.randomInt(100000, 1000000));
}

function hashCode(code) {
  return crypto
    .createHash("sha256")
    .update(String(code) + (process.env.JWT_SECRET || ""))
    .digest("hex");
}

/**
 * Create (or replace) an OTP for an email, tied to the pending signup payload.
 * The pending signup is stored alongside so that the final /verify endpoint
 * doesn't need to trust the client again.
 */
async function issueOtp({ email, pendingUser }) {
  const { db } = await connectToDatabase();
  const otps = db.collection(COLLECTION);

  const cleanEmail = String(email).toLowerCase().trim();
  const code = generateCode();
  const ttlMin = Number(process.env.OTP_TTL_MINUTES || 10);
  const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000);

  await otps.deleteMany({ email: cleanEmail }); // one active code per email

  await otps.insertOne({
    email: cleanEmail,
    codeHash: hashCode(code),
    pendingUser,              // { name, email, phone, passwordHash }
    attempts: 0,
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
    createdAt: new Date(),
    expiresAt,
  });

  return { code, expiresAt, ttlMin };
}

/**
 * Verify an OTP. Returns { ok, pendingUser } or { ok:false, reason }.
 * Does NOT delete the OTP — caller decides (signup endpoint will delete on success).
 */
async function verifyOtp({ email, code }) {
  const { db } = await connectToDatabase();
  const otps = db.collection(COLLECTION);
  const cleanEmail = String(email).toLowerCase().trim();

  const doc = await otps.findOne({ email: cleanEmail });
  if (!doc) return { ok: false, reason: "no-code" };

  if (new Date(doc.expiresAt) < new Date()) {
    await otps.deleteOne({ _id: doc._id });
    return { ok: false, reason: "expired" };
  }

  if (doc.attempts >= (doc.maxAttempts || 5)) {
    await otps.deleteOne({ _id: doc._id });
    return { ok: false, reason: "too-many-attempts" };
  }

  if (hashCode(code) !== doc.codeHash) {
    await otps.updateOne({ _id: doc._id }, { $inc: { attempts: 1 } });
    return { ok: false, reason: "wrong-code" };
  }

  return { ok: true, pendingUser: doc.pendingUser, otpId: doc._id };
}

async function consumeOtp(otpId) {
  const { db } = await connectToDatabase();
  await db.collection(COLLECTION).deleteOne({ _id: otpId });
}

module.exports = { issueOtp, verifyOtp, consumeOtp };