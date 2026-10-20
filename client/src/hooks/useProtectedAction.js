// client/src/hooks/useProtectedAction.js
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function useProtectedAction() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (action) => {
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${redirect}`, { replace: false });
      return false;
    }
    action?.();
    return true;
  };
}