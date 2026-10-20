// client/src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);

  const refresh = async () => {
    if (!isAuthenticated) {
      setItems([]);
      setTotal(0);
      setCount(0);
      return;
    }
    try {
      const { data } = await api.get("/cart");
      setItems(data.items || []);
      setTotal(data.total || 0);
      setCount(data.count || 0);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const add = async (bookId, quantity = 1) => {
    await api.post("/cart", { bookId, quantity });
    await refresh();
  };

  const remove = async (bookId) => {
    await api.delete("/cart", { data: { bookId } });
    await refresh();
  };

  const updateQty = async (bookId, quantity) => {
    await api.put("/cart", { bookId, quantity });
    await refresh();
  };

  return (
    <CartContext.Provider
      value={{ items, total, count, add, remove, updateQty, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}