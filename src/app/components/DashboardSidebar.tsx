import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, BookOpen, Heart, Megaphone, FileText, MessageSquare,
  Settings, LogOut, ChevronLeft, ChevronRight, Monitor, Calendar,
  DollarSign, Users, CheckSquare, AlertTriangle, BarChart3, Cog, Eye,
  Plus, Map
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface DashboardSidebarProps {
  role: "advertiser" | "owner" | "admin";
}

const navItems: Record<string, NavItem[]> = {
  advertiser: [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Tổng Quan", path: "/advertiser" },
    { icon: <Map className="w-5 h-5" />, label: "Bản đồ LED", path: "/advertiser/map" },
    { icon: <BookOpen className="w-5 h-5" />, label: "Đặt Chỗ", path: "/advertiser/bookings" },
    { icon: <Megaphone className="w-5 h-5" />, label: "Chiến Dịch", path: "/advertiser/campaigns" },
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
};

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const items = navItems[role];

  return (
    <aside
      className={`hidden lg:flex h-screen bg-card text-foreground flex-col transition-all duration-300 border-r border-border/30 shrink-0 z-50 ${collapsed ? "w-[68px]" : "w-[256px]"
        }`}
    >
      <div className="flex flex-col px-4 py-6 border-b border-border/20 relative">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-8 h-8 rounded-lg shadow-md shrink-0 border border-primary/10" alt="ADORA logo" />
            <div>
              <h1 className="text-xl font-extrabold text-primary tracking-tighter leading-none">ADORA LED</h1>
              <p className="text-muted-foreground text-[9px] uppercase font-bold tracking-wider mt-1">
                {role === "advertiser" ? "Enterprise Tier" : role === "owner" ? "Owner Tier" : "Admin Tier"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <img src="/logo.png" className="w-8 h-8 rounded-lg shadow-sm" alt="ADORA logo" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-4 top-6 w-6 h-6 rounded-md bg-surface border border-border/50 hover:bg-border/30 flex items-center justify-center transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-foreground" /> : <ChevronLeft className="w-3.5 h-3.5 text-foreground" />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-2">
        {items.map((item) => {
          const isActive =
            item.path === "/admin" || item.path === "/owner" || item.path === "/advertiser"
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all cursor-pointer rounded-xl group ${isActive
                  ? "text-accent bg-accent/10 border-r-4 border-accent font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="transition-transform group-hover:translate-x-0.5 duration-200">
                {item.icon}
              </span>
              {!collapsed && <span className="font-semibold text-xs tracking-wide">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 space-y-3 border-t border-border/20">
        {!collapsed && role === "advertiser" && (
          <button
            onClick={() => navigate("/advertiser/campaigns")}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20 cursor-pointer text-xs uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            Chiến dịch mới
          </button>
        )}
        <div className="flex flex-col gap-1">
        </div>
      </div>
    </aside>
  );
}
