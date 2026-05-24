import React from "react";
import { useNavigate, useLocation } from "react-router";
import { Search, Bell, User } from "lucide-react";

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="w-full border-b border-[#E3E8EF] bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate("/")} className="text-xl text-[#1D4ED8] tracking-tight cursor-pointer" style={{ fontWeight: 800 }}>
            ADORA
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
          <button className="w-9 h-9 rounded-lg hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] transition-colors cursor-pointer relative">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
          </button>
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
        </div>
      </div>
    </header>
  );
}
