import React, { useState } from "react";
import { Search, Filter, Heart, Eye, MoreHorizontal } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";

const mockSavedBillboards = [
  {
    id: "SVD-001",
    billboard: "Cầu Rồng LED",
    location: "Hải Châu, Đà Nẵng",
    format: "LED 12x4m",
    price: "85.000.000₫ / tháng",
    status: "available",
    savedAt: "12/02/2026",
  },
  {
    id: "SVD-002",
    billboard: "Bạch Đằng Digital",
    location: "Sơn Trà, Đà Nẵng",
    format: "Digital 9x3m",
    price: "55.000.000₫ / tháng",
    status: "available",
    savedAt: "20/02/2026",
  },
  {
    id: "SVD-003",
    billboard: "Nguyễn Văn Linh Screen",
    location: "Thanh Khê, Đà Nẵng",
    format: "LED 8x4m",
    price: "68.000.000₫ / tháng",
    status: "booked",
    savedAt: "01/03/2026",
  },
  {
    id: "SVD-004",
    billboard: "Mỹ Khê Beach LED",
    location: "Ngũ Hành Sơn, ĐN",
    format: "Outdoor 14x4m",
    price: "42.000.000₫ / tháng",
    status: "available",
    savedAt: "03/03/2026",
  },
  {
    id: "SVD-005",
    billboard: "Vincom Đà Nẵng",
    location: "Hải Châu, Đà Nẵng",
    format: "LCD Indoor",
    price: "120.000.000₫ / tháng",
    status: "unavailable",
    savedAt: "05/03/2026",
  },
];

const columns = [
  {
    key: "id",
    label: "Mã Đã Lưu",
    render: (v: string) => <span className="text-[#6B7A8D]">{v}</span>,
  },
  {
    key: "billboard",
    label: "Bảng QC",
    render: (v: string) => (
      <span style={{ fontWeight: 500 }} className="text-[#1D4ED8]">
        {v}
      </span>
    ),
  },
  { key: "location", label: "Vị Trí" },
  { key: "format", label: "Định Dạng" },
  {
    key: "status",
    label: "Trạng Thái",
    render: (v: string) => <StatusBadge variant={v as any} />,
  },
  {
    key: "price",
    label: "Giá Tham Khảo",
    render: (v: string) => (
      <span style={{ fontWeight: 600 }} className="text-[#1D4ED8]">
        {v}
      </span>
    ),
  },
  { key: "savedAt", label: "Ngày Lưu" },
  {
    key: "actions",
    label: "Thao Tác",
    render: () => (
      <div className="flex items-center gap-2">
        <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer">
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button className="w-7 h-7 rounded-md hover:bg-[#FEE2E2] flex items-center justify-center text-[#DC2626] cursor-pointer">
          <Heart className="w-3.5 h-3.5 fill-current" />
        </button>
        <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  },
];

export default function AdvertiserSaved() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = mockSavedBillboards.filter((item) => {
    const keyword = searchTerm.toLowerCase();
    return (
      item.billboard.toLowerCase().includes(keyword) ||
      item.location.toLowerCase().includes(keyword) ||
      item.format.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="flex h-screen bg-[#F0F9FF]">
      <DashboardSidebar role="advertiser" />
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-[#E3E8EF] px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-xl text-[#1D4ED8]"
                style={{ fontWeight: 700 }}
              >
                Bảng Quảng Cáo Đã Lưu
              </h1>
              <p className="text-sm text-[#6B7A8D] mt-0.5">
                Xem lại và quản lý các vị trí bảng quảng cáo mà bạn đã yêu
                thích.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="bg-white rounded-xl border border-[#E3E8EF] shadow-sm">
            <div className="p-5 border-b border-[#E3E8EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bảng quảng cáo đã lưu..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E3E8EF] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-[#E3E8EF] rounded-lg text-sm text-[#1A2332] hover:bg-[#F8FAFC] transition-colors cursor-pointer">
                  <Filter className="w-4 h-4 text-[#6B7A8D]" /> Bộ lọc
                </button>
              </div>
            </div>

            <div className="p-0">
              <DataTable columns={columns} data={filteredData} />
            </div>

            <div className="p-5 border-t border-[#E3E8EF] flex items-center justify-between text-sm text-[#6B7A8D]">
              <div>
                Đang hiển thị {filteredData.length} / {mockSavedBillboards.length} bảng quảng cáo đã lưu
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

