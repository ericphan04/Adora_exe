import React, { useState } from "react";
import {
  Search,
  Plus,
  Paperclip,
  Smile,
  Send,
  Pin,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";

interface Conversation {
  id: string;
  name: string;
  brand: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  pinned?: boolean;
}

interface Message {
  id: string;
  conversationId: string;
  sender: "customer" | "admin";
  content: string;
  type: "text" | "image" | "file";
  time: string;
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Nguyễn Minh Anh",
    brand: "Vincom Retail",
    lastMessage: "Bên mình có thể tăng tần suất hiển thị dịp Tết không?",
    timestamp: "10:24",
    unread: 2,
    pinned: true,
  },
  {
    id: "2",
    name: "Phạm Hoàng Long",
    brand: "TechZone",
    lastMessage: "Anh đã nhận được báo giá mới, cảm ơn em.",
    timestamp: "Hôm qua",
    unread: 0,
  },
  {
    id: "3",
    name: "Marketing Team",
    brand: "Coca-Cola",
    lastMessage: "Cho mình xin file báo cáo hiệu suất tuần này.",
    timestamp: "T2",
    unread: 1,
  },
  {
    id: "4",
    name: "Nguyễn Thị Mai",
    brand: "MegaMart",
    lastMessage: "Bên bạn hỗ trợ xuất hóa đơn VAT cho chiến dịch này chứ?",
    timestamp: "T5",
    unread: 0,
  },
];

const messages: Message[] = [
  {
    id: "m1",
    conversationId: "1",
    sender: "customer",
    content:
      "Chào bạn, bên mình muốn hỏi thêm về gói quảng cáo LED tại Cầu Rồng dịp Tết.",
    type: "text",
    time: "10:10",
  },
  {
    id: "m2",
    conversationId: "1",
    sender: "admin",
    content:
      "Chào chị Minh Anh, hiện tại vị trí Cầu Rồng LED còn khung giờ từ 18h–22h mỗi ngày, em gửi chị proposal chi tiết nhé.",
    type: "text",
    time: "10:15",
  },
  {
    id: "m3",
    conversationId: "1",
    sender: "customer",
    content:
      "Bên mình có thể tăng tần suất hiển thị dịp Tết không?",
    type: "text",
    time: "10:24",
  },
  {
    id: "m4",
    conversationId: "2",
    sender: "customer",
    content:
      "Anh đã nhận được báo giá mới, cảm ơn em.",
    type: "text",
    time: "Hôm qua",
  },
];

export default function AdvertiserMessages() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("1");
  const [input, setInput] = useState("");

  const filteredConversations = conversations.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.brand.toLowerCase().includes(term) ||
      c.lastMessage.toLowerCase().includes(term)
    );
  });

  const activeConversation =
    filteredConversations.find((c) => c.id === selectedId) ||
    filteredConversations[0] ||
    conversations[0];

  const conversationMessages = messages.filter(
    (m) => m.conversationId === activeConversation.id
  );

  return (
    <div className="flex h-screen bg-[#F0F9FF]">
      <DashboardSidebar role="advertiser" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-[#E3E8EF] px-8 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1
                className="text-xl text-[#1D4ED8]"
                style={{ fontWeight: 700 }}
              >
                Tin Nhắn
              </h1>
              <p className="text-sm text-[#6B7A8D] mt-0.5">
                Trao đổi nhanh với khách hàng và theo dõi lịch sử hội thoại.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
                <input
                  type="text"
                  placeholder="Tìm theo khách hàng hoặc nội dung..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E3E8EF] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] bg-[#F9FAFB]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="bg-gradient-to-r from-[#4F46E5] to-[#1D4ED8] text-white text-sm px-4 py-2.5 rounded-lg hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Tin Nhắn Mới
              </button>
            </div>
          </div>
        </div>

        {/* 3-column layout */}
        <div className="p-8 h-[calc(100vh-88px)]">
          <div className="bg-white rounded-xl border border-[#E3E8EF] h-full flex overflow-hidden">
            {/* Conversation list */}
            <aside className="w-72 border-r border-[#E3E8EF] flex flex-col">
              <div className="px-4 py-3 border-b border-[#E3E8EF] flex items-center justify-between">
                <span
                  className="text-xs text-[#6B7A8D]"
                  style={{ fontWeight: 500 }}
                >
                  Cuộc trò chuyện
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EEF2FF] text-[#4F46E5]">
                  {filteredConversations.length} đang mở
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((c) => {
                  const isActive = c.id === activeConversation.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`w-full text-left px-4 py-3 border-b border-[#F1F5F9] cursor-pointer transition-colors flex gap-3 ${
                        isActive ? "bg-[#EEF2FF]" : "hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#7C3AED] flex items-center justify-center text-white text-xs">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        {c.unread > 0 && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#EF4444] border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className="text-sm text-[#1A2332] truncate"
                            style={{ fontWeight: 500 }}
                          >
                            {c.name}
                          </p>
                          <span className="text-[11px] text-[#9CA3AF]">
                            {c.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7A8D] truncate">
                          {c.brand}
                        </p>
                        <p
                          className={`text-[11px] mt-0.5 truncate ${
                            c.unread > 0 ? "text-[#111827]" : "text-[#6B7A8D]"
                          }`}
                          style={c.unread > 0 ? { fontWeight: 500 } : {}}
                        >
                          {c.lastMessage}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        {c.pinned && (
                          <Pin className="w-3 h-3 text-[#9CA3AF]" />
                        )}
                        {c.unread > 0 && (
                          <span className="mt-1 min-w-[18px] px-1 h-4 rounded-full bg-[#1D4ED8] text-white text-[10px] flex items-center justify-center">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Chat window */}
            <section className="flex-1 flex flex-col border-r border-[#E3E8EF]">
              {/* Chat header */}
              <div className="px-5 py-3 border-b border-[#E3E8EF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#7C3AED] flex items-center justify-center text-white text-xs">
                    {activeConversation.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p
                      className="text-sm text-[#1A2332]"
                      style={{ fontWeight: 600 }}
                    >
                      {activeConversation.name}
                    </p>
                    <p className="text-[11px] text-[#6B7A8D]">
                      {activeConversation.brand} ·
                      <span className="ml-1 text-emerald-600">
                        Đang hoạt động
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#6B7A8D]">
                  <button className="px-2 py-1 rounded-full border border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Đánh dấu đã đọc
                  </button>
                  <button className="px-2 py-1 rounded-full border border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer flex items-center gap-1">
                    <Pin className="w-3 h-3 text-[#6B7280]" />
                    Ghim cuộc trò chuyện
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 px-5 py-4 overflow-y-auto space-y-3 bg-[#F9FAFB]">
                {conversationMessages.map((m) => {
                  const isMe = m.sender === "admin";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          isMe
                            ? "bg-[#1D4ED8] text-white rounded-br-sm"
                            : "bg-white text-[#111827] rounded-bl-sm"
                        }`}
                      >
                        <p>{m.content}</p>
                        <div
                          className={`mt-1 text-[10px] ${
                            isMe ? "text-white/80" : "text-[#9CA3AF]"
                          }`}
                        >
                          {m.time}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Demo message types */}
                <div className="flex justify-start">
                  <div className="max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm bg-white rounded-bl-sm">
                    <p>Em gửi kèm file proposal chi tiết ở đây ạ.</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-[#1D4ED8] bg-[#EFF6FF] rounded-lg px-2 py-1">
                      <Paperclip className="w-3 h-3" />
                      proposal-tet-2026.pdf · 2.3 MB
                    </div>
                    <div className="mt-1 text-[10px] text-[#9CA3AF]">
                      10:20
                    </div>
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="px-5 py-3 border-t border-[#E3E8EF] bg-white">
                <div className="flex items-center gap-3">
                  <button className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F9FAFB] cursor-pointer">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-[#F9FAFB] cursor-pointer">
                    <Smile className="w-4 h-4" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Nhập tin nhắn..."
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] bg-[#F9FAFB]"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-[#1D4ED8] text-white text-sm flex items-center gap-1 hover:bg-[#1E40AF] cursor-pointer">
                    <Send className="w-4 h-4" />
                    Gửi
                  </button>
                </div>
              </div>
            </section>

            {/* Customer info */}
            <aside className="w-80 bg-[#F9FAFB] flex flex-col">
              <div className="px-4 py-3 border-b border-[#E3E8EF] flex items-center justify-between">
                <span
                  className="text-xs text-[#6B7A8D]"
                  style={{ fontWeight: 500 }}
                >
                  Thông Tin Khách Hàng
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                  <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                  Đang online
                </span>
              </div>
              <div className="p-4 space-y-4 text-sm">
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#7C3AED] flex items-center justify-center text-white text-sm">
                      {activeConversation.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p
                        className="text-sm text-[#1A2332]"
                        style={{ fontWeight: 600 }}
                      >
                        {activeConversation.name}
                      </p>
                      <p className="text-[11px] text-[#6B7A8D]">
                        {activeConversation.brand}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-[12px] text-[#4B5563]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280]">Email</span>
                      <span>contact@{activeConversation.brand.toLowerCase().replace(/\s+/g, "")}.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B7280]">Số điện thoại</span>
                      <span>+84 909 123 456</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-2 text-[12px]">
                  <div className="flex items-center justify-between mb-1">
                    <p
                      className="text-xs text-[#111827]"
                      style={{ fontWeight: 600 }}
                    >
                      Chiến Dịch Đang Chạy
                    </p>
                    <span className="text-[11px] text-[#6B7280]">2 chiến dịch</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="truncate">
                        Tết 2026 - Đại Tiệc Mua Sắm
                      </span>
                      <span className="text-[11px] text-emerald-600">
                        Đang chạy
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="truncate">
                        Mùa Hè Sôi Động 2026
                      </span>
                      <span className="text-[11px] text-yellow-600">
                        Sắp chạy
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-2 text-[12px]">
                  <div className="flex items-center justify-between mb-1">
                    <p
                      className="text-xs text-[#111827]"
                      style={{ fontWeight: 600 }}
                    >
                      Hóa Đơn Liên Quan
                    </p>
                    <span className="text-[11px] text-[#6B7280]">3 hóa đơn</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="truncate">INV-2026-001</span>
                      <span className="text-[11px] text-emerald-600">
                        Đã thanh toán
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="truncate">INV-2026-014</span>
                      <span className="text-[11px] text-yellow-600">
                        Chưa thanh toán
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="truncate">INV-2025-087</span>
                      <span className="text-[11px] text-red-500">
                        Quá hạn
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#6B7280]">
                  * Các tính năng như thông báo realtime, đánh dấu đã đọc/chưa
                  đọc, gửi file và emoji hiện đang được mô phỏng giao diện để
                  sẵn sàng tích hợp backend/chat service sau này.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

