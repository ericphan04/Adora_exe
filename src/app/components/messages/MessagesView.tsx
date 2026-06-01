import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import {
  Search,
  Plus,
  Send,
  CheckCircle2,
  Monitor,
  BookOpen,
  Shield,
  Loader2,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import conversationApiFor, { ConversationApiRole } from "../../../api/conversationApi";
import bookingApi from "../../../api/bookingApi";
import ownerApi from "../../../api/ownerApi";
import { ConversationDto, MessageDto } from "../../../types/conversation";
import { BookingDto } from "../../../types/booking";
import { notify, apiErrorMessage } from "../../utils/notify";
import { useAuth } from "../../context/AuthContext";
import { useChatRealtime } from "../../hooks/useChatRealtime";

export type MessagesPanelRole = "RENTER" | "OWNER" | "ADMIN";

const META: Record<
  MessagesPanelRole,
  {
    apiRole: ConversationApiRole;
    title: string;
    subtitle: string;
    peerLabel: string;
    newChatLabel: string;
  }
> = {
  RENTER: {
    apiRole: "renter",
    title: "Tin nhắn",
    subtitle: "Trao đổi với chủ bảng QC về đặt chỗ và chiến dịch.",
    peerLabel: "Chủ bảng QC",
    newChatLabel: "Nhắn theo đặt chỗ",
  },
  OWNER: {
    apiRole: "owner",
    title: "Tin nhắn",
    subtitle: "Trao đổi với nhà quảng cáo về yêu cầu đặt chỗ.",
    peerLabel: "Nhà quảng cáo",
    newChatLabel: "Nhắn theo đặt chỗ",
  },
  ADMIN: {
    apiRole: "admin",
    title: "Tin nhắn nền tảng",
    subtitle: "Giám sát và hỗ trợ hội thoại giữa Renter và Owner.",
    peerLabel: "Hội thoại",
    newChatLabel: "",
  },
};

function formatTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface MessagesViewProps {
  role: MessagesPanelRole;
}

export function MessagesView({ role }: MessagesViewProps) {
  const meta = META[role];
  const api = useMemo(() => conversationApiFor(meta.apiRole), [meta.apiRole]);
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeIdRef = useRef<number | null>(null);

  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [active, setActive] = useState<ConversationDto | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");

  const [newChatOpen, setNewChatOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [newBookingId, setNewBookingId] = useState<number | "">("");
  const [newInitialMsg, setNewInitialMsg] = useState("");

  const appendMessageIfNew = useCallback((msg: MessageDto) => {
    setActive((prev) => {
      if (!prev || prev.id !== msg.conversationId) return prev;
      if (prev.messages?.some((m) => m.id === msg.id)) return prev;
      return {
        ...prev,
        messages: [...(prev.messages ?? []), msg],
        lastMessagePreview: msg.content,
        lastMessageAt: msg.createdAt,
      };
    });
    setConversations((prev) =>
      prev.map((c) =>
        c.id === msg.conversationId
          ? {
              ...c,
              lastMessagePreview: msg.content,
              lastMessageAt: msg.createdAt,
              unreadCount:
                activeIdRef.current === msg.conversationId ? 0 : c.unreadCount + 1,
            }
          : c,
      ),
    );
  }, []);

  const loadList = useCallback(async (silent = false) => {
    if (!silent) setLoadingList(true);
    try {
      const res = await api.list();
      if (res.success && res.data) {
        setConversations(res.data);
      } else if (!silent) {
        setConversations([]);
      }
    } catch (err: unknown) {
      if (!silent) {
        notify.error(apiErrorMessage(err, "Không tải được danh sách hội thoại."));
        setConversations([]);
      }
    } finally {
      if (!silent) setLoadingList(false);
    }
  }, [api]);

  const refreshActiveSilent = useCallback(
    async (id: number) => {
      try {
        const res = await api.getById(id);
        if (res.success && res.data) {
          setActive(res.data);
          setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
          );
        }
      } catch {
        /* polling fallback */
      }
    },
    [api],
  );

  const openConversation = useCallback(
    async (id: number) => {
      setLoadingChat(true);
      try {
        const res = await api.getById(id);
        if (res.success && res.data) {
          setActive(res.data);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === id ? { ...c, unreadCount: 0 } : c,
            ),
          );
        }
      } catch (err: unknown) {
        notify.error(apiErrorMessage(err, "Không tải được hội thoại."));
      } finally {
        setLoadingChat(false);
      }
    },
    [api],
  );

  const { status: realtimeStatus } = useChatRealtime({
    activeConversationId: active?.id ?? null,
    currentUserId: user?.id,
    onMessage: appendMessageIfNew,
    onInboxRefresh: () => loadList(true),
  });

  useEffect(() => {
    activeIdRef.current = active?.id ?? null;
  }, [active?.id]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (realtimeStatus === "connected") return;
    const listTimer = setInterval(() => loadList(true), 8000);
    return () => clearInterval(listTimer);
  }, [realtimeStatus, loadList]);

  useEffect(() => {
    if (realtimeStatus === "connected" || !active?.id) return;
    const chatTimer = setInterval(() => refreshActiveSilent(active.id), 4000);
    return () => clearInterval(chatTimer);
  }, [realtimeStatus, active?.id, refreshActiveSilent]);

  useEffect(() => {
    const idParam = searchParams.get("conversationId");
    const bookingId = searchParams.get("bookingId");
    const billboardId = searchParams.get("billboardId");

    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) openConversation(id);
      return;
    }

    if (role !== "ADMIN" && (bookingId || billboardId)) {
      (async () => {
        try {
          const payload: {
            bookingId?: number;
            billboardId?: number;
            initialMessage?: string;
          } = {};
          if (bookingId) payload.bookingId = Number(bookingId);
          if (billboardId) payload.billboardId = Number(billboardId);
          const res = await api.create(payload);
          if (res.success && res.data) {
            setActive(res.data);
            await loadList();
            setSearchParams({}, { replace: true });
          }
        } catch (err: unknown) {
          notify.error(apiErrorMessage(err, "Không mở được hội thoại."));
        }
      })();
    }
  }, [searchParams, role, api, openConversation, loadList, setSearchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages]);

  const filtered = useMemo(() => {
    const kw = search.toLowerCase();
    if (!kw) return conversations;
    return conversations.filter((c) => {
      const peer = role === "ADMIN"
        ? `${c.renter?.fullName} ${c.owner?.fullName}`
        : c.peer?.fullName ?? "";
      return (
        peer.toLowerCase().includes(kw) ||
        c.billboardTitle?.toLowerCase().includes(kw) ||
        c.lastMessagePreview?.toLowerCase().includes(kw)
      );
    });
  }, [conversations, search, role]);

  const handleSend = async () => {
    if (!active || !input.trim()) return;
    setSending(true);
    try {
      const res = await api.sendMessage(active.id, { content: input.trim() });
      if (res.success && res.data) {
        appendMessageIfNew(res.data);
        setInput("");
        loadList(true);
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Gửi tin nhắn thất bại."));
    } finally {
      setSending(false);
    }
  };

  const handleMarkRead = async () => {
    if (!active) return;
    try {
      await api.markRead(active.id);
      notify.success("Đã đánh dấu đã đọc");
      loadList();
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err));
    }
  };

  const openNewChatModal = async () => {
    if (role === "ADMIN") return;
    setNewChatOpen(true);
    try {
      const res =
        role === "RENTER"
          ? await bookingApi.getRenterBookings()
          : await ownerApi.getBookings();
      if (res.success && res.data) setBookings(res.data);
    } catch {
      setBookings([]);
    }
  };

  const startChatFromBooking = async () => {
    if (!newBookingId) {
      notify.error("Chọn đặt chỗ để bắt đầu hội thoại.");
      return;
    }
    try {
      const res = await api.create({
        bookingId: Number(newBookingId),
        initialMessage: newInitialMsg.trim() || undefined,
      });
      if (res.success && res.data) {
        setNewChatOpen(false);
        setNewBookingId("");
        setNewInitialMsg("");
        await loadList();
        await openConversation(res.data.id);
        notify.success("Đã mở hội thoại");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Không tạo được hội thoại."));
    }
  };

  const displayTitle = (c: ConversationDto) => {
    if (role === "ADMIN") {
      return `${c.renter?.fullName ?? "Renter"} ↔ ${c.owner?.fullName ?? "Owner"}`;
    }
    return c.peer?.fullName ?? "Người dùng";
  };

  const displaySubtitle = (c: ConversationDto) => {
    const company = c.peer?.companyName;
    const bb = c.billboardTitle;
    if (role === "ADMIN") {
      return bb ? `${bb} · #${c.bookingId ?? "—"}` : "Hỗ trợ nền tảng";
    }
    return [company, bb].filter(Boolean).join(" · ") || meta.peerLabel;
  };

  const activeTitle = active ? displayTitle(active) : "";
  const activeMessages = active?.messages ?? [];

  return (
    <div className="p-8 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-3">
        {realtimeStatus !== "connected" && (
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
              realtimeStatus === "polling"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            {realtimeStatus === "polling"
              ? "Polling dự phòng (4s)"
              : realtimeStatus === "connecting"
                ? "Đang kết nối..."
                : "Ngoại tuyến"}
          </span>
        )}
        {role !== "ADMIN" && (
          <button
            type="button"
            onClick={openNewChatModal}
            className="bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#1E40AF] cursor-pointer flex items-center gap-2 font-semibold"
          >
            <Plus className="w-4 h-4" />
            {meta.newChatLabel}
          </button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border/80 flex-1 flex overflow-hidden min-h-0">
        {/* List */}
        <aside className="w-80 border-r border-border/80 flex flex-col shrink-0">
          <div className="p-3 border-b border-border/80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm hội thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary bg-surface/30 text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#1D4ED8]" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-[#6B7A8D] text-center py-10 px-4">
                Chưa có hội thoại nào.
              </p>
            ) : (
              filtered.map((c) => {
                const isActive = active?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => openConversation(c.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border/40 flex gap-3 cursor-pointer transition-colors ${
                      isActive ? "bg-primary-light/50" : "hover:bg-surface/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials(displayTitle(c))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {displayTitle(c)}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatTime(c.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {displaySubtitle(c)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {c.lastMessagePreview || "Chưa có tin nhắn"}
                      </p>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#1D4ED8] text-white text-[10px] flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat */}
        <section className="flex-1 flex flex-col min-w-0">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-[#6B7A8D] text-sm">
              Chọn một hội thoại để xem tin nhắn
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-border/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold">
                    {initials(activeTitle)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{activeTitle}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {displaySubtitle(active)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleMarkRead}
                  className="text-xs px-2 py-1 rounded-lg border border-border hover:bg-surface/50 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Đã đọc
                </button>
              </div>

              {loadingChat ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1D4ED8]" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-surface/20">
                  {activeMessages.map((m: MessageDto) => (
                    <div
                      key={m.id}
                      className={`flex ${m.mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          m.mine
                            ? "bg-primary text-white rounded-br-sm"
                            : m.senderRole === "ADMIN"
                              ? "bg-amber-50 border border-amber-200 text-amber-950 rounded-bl-sm dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-200"
                              : "bg-card border border-border/80 text-foreground rounded-bl-sm"
                        }`}
                      >
                        {m.senderRole === "ADMIN" && !m.mine && (
                          <p className="text-[10px] font-bold text-amber-700 mb-1 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            ADORA Admin
                          </p>
                        )}
                        <p>{m.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${m.mine ? "text-white/70" : "text-[#94A3B8]"}`}
                        >
                          {formatTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              <div className="px-5 py-3 border-t border-border/80 bg-card">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1 px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary bg-surface/30 text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    disabled={sending || !input.trim()}
                    onClick={handleSend}
                    className="px-4 py-2.5 rounded-lg bg-[#1D4ED8] text-white text-sm font-semibold hover:bg-[#1E40AF] disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Gửi
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Context panel */}
        {active && (
          <aside className="w-72 border-l border-border/80 bg-surface/20 p-4 hidden xl:block shrink-0 overflow-y-auto">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Ngữ cảnh</p>
            {active.billboardTitle && (
              <div className="bg-card rounded-lg border border-border/80 p-3 mb-3 text-sm">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                  <Monitor className="w-3 h-3" /> Bảng QC
                </p>
                <p className="font-medium text-primary">{active.billboardTitle}</p>
              </div>
            )}
            {active.bookingId && (
              <div className="bg-card rounded-lg border border-border/80 p-3 mb-3 text-sm">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                  <BookOpen className="w-3 h-3" /> Đặt chỗ
                </p>
                <p className="font-mono text-xs text-foreground">#{active.bookingId}</p>
                {active.bookingStatus && (
                  <p className="text-xs text-muted-foreground mt-1">{active.bookingStatus}</p>
                )}
              </div>
            )}
            {role === "ADMIN" && active.renter && active.owner && (
              <div className="bg-card rounded-lg border border-border/80 p-3 text-xs space-y-2">
                <p>
                  <span className="text-muted-foreground">Renter:</span>{" "}
                  {active.renter.fullName}
                </p>
                <p>
                  <span className="text-muted-foreground">Owner:</span>{" "}
                  {active.owner.fullName}
                </p>
              </div>
            )}
            {active.peer && role !== "ADMIN" && (
              <div className="bg-card rounded-lg border border-border/80 p-3 mt-3 text-xs">
                <p className="font-semibold text-foreground">{active.peer.fullName}</p>
                <p className="text-muted-foreground mt-1">{active.peer.email}</p>
                <p className="text-muted-foreground">{active.peer.phone}</p>
              </div>
            )}
          </aside>
        )}
      </div>

      {newChatOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl border border-border/80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-primary">{meta.newChatLabel}</h3>
              <button
                type="button"
                onClick={() => setNewChatOpen(false)}
                className="cursor-pointer text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Chọn đặt chỗ
            </label>
            <select
              value={newBookingId}
              onChange={(e) =>
                setNewBookingId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full mb-3 px-3 py-2 border border-border rounded-lg text-sm bg-surface/30 text-foreground"
            >
              <option value="">— Chọn —</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  #{b.id} — {b.billboard?.title ?? "Bảng QC"} ({b.status})
                </option>
              ))}
            </select>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Tin nhắn đầu (tuỳ chọn)
            </label>
            <textarea
              value={newInitialMsg}
              onChange={(e) => setNewInitialMsg(e.target.value)}
              rows={3}
              className="w-full mb-4 px-3 py-2 border border-border rounded-lg text-sm bg-surface/30 text-foreground"
              placeholder="Xin chào, tôi muốn trao đổi về đặt chỗ..."
            />
            <button
              type="button"
              onClick={startChatFromBooking}
              className="w-full py-2.5 bg-[#1D4ED8] text-white rounded-lg font-semibold text-sm cursor-pointer hover:bg-[#1E40AF]"
            >
              Bắt đầu trò chuyện
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
