// client/src/context/WishlistContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [ids, setIds] = useState(new Set());
  const [items, setItems] = useState([]);

  const refresh = async () => {
    if (!isAuthenticated) {
      setIds(new Set());
      setItems([]);
      return;
    }
    try {
      const { data } = await api.get("/wishlist");
      setItems(data);
      setIds(new Set(data.map((b) => b._id)));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const toggle = async (bookId) => {
    const { data } = await api.post("/wishlist", { bookId });
    if (data.inWishlist) {
      setIds((prev) => new Set(prev).add(bookId));
    } else {
      setIds((prev) => {
        const next = new Set(prev);
        next.delete(bookId);
        return next;
      });
    }
    return data.inWishlist;
  };

  const has = (bookId) => ids.has(bookId);

  return (
    <WishlistContext.Provider
      value={{ ids, items, has, toggle, refresh, count: ids.size }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside WishlistProvider");
  return ctx;
}