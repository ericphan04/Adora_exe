import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  FileText,
  Download,
} from "lucide-react";
import { KpiCard } from "../../KpiCard";
import { DataTable } from "../../DataTable";
import { StatusBadge } from "../../StatusBadge";
import { BookingDto } from "../../../../types/booking";
import { PaymentDto } from "../../../../types/payment";
import { bookingsToInvoices, formatVnd } from "../../../utils/advertiser";
import { paymentsToInvoices } from "../../../utils/payments";
import { notify } from "../../../utils/notify";

interface AdvertiserInvoicesViewProps {
  bookings: BookingDto[];
  payments: PaymentDto[];
  onPayBooking: (id: number) => void;
}

export function AdvertiserInvoicesView({
  bookings,
  payments,
  onPayBooking,
}: AdvertiserInvoicesViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const invoices = useMemo(() => {
    const fromPayments = paymentsToInvoices(payments);
    const paidBookingIds = new Set(fromPayments.map((p) => p.bookingId));
    const fromBookings = bookingsToInvoices(bookings).filter(
      (inv) => !paidBookingIds.has(inv.bookingId),
    );
    return [...fromPayments, ...fromBookings].sort(
      (a, b) => b.bookingId - a.bookingId,
    );
  }, [bookings, payments]);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      !search ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.campaign.toLowerCase().includes(search.toLowerCase()) ||
      ("transactionCode" in inv &&
        inv.transactionCode?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selected =
    filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  const paidTotal = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);
  const pendingTotal = invoices
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.total, 0);

  const columns = [
    {
      key: "id",
      label: "Mã HĐ",
      render: (v: string, row: { campaign: string }) => (
        <div>
          <p className="font-mono text-xs text-[#1D4ED8]">{v}</p>
          <p className="text-[10px] text-[#6B7A8D] truncate max-w-[180px]">{row.campaign}</p>
        </div>
      ),
    },
    { key: "billboard", label: "Bảng QC" },
    { key: "createdAt", label: "Ngày tạo" },
    { key: "dueAt", label: "Hạn TT" },
    {
      key: "totalLabel",
      label: "Số tiền",
      render: (v: string) => <span className="font-semibold text-[#1D4ED8]">{v}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_: unknown, row: { status: string }) => {
        const map = {
          paid: { variant: "active" as const, label: "Đã thanh toán" },
          pending: { variant: "pending" as const, label: "Chờ thanh toán" },
          overdue: { variant: "expired" as const, label: "Thất bại" },
        };
        const conf = map[row.status as keyof typeof map] || map.pending;
        return <StatusBadge variant={conf.variant} label={conf.label} />;
      },
    },
    {
      key: "actions",
      label: "",
      render: (_: unknown, row: { id: string; bookingId: number; status: string }) => (
        <button
          type="button"
          onClick={() => setSelectedId(row.id)}
          className="text-xs text-[#06B6D4] hover:underline cursor-pointer"
        >
          Chi tiết
        </button>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Đã thanh toán" value={formatVnd(paidTotal)} icon={<DollarSign className="w-5 h-5" />} />
        <KpiCard title="Chờ thanh toán" value={formatVnd(pendingTotal)} icon={<CreditCard className="w-5 h-5" />} />
        <KpiCard title="Giao dịch" value={String(invoices.length)} icon={<FileText className="w-5 h-5" />} />
        <KpiCard
          title="VNPay thành công"
          value={String(payments.filter((p) => p.paymentStatus === "SUCCESS").length)}
          icon={<CheckCircle className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
              <input
                type="text"
                placeholder="Tìm mã hóa đơn, mã giao dịch..."
                className="w-full pl-10 py-2 border border-[#E3E8EF] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Filter className="w-4 h-4 text-[#6B7A8D] self-center" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ thanh toán</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-[#E3E8EF] shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-[#6B7A8D]">
                Chưa có hóa đơn hoặc giao dịch thanh toán.
              </p>
            ) : (
              <DataTable columns={columns} data={filtered} />
            )}
          </div>
        </div>

        {selected && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1D4ED8]">Chi tiết</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-mono">
                  {selected.id}
                </span>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#6B7A8D]">Mô tả</dt>
                  <dd className="font-medium text-right max-w-[60%]">{selected.campaign}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7A8D]">Bảng QC</dt>
                  <dd>{selected.billboard}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7A8D]">Ngày</dt>
                  <dd>{selected.createdAt}</dd>
                </div>
                {"transactionCode" in selected && selected.transactionCode && (
                  <div className="flex justify-between">
                    <dt className="text-[#6B7A8D]">Mã GD</dt>
                    <dd className="font-mono text-xs">{selected.transactionCode}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-dashed border-[#E3E8EF] pt-3">
                  <dt className="text-[#6B7A8D]">Số tiền</dt>
                  <dd className="text-lg font-bold text-[#1D4ED8]">{selected.totalLabel}</dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => notify.info("Tính năng tải PDF đang phát triển")}
                  className="flex-1 flex items-center justify-center gap-1 py-2 border border-[#E3E8EF] rounded-lg text-xs font-semibold cursor-pointer hover:bg-slate-50"
                >
                  <Download className="w-3.5 h-3.5" /> Tải PDF
                </button>
                {selected.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => onPayBooking(selected.bookingId)}
                    className="flex-1 py-2 bg-[#1D4ED8] text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-[#1E40AF]"
                  >
                    Thanh toán VNPay
                  </button>
                )}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-2 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Dữ liệu từ <code className="text-[10px]">GET /api/renter/payments</code> và booking chờ thanh toán.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
