import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("hbc_admin");
    const token = localStorage.getItem("hbc_token");
    if (stored && token) {
      setAdmin(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("hbc_token", data.token);
    localStorage.setItem("hbc_admin", JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("hbc_token");
    localStorage.removeItem("hbc_admin");
    setAdmin(null);
  };

  const isAuthenticated = !!admin;

  return (
    <AuthContext.Provider
      value={{ admin, loading, login, logout, isAuthenticated }}
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