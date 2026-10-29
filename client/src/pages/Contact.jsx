// client/src/pages/Contact.jsx
import { useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Contact() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    subject: "General enquiry",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await api.post("/contact", form);
      setSent(true);
      setTimeout(() => setSent(false), 8000);
      setForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        subject: "General enquiry",
        message: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const socials = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/p/Halesi-Books-Centre-61566513787785",
      handle: "Halesi Books Centre",
      color: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/halesi_books",
      handle: "@halesi_books",
      color: "text-pink-600 bg-pink-50 border-pink-200 hover:bg-pink-100",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.52.01-4.76.07-.99.04-1.53.21-1.89.35-.47.18-.81.4-1.16.75-.35.35-.57.69-.75 1.16-.14.36-.31.9-.35 1.89-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.99.21 1.53.35 1.89.18.47.4.81.75 1.16.35.35.69.57 1.16.75.36.14.9.31 1.89.35 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.99-.04 1.53-.21 1.89-.35.47-.18.81-.4 1.16-.75.35-.35.57-.69.75-1.16.14-.36.31-.9.35-1.89.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.99-.21-1.53-.35-1.89a3.1 3.1 0 00-.75-1.16 3.1 3.1 0 00-1.16-.75c-.36-.14-.9-.31-1.89-.35-1.24-.06-1.61-.07-4.76-.07zm0 3.06a5.02 5.02 0 110 10.04 5.02 5.02 0 010-10.04zm0 1.8a3.22 3.22 0 100 6.44 3.22 3.22 0 000-6.44zm5.2-1.98a1.17 1.17 0 11-2.34 0 1.17 1.17 0 012.34 0z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@halesi_books",
      handle: "@halesi_books",
      color: "text-gray-800 bg-gray-100 border-gray-300 hover:bg-gray-200",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.6 5.82A4.28 4.28 0 0115.54 3h-3.1v12.4a2.59 2.59 0 01-2.59 2.5 2.59 2.59 0 01-2.59-2.59 2.59 2.59 0 012.59-2.59c.27 0 .53.04.77.12V9.7a5.7 5.7 0 00-.77-.05A5.7 5.7 0 004.16 15.35 5.7 5.7 0 009.85 21a5.7 5.7 0 005.7-5.65V9.01a7.18 7.18 0 004.19 1.34V7.25a4.28 4.28 0 01-3.14-1.43z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@halesi_books",
      handle: "@halesi_books",
      color: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 00.5 6.2 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.8 3.02 3.02 0 002.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.8zM9.6 15.6V8.4l6.24 3.6-6.24 3.6z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="container-x py-16 animate-fade-in">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-red-700">
          Contact
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2 font-display">
          Get in <span className="text-green-700">Touch</span>
        </h1>
        <p className="text-gray-600 mt-4">
          Have a question? Looking for a specific book? We'd love to hear from
          you.
        </p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-t-red-600">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Visit Us</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Traffic Chwok, Biratnagar-9
            <br />
            Morang, Nepal
          </p>
          <a
            href="https://maps.google.com/?q=Halesi+Books+Centre+Biratnagar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 mt-2 transition"
          >
            Get directions ↗
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-t-green-600">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            <a
              href="tel:+9779863958892"
              className="hover:text-green-700 transition"
            >
              +977-9863958892
            </a>
            <br />
            Sun–Fri, 8am – 7pm
          </p>
          <a
            href="https://wa.me/9779863958892"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 mt-2 transition"
          >
            Chat on WhatsApp ↗
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-t-4 border-t-yellow-400">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
          <p className="text-sm text-gray-600 leading-relaxed break-all">
            <a
              href="mailto:info@halesibooks.com.np"
              className="hover:text-yellow-600 transition"
            >
              info@halesibooks.com.np
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            We usually reply within 24 hours.
          </p>
        </div>
      </div>

      {/* Social + Map */}
      <div className="max-w-5xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border-t-4 border-t-blue-500">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Connect with us
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Follow us for new arrivals, offers, and updates.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${social.color} transition-all duration-300 hover:scale-[1.02]`}
              >
                <span className="shrink-0">{social.icon}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight">
                    {social.name}
                  </span>
                  <span className="block text-xs opacity-75 truncate">
                    {social.handle}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border-t-4 border-t-red-600">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Find us</h2>
          <p className="text-sm text-gray-500 mb-4">
            Traffic Chwok, Biratnagar-9, Morang, Nepal
          </p>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.0492589985056!2d87.27655067520774!3d26.454141076923467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef750008fd3e57%3A0x7cf6eea6e4a46296!2sHalesi%20books%20Centre!5e0!3m2!1sen!2snp!4v1792475727425!5m2!1sen!2snp"
              width="100%"
              height="260"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Halesi Books Centre Location"
            />
          </div>
          <a
            href="https://maps.google.com/?q=Halesi+Books+Centre+Biratnagar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 mt-3 transition"
          >
            Open in Google Maps ↗
          </a>
        </div>
      </div>

      {/* Contact form */}
      <div className="max-w-2xl mx-auto mt-10 bg-white rounded-2xl shadow-md p-6 md:p-8 border-t-4 border-t-yellow-400">
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          Send us a message
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          We usually reply within 24 hours.
        </p>

        {sent && (
          <div className="mb-5 flex items-start gap-2 bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-lg text-sm animate-fade-in">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Thank you! Your message has been sent. Our team will reply to
              your email soon — you can also see the reply in your{" "}
              <strong>Profile → Messages</strong>.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-2 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Phone (optional)
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+977-98XXXXXXXX"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="e.g. Book availability"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Message *
            </label>
            <textarea
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us what you're looking for..."
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}