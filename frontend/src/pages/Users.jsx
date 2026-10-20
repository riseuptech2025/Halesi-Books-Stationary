// frontend/src/pages/Users.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [busy, setBusy] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  });

  const toggleBlock = async (id, blocked) => {
    setBusy(id);
    try {
      await api.put(`/admin/users/${id}`, { blocked: !blocked });
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, blocked: !blocked } : u))
      );
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    setBusy(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } finally {
      setBusy(null);
    }
  };

  const initials = (name) =>
    (name || "U")
      .split(" ")
      .filter(Boolean)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <Layout title="Users" subtitle="Manage customer accounts.">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-red-600 p-4 mb-6">
        <div className="relative">
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
          />
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {filtered.length} of {users.length} users
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-md p-16 flex justify-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-16 text-center">
          <p className="text-lg font-bold text-gray-800">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {filtered.map((u) => (
            <div
              key={u._id}
              className="border-b border-gray-100 last:border-0"
            >
              <div className="p-4 flex items-center gap-4">
                {u.avatar?.url ? (
                  <img
                    src={u.avatar.url}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-red-500 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {initials(u.name)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {u.name}
                    </p>
                    {u.blocked && (
                      <span className="text-[10px] font-bold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        Blocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  {u.phone && (
                    <p className="text-xs text-gray-400">{u.phone}</p>
                  )}
                </div>

                <div className="hidden sm:flex items-center gap-6 text-right">
                  <div>
                    <p className="text-xs text-gray-500">Orders</p>
                    <p className="text-sm font-bold text-gray-900">
                      {u.orderCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Spent</p>
                    <p className="text-sm font-bold text-green-700">
                      NPR {Number(u.totalSpent).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setExpanded(expanded === u._id ? null : u._id)
                  }
                  className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
                >
                  <svg
                    className={`w-4 h-4 text-gray-500 transition ${
                      expanded === u._id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {expanded === u._id && (
                <div className="bg-gray-50 border-t border-gray-100 p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <Stat label="Wishlist" value={u.wishlistCount} />
                    <Stat label="Addresses" value={u.addressesCount} />
                    <Stat label="Orders" value={u.orderCount} />
                    <Stat
                      label="Total Spent"
                      value={`NPR ${Number(u.totalSpent).toLocaleString()}`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleBlock(u._id, u.blocked)}
                      disabled={busy === u._id}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-60 ${
                        u.blocked
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      }`}
                    >
                      {u.blocked ? "Unblock User" : "Block User"}
                    </button>
                    <button
                      onClick={() => remove(u._id)}
                      disabled={busy === u._id}
                      className="px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-semibold text-sm transition disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-100">
      <p className="text-[10px] uppercase tracking-wide font-bold text-gray-500">
        {label}
      </p>
      <p className="text-base font-extrabold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}