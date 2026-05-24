import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  PlayCircle,
  Eye,
  MonitorPlay,
  Users,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router";
import { KpiCard } from "../../KpiCard";
import { DataTable } from "../../DataTable";
import { StatusBadge } from "../../StatusBadge";
import { BookingDto } from "../../../../types/booking";
import { bookingsToCampaigns, formatVnd } from "../../../utils/advertiser";

interface AdvertiserCampaignsViewProps {
  bookings: BookingDto[];
}

export function AdvertiserCampaignsView({ bookings }: AdvertiserCampaignsViewProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const campaigns = useMemo(() => bookingsToCampaigns(bookings), [bookings]);

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const running = campaigns.filter((c) => c.status === "running").length;
  const totalBudget = bookings
    .filter((b) => b.status === "PAID")
    .reduce((s, b) => s + b.finalAmount, 0);

  const statusMap: Record<string, { variant: "active" | "pending" | "expired" | "unavailable"; label: string }> = {
    running: { variant: "active", label: "Đang chạy" },
    upcoming: { variant: "pending", label: "Sắp chạy" },
    finished: { variant: "expired", label: "Đã kết thúc" },
    paused: { variant: "unavailable", label: "Tạm dừng" },
  };

  const columns = [
    {
      key: "name",
      label: "Chiến dịch",
      render: (v: string, row: { brand: string; location: string }) => (
        <div>
          <p className="text-sm font-medium text-[#1E293B]">{v}</p>
          <p className="text-xs text-[#6B7A8D] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {row.brand} · {row.location}
          </p>
        </div>
      ),
    },
    {
      key: "time",
      label: "Thời gian",
      render: (_: unknown, row: { startDate: string; endDate: string }) => (
        <span className="text-sm">{row.startDate} – {row.endDate}</span>
      ),
    },
    {
      key: "budget",
      label: "Ngân sách",
      render: (v: string) => <span className="font-semibold text-[#1D4ED8]">{v}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_: unknown, row: { status: string }) => {
        const conf = statusMap[row.status] || statusMap.upcoming;
        return <StatusBadge variant={conf.variant} label={conf.label} />;
      },
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4F46E5] via-[#1D4ED8] to-[#06B6D4] p-6 text-white">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-sm text-indigo-100">Trung tâm chiến dịch</p>
            <h2 className="text-2xl font-bold mt-1">Quản lý quảng cáo LED</h2>
            <p className="text-sm text-indigo-100/90 mt-2">
              Mỗi booking đã thanh toán được coi là một chiến dịch trên ADORA.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/billboards")}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#1D4ED8] text-sm font-bold hover:bg-blue-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Chiến dịch mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Đang chạy" value={String(running)} icon={<PlayCircle className="w-5 h-5" />} />
        <KpiCard title="Tổng chiến dịch" value={String(campaigns.length)} icon={<MonitorPlay className="w-5 h-5" />} />
        <KpiCard title="Chi phí đã chi" value={formatVnd(totalBudget)} icon={<Users className="w-5 h-5" />} />
        <KpiCard title="Lượt hiển thị (ước tính)" value="2.4M" change="+15%" changeType="up" icon={<Eye className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
              <input
                type="text"
                placeholder="Tìm chiến dịch..."
                className="w-full pl-10 pr-4 py-2 border border-[#E3E8EF] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Filter className="w-4 h-4 text-[#6B7A8D]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="running">Đang chạy</option>
              <option value="upcoming">Sắp chạy</option>
              <option value="finished">Đã kết thúc</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-[#E3E8EF] shadow-sm">
            <div className="p-4 border-b border-[#E3E8EF]">
              <h3 className="font-semibold text-[#1E293B]">Danh sách chiến dịch</h3>
              <p className="text-xs text-[#6B7A8D]">{filtered.length} chiến dịch</p>
            </div>
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-[#6B7A8D]">Chưa có chiến dịch nào.</p>
            ) : (
              <DataTable columns={columns} data={filtered} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-5">
            <h3 className="font-semibold text-[#1D4ED8] mb-3">Xem trước creative</h3>
            <div className="relative bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED] rounded-xl h-36 flex items-center justify-center">
              <div className="w-4/5 h-2/3 border-4 border-white/80 rounded-lg bg-black/70 flex items-center justify-center">
                <span className="text-[10px] text-white/70">16:9 LED Preview</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-5">
            <h3 className="font-semibold text-[#1D4ED8] mb-3">Vị trí đang chạy</h3>
            <ul className="space-y-2 text-xs">
              {[...new Set(campaigns.map((c) => c.location))].slice(0, 4).map((loc) => (
                <li key={loc} className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span className="font-medium text-[#1E293B]">{loc}</span>
                  <StatusBadge variant="active" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
