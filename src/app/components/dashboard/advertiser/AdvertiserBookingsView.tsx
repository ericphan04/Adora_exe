import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  Eye,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { DataTable } from "../../DataTable";
import { StatusBadge } from "../../StatusBadge";
import { BookingDto } from "../../../../types/booking";
import { formatAdvertiserDate, mapBookingStatus } from "../../../utils/advertiser";
import { KpiCard } from "../../KpiCard";

interface AdvertiserBookingsViewProps {
  bookings: BookingDto[];
  onCancelBooking: (id: number) => void;
  onPayBooking: (id: number) => void;
  onReviewBooking: (id: number) => void;
  onReportBooking: (bookingId: number, billboardId: number | null) => void;
}

export function AdvertiserBookingsView({
  bookings,
  onCancelBooking,
  onPayBooking,
  onReviewBooking,
  onReportBooking,
}: AdvertiserBookingsViewProps) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      active: bookings.filter((b) => b.status === "PAID").length,
      cancelled: bookings.filter((b) =>
        ["CANCELLED", "REJECTED"].includes(b.status),
      ).length,
    }),
    [bookings],
  );

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const kw = searchTerm.toLowerCase();
      const matchKw =
        !kw ||
        b.billboard?.title?.toLowerCase().includes(kw) ||
        b.note?.toLowerCase().includes(kw) ||
        String(b.id).includes(kw);
      const matchSt = !statusFilter || b.status === statusFilter;
      return matchKw && matchSt;
    });
  }, [bookings, searchTerm, statusFilter]);

  const tableData = filteredBookings.map((b) => ({
    id: b.id,
    billboardId: b.billboard?.id,
    code: `#${b.id}`,
    billboard: b.billboard?.title ?? "—",
    location: b.billboard
      ? `${b.billboard.district}, ${b.billboard.city}`
      : "—",
    startDate: formatAdvertiserDate(b.startDate),
    endDate: formatAdvertiserDate(b.endDate),
    status: b.status,
    rawStatus: b.status,
    payment: b.finalAmount.toLocaleString("vi-VN") + "₫",
  }));

  const columns = [
    {
      key: "code",
      label: "Mã đặt chỗ",
      className: "font-mono text-xs text-muted-foreground",
      render: (v: string) => <span>{v}</span>,
    },
    {
      key: "billboard",
      label: "Bảng QC",
      className: "font-semibold text-primary",
      render: (v: string) => <span>{v}</span>,
    },
    { key: "location", label: "Vị trí", className: "text-foreground" },
    {
      key: "time",
      label: "Thời gian",
      className: "text-xs text-muted-foreground",
      render: (_: unknown, row: { startDate: string; endDate: string }) => (
        <span>
          {row.startDate} – {row.endDate}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (v: string) => {
        const { variant, label } = mapBookingStatus(v);
        return <StatusBadge variant={variant} label={label} />;
      },
    },
    {
      key: "payment",
      label: "Tổng tiền",
      className: "font-bold text-primary",
      render: (v: string) => <span>{v}</span>,
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (_: unknown, row: { id: number; rawStatus: string; billboardId?: number }) => (
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1">
          <button
            type="button"
            className="flex-shrink-0 w-7 h-7 rounded-md hover:bg-surface/50 flex items-center justify-center text-muted-foreground cursor-pointer"
            title="Chi tiết bảng QC"
            onClick={() =>
              row.billboardId
                ? navigate(`/billboard/${row.billboardId}`)
                : navigate("/billboards")
            }
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {row.rawStatus === "PENDING" && (
            <button
              type="button"
              onClick={() => onCancelBooking(row.id)}
              className="flex-shrink-0 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700 hover:bg-red-100 transition-colors whitespace-nowrap"
            >
              Hủy
            </button>
          )}
          {row.rawStatus === "ACCEPTED" && (
            <button
              type="button"
              onClick={() => onPayBooking(row.id)}
              className="flex-shrink-0 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap"
            >
              Thanh toán
            </button>
          )}
          {(row.rawStatus === "PAID" || row.rawStatus === "COMPLETED") && (
            <button
              type="button"
              onClick={() => onReviewBooking(row.id)}
              className="flex-shrink-0 rounded-2xl border border-sky-100 bg-sky-50 px-3 py-2 text-[10px] font-semibold text-sky-700 hover:bg-sky-100 transition-colors whitespace-nowrap"
            >
              Đánh giá
            </button>
          )}
          {row.billboardId && (
            <button
              type="button"
              onClick={() => onReportBooking(row.id, row.billboardId)}
              className="flex-shrink-0 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors whitespace-nowrap"
            >
              Khiếu nại
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Tổng đặt chỗ"
          value={String(stats.total)}
          icon={<BookOpen className="w-5 h-5" />}
        />
        <KpiCard
          title="Chờ duyệt"
          value={String(stats.pending)}
          icon={<Clock className="w-5 h-5" />}
        />
        <KpiCard
          title="Đang chạy"
          value={String(stats.active)}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <KpiCard
          title="Đã hủy / từ chối"
          value={String(stats.cancelled)}
          changeType="down"
          icon={<XCircle className="w-5 h-5" />}
        />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm đặt chỗ của bạn..."
              className="w-full pl-10 pr-4 py-2 bg-surface/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-surface/30 border border-border rounded-lg px-3 py-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-primary text-sm cursor-pointer"
            >
              <option className="bg-card text-foreground" value="">Tất cả trạng thái</option>
              <option className="bg-card text-foreground" value="PENDING">Chờ duyệt</option>
              <option className="bg-card text-foreground" value="ACCEPTED">Chờ thanh toán</option>
              <option className="bg-card text-foreground" value="PAID">Đang hoạt động</option>
              <option className="bg-card text-foreground" value="COMPLETED">Hoàn thành</option>
              <option className="bg-card text-foreground" value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
        {filteredBookings.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm font-semibold">
            Chưa có đặt chỗ nào.
          </div>
        ) : (
          <DataTable columns={columns} data={tableData} />
        )}
      </div>
    </div>
  );
}
