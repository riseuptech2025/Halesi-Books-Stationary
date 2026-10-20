// client/src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  const socials = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/p/Halesi-Books-Centre-61566513787785",
      color: "hover:text-blue-500",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/halesi_books",
      color: "hover:text-pink-500",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.52.01-4.76.07-.99.04-1.53.21-1.89.35-.47.18-.81.4-1.16.75-.35.35-.57.69-.75 1.16-.14.36-.31.9-.35 1.89-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.04.99.21 1.53.35 1.89.18.47.4.81.75 1.16.35.35.69.57 1.16.75.36.14.9.31 1.89.35 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c.99-.04 1.53-.21 1.89-.35.47-.18.81-.4 1.16-.75.35-.35.57-.69.75-1.16.14-.36.31-.9.35-1.89.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.04-.99-.21-1.53-.35-1.89a3.1 3.1 0 00-.75-1.16 3.1 3.1 0 00-1.16-.75c-.36-.14-.9-.31-1.89-.35-1.24-.06-1.61-.07-4.76-.07zm0 3.06a5.02 5.02 0 110 10.04 5.02 5.02 0 010-10.04zm0 1.8a3.22 3.22 0 100 6.44 3.22 3.22 0 000-6.44zm5.2-1.98a1.17 1.17 0 11-2.34 0 1.17 1.17 0 012.34 0z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@halesi_books",
      color: "hover:text-white",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16.6 5.82A4.28 4.28 0 0115.54 3h-3.1v12.4a2.59 2.59 0 01-2.59 2.5 2.59 2.59 0 01-2.59-2.59 2.59 2.59 0 012.59-2.59c.27 0 .53.04.77.12V9.7a5.7 5.7 0 00-.77-.05A5.7 5.7 0 004.16 15.35 5.7 5.7 0 009.85 21a5.7 5.7 0 005.7-5.65V9.01a7.18 7.18 0 004.19 1.34V7.25a4.28 4.28 0 01-3.14-1.43z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com/@halesi_books",
      color: "hover:text-red-500",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 00.5 6.2 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.8 3.02 3.02 0 002.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.8zM9.6 15.6V8.4l6.24 3.6-6.24 3.6z" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="container-x py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl border-2 border-yellow-400 bg-white overflow-hidden flex items-center justify-center">
              <img
                src="/logo.jpeg"
                alt="Halesi Books Centre"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<span class="text-sm font-bold text-green-700">HB</span>';
                }}
              />
            </div>
            <p className="font-extrabold text-lg text-white">
              <span className="text-red-500">Halesi</span>{" "}
              <span className="text-green-500">Books</span>{" "}
              <span className="text-yellow-400">Centre</span>
            </p>
          </div>
          <p className="text-sm text-gray-400 max-w-md">
            Your trusted local bookstore — offering academic, literature, and
            reference books for every reader. Visit us in Halesi or browse our
            collection online.
          </p>

          {/* Social Media Links */}
          <div className="mt-5">
            <h4 className="text-white font-bold mb-3 text-sm">Follow Us</h4>
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                  className={`w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 ${social.color} hover:bg-gray-700 transition-all duration-300 hover:scale-110`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-yellow-400 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/books" className="hover:text-yellow-400 transition">
                All Books
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-yellow-400 transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-yellow-400 transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-bold mb-4">Get in Touch</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <svg
                className="w-4 h-4 mt-0.5 text-yellow-400"
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
              Traffic Chwok, Biratnagar-9, Morang, Nepal
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-4 h-4 mt-0.5 text-yellow-400"
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
              +977 9863958892
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="w-4 h-4 mt-0.5 text-yellow-400"
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
              info@halesibooks.com.np
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-x py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()}{" "}
            <strong>Halesi Books Centre</strong>. All rights reserved.
          </p>

          {/* Mini social icons in bottom bar (optional) */}
          <div className="flex items-center gap-3">
            {socials.map((social) => (
              <a
                key={`bottom-${social.name}`}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className={`text-gray-500 ${social.color} transition-colors duration-300`}
              >
                {social.icon}
              </a>
            ))}
          </div>

          <p className="text-center">
            Designed & Developed by{" "}
            <a
              href="https://www.riseuptech.com.np"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
              title="Contact Riseup-Tech Software Company"
            >
              Riseup-Tech Software Company ↗
            </a>
          </p>

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}