import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Menu, LayoutDashboard, Map, BookOpen, MessageSquare, Monitor, Users,
  DollarSign, Search, User, Home, LogOut, Settings, Heart, FileText,
  CheckSquare, AlertTriangle, Eye, Cog, X, Calendar, BarChart3, Sun, Moon, Plus
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useThemeContext } from "../context/ThemeContext";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export function MobileBottomNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useThemeContext();
  const { unreadCount } = useNotifications();

  const getRole = (): "advertiser" | "owner" | "admin" | "guest" => {
    if (!user) return "guest";
    if (user.role === "ADMIN") return "admin";
    if (user.role === "OWNER") return "owner";
    return "advertiser";
  };

  const role = getRole();

  // Full lists of nav items for the drawer
  const drawerItems: Record<string, NavItem[]> = {
    advertiser: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: "Tổng Quan", path: "/advertiser" },
      { icon: <Plus className="w-5 h-5" />, label: "Đặt Chỗ Mới", path: "/advertiser/new-booking" },
      { icon: <BookOpen className="w-5 h-5" />, label: "Lịch Sử Đặt Chỗ", path: "/advertiser/bookings" },
      { icon: <Map className="w-5 h-5" />, label: "Bản đồ LED", path: "/advertiser/map" },
      { icon: <MegaphoneIcon className="w-5 h-5" />, label: "Chiến Dịch", path: "/advertiser/campaigns" },
      { icon: <Heart className="w-5 h-5" />, label: "Đã Lưu", path: "/advertiser/saved" },
      { icon: <FileText className="w-5 h-5" />, label: "Hóa Đơn", path: "/advertiser/invoices" },
      { icon: <MessageSquare className="w-5 h-5" />, label: "Tin Nhắn", path: "/advertiser/messages" },
      { icon: <Settings className="w-5 h-5" />, label: "Cài Đặt", path: "/advertiser/settings" },
    ],
    owner: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: "Tổng Quan", path: "/owner" },
      { icon: <Monitor className="w-5 h-5" />, label: "Bảng QC Của Tôi", path: "/owner/billboards" },
      { icon: <Calendar className="w-5 h-5" />, label: "Lịch Trống", path: "/owner/availability" },
      { icon: <BookOpen className="w-5 h-5" />, label: "Đặt Chỗ", path: "/owner/bookings" },
      { icon: <DollarSign className="w-5 h-5" />, label: "Doanh Thu", path: "/owner/revenue" },
      { icon: <MessageSquare className="w-5 h-5" />, label: "Tin Nhắn", path: "/owner/messages" },
      { icon: <Settings className="w-5 h-5" />, label: "Cài Đặt", path: "/owner/settings" },
    ],
    admin: [
      { icon: <LayoutDashboard className="w-5 h-5" />, label: "Tổng Quan", path: "/admin" },
      { icon: <Users className="w-5 h-5" />, label: "Quản Lý Người Dùng", path: "/admin/users" },
      { icon: <CheckSquare className="w-5 h-5" />, label: "Duyệt Tin Đăng", path: "/admin/listings" },
      { icon: <DollarSign className="w-5 h-5" />, label: "Giao Dịch", path: "/admin/transactions" },
      { icon: <BarChart3 className="w-5 h-5" />, label: "Doanh Thu", path: "/admin/revenue" },
      { icon: <AlertTriangle className="w-5 h-5" />, label: "Khiếu Nại", path: "/admin/disputes" },
      { icon: <Eye className="w-5 h-5" />, label: "Báo Cáo", path: "/admin/reports" },
      { icon: <MessageSquare className="w-5 h-5" />, label: "Tin Nhắn", path: "/admin/messages" },
      { icon: <Cog className="w-5 h-5" />, label: "Cài Đặt Hệ Thống", path: "/admin/settings" },
    ],
    guest: [
      { icon: <Home className="w-5 h-5" />, label: "Trang Chủ", path: "/" },
      { icon: <Search className="w-5 h-5" />, label: "Tìm Bảng QC", path: "/billboards" },
      { icon: <Map className="w-5 h-5" />, label: "Bản Đồ LED", path: "/billboards/map" },
    ]
  };

  // Quick navigation tabs for the bottom bar
  const bottomTabs: Record<string, { icon: React.ReactNode; label: string; path: string; badge?: number }[]> = {
    advertiser: [
      { icon: <LayoutDashboard className="w-5.5 h-5.5" />, label: "Tổng quan", path: "/advertiser" },
      { icon: <Map className="w-5.5 h-5.5" />, label: "Bản đồ", path: "/advertiser/map" },
      { icon: <BookOpen className="w-5.5 h-5.5" />, label: "Đặt chỗ", path: "/advertiser/bookings" },
      { icon: <MessageSquare className="w-5.5 h-5.5" />, label: "Tin nhắn", path: "/advertiser/messages", badge: unreadCount },
    ],
    owner: [
      { icon: <LayoutDashboard className="w-5.5 h-5.5" />, label: "Tổng quan", path: "/owner" },
      { icon: <Monitor className="w-5.5 h-5.5" />, label: "Bảng QC", path: "/owner/billboards" },
      { icon: <DollarSign className="w-5.5 h-5.5" />, label: "Doanh thu", path: "/owner/revenue" },
      { icon: <MessageSquare className="w-5.5 h-5.5" />, label: "Tin nhắn", path: "/owner/messages", badge: unreadCount },
    ],
    admin: [
      { icon: <LayoutDashboard className="w-5.5 h-5.5" />, label: "Tổng quan", path: "/admin" },
      { icon: <Users className="w-5.5 h-5.5" />, label: "Thành viên", path: "/admin/users" },
      { icon: <DollarSign className="w-5.5 h-5.5" />, label: "Giao dịch", path: "/admin/transactions" },
      { icon: <MessageSquare className="w-5.5 h-5.5" />, label: "Tin nhắn", path: "/admin/messages" },
    ],
    guest: [
      { icon: <Home className="w-5.5 h-5.5" />, label: "Trang chủ", path: "/" },
      { icon: <Search className="w-5.5 h-5.5" />, label: "Tìm bảng", path: "/billboards" },
      { icon: <Map className="w-5.5 h-5.5" />, label: "Bản đồ", path: "/billboards/map" },
      { icon: <User className="w-5.5 h-5.5" />, label: "Tài khoản", path: "/login" },
    ]
  };

  const tabs = bottomTabs[role];
  const items = drawerItems[role];

  const handleTabClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* Bottom Nav Bar - visible only on screens smaller than lg (1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-safe-nav bg-card/90 backdrop-blur-lg border-t border-border/40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 flex items-center justify-around px-2 pb-safe">
        {/* Far Left: Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-lg transition-colors border-none bg-transparent ${
            isOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Menu className="w-5.5 h-5.5" />
          <span className="text-[10px] font-bold tracking-tight">Menu</span>
        </button>

        {/* Quick Tabs */}
        {tabs.map((tab) => {
          const isActive =
            tab.path === "/" || tab.path === "/admin" || tab.path === "/owner" || tab.path === "/advertiser"
              ? location.pathname === tab.path
              : location.pathname.startsWith(tab.path);

          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-lg transition-colors border-none bg-transparent relative ${
                isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute top-1 right-2 bg-destructive text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center scale-90 border border-card">
                  {tab.badge}
                </span>
              ) : null}
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop click shuts the drawer */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer sheet sliding from left (Facebook style) */}
          <div className="relative w-72 bg-card h-full flex flex-col shadow-2xl z-50 animate-in slide-in-from-left duration-200 border-r border-border/30">
            {/* Header info / user profile */}
            <div className="p-6 border-b border-border/20 flex flex-col gap-4 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-surface border border-border/40 flex items-center justify-center text-foreground hover:bg-border/30 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <img
                  src="/logo.png?v=3"
                  className="w-9 h-9 rounded-lg shadow-md border border-primary/10 shrink-0"
                  alt="ADORA logo"
                />
                <div>
                  <h3 className="text-base font-extrabold text-primary tracking-tighter leading-none">
                    ADORA LED
                  </h3>
                  <p className="text-muted-foreground text-[8px] uppercase font-bold tracking-wider mt-1.5">
                    {role === "admin"
                      ? "Admin Mode"
                      : role === "owner"
                      ? "Owner Mode"
                      : role === "advertiser"
                      ? "Advertiser Mode"
                      : "Guest Mode"}
                  </p>
                </div>
              </div>

              {user && (
                <div className="mt-4 flex items-center gap-3 bg-surface/50 p-2.5 rounded-xl border border-border/30">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{user.fullName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable links */}
            <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
              {items.map((item) => {
                const isActive =
                  item.path === "/admin" || item.path === "/owner" || item.path === "/advertiser"
                    ? location.pathname === item.path
                    : location.pathname.startsWith(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() => handleTabClick(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm cursor-pointer rounded-xl transition-all border-none text-left ${
                      isActive
                        ? "text-primary bg-primary/10 font-bold border-l-4 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                    }`}
                  >
                    {item.icon}
                    <span className="font-semibold text-xs tracking-wide">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Bottom utilities */}
            <div className="mt-auto p-4 border-t border-border/20 space-y-3 bg-surface/10">
              {/* Theme Toggle inside drawer */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground border border-border/30 rounded-xl hover:bg-surface/50 transition-all bg-transparent"
              >
                <div className="flex items-center gap-2">
                  {resolvedTheme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                  <span>Giao diện {resolvedTheme === "dark" ? "Sáng" : "Tối"}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                  {resolvedTheme === "dark" ? "Dark" : "Light"}
                </span>
              </button>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-all rounded-xl font-bold cursor-pointer border-none bg-transparent text-left"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span className="text-xs uppercase tracking-wider">Đăng Xuất</span>
                </button>
              ) : (
                <button
                  onClick={() => handleTabClick("/login")}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 active:scale-98 transition-all shadow-md shadow-primary/15 border-none"
                >
                  Đăng Nhập
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Quick Lucide Megaphone wrapper if not explicitly exported in standard lucide version
function MegaphoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m3 11 18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}
