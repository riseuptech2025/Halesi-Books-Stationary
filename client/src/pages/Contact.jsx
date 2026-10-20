// client/src/pages/Contact.jsx
import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple UI demo — hook this up to an actual email service later
    setSent(true);
    setTimeout(() => setSent(false), 5000);
    setForm({ name: "", email: "", message: "" });
  };

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Info cards */}
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
            +977-9863958892
            <br />
            Sun–Fri, 8am – 7pm
          </p>
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
            info@halesibooks.com.np
          </p>
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
            <span>Thank you! Your message has been sent.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your Name
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
              Email
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
              Message
            </label>
            <textarea
              name="message"
              required
              rows={5}
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-gray-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition resize-none"
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
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
          </button>
        </form>
      </div>
    </div>
  );
}