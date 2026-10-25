
 // client/src/utils/api.js
import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://halesi-books-stationary-ncy8.vercel.app/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach user token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hbc_user_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
