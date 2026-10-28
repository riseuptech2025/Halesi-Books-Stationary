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

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

module.exports = { sendOtpEmail, getTransporter };