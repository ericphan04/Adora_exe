import React, { useState } from "react";
import { Search, Filter, Plus, Eye, Download, MoreHorizontal } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";

const mockBookings = [
    { id: "BKG-001", billboard: "Cầu Rồng LED", location: "Hải Châu, Đà Nẵng", startDate: "01/03/2026", endDate: "31/03/2026", status: "active", payment: "85.000.000₫" },
    { id: "BKG-002", billboard: "Bạch Đằng Digital", location: "Sơn Trà, Đà Nẵng", startDate: "15/03/2026", endDate: "15/04/2026", status: "pending", payment: "55.000.000₫" },
    { id: "BKG-003", billboard: "Nguyễn Văn Linh Screen", location: "Thanh Khê, Đà Nẵng", startDate: "01/04/2026", endDate: "30/04/2026", status: "booked", payment: "68.000.000₫" },
    { id: "BKG-004", billboard: "Mỹ Khê Beach LED", location: "Ngũ Hành Sơn, ĐN", startDate: "01/02/2026", endDate: "28/02/2026", status: "expired", payment: "42.000.000₫" },
    { id: "BKG-005", billboard: "Vincom Đà Nẵng", location: "Hải Châu, Đà Nẵng", startDate: "10/03/2026", endDate: "10/04/2026", status: "active", payment: "120.000.000₫" },
    { id: "BKG-006", billboard: "Sân Bay Quốc Tế", location: "Hải Châu, Đà Nẵng", startDate: "01/05/2026", endDate: "31/10/2026", status: "unavailable", payment: "0₫" },
];

const columns = [
    { key: "id", label: "Mã Đặt Chỗ", render: (v: string) => <span className="text-[#6B7A8D]">{v}</span> },
    { key: "billboard", label: "Bảng QC", render: (v: string) => <span style={{ fontWeight: 500 }} className="text-[#1D4ED8]">{v}</span> },
    { key: "location", label: "Vị Trí" },
    { key: "time", label: "Thời Gian", render: (_: any, item: any) => <span>{item.startDate} - {item.endDate}</span> },
    { key: "status", label: "Trạng Thái", render: (v: string) => <StatusBadge variant={v as any} /> },
    { key: "payment", label: "Thanh Toán", render: (v: string) => <span style={{ fontWeight: 600 }} className="text-[#1D4ED8]">{v}</span> },
    {
        key: "actions", label: "Thao Tác", render: () => (
            <div className="flex items-center gap-2">
                <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer"><Eye className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer"><Download className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer"><MoreHorizontal className="w-3.5 h-3.5" /></button>
            </div>
        )
    },
];

export default function AdvertiserBookings() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="flex h-screen bg-[#F0F9FF]">
            <DashboardSidebar role="advertiser" />
            <main className="flex-1 overflow-y-auto">
                <div className="bg-white border-b border-[#E3E8EF] px-8 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl text-[#1D4ED8]" style={{ fontWeight: 700 }}>Quản Lý Đặt Chỗ</h1>
                            <p className="text-sm text-[#6B7A8D] mt-0.5">Theo dõi và quản lý các lượt đặt chỗ bảng quảng cáo của bạn.</p>
                        </div>
                        <button className="bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Đặt Chỗ Mới
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="bg-white rounded-xl border border-[#E3E8EF] shadow-sm">
                        <div className="p-5 border-b border-[#E3E8EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative max-w-md w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm đặt chỗ, bảng quảng cáo..."
                                    className="w-full pl-10 pr-4 py-2 border border-[#E3E8EF] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 border border-[#E3E8EF] rounded-lg text-sm text-[#1A2332] hover:bg-[#F8FAFC] transition-colors cursor-pointer">
                                    <Filter className="w-4 h-4 text-[#6B7A8D]" /> Bộ lọc
                                </button>
                                <select className="px-4 py-2 border border-[#E3E8EF] rounded-lg text-sm text-[#1A2332] focus:outline-none focus:border-[#1D4ED8] cursor-pointer bg-white">
                                    <option>Tất cả trạng thái</option>
                                    <option>Đang hoạt động</option>
                                    <option>Chờ xác nhận</option>
                                    <option>Đã đặt</option>
                                    <option>Đã hết hạn</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-0">
                            <DataTable columns={columns} data={mockBookings} />
                        </div>

                        <div className="p-5 border-t border-[#E3E8EF] flex items-center justify-between text-sm text-[#6B7A8D]">
                            <div>Hiển thị 1 - 6 của 24 đặt chỗ</div>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 border border-[#E3E8EF] rounded hover:bg-[#F8FAFC] disabled:opacity-50 cursor-pointer">Trước</button>
                                <button className="px-3 py-1 bg-[#1D4ED8] text-white rounded cursor-pointer">1</button>
                                <button className="px-3 py-1 border border-[#E3E8EF] rounded hover:bg-[#F8FAFC] cursor-pointer">2</button>
                                <button className="px-3 py-1 border border-[#E3E8EF] rounded hover:bg-[#F8FAFC] cursor-pointer">3</button>
                                <button className="px-3 py-1 border border-[#E3E8EF] rounded hover:bg-[#F8FAFC] cursor-pointer">Sau</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
