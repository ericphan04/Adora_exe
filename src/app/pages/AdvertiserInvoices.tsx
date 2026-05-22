import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Calendar,
  DollarSign,
  FileText,
  Download,
  Send,
  CreditCard,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { KpiCard } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";

const invoices = [
  {
    id: "INV-2026-001",
    customer: "Vincom Retail",
    campaign: "Tết 2026 - Đại Tiệc Mua Sắm",
    createdAt: "02/01/2026",
    dueAt: "15/01/2026",
    total: "450.000.000₫",
    status: "paid",
  },
  {
    id: "INV-2026-002",
    customer: "TechZone",
    campaign: "Ra Mắt Sản Phẩm Mới",
    createdAt: "01/03/2026",
    dueAt: "20/03/2026",
    total: "220.000.000₫",
    status: "pending",
  },
  {
    id: "INV-2026-003",
    customer: "Coca-Cola",
    campaign: "Mùa Hè Sôi Động",
    createdAt: "01/06/2025",
    dueAt: "30/06/2025",
    total: "650.000.000₫",
    status: "paid",
  },
  {
    id: "INV-2026-004",
    customer: "MegaMart",
    campaign: "Khuyến Mãi Cuối Tuần",
    createdAt: "10/02/2026",
    dueAt: "25/02/2026",
    total: "180.000.000₫",
    status: "overdue",
  },
];

const columns = [
  {
    key: "id",
    label: "Mã Hóa Đơn",
    render: (v: string, row: any) => (
      <div>
        <div className="flex items-center gap-2">
          <span
            className="text-sm text-[#1A2332]"
            style={{ fontWeight: 500 }}
          >
            {v}
          </span>
        </div>
        <p className="text-xs text-[#6B7A8D] mt-0.5">{row.customer}</p>
      </div>
    ),
  },
  {
    key: "campaign",
    label: "Chiến Dịch",
    render: (v: string) => (
      <span className="text-sm text-[#1A2332]">{v}</span>
    ),
  },
  {
    key: "createdAt",
    label: "Ngày Tạo",
  },
  {
    key: "dueAt",
    label: "Hạn Thanh Toán",
  },
  {
    key: "total",
    label: "Tổng Tiền",
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
      const map: Record<
        string,
        { variant: any; label: string }
      > = {
        paid: { variant: "active", label: "Đã thanh toán" },
        pending: { variant: "pending", label: "Chưa thanh toán" },
        overdue: { variant: "expired", label: "Quá hạn" },
      };
      const conf = map[row.status] || map.pending;
      return <StatusBadge variant={conf.variant} label={conf.label} />;
    },
  },
  {
    key: "actions",
    label: "Thao Tác",
    render: () => (
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer">
          <FileText className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer">
          <Download className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#F0F9FF] flex items-center justify-center text-[#1D4ED8] cursor-pointer">
          <Send className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];

export default function AdvertiserInvoices() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      !search ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : inv.status === statusFilter;
    const matchesCustomer =
      customerFilter === "all"
        ? true
        : inv.customer.toLowerCase().includes(customerFilter.toLowerCase());
    const matchesCampaign =
      campaignFilter === "all"
        ? true
        : inv.campaign.toLowerCase().includes(campaignFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesCustomer && matchesCampaign;
  });

  const selectedInvoice = filteredInvoices[0] || invoices[0];

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
                Quản Lý Hóa Đơn
              </h1>
              <p className="text-sm text-[#6B7A8D] mt-0.5">
                Theo dõi doanh thu, tình trạng thanh toán và lịch sử hóa đơn.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
                <input
                  type="text"
                  placeholder="Tìm theo mã hóa đơn hoặc khách hàng..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E3E8EF] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] bg-[#F9FAFB]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="bg-gradient-to-r from-[#4F46E5] to-[#1D4ED8] text-white text-sm px-4 py-2.5 rounded-lg hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Tạo Hóa Đơn Mới
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* KPI section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              title="Tổng Doanh Thu"
              value="1.500 Tỷ₫"
              change="+12.3%"
              changeType="up"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <KpiCard
              title="Hóa Đơn Đã Thanh Toán"
              value="86"
              change="+6"
              changeType="up"
              icon={<CheckCircle className="w-5 h-5" />}
            />
            <KpiCard
              title="Hóa Đơn Chưa Thanh Toán"
              value="14"
              change="-3"
              changeType="down"
              icon={<AlertTriangle className="w-5 h-5" />}
            />
            <KpiCard
              title="Đang Chờ Thanh Toán"
              value="320 Tr₫"
              change="+2.1%"
              changeType="up"
              icon={<CreditCard className="w-5 h-5" />}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* Filters + table */}
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
                      <option value="paid">Đã thanh toán</option>
                      <option value="pending">Chưa thanh toán</option>
                      <option value="overdue">Quá hạn</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7A8D]">Khách hàng</span>
                    <select
                      className="px-3 py-1.5 border border-[#E3E8EF] rounded-lg text-xs text-[#1A2332] bg-white cursor-pointer"
                      value={customerFilter}
                      onChange={(e) => setCustomerFilter(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      <option value="vincom">Vincom</option>
                      <option value="techzone">TechZone</option>
                      <option value="coca-cola">Coca-Cola</option>
                      <option value="megamart">MegaMart</option>
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
                    value={campaignFilter}
                    onChange={(e) => setCampaignFilter(e.target.value)}
                  >
                    <option value="all">Tất cả chiến dịch</option>
                    <option value="tết 2026">Tết 2026</option>
                    <option value="ra mắt sản phẩm">Ra mắt sản phẩm</option>
                    <option value="mùa hè">Mùa hè</option>
                    <option value="khuyến mãi cuối tuần">Khuyến mãi cuối tuần</option>
                  </select>
                </div>
              </div>

              {/* Invoices table */}
              <div className="bg-white rounded-xl border border-[#E3E8EF] shadow-sm">
                <div className="p-4 border-b border-[#E3E8EF] flex items-center justify-between">
                  <div>
                    <h2
                      className="text-sm text-[#1A2332]"
                      style={{ fontWeight: 600 }}
                    >
                      Danh Sách Hóa Đơn
                    </h2>
                    <p className="text-xs text-[#6B7A8D] mt-0.5">
                      Quản lý toàn bộ hóa đơn và tình trạng thanh toán.
                    </p>
                  </div>
                  <span className="text-xs text-[#6B7A8D]">
                    {filteredInvoices.length} hóa đơn
                  </span>
                </div>
                <div className="p-0">
                  <DataTable columns={columns} data={filteredInvoices} />
                </div>
              </div>
            </div>

            {/* Invoice detail + payment */}
            <div className="space-y-4">
              {/* Detail card */}
              <div className="bg-white rounded-xl border border-[#E3E8EF] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3
                      className="text-sm text-[#1A2332]"
                      style={{ fontWeight: 600 }}
                    >
                      Chi Tiết Hóa Đơn
                    </h3>
                    <p className="text-xs text-[#6B7A8D] mt-0.5">
                      Thông tin tóm tắt của hóa đơn đang chọn.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5]">
                    <FileText className="w-3.5 h-3.5" />
                    {selectedInvoice.id}
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7A8D]">Khách hàng</span>
                    <span
                      className="text-[#1A2332]"
                      style={{ fontWeight: 500 }}
                    >
                      {selectedInvoice.customer}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7A8D]">Chiến dịch</span>
                    <span className="text-right text-[#1A2332]">
                      {selectedInvoice.campaign}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7A8D]">Thời gian</span>
                    <span className="text-[#1A2332]">
                      {selectedInvoice.createdAt} - {selectedInvoice.dueAt}
                    </span>
                  </div>
                  <div className="border-t border-dashed border-[#E3E8EF] my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7A8D]">Tạm tính</span>
                    <span className="text-[#1A2332]">
                      {selectedInvoice.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7A8D]">Thuế (10%)</span>
                    <span className="text-[#1A2332]">
                      {/* demo value */}
                      10% VAT
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7A8D]">Tổng thanh toán</span>
                    <span
                      className="text-[#1D4ED8]"
                      style={{ fontWeight: 700 }}
                    >
                      {selectedInvoice.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment actions */}
              <div className="bg-white rounded-xl border border-[#E3E8EF] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3
                      className="text-sm text-[#1A2332]"
                      style={{ fontWeight: 600 }}
                    >
                      Thanh Toán & Trạng Thái
                    </h3>
                    <p className="text-xs text-[#6B7A8D] mt-0.5">
                      Đánh dấu thanh toán hoặc gửi link thanh toán cho khách.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#16A34A] text-white text-sm cursor-pointer hover:bg-[#15803D]">
                    <CheckCircle className="w-4 h-4" />
                    Đánh Dấu Đã Thanh Toán
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#E3E8EF] hover:bg-[#F8FAFC] cursor-pointer">
                      <CreditCard className="w-3.5 h-3.5 text-[#0EA5E9]" />
                      VNPay
                    </button>
                    <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#E3E8EF] hover:bg-[#F8FAFC] cursor-pointer">
                      <CreditCard className="w-3.5 h-3.5 text-[#6366F1]" />
                      Stripe
                    </button>
                    <button className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-[#E3E8EF] hover:bg-[#F8FAFC] cursor-pointer">
                      <DollarSign className="w-3.5 h-3.5 text-[#22C55E]" />
                      Chuyển khoản
                    </button>
                  </div>
                  <p className="text-[11px] text-[#6B7A8D]">
                    * Các phương thức trên chỉ là mô phỏng giao diện để tích hợp
                    VNPay, Stripe hoặc chuyển khoản ngân hàng trong tương lai.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

