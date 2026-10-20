// client/src/context/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-x py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(
          location.pathname + location.search
        )}`}
        replace
      />
    );
  }

  return children;
}