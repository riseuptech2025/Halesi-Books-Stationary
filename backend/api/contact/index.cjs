// backend/api/contact/index.cjs — PUBLIC
const { connectToDatabase } = require("../lib/db.cjs");
const { getUserFromRequest } = require("../lib/auth.cjs");
const { setCors, handleOptions } = require("../lib/cors.cjs");
const { sendContactMessageToAdmin } = require("../lib/mailer.cjs");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, email, phone, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email and message are required" });
    }
    if (!EMAIL_RE.test(String(email).trim())) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (String(message).trim().length < 10) {
      return res
        .status(400)
        .json({ message: "Message is too short (min 10 chars)" });
    }

    const decoded = getUserFromRequest(req);
    const { db } = await connectToDatabase();
    const messages = db.collection("contact_messages");

    const now = new Date();
    const doc = {
      userId: decoded?.id || null,
      name: String(name).trim().slice(0, 80),
      email: String(email).toLowerCase().trim().slice(0, 120),
      phone: phone ? String(phone).trim().slice(0, 30) : "",
      subject: subject ? String(subject).trim().slice(0, 140) : "General enquiry",
      message: String(message).trim().slice(0, 4000),
      thread: [
        {
          from: "user",
          text: String(message).trim().slice(0, 4000),
          at: now,
          adminName: null,
        },
      ],
      status: "new",
      createdAt: now,
      updatedAt: now,
    };

    const result = await messages.insertOne(doc);

    // Fire-and-forget email — don't block the response
    sendContactMessageToAdmin({
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      subject: doc.subject,
      message: doc.message,
    }).catch((err) => console.error("Contact email failed:", err));

    return res.status(201).json({
      _id: result.insertedId,
      message: "Thank you! Your message was received.",
    });
  } catch (err) {
    console.error("Contact submit error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};