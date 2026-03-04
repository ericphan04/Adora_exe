import React from "react";
import { Monitor, BarChart3, DollarSign, Clock, Check, X, Eye } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { DataTable } from "../components/DataTable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
  { month: "T9", revenue: 180000000 },
  { month: "T10", revenue: 220000000 },
  { month: "T11", revenue: 280000000 },
  { month: "T12", revenue: 245000000 },
  { month: "T1", revenue: 310000000 },
  { month: "T2", revenue: 360000000 },
];

const bookingRequests = [
  { advertiser: "Công ty CP ABC", billboard: "Cầu Rồng LED", dates: "05/03 - 05/04", amount: "85.000.000₫", status: "pending" },
  { advertiser: "Đại Lý QC Số Việt", billboard: "Bạch Đằng Digital", dates: "15/03 - 15/04", amount: "55.000.000₫", status: "pending" },
  { advertiser: "Công ty MediaPro", billboard: "Nguyễn Văn Linh", dates: "01/04 - 30/04", amount: "68.000.000₫", status: "pending" },
  { advertiser: "Thương Hiệu XYZ", billboard: "Mỹ Khê Beach LED", dates: "20/03 - 20/04", amount: "42.000.000₫", status: "active" },
  { advertiser: "ProMedia LLC", billboard: "Trần Phú LED", dates: "01/02 - 28/02", amount: "52.000.000₫", status: "expired" },
];

const columns = [
  { key: "advertiser", label: "Nhà Quảng Cáo", render: (v: string) => <span style={{ fontWeight: 500 }} className="text-[#1D4ED8]">{v}</span> },
  { key: "billboard", label: "Bảng QC" },
  { key: "dates", label: "Thời Gian" },
  { key: "amount", label: "Số Tiền", render: (v: string) => <span style={{ fontWeight: 600 }} className="text-[#1D4ED8]">{v}</span> },
  { key: "status", label: "Trạng Thái", render: (v: string) => <StatusBadge variant={v as any} /> },
  { key: "actions", label: "Thao Tác", render: (_: any, row: any) => (
    <div className="flex items-center gap-2">
      {row.status === "pending" ? (
        <>
          <button className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-md hover:bg-emerald-100 cursor-pointer">
            <Check className="w-3 h-3" /> Chấp Nhận
          </button>
          <button className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-md hover:bg-red-100 cursor-pointer">
            <X className="w-3 h-3" /> Từ Chối
          </button>
        </>
      ) : (
        <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer">
          <Eye className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )},
];

const calEvents = [
  { day: 5, title: "CP ABC - Bắt đầu", color: "bg-[#3B82F6]" },
  { day: 15, title: "QC Số Việt - Bắt đầu", color: "bg-emerald-500" },
  { day: 20, title: "XYZ - Bắt đầu", color: "bg-[#F59E0B]" },
  { day: 28, title: "Chi Trả Doanh Thu", color: "bg-[#1D4ED8]" },
];

export default function OwnerDashboard() {
  return (
    <div className="flex h-screen bg-[#F0F9FF]">
      <DashboardSidebar role="owner" />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-[#E3E8EF] px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#1D4ED8]" style={{ fontWeight: 700 }}>Tổng Quan Chủ Sở Hữu</h1>
              <p className="text-sm text-[#6B7A8D] mt-0.5">Chào mừng trở lại, Minh Đức. Đây là tổng quan danh mục của bạn.</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg px-3 py-2 text-sm text-[#1D4ED8] cursor-pointer">
                <option>30 Ngày Qua</option>
                <option>7 Ngày Qua</option>
                <option>90 Ngày Qua</option>
              </select>
              <button className="bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer">
                + Thêm Bảng QC
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard title="Tổng Tin Đăng" value="12" change="+2" changeType="up" icon={<Monitor className="w-5 h-5" />} />
            <KpiCard title="Tỷ Lệ Lấp Đầy" value="78%" change="+5.2%" changeType="up" icon={<BarChart3 className="w-5 h-5" />} />
            <KpiCard title="Doanh Thu Tháng" value="360 Tr₫" change="+18.3%" changeType="up" icon={<DollarSign className="w-5 h-5" />} />
            <KpiCard title="Chờ Xử Lý" value="3" change="+1" changeType="up" icon={<Clock className="w-5 h-5" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E8EF] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Xu Hướng Doanh Thu</h3>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+18.3% so với kỳ trước</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                  <XAxis dataKey="month" tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}Tr`} />
                  <Tooltip formatter={(value: number) => [`${(value / 1000000).toFixed(0)} Triệu ₫`, "Doanh Thu"]} />
                  <Line type="monotone" dataKey="revenue" stroke="#1D4ED8" strokeWidth={2.5} dot={{ fill: "#1D4ED8", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <h3 className="text-[#1D4ED8] mb-4" style={{ fontWeight: 600 }}>Tháng 3, 2026</h3>
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {["CN","T2","T3","T4","T5","T6","T7"].map((d) => (
                  <div key={d} className="py-1 text-[#6B7A8D]">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i + 1;
                  const event = calEvents.find(e => e.day === day);
                  return (
                    <div key={i} className={`py-1.5 rounded relative ${day <= 31 ? "text-[#1A2332]" : "text-transparent"} ${event ? "bg-[#F0F9FF]" : ""}`}>
                      {day <= 31 ? day : "0"}
                      {event && <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${event.color}`} />}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2">
                {calEvents.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${e.color}`} />
                    <span className="text-[#6B7A8D]">{e.day}/03</span>
                    <span className="text-[#1A2332]" style={{ fontWeight: 500 }}>{e.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Yêu Cầu Đặt Chỗ</h3>
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">3 chờ xử lý</span>
            </div>
            <DataTable columns={columns} data={bookingRequests} />
          </div>
        </div>
      </main>
    </div>
  );
}
