import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, BookOpen, Heart, Megaphone, FileText, MessageSquare,
  Settings, LogOut, ChevronLeft, ChevronRight, Monitor, Calendar,
  DollarSign, Users, CheckSquare, AlertTriangle, BarChart3, Cog, Eye
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
    { icon: <BookOpen className="w-5 h-5" />, label: "Đặt Chỗ", path: "/advertiser/bookings" },
    { icon: <Heart className="w-5 h-5" />, label: "Đã Lưu", path: "/advertiser/saved" },
    { icon: <Megaphone className="w-5 h-5" />, label: "Chiến Dịch", path: "/advertiser/campaigns" },
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
      className={`h-screen bg-gradient-to-b from-[#1D4ED8] to-[#1E40AF] text-white flex flex-col transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/15">
        {!collapsed && (
          <span className="text-xl tracking-tight" style={{ fontWeight: 700 }}>ADORA</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {items.map((item) => {
          const isActive =
            item.path === "/admin" || item.path === "/owner" || item.path === "/advertiser"
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-[#1D4ED8]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              } ${collapsed ? "justify-center" : ""}`}
              style={isActive ? { fontWeight: 600 } : {}}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/15 p-4">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className={`w-full flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Đăng Xuất</span>}
        </button>
      </div>
    </aside>
  );
}
