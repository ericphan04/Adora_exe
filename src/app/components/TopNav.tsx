import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  CreditCard, 
  BellOff 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { NotificationDto } from "../../types/notification";

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "OWNER") return "/owner";
    return "/advertiser";
  };

  const getRoleLabel = () => {
    if (!user) return "";
    if (user.role === "ADMIN") return "Admin";
    if (user.role === "OWNER") return "Chủ bảng";
    return "Nhà quảng cáo";
  };

  // Helper to format notification time relatively
  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Render proper icon based on notification type
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "PAYMENT_SUCCESS":
        return (
          <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 border border-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        );
      case "BOOKING_PAID":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
            <CreditCard className="w-4.5 h-4.5" />
          </div>
        );
      case "BOOKING_ACCEPTED":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center shrink-0">
            <Calendar className="w-4.5 h-4.5" />
          </div>
        );
      case "PAYMENT_FAILED":
      case "BOOKING_REJECTED":
        return (
          <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shrink-0">
            <XCircle className="w-4.5 h-4.5" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center shrink-0">
            <Bell className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

  // Handle notification click (mark read & redirect)
  const handleNotificationClick = (notif: NotificationDto) => {
    markAsRead(notif.id);
    setShowNotifications(false);

    // Dynamic routing depending on who needs to see the changes
    if (notif.type === "BOOKING_PAID") {
      navigate("/owner");
    } else {
      navigate("/advertiser");
    }
  };

  return (
    <header className="w-full border-b border-[#E3E8EF] bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xl text-[#1D4ED8] tracking-tight cursor-pointer font-black">
            <img src="/logo.png" className="w-8 h-8 rounded-lg shadow-sm border border-[#1D4ED8]/10" alt="ADORA logo" />
            <span>ADORA</span>
          </button>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate("/billboards")} className="text-sm text-[#6B7A8D] hover:text-[#1D4ED8] transition-colors cursor-pointer">
              Tìm Bảng Quảng Cáo
            </button>
            <button onClick={() => navigate("/billboards/map")} className="text-sm text-[#6B7A8D] hover:text-[#1D4ED8] transition-colors cursor-pointer">
              Bản Đồ
            </button>
            <button onClick={() => navigate("/")} className="text-sm text-[#6B7A8D] hover:text-[#1D4ED8] transition-colors cursor-pointer">
              Cách Hoạt Động
            </button>
            <button onClick={() => navigate("/")} className="text-sm text-[#6B7A8D] hover:text-[#1D4ED8] transition-colors cursor-pointer">
              Bảng Giá
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-[#F0F9FF] rounded-lg px-3 py-2 w-64">
            <Search className="w-4 h-4 text-[#6B7A8D]" />
            <input
              type="text"
              placeholder="Tìm kiếm bảng quảng cáo..."
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>

          {/* Dynamic Notification Bell Button */}
          {user && (
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowDropdown(false);
                }}
                className="w-9 h-9 rounded-lg hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] hover:text-[#1D4ED8] transition-colors cursor-pointer relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF4444]"></span>
                  </span>
                )}
              </button>

              {/* Glassmorphic Dropdown Panel */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E3E8EF] rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-[#E3E8EF] flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1A2332]">Thông báo</span>
                        {unreadCount > 0 && (
                          <span className="bg-[#EF4444]/10 text-[#EF4444] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-[#1D4ED8] hover:text-[#3B82F6] font-semibold transition-colors cursor-pointer"
                        >
                          Đọc tất cả
                        </button>
                      )}
                    </div>

                    {/* Scrollable list */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#E3E8EF]">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                          <BellOff className="w-8 h-8 mb-2 text-slate-300" />
                          <p className="text-xs font-semibold">Bạn không có thông báo nào</p>
                          <p className="text-[10px] text-slate-400/80 mt-0.5">Mọi cập nhật trạng thái sẽ hiển thị ở đây</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-4 flex gap-3 hover:bg-[#F0F9FF]/50 transition-colors cursor-pointer relative ${
                              !notif.isRead ? "bg-[#1D4ED8]/[0.02]" : ""
                            }`}
                          >
                            {renderNotificationIcon(notif.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <span className={`text-xs block truncate ${
                                  !notif.isRead ? "font-bold text-[#1A2332]" : "font-semibold text-slate-700"
                                }`}>
                                  {notif.title}
                                </span>
                                {!notif.isRead && (
                                  <span className="w-1.5 h-1.5 bg-[#1D4ED8] rounded-full shrink-0 mt-1.5" />
                                )}
                              </div>
                              <span className="text-[11px] text-[#6B7A8D] mt-0.5 block line-clamp-2 leading-relaxed">
                                {notif.message}
                              </span>
                              <span className="text-[9px] text-[#94A3B8] mt-1.5 block">
                                {formatRelativeTime(notif.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-[#E3E8EF] bg-slate-50/50 text-center">
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          navigate(getDashboardPath());
                        }}
                        className="text-[10px] font-bold text-[#6B7A8D] hover:text-[#1D4ED8] transition-colors py-1 block w-full text-center"
                      >
                        Xem trong Trang Quản Lý
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 hover:bg-[#F0F9FF] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#1D4ED8]/10 text-[#1D4ED8] flex items-center justify-center font-semibold text-sm">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-[#1A2332] leading-tight">{user.fullName}</p>
                  <p className="text-[10px] text-[#6B7A8D]">{getRoleLabel()}</p>
                </div>
              </button>

              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E3E8EF] rounded-xl shadow-lg py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-[#E3E8EF]">
                      <p className="text-sm font-semibold text-[#1A2332] truncate">{user.fullName}</p>
                      <p className="text-xs text-[#6B7A8D] truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate(getDashboardPath());
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#1A2332] hover:bg-[#F0F9FF] transition-colors text-left cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#6B7A8D]" />
                      <span>Trang Quản Lý</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-red-50 transition-colors text-left border-t border-[#E3E8EF] mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng Xuất</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-[#1D4ED8] border border-[#E3E8EF] px-4 py-2 rounded-lg hover:bg-[#F0F9FF] transition-colors cursor-pointer"
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-sm text-white bg-[#1D4ED8] px-4 py-2 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer"
              >
                Bắt Đầu
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
