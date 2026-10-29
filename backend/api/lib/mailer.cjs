// backend/api/lib/mailer.cjs
const nodemailer = require("nodemailer");

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE) === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP_USER / SMTP_PASS not configured");
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return cachedTransporter;
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

// ------------------------------------------------------------
// OTP / signup verification email
// ------------------------------------------------------------
async function sendOtpEmail({ to, name, code }) {
  const transporter = getTransporter();
  const ttl = Number(process.env.OTP_TTL_MINUTES || 10);

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #b91c1c; margin: 0; font-size: 22px;">Halesi Books Centre</h1>
        <p style="color: #6b7280; margin: 4px 0 0; font-size: 13px;">Email Verification</p>
      </div>
      <div style="background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
        <p style="color: #111827; font-size: 15px; margin: 0 0 12px;">
          Hi <strong>${escapeHtml(name || "there")}</strong>,
        </p>
        <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
          Use the code below to verify your email and finish creating your
          Halesi Books Centre account. This code expires in
          <strong>${ttl} minutes</strong>.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; padding: 16px 28px; background: #fef3c7; border: 2px dashed #d97706; border-radius: 12px; letter-spacing: 10px; font-size: 30px; font-weight: 800; color: #92400e;">
            ${code}
          </div>
        </div>
        <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 20px 0 0;">
          If you didn't request this, you can safely ignore this email — no
          account will be created without the code.
        </p>
      </div>
      <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 20px;">
        © ${new Date().getFullYear()} Halesi Books Centre · Biratnagar, Nepal
      </p>
    </div>
  `;

  const text = `Your Halesi Books Centre verification code is ${code}. It expires in ${ttl} minutes.`;

  return transporter.sendMail({
    from: `"Halesi Books Centre" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your verification code: ${code}`,
    text,
    html,
  });
}

// ------------------------------------------------------------
// Contact message → admin inbox
// ------------------------------------------------------------
async function sendContactMessageToAdmin({
  name,
  email,
  phone,
  subject,
  message,
}) {
  const transporter = getTransporter();
  const adminEmail = process.env.SMTP_USER;
  if (!adminEmail) throw new Error("SMTP_USER not configured");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px;">
      <div style="text-align:center;margin-bottom:20px;">
        <h2 style="color:#b91c1c;margin:0;font-size:20px;">New Contact Message</h2>
        <p style="color:#6b7280;font-size:12px;margin-top:4px;">Halesi Books Centre</p>
      </div>
      <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e5e7eb;">
        <table style="width:100%;font-size:14px;color:#374151;">
          <tr><td style="padding:6px 0;font-weight:700;width:90px;">Name</td><td>${escapeHtml(name)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700;">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          ${phone ? `<tr><td style="padding:6px 0;font-weight:700;">Phone</td><td>${escapeHtml(phone)}</td></tr>` : ""}
          <tr><td style="padding:6px 0;font-weight:700;">Subject</td><td>${escapeHtml(subject || "General enquiry")}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
        <p style="white-space:pre-wrap;color:#111827;font-size:14px;line-height:1.6;">${escapeHtml(message)}</p>
      </div>
      <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px;">
        Reply from the admin panel to respond to this customer.
      </p>
    </div>
  `;

  return transporter.sendMail({
    from: `"Halesi Books Centre" <${adminEmail}>`,
    to: adminEmail,
    replyTo: email,
    subject: `[Contact] ${subject || "New message"} — ${name}`,
    html,
    text: `New message from ${name} (${email})${phone ? ` · ${phone}` : ""}:\n\n${message}`,
  });
}

// ------------------------------------------------------------
// Admin reply → user inbox
// ------------------------------------------------------------
async function sendReplyToUser({
  to,
  userName,
  subject,
  replyText,
  originalMessage,
}) {
  const transporter = getTransporter();

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px;">
      <div style="text-align:center;margin-bottom:20px;">
        <h2 style="color:#b91c1c;margin:0;font-size:20px;">Halesi Books Centre</h2>
        <p style="color:#6b7280;font-size:12px;margin-top:4px;">Reply to your enquiry</p>
      </div>
      <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e5e7eb;">
        <p style="color:#111827;font-size:14px;">Hi <strong>${escapeHtml(userName || "there")}</strong>,</p>
        <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:12px 16px;margin:12px 0;border-radius:6px;color:#14532d;white-space:pre-wrap;font-size:14px;line-height:1.6;">${escapeHtml(replyText)}</div>
        <p style="color:#6b7280;font-size:12px;margin-top:20px;">Your original message:</p>
        <p style="color:#6b7280;font-size:12px;white-space:pre-wrap;font-style:italic;border-left:2px solid #e5e7eb;padding-left:10px;">${escapeHtml(originalMessage)}</p>
      </div>
      <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px;">© ${new Date().getFullYear()} Halesi Books Centre</p>
    </div>
  `;

  return transporter.sendMail({
    from: `"Halesi Books Centre" <${process.env.SMTP_USER}>`,
    to,
    subject: `Re: ${subject || "Your message"} — Halesi Books Centre`,
    html,
    text: `${replyText}\n\n---\nYour message: ${originalMessage}`,
  });
}

// ------------------------------------------------------------
// New order → admin notification
// ------------------------------------------------------------
async function sendOrderNotificationToAdmin({
  orderNumber,
  customerName,
  customerPhone,
  customerEmail,
  shippingAddress,
  city,
  paymentMethod,
  paymentStatus,
  items,
  subtotal,
  deliveryFee,
  deliveryZoneName,
  total,
  notes,
  createdAt,
}) {
  const transporter = getTransporter();
  const adminEmail = process.env.SMTP_USER;
  if (!adminEmail) throw new Error("SMTP_USER not configured");

  const itemsHtml = (items || [])
    .map(
      (i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6;">
          <div style="font-weight:600;color:#111827;">${escapeHtml(i.title)}</div>
          <div style="font-size:12px;color:#6b7280;">by ${escapeHtml(i.author || "")}</div>
        </td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:center;">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:right;">NPR ${Number(i.price).toLocaleString()}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;">NPR ${Number(i.price * i.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const itemsText = (items || [])
    .map(
      (i) =>
        `• ${i.title} × ${i.quantity} — NPR ${(i.price * i.quantity).toLocaleString()}`
    )
    .join("\n");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px;">
      <div style="text-align:center;margin-bottom:20px;">
        <h2 style="color:#b91c1c;margin:0;font-size:22px;">🛒 New Order Received</h2>
        <p style="color:#6b7280;font-size:13px;margin-top:4px;">
          Order <strong>#${escapeHtml(orderNumber)}</strong> ·
          ${new Date(createdAt || Date.now()).toLocaleString("en-GB")}
        </p>
      </div>

      <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e5e7eb;margin-bottom:16px;">
        <h3 style="margin:0 0 12px;color:#111827;font-size:15px;">Customer</h3>
        <table style="width:100%;font-size:14px;color:#374151;">
          <tr><td style="padding:4px 0;font-weight:700;width:100px;">Name</td><td>${escapeHtml(customerName)}</td></tr>
          <tr><td style="padding:4px 0;font-weight:700;">Phone</td><td><a href="tel:${escapeHtml(customerPhone)}">${escapeHtml(customerPhone)}</a></td></tr>
          ${customerEmail ? `<tr><td style="padding:4px 0;font-weight:700;">Email</td><td>${escapeHtml(customerEmail)}</td></tr>` : ""}
          <tr><td style="padding:4px 0;font-weight:700;">Address</td><td>${escapeHtml(shippingAddress)}${city ? `, ${escapeHtml(city)}` : ""}</td></tr>
          ${deliveryZoneName ? `<tr><td style="padding:4px 0;font-weight:700;">Zone</td><td>${escapeHtml(deliveryZoneName)}</td></tr>` : ""}
          <tr><td style="padding:4px 0;font-weight:700;">Payment</td><td>${paymentMethod === "cod" ? "Cash on Delivery" : "QR"} · <span style="color:#b45309;">${escapeHtml(paymentStatus || "")}</span></td></tr>
        </table>
      </div>

      <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e5e7eb;margin-bottom:16px;">
        <h3 style="margin:0 0 12px;color:#111827;font-size:15px;">Items (${(items || []).length})</h3>
        <table style="width:100%;font-size:13px;color:#374151;border-collapse:collapse;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px;text-align:left;font-weight:700;">Book</th>
              <th style="padding:8px;text-align:center;font-weight:700;">Qty</th>
              <th style="padding:8px;text-align:right;font-weight:700;">Price</th>
              <th style="padding:8px;text-align:right;font-weight:700;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <table style="width:100%;font-size:14px;margin-top:12px;">
          <tr><td style="padding:4px 0;color:#6b7280;">Subtotal</td><td style="text-align:right;">NPR ${Number(subtotal).toLocaleString()}</td></tr>
          <tr><td style="padding:4px 0;color:#6b7280;">Delivery</td><td style="text-align:right;">NPR ${Number(deliveryFee).toLocaleString()}</td></tr>
          <tr><td style="padding:8px 0 0;border-top:1px solid #e5e7eb;font-weight:800;color:#b91c1c;font-size:16px;">Total</td><td style="text-align:right;padding:8px 0 0;border-top:1px solid #e5e7eb;font-weight:800;color:#b91c1c;font-size:16px;">NPR ${Number(total).toLocaleString()}</td></tr>
        </table>
      </div>

      ${notes ? `<div style="background:#fef3c7;border-left:4px solid #d97706;padding:12px 16px;border-radius:6px;color:#78350f;font-size:13px;"><strong>Customer note:</strong> ${escapeHtml(notes)}</div>` : ""}

      <p style="text-align:center;font-size:11px;color:#9ca3af;margin-top:16px;">Log in to the admin panel to confirm and process this order.</p>
    </div>
  `;

  return transporter.sendMail({
    from: `"Halesi Books Centre" <${adminEmail}>`,
    to: adminEmail,
    subject: `🛒 New Order #${orderNumber} — NPR ${Number(total).toLocaleString()}`,
    html,
    text: `New order #${orderNumber} from ${customerName} (${customerPhone})\n\n${itemsText}\n\nTotal: NPR ${Number(total).toLocaleString()}`,
  });
}

module.exports = {
  getTransporter,
  sendOtpEmail,
  sendContactMessageToAdmin,
  sendReplyToUser,
  sendOrderNotificationToAdmin,
};