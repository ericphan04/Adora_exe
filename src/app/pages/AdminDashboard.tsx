import React from "react";
import { Users, Monitor, DollarSign, TrendingUp, Check, X, Eye, MoreHorizontal } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { DataTable } from "../components/DataTable";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const gmvData = [
  { month: "T9", gmv: 2800000000 },
  { month: "T10", gmv: 3400000000 },
  { month: "T11", gmv: 3900000000 },
  { month: "T12", gmv: 3600000000 },
  { month: "T1", gmv: 4300000000 },
  { month: "T2", gmv: 4800000000 },
];

const bookingVolumeData = [
  { month: "T9", bookings: 85 },
  { month: "T10", bookings: 102 },
  { month: "T11", bookings: 118 },
  { month: "T12", bookings: 105 },
  { month: "T1", bookings: 135 },
  { month: "T2", bookings: 148 },
];

const users = [
  { name: "Nguyễn Thanh Hà", email: "ha@abccorp.vn", role: "Nhà Quảng Cáo", status: "active", joined: "15/01/2026" },
  { name: "Trần Minh Đức", email: "duc@digitalads.vn", role: "Chủ Bảng QC", status: "active", joined: "02/02/2026" },
  { name: "Lê Thị Mai", email: "mai@mediapro.vn", role: "Nhà Quảng Cáo", status: "pending", joined: "28/02/2026" },
  { name: "Phạm Văn Hoàng", email: "hoang@adventure.vn", role: "Nhà Quảng Cáo", status: "active", joined: "01/03/2026" },
  { name: "Võ Ngọc Lan", email: "lan@billboardco.vn", role: "Chủ Bảng QC", status: "active", joined: "10/02/2026" },
];

const listings = [
  { name: "Trung Tâm Hội An LED", owner: "Võ Ngọc Lan", location: "Hội An, Quảng Nam", size: "12m x 5m", status: "pending", submitted: "01/03/2026" },
  { name: "Cầu Thuận Phước LED", owner: "Trần Văn Bình", location: "Sơn Trà, Đà Nẵng", size: "10m x 4m", status: "pending", submitted: "02/03/2026" },
  { name: "Bà Nà Hills Digital", owner: "Trần Minh Đức", location: "Hòa Vang, Đà Nẵng", size: "14m x 6m", status: "pending", submitted: "03/03/2026" },
];

const transactions = [
  { id: "GD-001", advertiser: "Công ty CP ABC", owner: "Trần Minh Đức", amount: "85.000.000₫", commission: "4.250.000₫", status: "active", date: "01/03/2026" },
  { id: "GD-002", advertiser: "QC Số Việt", owner: "Võ Ngọc Lan", amount: "55.000.000₫", commission: "2.750.000₫", status: "pending", date: "02/03/2026" },
  { id: "GD-003", advertiser: "MediaPro", owner: "Trần Văn Bình", amount: "68.000.000₫", commission: "3.400.000₫", status: "active", date: "03/03/2026" },
  { id: "GD-004", advertiser: "XYZ Brand", owner: "Trần Minh Đức", amount: "42.000.000₫", commission: "2.100.000₫", status: "expired", date: "28/02/2026" },
];

const userColumns = [
  { key: "name", label: "Họ Tên", render: (v: string) => <span style={{ fontWeight: 500 }} className="text-[#1D4ED8]">{v}</span> },
  { key: "email", label: "Email" },
  { key: "role", label: "Vai Trò", render: (v: string) => (
    <span className={`text-xs px-2 py-1 rounded-full ${v === "Nhà Quảng Cáo" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{v}</span>
  )},
  { key: "status", label: "Trạng Thái", render: (v: string) => <StatusBadge variant={v as any} /> },
  { key: "joined", label: "Ngày Tham Gia" },
  { key: "actions", label: "", render: () => (
    <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer"><MoreHorizontal className="w-3.5 h-3.5" /></button>
  )},
];

const listingColumns = [
  { key: "name", label: "Bảng QC", render: (v: string) => <span style={{ fontWeight: 500 }} className="text-[#1D4ED8]">{v}</span> },
  { key: "owner", label: "Chủ Sở Hữu" },
  { key: "location", label: "Vị Trí" },
  { key: "size", label: "Kích Thước" },
  { key: "submitted", label: "Ngày Gửi" },
  { key: "actions", label: "Thao Tác", render: () => (
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-md hover:bg-emerald-100 cursor-pointer">
        <Check className="w-3 h-3" /> Duyệt
      </button>
      <button className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-md hover:bg-red-100 cursor-pointer">
        <X className="w-3 h-3" /> Từ Chối
      </button>
      <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer">
        <Eye className="w-3.5 h-3.5" />
      </button>
    </div>
  )},
];

const txnColumns = [
  { key: "id", label: "Mã GD", render: (v: string) => <span className="text-[#06B6D4] text-xs" style={{ fontWeight: 500 }}>{v}</span> },
  { key: "advertiser", label: "Nhà QC" },
  { key: "owner", label: "Chủ Bảng QC" },
  { key: "amount", label: "Số Tiền", render: (v: string) => <span style={{ fontWeight: 600 }} className="text-[#1D4ED8]">{v}</span> },
  { key: "commission", label: "Hoa Hồng", render: (v: string) => <span className="text-emerald-600" style={{ fontWeight: 500 }}>{v}</span> },
  { key: "status", label: "Trạng Thái", render: (v: string) => <StatusBadge variant={v as any} /> },
  { key: "date", label: "Ngày" },
];

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-[#F0F9FF]">
      <DashboardSidebar role="admin" />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-[#E3E8EF] px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#1D4ED8]" style={{ fontWeight: 700 }}>Bảng Điều Khiển Quản Trị</h1>
              <p className="text-sm text-[#6B7A8D] mt-0.5">Tổng quan nền tảng và bảng quản lý.</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg px-3 py-2 text-sm text-[#1D4ED8] cursor-pointer">
                <option>30 Ngày Qua</option>
                <option>7 Ngày Qua</option>
                <option>90 Ngày Qua</option>
              </select>
              <button className="bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer">
                Xuất Báo Cáo
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard title="Tổng Người Dùng" value="5.847" change="+324" changeType="up" icon={<Users className="w-5 h-5" />} />
            <KpiCard title="Tổng Tin Đăng" value="1.234" change="+48" changeType="up" icon={<Monitor className="w-5 h-5" />} />
            <KpiCard title="Tổng Giao Dịch" value="4.8 Tỷ₫" change="+15.8%" changeType="up" icon={<DollarSign className="w-5 h-5" />} />
            <KpiCard title="Doanh Thu Hoa Hồng" value="240 Tr₫" change="+12.3%" changeType="up" icon={<TrendingUp className="w-5 h-5" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>GMV Hàng Tháng</h3>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+15.8%</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={gmvData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                  <XAxis dataKey="month" tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000000} Tỷ`} />
                  <Tooltip formatter={(value: number) => [`${(value / 1000000000).toFixed(1)} Tỷ ₫`, "GMV"]} />
                  <Bar dataKey="gmv" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Số Lượng Đặt Chỗ</h3>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+9.6%</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={bookingVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                  <XAxis dataKey="month" tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#06B6D4" strokeWidth={2.5} dot={{ fill: "#06B6D4", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Quản Lý Người Dùng</h3>
              <button className="text-sm text-[#06B6D4] hover:underline cursor-pointer">Xem Tất Cả</button>
            </div>
            <DataTable columns={userColumns} data={users} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Tin Đăng Chờ Duyệt</h3>
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">{listings.length} chờ duyệt</span>
            </div>
            <DataTable columns={listingColumns} data={listings} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Giám Sát Giao Dịch</h3>
              <button className="text-sm text-[#06B6D4] hover:underline cursor-pointer">Xem Tất Cả</button>
            </div>
            <DataTable columns={txnColumns} data={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}
