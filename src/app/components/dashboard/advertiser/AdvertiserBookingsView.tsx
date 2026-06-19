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
  MapPin,
} from "lucide-react";
import { DataTable } from "../../DataTable";
import { StatusBadge } from "../../StatusBadge";
import { BookingDto } from "../../../../types/booking";
import { formatAdvertiserDate, mapBookingStatus } from "../../../utils/advertiser";
import { parseBookingTime } from "../../../utils/calendar";
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
  const [selectedBooking, setSelectedBooking] = useState<BookingDto | null>(null);

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

  const tableData = filteredBookings.map((b) => {
    const timeInfo = parseBookingTime(b.startDate, b.endDate);
    return {
      id: b.id,
      billboardId: b.billboard?.id,
      code: `#${b.id}`,
      billboard: b.billboard?.title ?? "—",
      location: b.billboard
        ? `${b.billboard.district}, ${b.billboard.city}`
        : "—",
      mode: timeInfo.modeLabel,
      modeColor: timeInfo.modeColor,
      time: timeInfo.timeLabel,
      status: b.status,
      rawStatus: b.status,
      payment: b.finalAmount.toLocaleString("vi-VN") + "₫",
      rawBooking: b,
    };
  });

  const columns = [
    {
      key: "code",
      label: "Mã đặt chỗ",
      className: "font-mono text-xs text-muted-foreground",
      render: (v: string) => <span>{v}</span>,
    },
    {
      key: "billboard",
      label: "Bảng QC / Vị trí",
      className: "font-semibold text-primary",
      render: (v: string, row: any) => (
        <div>
          <span 
            className="block font-bold hover:text-primary transition-colors cursor-pointer" 
            onClick={() => setSelectedBooking(row.rawBooking)}
          >
            {v}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-0.5">{row.location}</span>
        </div>
      ),
    },
    {
      key: "mode",
      label: "Hình thức",
      render: (v: string, row: any) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.modeColor}`}>
          {v}
        </span>
      ),
    },
    {
      key: "time",
      label: "Thời gian thuê",
      className: "text-xs text-foreground font-medium",
      render: (v: string) => <span>{v}</span>,
    },
    {
      key: "payment",
      label: "Tổng tiền",
      className: "font-bold text-primary",
      render: (v: string) => <span>{v}</span>,
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
      key: "actions",
      label: "Thao tác",
      render: (_: unknown, row: any) => (
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1">
          <button
            type="button"
            className="flex-shrink-0 w-7 h-7 rounded-md hover:bg-surface flex items-center justify-center text-muted-foreground cursor-pointer border border-border/40"
            title="Chi tiết đơn đặt"
            onClick={() => setSelectedBooking(row.rawBooking)}
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

      {/* ====== BOOKING DETAIL MODAL ====== */}
      {selectedBooking && (() => {
        const timeInfo = parseBookingTime(selectedBooking.startDate, selectedBooking.endDate);
        const { variant, label } = mapBookingStatus(selectedBooking.status);
        const bb = selectedBooking.billboard;
        const thumb = bb?.images?.find(i => i.isThumbnail)?.imageUrl || bb?.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1572945281861-68b1227368e5?w=600";
        
        return (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedBooking(null)}
          >
            <div 
              className="bg-card text-card-foreground rounded-3xl max-w-2xl w-full border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    #{selectedBooking.id}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">Chi Tiết Đơn Đặt Chỗ</h3>
                    <p className="text-xs text-muted-foreground">Khởi tạo ngày: {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleDateString("vi-VN") : "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${timeInfo.modeColor}`}>
                    {timeInfo.modeLabel}
                  </span>
                  <StatusBadge variant={variant} label={label} />
                </div>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Billboard section */}
                {bb && (
                  <div className="flex gap-4 items-start p-4 bg-surface/50 border border-border/40 rounded-2xl">
                    <img src={thumb} alt={bb.title} className="w-24 h-16 object-cover rounded-xl border border-border/50 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-foreground text-sm line-clamp-1">{bb.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" /> {bb.district}, {bb.city}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">Kích thước: {bb.width}m × {bb.height}m | {bb.screenType}</p>
                    </div>
                  </div>
                )}

                {/* Rental details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-border/40 rounded-2xl space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Thời gian thuê</h5>
                    <p className="text-sm font-bold text-foreground">{timeInfo.detailLabel}</p>
                    <p className="text-xs text-muted-foreground">
                      Bắt đầu: {new Date(selectedBooking.startDate).toLocaleString("vi-VN")}<br/>
                      Kết thúc: {new Date(selectedBooking.endDate).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <div className="p-4 border border-border/40 rounded-2xl space-y-2">
                    <h5 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Ghi chú từ khách hàng</h5>
                    <p className="text-xs text-foreground italic leading-relaxed bg-muted/40 p-2.5 rounded-xl border border-border/20">
                      {selectedBooking.note ? `"${selectedBooking.note}"` : "Không có ghi chú."}
                    </p>
                  </div>
                </div>

                {/* Financial invoice breakdown */}
                <div className="p-5 border border-border/55 rounded-2xl space-y-3">
                  <h5 className="text-xs font-bold text-primary uppercase tracking-wider">Chi Tiết Thanh Toán</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Giá thuê ({timeInfo.isDaily ? "ngày" : "giờ"})</span>
                      <span className="font-semibold text-foreground">
                        {timeInfo.isDaily 
                          ? `${(bb?.pricePerDay ?? 0).toLocaleString("vi-VN")}₫ / ngày`
                          : `${(selectedBooking.totalPrice / Math.round((new Date(selectedBooking.endDate).getTime() - new Date(selectedBooking.startDate).getTime()) / (60 * 60 * 1000))).toLocaleString("vi-VN")}₫ / giờ`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Tạm tính tiền thuê</span>
                      <span className="font-semibold text-foreground">{selectedBooking.totalPrice.toLocaleString("vi-VN")}₫</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Phí dịch vụ hệ thống</span>
                      <span className="font-semibold text-foreground">{selectedBooking.serviceFee.toLocaleString("vi-VN")}₫</span>
                    </div>
                    {selectedBooking.locationSurcharge > 0 && (
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Phụ phí vị trí</span>
                        <span className="font-semibold text-foreground">{selectedBooking.locationSurcharge.toLocaleString("vi-VN")}₫</span>
                      </div>
                    )}
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-foreground">Tổng số tiền thanh toán</span>
                      <span className="font-extrabold text-base text-primary">{selectedBooking.finalAmount.toLocaleString("vi-VN")}₫</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-border bg-muted/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-surface cursor-pointer"
                >
                  Đóng
                </button>
                {selectedBooking.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => { onCancelBooking(selectedBooking.id); setSelectedBooking(null); }}
                    className="rounded-xl bg-destructive text-white px-4 py-2 text-xs font-bold hover:bg-destructive/90 cursor-pointer"
                  >
                    Hủy Đặt Chỗ
                  </button>
                )}
                {selectedBooking.status === "ACCEPTED" && (
                  <button
                    type="button"
                    onClick={() => { onPayBooking(selectedBooking.id); setSelectedBooking(null); }}
                    className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                  >
                    Thanh Toán Ngay
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
