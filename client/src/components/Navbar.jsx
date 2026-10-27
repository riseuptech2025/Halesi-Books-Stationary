// client/src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const menuRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/books", label: "Books" },
    {
      label: "Announcements",
      children: [
        { to: "/announcements/nijamati", label: "Nijamati" },
        { to: "/announcements/public-agency", label: "Public Agency" },
        { to: "/announcements/security-agency", label: "Security Agency" },
        { to: "/announcements/teacher-service", label: "Teacher Service Commission" },
        { to: "/announcements/all", label: "All" },
      ],
    },
    {
      label: "Study Materials",
      children: [
        { to: "/materials/nijamati", label: "Nijamati" },
        { to: "/materials/public-agency", label: "Public Agency" },
        { to: "/materials/security-agency", label: "Security Agency" },
        { to: "/materials/teacher-service", label: "Teacher Service Commission" },
        { to: "/materials/all", label: "All" },
      ],
    },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials = (user?.name || "U")
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="container-x flex items-center justify-between h-16 gap-4">
        {/* ============= LOGO ============= */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
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
          <div className="hidden sm:block leading-tight">
            <p className="font-extrabold text-base tracking-tight">
              <span className="text-red-700">Halesi</span>{" "}
              <span className="text-green-700">Books</span>{" "}
              <span className="text-yellow-500">Centre</span>
            </p>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide">
              BOOKS · STATIONERY · MORE
            </p>
          </div>
        </Link>

        {/* ============= DESKTOP NAV ============= */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) =>
            l.children ? (
              <NavDropdown key={l.label} item={l} />
            ) : (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? "bg-red-50 text-red-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-red-700"
                  }`
                }
              >
                {l.label}
              </NavLink>
            )
          )}
        </nav>

        {/* ============= RIGHT ACTIONS ============= */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Wishlist badge */}
          {isAuthenticated && (
            <Link
              to="/profile?tab=wishlist"
              className="relative w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              title="Wishlist"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {wishCount > 99 ? "99+" : wishCount}
                </span>
              )}
            </Link>
          )}

          {/* Cart badge */}
          {isAuthenticated && (
            <Link
              to="/profile?tab=cart"
              className="relative w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              title="Cart"
            >
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Browse books CTA */}
          <Link
            to="/books"
            className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md shadow-red-500/20 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Browse
          </Link>

          {/* ============= USER AREA ============= */}
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenu((v) => !v)}
                className="flex items-center gap-2 rounded-full hover:bg-gray-100 p-1 pr-2 transition"
                title={user?.name}
              >
                {/* Avatar */}
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-red-500 shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center text-xs font-extrabold border-2 border-red-500 shadow-sm">
                    {initials}
                  </div>
                )}
                <svg
                  className={`w-3.5 h-3.5 text-gray-500 transition ${
                    userMenu ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                  {/* User header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                    {user?.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-red-500"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center text-sm font-extrabold border-2 border-red-500">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <MenuItem
                      to="/profile"
                      icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      label="My Profile"
                      onClick={() => setUserMenu(false)}
                    />
                    <MenuItem
                      to="/profile?tab=orders"
                      icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      label="My Orders"
                      onClick={() => setUserMenu(false)}
                    />
                    <MenuItem
                      to="/profile?tab=wishlist"
                      icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      label="Wishlist"
                      onClick={() => setUserMenu(false)}
                      badge={wishCount}
                    />
                    <MenuItem
                      to="/profile?tab=cart"
                      icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      label="My Cart"
                      onClick={() => setUserMenu(false)}
                      badge={cartCount}
                    />
                    <MenuItem
                      to="/profile?tab=addresses"
                      icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      label="Addresses"
                      onClick={() => setUserMenu(false)}
                    />
                    <MenuItem
                      to="/profile?tab=security"
                      icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      label="Security"
                      onClick={() => setUserMenu(false)}
                    />
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-gray-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:flex text-sm font-semibold text-gray-700 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="flex text-sm font-semibold text-white bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 px-4 py-2 rounded-lg shadow-md shadow-green-500/20 transition"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="md:hidden w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* ============= MOBILE NAV ============= */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="container-x py-3 flex flex-col gap-1">
            {links.map((l) =>
              l.children ? (
                <div key={l.label} className="border-t border-gray-100 pt-2 mt-1">
                  <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {l.label}
                  </p>
                  {l.children.map((c) => (
                    <NavLink
                      key={c.to}
                      to={c.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `block px-6 py-2 rounded-lg text-sm font-medium ${
                          isActive
                            ? "bg-red-50 text-red-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`
                      }
                    >
                      {c.label}
                    </NavLink>
                  ))}
                </div>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg text-sm font-semibold ${
                      isActive
                        ? "bg-red-50 text-red-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              )
            )}
            {isAuthenticated && (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  My Profile
                </NavLink>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center text-sm font-semibold text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center text-sm font-semibold text-white bg-gradient-to-r from-green-700 to-green-600 px-4 py-2.5 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

/* ============= NAV DROPDOWN (desktop) ============= */
function NavDropdown({ item }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1 ${
          open
            ? "bg-red-50 text-red-700"
            : "text-gray-700 hover:bg-gray-50 hover:text-red-700"
        }`}
      >
        {item.label}
        <svg
          className={`w-3.5 h-3.5 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
          {item.children.map((c) => (
            <NavLink
              key={c.to}
              to={c.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-red-50 text-red-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              {c.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============= USER MENU ITEM ============= */
function MenuItem({ to, icon, label, onClick, badge = 0 }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
    >
      <svg
        className="w-4 h-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={icon}
        />
      </svg>
      <span className="flex-1">{label}</span>
      {badge > 0 && (
        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}