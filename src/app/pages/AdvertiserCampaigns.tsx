import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Calendar,
  MapPin,
  Users,
  PlayCircle,
  PauseCircle,
  Pencil,
  Eye,
  MonitorPlay,
} from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { KpiCard } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";

const campaigns = [
  {
    name: "Tết 2026 - Đại Tiệc Mua Sắm",
    brand: "Vincom Retail",
    screens: "Cầu Rồng LED, Bạch Đằng Digital",
    startDate: "05/01/2026",
    endDate: "15/02/2026",
    budget: "1.200.000.000₫",
    status: "running",
  },
  {
    name: "Ra Mắt Sản Phẩm Mới",
    brand: "TechZone",
    screens: "Nguyễn Văn Linh Screen",
    startDate: "01/03/2026",
    endDate: "31/03/2026",
    budget: "450.000.000₫",
    status: "upcoming",
  },
  {
    name: "Mùa Hè Sôi Động",
    brand: "Coca-Cola",
    screens: "Mỹ Khê Beach LED",
    startDate: "01/06/2025",
    endDate: "31/08/2025",
    budget: "900.000.000₫",
    status: "finished",
  },
  {
    name: "Khuyến Mãi Cuối Tuần",
    brand: "MegaMart",
    screens: "Vincom Đà Nẵng, Cầu Rồng LED",
    startDate: "10/03/2026",
    endDate: "30/03/2026",
    budget: "320.000.000₫",
    status: "paused",
  },
];

const columns = [
  {
    key: "name",
    label: "Tên Chiến Dịch",
    render: (v: string, row: any) => (
      <div>
        <div className="text-sm text-[#1A2332]" style={{ fontWeight: 500 }}>
          {v}
        </div>
        <div className="text-xs text-[#6B7A8D] flex items-center gap-1 mt-0.5">
          <Users className="w-3 h-3" />
          <span>{row.brand}</span>
        </div>
      </div>
    ),
  },
  {
    key: "screens",
    label: "Màn Hình Quảng Cáo",
    render: (v: string) => (
      <span className="text-sm text-[#1A2332]">{v}</span>
    ),
  },
  {
    key: "time",
    label: "Thời Gian Chạy",
    render: (_: any, row: any) => (
      <div className="text-sm text-[#1A2332]">
        {row.startDate} - {row.endDate}
      </div>
    ),
  },
  {
    key: "budget",
    label: "Ngân Sách",
    render: (v: string) => (
      <span className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>
        {v}
      </span>
    ),
  },
  {
    key: "status",
    label: "Trạng Thái",
    render: (_: any, row: any) => {
      const map: Record<string, { variant: any; label: string }> = {
        running: { variant: "active", label: "Đang chạy" },
        upcoming: { variant: "pending", label: "Sắp chạy" },
        finished: { variant: "expired", label: "Đã kết thúc" },
        paused: { variant: "unavailable", label: "Tạm dừng" },
      };
      const conf = map[row.status] || map.running;
      return <StatusBadge variant={conf.variant} label={conf.label} />;
    },
  },
  {
    key: "actions",
    label: "Thao Tác",
    render: () => (
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer">
          <Eye className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer">
          <Pencil className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#F0F9FF] flex items-center justify-center text-[#EF4444] cursor-pointer">
          <PauseCircle className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];

export default function AdvertiserCampaigns() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : c.status === statusFilter;
    const matchesLocation =
      locationFilter === "all"
        ? true
        : c.screens.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesBrand =
      brandFilter === "all"
        ? true
        : c.brand.toLowerCase().includes(brandFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesLocation && matchesBrand;
  });

  return (
    <div className="flex h-screen bg-[#F0F9FF]">
      <DashboardSidebar role="advertiser" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-[#E3E8EF] px-8 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1
                className="text-xl text-[#1D4ED8]"
                style={{ fontWeight: 700 }}
              >
                Quản Lý Chiến Dịch
              </h1>
              <p className="text-sm text-[#6B7A8D] mt-0.5">
                Theo dõi, tối ưu và kiểm soát các chiến dịch quảng cáo ngoài trời của bạn.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chiến dịch, thương hiệu..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E3E8EF] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] bg-[#F9FAFB]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="bg-gradient-to-r from-[#4F46E5] to-[#1D4ED8] text-white text-sm px-4 py-2.5 rounded-lg hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Tạo Chiến Dịch Mới
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* KPI section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              title="Chiến Dịch Đang Chạy"
              value="4"
              change="+8%"
              changeType="up"
              icon={<PlayCircle className="w-5 h-5" />}
            />
            <KpiCard
              title="Màn Hình Đang Phát"
              value="18"
              change="+3"
              changeType="up"
              icon={<MonitorPlay className="w-5 h-5" />}
            />
            <KpiCard
              title="Lượt Hiển Thị"
              value="2.4M"
              change="+15%"
              changeType="up"
              icon={<Eye className="w-5 h-5" />}
            />
            <KpiCard
              title="Chi Phí Đã Sử Dụng"
              value="780 Tr₫"
              change="+5.2%"
              changeType="up"
              icon={<Users className="w-5 h-5" />}
            />
          </div>

          {/* Filters + list + side panel */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 space-y-4">
              {/* Filters */}
              <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7A8D]">Trạng thái</span>
                    <select
                      className="px-3 py-1.5 border border-[#E3E8EF] rounded-lg text-xs text-[#1A2332] bg-white cursor-pointer"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      <option value="running">Đang chạy</option>
                      <option value="upcoming">Sắp chạy</option>
                      <option value="finished">Đã kết thúc</option>
                      <option value="paused">Tạm dừng</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7A8D]">Vị trí màn hình</span>
                    <select
                      className="px-3 py-1.5 border border-[#E3E8EF] rounded-lg text-xs text-[#1A2332] bg-white cursor-pointer"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      <option value="cầu rồng">Cầu Rồng</option>
                      <option value="bạch đằng">Bạch Đằng</option>
                      <option value="nguyễn văn linh">Nguyễn Văn Linh</option>
                      <option value="mỹ khê">Mỹ Khê</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7A8D]">Thời gian</span>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E3E8EF] rounded-lg text-xs text-[#1A2332] bg-white cursor-pointer hover:bg-[#F8FAFC]">
                      <Calendar className="w-3.5 h-3.5 text-[#6B7A8D]" />
                      <span>Chọn khoảng thời gian</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#6B7A8D]" />
                  <select
                    className="px-3 py-1.5 border border-[#E3E8EF] rounded-lg text-xs text-[#1A2332] bg-white cursor-pointer"
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                  >
                    <option value="all">Tất cả thương hiệu</option>
                    <option value="vincom">Vincom</option>
                    <option value="techzone">TechZone</option>
                    <option value="coca-cola">Coca-Cola</option>
                    <option value="megamart">MegaMart</option>
                  </select>
                </div>
              </div>

              {/* Campaign list */}
              <div className="bg-white rounded-xl border border-[#E3E8EF] shadow-sm">
                <div className="p-4 border-b border-[#E3E8EF] flex items-center justify-between">
                  <div>
                    <h2
                      className="text-sm text-[#1A2332]"
                      style={{ fontWeight: 600 }}
                    >
                      Danh Sách Chiến Dịch
                    </h2>
                    <p className="text-xs text-[#6B7A8D] mt-0.5">
                      Quản lý tất cả chiến dịch quảng cáo và trạng thái hoạt động.
                    </p>
                  </div>
                  <span className="text-xs text-[#6B7A8D]">
                    {filteredCampaigns.length} chiến dịch
                  </span>
                </div>
                <div className="p-0">
                  <DataTable columns={columns} data={filteredCampaigns} />
                </div>
              </div>
            </div>

            {/* Preview + Map side panel */}
            <div className="space-y-4">
              {/* Preview */}
              <div className="bg-white rounded-xl border border-[#E3E8EF] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3
                      className="text-sm text-[#1A2332]"
                      style={{ fontWeight: 600 }}
                    >
                      Xem Trước Quảng Cáo
                    </h3>
                    <p className="text-xs text-[#6B7A8D] mt-0.5">
                      Mô phỏng tỷ lệ màn hình LED ngoài trời.
                    </p>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg text-xs bg-[#EEF2FF] text-[#4F46E5] cursor-pointer flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5" /> Xem demo
                  </button>
                </div>
                <div className="relative bg-gradient-to-r from-[#1D4ED8] via-[#4F46E5] to-[#7C3AED] rounded-xl h-40 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff_0,_transparent_60%)]" />
                  <div className="relative w-4/5 h-[60%] border-4 border-white/80 rounded-lg shadow-lg bg-black/80 flex items-center justify-center">
                    <span className="text-xs text-white/80 tracking-wide">
                      VIDEO / HÌNH 16:9
                    </span>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-xl border border-[#E3E8EF] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3
                      className="text-sm text-[#1A2332]"
                      style={{ fontWeight: 600 }}
                    >
                      Bản Đồ Vị Trí Màn Hình
                    </h3>
                    <p className="text-xs text-[#6B7A8D] mt-0.5">
                      Xem nhanh các vị trí đang có chiến dịch chạy.
                    </p>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg text-xs border border-[#E3E8EF] text-[#1A2332] cursor-pointer flex items-center gap-1 hover:bg-[#F8FAFC]">
                    <MapPin className="w-3.5 h-3.5 text-[#EF4444]" /> Xem chi tiết
                  </button>
                </div>
                <div className="rounded-lg border border-dashed border-[#E3E8EF] p-3 h-48 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-[#EFF6FF]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#1A2332]" style={{ fontWeight: 500 }}>
                          Cầu Rồng
                        </span>
                        <StatusBadge variant="active" />
                      </div>
                      <p className="text-[11px] text-[#6B7A8D]">
                        2 chiến dịch đang chạy
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#F5F3FF]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#1A2332]" style={{ fontWeight: 500 }}>
                          Bạch Đằng
                        </span>
                        <StatusBadge variant="pending" />
                      </div>
                      <p className="text-[11px] text-[#6B7A8D]">
                        1 chiến dịch sắp chạy
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#ECFEFF]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#1A2332]" style={{ fontWeight: 500 }}>
                          Nguyễn Văn Linh
                        </span>
                        <StatusBadge variant="available" />
                      </div>
                      <p className="text-[11px] text-[#6B7A8D]">
                        1 chiến dịch đang chạy
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FEF2F2]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#1A2332]" style={{ fontWeight: 500 }}>
                          Mỹ Khê
                        </span>
                        <StatusBadge variant="expired" />
                      </div>
                      <p className="text-[11px] text-[#6B7A8D]">
                        1 chiến dịch đã kết thúc
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#6B7A8D] mt-2">
                    <span>Đà Nẵng · Việt Nam</span>
                    <span>Zoom 12 · 4 màn hình</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

