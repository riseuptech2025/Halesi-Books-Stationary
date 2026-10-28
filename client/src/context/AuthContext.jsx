// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("hbc_user");
    const token = localStorage.getItem("hbc_user_token");
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("hbc_user");
        localStorage.removeItem("hbc_user_token");
      }
    }
    setLoading(false);
  }, []);

  // ---------- PERSIST HELPERS ----------
  const persistAuth = (data) => {
    localStorage.setItem("hbc_user_token", data.token);
    localStorage.setItem("hbc_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const clearAuth = () => {
    localStorage.removeItem("hbc_user_token");
    localStorage.removeItem("hbc_user");
    setUser(null);
  };

  // ---------- LOGIN ----------
  const login = async (email, password) => {
    const { data } = await api.post("/auth/user-login", { email, password });
    return persistAuth(data);
  };

  // ---------- LEGACY REGISTER (no OTP) ----------
  // Kept for backward compatibility. Prefer requestSignupOtp + verifySignupOtp
  // for the current signup flow.
  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return persistAuth(data);
  };

  // ---------- OTP SIGNUP: STEP 1 (request code) ----------
  // payload: { name, email, phone, password }
  // returns: { message, email, expiresAt, ttlMinutes }
  const requestSignupOtp = async (payload) => {
    const { data } = await api.post("/auth/signup-request", payload);
    return data;
  };

  // ---------- OTP SIGNUP: STEP 2 (verify code) ----------
  // returns the created user and stores the JWT
  const verifySignupOtp = async (email, code) => {
    const { data } = await api.post("/auth/signup-verify", { email, code });
    return persistAuth(data);
  };

  // ---------- PARTIAL UPDATE (e.g. after profile save) ----------
  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("hbc_user", JSON.stringify(next));
      return next;
    });
  };

  // ---------- LOGOUT ----------
  const logout = () => {
    clearAuth();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated,
        requestSignupOtp,
        verifySignupOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}