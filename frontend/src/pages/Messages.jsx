// frontend/src/pages/Messages.jsx
import { useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import api from "../utils/api";

const STATUS_STYLES = {
  new: { label: "New", cls: "bg-red-100 text-red-700 border-red-200" },
  read: { label: "Read", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  replied: { label: "Replied", cls: "bg-green-100 text-green-700 border-green-200" },
};

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [counts, setCounts] = useState({ new: 0, read: 0, replied: 0, total: 0 });
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [activeId, setActiveId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const [showInfo, setShowInfo] = useState(false);
  const [mobileView, setMobileView] = useState("list"); // "list" | "chat"

  const threadEndRef = useRef(null);

  // ============ LIST ============
  const loadList = async () => {
    setLoadingList(true);
    setListError("");
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get("/admin/messages", { params });
      setMessages(data.messages || []);
      setCounts(data.counts || { new: 0, read: 0, replied: 0, total: 0 });
    } catch (err) {
      setListError(err.response?.data?.message || "Failed to load messages.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    const t = setTimeout(loadList, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ============ DETAIL ============
  const openThread = async (id) => {
    setActiveId(id);
    setLoadingDetail(true);
    setDetailError("");
    setDetail(null);
    setReplyText("");
    setShowInfo(false);
    setMobileView("chat");
    try {
      const { data } = await api.get(`/admin/messages/${id}`);
      setDetail(data);

      // reflect read status locally
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: data.status } : m))
      );
      if (data.status === "read") {
        setCounts((c) => ({
          ...c,
          new: Math.max(0, c.new - 1),
          read: c.read + 1,
        }));
      }
    } catch (err) {
      setDetailError(err.response?.data?.message || "Failed to load thread.");
    } finally {
      setLoadingDetail(false);
    }
  };

  // Scroll to bottom when thread changes / new reply
  useEffect(() => {
    if (threadEndRef.current) {
      threadEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [detail, detail?.thread?.length]);

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
            ? { ...m, status: "replied", thread: data.thread, updatedAt: data.updatedAt }
            : m
        )
      );
      setCounts((c) => ({ ...c, replied: c.replied + 1 }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const deleteThread = async (id) => {
    if (!confirm("Delete this message thread permanently?")) return;
    try {
      await api.delete(`/admin/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (activeId === id) {
        setActiveId(null);
        setDetail(null);
        setMobileView("list");
      }
    } catch {
      alert("Failed to delete");
    }
  };

  // ============ HELPERS ============
  const initials = (name) =>
    (name || "A")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase();

  const timeAgo = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "now";
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // Group thread by date
  const groupedThread = (thread) => {
    const groups = {};
    for (const m of thread || []) {
      const day = new Date(m.at).toDateString();
      if (!groups[day]) groups[day] = [];
      groups[day].push(m);
    }
    return Object.entries(groups);
  };

  return (
    <Layout title="Messages" subtitle="Customer enquiries from the contact form.">
      {/* Wrapper: fixed height, two-pane on lg */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex h-[calc(100vh-12rem)] min-h-[500px]">
        {/* ============ LEFT: LIST ============ */}
        <aside
          className={`w-full lg:w-80 xl:w-96 border-r border-gray-100 flex flex-col flex-shrink-0 ${
            mobileView === "chat" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Search + filter header */}
          <div className="p-3 border-b border-gray-100 space-y-2 bg-gradient-to-b from-gray-50 to-white">
            <div className="relative">
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
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
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
              />
            </div>

            <div className="flex gap-1 text-[11px] font-semibold">
              {[
                { id: "all", label: "All", count: counts.total },
                { id: "new", label: "New", count: counts.new, accent: "red" },
                { id: "read", label: "Read", count: counts.read, accent: "yellow" },
                { id: "replied", label: "Replied", count: counts.replied, accent: "green" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center gap-1 ${
                    statusFilter === f.id
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                  {f.count > 0 && (
                    <span
                      className={`text-[9px] px-1 rounded-full ${
                        statusFilter === f.id
                          ? "bg-white/20"
                          : "bg-white"
                      }`}
                    >
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
              </div>
            ) : listError ? (
              <div className="p-4 text-sm text-red-700 bg-red-50 border-l-4 border-red-500 m-3 rounded">
                {listError}
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  No messages
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Customer enquiries will appear here.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isActive = activeId === m._id;
                const status = STATUS_STYLES[m.status] || {};
                const lastMsg = m.thread?.[m.thread.length - 1];
                return (
                  <button
                    key={m._id}
                    onClick={() => openThread(m._id)}
                    className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition flex items-start gap-3 ${
                      isActive ? "bg-red-50 border-l-4 border-l-red-600" : ""
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isActive
                            ? "bg-red-600 text-white"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {initials(m.name)}
                      </div>
                      {m.status === "new" && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-600 border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm truncate ${
                            m.status === "new"
                              ? "font-extrabold text-gray-900"
                              : "font-semibold text-gray-800"
                          }`}
                        >
                          {m.name}
                        </p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {timeAgo(m.updatedAt || m.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          m.status === "new"
                            ? "text-gray-900 font-semibold"
                            : "text-gray-500"
                        }`}
                      >
                        {m.subject}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {lastMsg?.from === "admin" && (
                          <span className="text-green-600 font-semibold">
                            You:{" "}
                          </span>
                        )}
                        {lastMsg?.text || m.message}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Total footer */}
          <div className="px-3 py-2 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>
              {messages.length} conversation{messages.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {counts.new} unread
            </span>
          </div>
        </aside>

        {/* ============ RIGHT: CHAT ============ */}
        <section
          className={`flex-1 flex flex-col min-w-0 ${
            mobileView === "list" ? "hidden lg:flex" : "flex"
          }`}
        >
          {!activeId ? (
            <EmptyChat />
          ) : loadingDetail ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
            </div>
          ) : detailError ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <p className="text-red-600 font-semibold">Failed to load</p>
                <p className="text-sm text-gray-500 mt-1">{detailError}</p>
              </div>
            </div>
          ) : detail ? (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center gap-3 flex-shrink-0">
                {/* Back button (mobile only) */}
                <button
                  onClick={() => setMobileView("list")}
                  className="lg:hidden w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
                  aria-label="Back"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold flex-shrink-0">
                  {initials(detail.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 truncate">
                      {detail.name}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        STATUS_STYLES[detail.status]?.cls || ""
                      }`}
                    >
                      {STATUS_STYLES[detail.status]?.label || detail.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {detail.email}
                    {detail.phone && ` · ${detail.phone}`}
                  </p>
                </div>

                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition flex-shrink-0 ${
                    showInfo
                      ? "bg-red-50 text-red-700"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                  title="Details"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => deleteThread(detail._id)}
                  className="w-9 h-9 rounded-lg hover:bg-red-50 text-red-600 flex items-center justify-center transition flex-shrink-0"
                  title="Delete thread"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Optional info drawer */}
              {showInfo && (
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 text-xs space-y-1">
                  <InfoLine label="Subject" value={detail.subject} />
                  <InfoLine label="Email" value={detail.email} />
                  {detail.phone && <InfoLine label="Phone" value={detail.phone} />}
                  <InfoLine
                    label="Started"
                    value={formatDate(detail.createdAt)}
                  />
                  <InfoLine
                    label="Messages"
                    value={`${detail.thread?.length || 0} total`}
                  />
                </div>
              )}

              {/* Thread */}
              <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#e5ddd5]/30 space-y-4">
                {groupedThread(detail.thread).map(([day, msgs]) => (
                  <div key={day} className="space-y-3">
                    <div className="flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-white/80 text-[10px] font-bold uppercase text-gray-500 shadow-sm">
                        {formatDate(msgs[0].at)}
                      </span>
                    </div>

                    {msgs.map((t, i) => {
                      const isAdmin = t.from === "admin";
                      return (
                        <div
                          key={i}
                          className={`flex ${
                            isAdmin ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isAdmin && (
                            <div className="w-7 h-7 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mr-2 mt-auto">
                              {initials(detail.name)}
                            </div>
                          )}
                          <div
                            className={`max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm relative ${
                              isAdmin
                                ? "bg-gradient-to-br from-green-600 to-green-700 text-white rounded-tr-sm"
                                : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                            }`}
                          >
                            {isAdmin && (
                              <p className="text-[10px] font-bold uppercase tracking-wide text-green-100 mb-0.5">
                                {t.adminName || "Admin"}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {t.text}
                            </p>
                            <p
                              className={`text-[10px] text-right mt-1 ${
                                isAdmin ? "text-green-100" : "text-gray-400"
                              }`}
                            >
                              {formatTime(t.at)}
                              {isAdmin && (
                                <span className="ml-1">✓✓</span>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div ref={threadEndRef} />
              </div>

              {/* Reply box */}
              <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={1}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                    placeholder="Type your reply... (Enter to send, Shift+Enter for new line)"
                    className="flex-1 max-h-32 resize-none px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 text-sm"
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !replyText.trim()}
                    className="w-11 h-11 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md transition flex-shrink-0"
                    title="Send reply"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 px-1">
                  The customer will receive your reply by email and can also
                  see it in their Profile → Messages.
                </p>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </Layout>
  );
}

/* ============== HELPERS ============== */
function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
      <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
        <svg
          className="w-10 h-10 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900">
        Select a conversation
      </h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">
        Choose a message from the list to view the full thread and send a
        reply.
      </p>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="font-semibold text-gray-800 truncate text-right">
        {value}
      </span>
    </div>
  );
}