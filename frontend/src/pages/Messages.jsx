// frontend/src/pages/Messages.jsx
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";

const STATUS_STYLES = {
  new: "bg-red-100 text-red-700 border-red-200",
  read: "bg-yellow-100 text-yellow-800 border-yellow-200",
  replied: "bg-green-100 text-green-700 border-green-200",
};

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState({ new: 0, read: 0, replied: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get("/admin/messages", { params });
      setMessages(data.messages || []);
      setCounts(data.counts || { new: 0, read: 0, replied: 0, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openThread = async (id) => {
    if (expanded === id) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(id);
    setDetailLoading(true);
    setReplyText("");
    try {
      const { data } = await api.get(`/admin/messages/${id}`);
      setDetail(data);
      // Refresh the list to reflect read status
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: data.status } : m))
      );
      if (data.status === "read") {
        setCounts((c) => ({ ...c, new: Math.max(0, c.new - 1), read: c.read + 1 }));
      }
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const sendReply = async () => {
    if (!detail || !replyText.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/admin/messages/${detail._id}`, {
        reply: replyText.trim(),
      });
      setDetail(data);
      setReplyText("");
      setMessages((prev) =>
        prev.map((m) =>
          m._id === data._id
            ? { ...m, status: "replied", thread: data.thread }
            : m
        )
      );
      // Refresh counts
      setCounts((c) => ({ ...c, replied: c.replied + 1 }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const deleteMsg = async (id) => {
    if (!confirm("Delete this message thread?")) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (expanded === id) {
        setExpanded(null);
        setDetail(null);
      }
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <Layout title="Messages" subtitle="Customer enquiries from the contact form.">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border-l-4 border-l-red-600 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 relative">
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
              placeholder="Search by name, email, subject or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:bg-white transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border-2 border-yellow-300 bg-yellow-50/50 text-sm font-medium focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-200 focus:bg-white transition"
          >
            <option value="all">All Messages</option>
            <option value="new">New ({counts.new})</option>
            <option value="read">Read ({counts.read})</option>
            <option value="replied">Replied ({counts.replied})</option>
          </select>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {counts.new} new
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            {counts.read} read
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {counts.replied} replied
          </span>
          <span>· Total: {counts.total}</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow p-16 flex justify-center">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl">
          {error}
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-16 text-center">
          <p className="text-base font-semibold text-gray-800">
            No messages {statusFilter !== "all" ? "in this filter" : "yet"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Messages sent from the contact page will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const isOpen = expanded === m._id;
            const statusCls = STATUS_STYLES[m.status] || "";
            return (
              <div
                key={m._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div
                  className="p-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => openThread(m._id)}
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold flex-shrink-0">
                    {(m.name || "A").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm">{m.name}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusCls}`}>
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1 truncate">
                      {m.subject}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                      {m.message}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(m.createdAt).toLocaleString("en-GB")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(m.thread?.length || 1)} message{m.thread?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-4">
                    {detailLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="w-8 h-8 border-3 border-red-200 border-t-red-600 rounded-full animate-spin" />
                      </div>
                    ) : detail ? (
                      <>
                        {/* Thread */}
                        <div className="space-y-3">
                          {detail.thread.map((t, i) => (
                            <div
                              key={i}
                              className={`flex ${t.from === "admin" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                  t.from === "admin"
                                    ? "bg-red-600 text-white"
                                    : "bg-white border border-gray-200 text-gray-800"
                                }`}
                              >
                                <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-1">
                                  {t.from === "admin" ? t.adminName || "Admin" : t.from === "user" ? detail.name : "System"}
                                </p>
                                <p className="text-sm whitespace-pre-wrap">{t.text}</p>
                                <p className="text-[10px] opacity-60 mt-1">
                                  {new Date(t.at).toLocaleString("en-GB")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reply */}
                        <div className="bg-white rounded-xl border-2 border-dashed border-red-200 p-3">
                          <label className="block text-xs font-bold uppercase text-red-700 mb-2">
                            Reply as {detail.thread.find((t) => t.from === "admin")?.adminName || "Admin"}
                          </label>
                          <textarea
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply — it will be emailed to the customer..."
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-sm focus:outline-none focus:border-red-500 resize-none"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => deleteMsg(m._id)}
                              className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 border border-red-200 transition"
                            >
                              Delete Thread
                            </button>
                            <button
                              onClick={sendReply}
                              disabled={sending || !replyText.trim()}
                              className="ml-auto bg-gradient-to-r from-red-700 to-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition disabled:opacity-60"
                            >
                              {sending ? "Sending..." : "Send Reply"}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Failed to load thread
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}