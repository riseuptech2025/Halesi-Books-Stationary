// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 toggle state
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-red-50 to-green-50 px-4 py-12 relative overflow-hidden">
      {/* Decorative colored blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />
      <div className="absolute top-1/3 right-10 w-48 h-48 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-5 rounded-3xl flex items-center justify-center shadow-xl border-2 border-yellow-400 bg-white overflow-hidden hover:scale-105 transition-transform">
            {/* 👇 Logo image from public folder */}
            <img
              src="/logo.jpeg"
              alt="Halesi Books Centre Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                // fallback if image fails to load
                e.target.style.display = "none";
                e.target.parentElement.innerHTML =
                  '<span class="text-3xl font-bold text-green-700">HB</span>';
              }}
            />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-red-700">Halesi</span>{" "}
            <span className="text-green-700">Books</span>{" "}
            <span className="text-yellow-500">Centre</span>
          </h1>
          <p className="text-gray-600 mt-1 font-medium flex items-center justify-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
            Admin Portal Login
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-7 border-t-4 border-t-red-600 border-b-4 border-b-yellow-400 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <span className="text-red-500 mr-1">●</span> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-gray-800 placeholder-amber-700/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
                placeholder="admin@halesibooks.com"
              />
            </div>

            {/* Password with show/hide toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <span className="text-green-600 mr-1">●</span> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} // 👈 toggle type
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-12 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-gray-800 placeholder-amber-700/50 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:bg-white transition"
                  placeholder="••••••••"
                />

                {/* 👇 Show/Hide toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-green-700 focus:outline-none focus:text-green-700 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    // Eye-off icon
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    // Eye icon
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
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
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Info box */}
          <div className="mt-6 flex items-start gap-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg text-xs">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Registration is disabled.{" "}
              <span className="font-semibold text-green-700">
                Contact system administrator
              </span>{" "}
              for access.
            </span>
          </div>
        </div>

        {/* Bottom color dots */}
        <div className="flex justify-center gap-3 mt-6">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="w-2 h-2 rounded-full bg-green-600" />
        </div>
      </div>
    </div>
  );
}