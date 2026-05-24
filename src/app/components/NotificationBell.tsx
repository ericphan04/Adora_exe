import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, X, ShieldAlert, CheckCircle, Info, Calendar, DollarSign } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router";
import { NotificationDto } from "../../types/notification";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: NotificationDto) => {
    if (!notif.read) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);

    // Smart routing based on notification type
    if (notif.type === "PAYMENT_SUCCESS" || notif.type === "PAYMENT_FAILED") {
      navigate("/advertiser/invoices");
    } else if (notif.type === "BOOKING_PAID") {
      navigate("/owner/bookings");
    } else if (notif.bookingId) {
      navigate(`/bookings`); // Fallback
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "PAYMENT_SUCCESS":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
        );
      case "PAYMENT_FAILED":
        return (
          <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <ShieldAlert className="w-4.5 h-4.5" />
          </div>
        );
      case "BOOKING_PAID":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 shrink-0">
            <Info className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

  // Format time relative or simple string
  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] hover:text-[#1D4ED8] transition-all cursor-pointer relative border border-[#E3E8EF] bg-white shadow-sm"
        title="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-[#E3E8EF] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#E3E8EF] flex items-center justify-between bg-gray-50/50">
            <h3 className="text-sm font-bold text-[#1A2332]">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-[#1D4ED8] hover:text-[#3B82F6] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-[#E3E8EF]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 flex gap-3 hover:bg-gray-50/80 transition-colors cursor-pointer relative ${
                    !notif.read ? "bg-[#F0F9FF]/40" : ""
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!notif.read && (
                    <span className="absolute top-4 right-4 w-2 h-2 bg-[#1D4ED8] rounded-full" />
                  )}
                  {getNotifIcon(notif.type)}
                  <div className="flex-1 min-w-0 pr-3">
                    <p className={`text-sm text-[#1A2332] leading-snug ${!notif.read ? "font-semibold" : ""}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-[#6B7A8D] mt-1 break-words line-clamp-2">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-[#9CA3AF] mt-1.5 block">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
