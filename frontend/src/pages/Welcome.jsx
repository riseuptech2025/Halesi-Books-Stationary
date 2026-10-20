import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Welcome() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-primary-900 flex items-center justify-center overflow-hidden relative">
      {/* Decorative circles */}
      <div className="absolute top-[-100px] left-[-100px] w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      <div className="text-center z-10 animate-fade-in px-6">
        <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-2xl animate-scale-in">
          <svg
            className="w-14 h-14 text-primary-600"
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
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
          Halesi Books Centre
        </h1>
        <p className="text-primary-100 text-lg mb-8">
          Admin Management Portal
        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
        </div>
      </div>
    </div>
  );
}