import React, { useState } from "react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { Eye, Download, MoreHorizontal, Filter, Search, Plus } from "lucide-react";

// Mock data for bookings
const bookingsData = [
    { id: "BKG-2026-001", billboard: "Cầu Rồng LED", location: "Hải Châu, Đà Nẵng", date: "01/03 - 31/03", status: "active", payment: "85.000.000₫", created: "15/02/2026" },
    { id: "BKG-2026-002", billboard: "Bạch Đằng Digital", location: "Sơn Trà, Đà Nẵng", date: "15/03 - 15/04", status: "pending", payment: "55.000.000₫", created: "20/02/2026" },
    { id: "BKG-2026-003", billboard: "Nguyễn Văn Linh Screen", location: "Thanh Khê, Đà Nẵng", date: "01/04 - 30/04", status: "booked", payment: "68.000.000₫", created: "25/02/2026" },
    { id: "BKG-2026-004", billboard: "Mỹ Khê Beach LED", location: "Ngũ Hành Sơn, Đà Nẵng", date: "01/02 - 28/02", status: "expired", payment: "42.000.000₫", created: "10/01/2026" },
    { id: "BKG-2026-005", billboard: "Vincom Đà Nẵng", location: "Hải Châu, Đà Nẵng", date: "10/03 - 10/04", status: "active", payment: "120.000.000₫", created: "18/02/2026" },
    { id: "BKG-2026-006", billboard: "Ngã 3 Huế Billboard", location: "Thanh Khê, Đà Nẵng", date: "01/05 - 31/05", status: "pending", payment: "90.000.000₫", created: "01/03/2026" },
    { id: "BKG-2026-007", billboard: "Sân bay Đà Nẵng (Quốc nội)", location: "Hải Châu, Đà Nẵng", date: "01/04 - 30/06", status: "booked", payment: "450.000.000₫", created: "28/02/2026" },
];

export default function AdvertiserBookingsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredBookings = bookingsData.filter(b => {
        const matchesSearch = b.billboard.toLowerCase().includes(searchTerm.toLowerCase()) || b.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const columns = [
        { key: "id", label: "Mã Đặt Chỗ", render: (v: string) => <span className="text-[#6B7A8D] font-medium">{v}</span> },
        { key: "billboard", label: "Bảng QC", render: (v: string) => <span className="font-medium text-[#1D4ED8]">{v}</span> },
        { key: "location", label: "Vị Trí" },
        { key: "date", label: "Thời Gian" },
        { key: "payment", label: "Tổng Tiền", render: (v: string) => <span className="font-semibold text-[#1A2332]">{v}</span> },
        { key: "status", label: "Trạng Thái", render: (v: string) => <StatusBadge variant={v as any} /> },
        {
            key: "actions", label: "Thao Tác", render: () => (
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer transition-colors" title="Xem chi tiết"><Eye className="w-4 h-4" /></button>
                    <button className="w-8 h-8 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer transition-colors" title="Tải hợp đồng/hóa đơn"><Download className="w-4 h-4" /></button>
                    <button className="w-8 h-8 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer transition-colors" title="Thêm hành động"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
            )
        },
    ];

    return (
        <div className="flex h-screen bg-[#F0F9FF]">
            <DashboardSidebar role="advertiser" />
            <main className="flex-1 overflow-y-auto">
                <div className="bg-white border-b border-[#E3E8EF] px-8 py-5 sticky top-0 z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl text-[#1D4ED8] font-bold">Quản Lý Đặt Chỗ</h1>
                            <p className="text-sm text-[#6B7A8D] mt-0.5">Theo dõi và quản lý tất cả các bảng quảng cáo bạn đã đặt.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 bg-white border border-[#E3E8EF] text-[#1A2332] text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-medium">
                                <Download className="w-4 h-4" />
                                Xuất Excel
                            </button>
                            <button className="flex items-center gap-2 bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer font-medium shadow-sm">
                                <Plus className="w-4 h-4" />
                                Đặt Chỗ Mới
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="bg-white rounded-xl border border-[#E3E8EF] shadow-sm overflow-hidden mb-6">
                        <div className="p-5 border-b border-[#E3E8EF] flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
                            <div className="flex gap-4 flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo mã, tên bảng QC..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-[#E3E8EF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="pl-9 pr-8 py-2 text-sm border border-[#E3E8EF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent appearance-none bg-white cursor-pointer min-w-[160px]"
                                    >
                                        <option value="all">Tất cả trạng thái</option>
                                        <option value="active">Đang hoạt động</option>
                                        <option value="pending">Chờ xử lý</option>
                                        <option value="booked">Đã đặt</option>
                                        <option value="expired">Hết hạn</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <DataTable columns={columns} data={filteredBookings} className="border-0 shadow-none rounded-none" />

                        {filteredBookings.length === 0 && (
                            <div className="p-8 text-center text-[#6B7A8D]">
                                <p>Không tìm thấy đặt chỗ nào phù hợp với bộ lọc.</p>
                            </div>
                        )}

                        <div className="p-4 border-t border-[#E3E8EF] flex items-center justify-between text-sm text-[#6B7A8D] bg-gray-50/50">
                            <div>Hiển thị <span className="font-medium text-[#1A2332]">{filteredBookings.length}</span> trong tổng số <span className="font-medium text-[#1A2332]">{bookingsData.length}</span> đặt chỗ</div>
                            <div className="flex gap-1">
                                <button className="px-3 py-1 border border-[#E3E8EF] rounded hover:bg-white transition-colors disabled:opacity-50" disabled>Trước</button>
                                <button className="px-3 py-1 bg-[#1D4ED8] text-white rounded transition-colors">1</button>
                                <button className="px-3 py-1 border border-[#E3E8EF] rounded hover:bg-white transition-colors">2</button>
                                <button className="px-3 py-1 border border-[#E3E8EF] rounded hover:bg-white transition-colors">Sau</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
