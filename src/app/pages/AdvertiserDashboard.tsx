import React from "react";
import { Megaphone, DollarSign, Calendar, Heart, MoreHorizontal, Eye, Download } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { DataTable } from "../components/DataTable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const perfData = [
  { month: "T9", impressions: 120000, clicks: 3400 },
  { month: "T10", impressions: 185000, clicks: 5200 },
  { month: "T11", impressions: 210000, clicks: 6100 },
  { month: "T12", impressions: 195000, clicks: 5800 },
  { month: "T1", impressions: 240000, clicks: 7200 },
  { month: "T2", impressions: 280000, clicks: 8400 },
];

const bookings = [
  { billboard: "Cầu Rồng LED", location: "Hải Châu, Đà Nẵng", date: "01/03 - 31/03", status: "active", payment: "85.000.000₫" },
  { billboard: "Bạch Đằng Digital", location: "Sơn Trà, Đà Nẵng", date: "15/03 - 15/04", status: "pending", payment: "55.000.000₫" },
  { billboard: "Nguyễn Văn Linh Screen", location: "Thanh Khê, Đà Nẵng", date: "01/04 - 30/04", status: "booked", payment: "68.000.000₫" },
  { billboard: "Mỹ Khê Beach LED", location: "Ngũ Hành Sơn, ĐN", date: "01/02 - 28/02", status: "expired", payment: "42.000.000₫" },
  { billboard: "Vincom Đà Nẵng", location: "Hải Châu, Đà Nẵng", date: "10/03 - 10/04", status: "active", payment: "120.000.000₫" },
];

const columns = [
  { key: "billboard", label: "Bảng QC", render: (v: string) => <span style={{ fontWeight: 500 }} className="text-[#1D4ED8]">{v}</span> },
  { key: "location", label: "Vị Trí" },
  { key: "date", label: "Thời Gian" },
  { key: "status", label: "Trạng Thái", render: (v: string) => <StatusBadge variant={v as any} /> },
  { key: "payment", label: "Thanh Toán", render: (v: string) => <span style={{ fontWeight: 600 }} className="text-[#1D4ED8]">{v}</span> },
  { key: "actions", label: "Thao Tác", render: () => (
    <div className="flex items-center gap-2">
      <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer"><Eye className="w-3.5 h-3.5" /></button>
      <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer"><Download className="w-3.5 h-3.5" /></button>
      <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer"><MoreHorizontal className="w-3.5 h-3.5" /></button>
    </div>
  )},
];

const calEvents = [
  { day: 3, title: "Cầu Rồng - Bắt đầu", color: "bg-[#3B82F6]" },
  { day: 10, title: "Vincom - Bắt đầu", color: "bg-emerald-500" },
  { day: 15, title: "Bạch Đằng - Bắt đầu", color: "bg-[#F59E0B]" },
  { day: 25, title: "Hạn Thanh Toán", color: "bg-[#EF4444]" },
];

export default function AdvertiserDashboard() {
  return (
    <div className="flex h-screen bg-[#F0F9FF]">
      <DashboardSidebar role="advertiser" />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-[#E3E8EF] px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#1D4ED8]" style={{ fontWeight: 700 }}>Tổng Quan</h1>
              <p className="text-sm text-[#6B7A8D] mt-0.5">Chào mừng trở lại, Thanh Hà. Đây là tổng quan chiến dịch của bạn.</p>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg px-3 py-2 text-sm text-[#1D4ED8] cursor-pointer">
                <option>30 Ngày Qua</option>
                <option>7 Ngày Qua</option>
                <option>90 Ngày Qua</option>
              </select>
              <button className="bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer">
                + Chiến Dịch Mới
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard title="Chiến Dịch Đang Chạy" value="8" change="+2" changeType="up" icon={<Megaphone className="w-5 h-5" />} />
            <KpiCard title="Tổng Chi Tiêu" value="370 Tr₫" change="+12.5%" changeType="up" icon={<DollarSign className="w-5 h-5" />} />
            <KpiCard title="Đặt Chỗ Sắp Tới" value="3" change="+1" changeType="up" icon={<Calendar className="w-5 h-5" />} />
            <KpiCard title="Bảng QC Đã Lưu" value="14" change="+3" changeType="up" icon={<Heart className="w-5 h-5" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E8EF] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Hiệu Suất Chiến Dịch</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" /> Lượt Hiển Thị</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> Lượt Click</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={perfData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                  <XAxis dataKey="month" tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="impressions" stroke="#1D4ED8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="clicks" stroke="#06B6D4" strokeWidth={2} dot={false} />
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
              <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Đặt Chỗ Gần Đây</h3>
              <button className="text-sm text-[#06B6D4] hover:underline cursor-pointer">Xem Tất Cả</button>
            </div>
            <DataTable columns={columns} data={bookings} />
          </div>
        </div>
      </main>
    </div>
  );
}
