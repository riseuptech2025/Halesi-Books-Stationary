// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const login = async (email, password) => {
    const { data } = await api.post("/auth/user-login", { email, password });
    localStorage.setItem("hbc_user_token", data.token);
    localStorage.setItem("hbc_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const updateUser = (patch) => {
  setUser((prev) => {
    const next = { ...prev, ...patch };
    localStorage.setItem("hbc_user", JSON.stringify(next));
    return next;
  });
};

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("hbc_user_token", data.token);
    localStorage.setItem("hbc_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("hbc_user_token");
    localStorage.removeItem("hbc_user");
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAuthenticated }}
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