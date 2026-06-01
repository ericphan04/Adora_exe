import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  Eye,
  MapPin,
  Calendar,
  Monitor,
  AlertTriangle,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { DataTable } from "../../DataTable";
import { StatusBadge } from "../../StatusBadge";
import { BookingDto } from "../../../../types/booking";
import { BillboardDto } from "../../../../types/billboard";
import { formatAdvertiserDate, mapBookingStatus } from "../../../utils/advertiser";
import {
  countAvailableDaysInMonth,
  filterAvailableBillboards,
} from "../../../utils/availability";
import { formatMonthTitle, getTodayParts } from "../../../utils/calendar";
import billboardApi from "../../../../api/billboardApi";
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
  const { year, month } = getTodayParts();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [billboardSearch, setBillboardSearch] = useState("");

  const [allBillboards, setAllBillboards] = useState<BillboardDto[]>([]);
  const [billboardsLoading, setBillboardsLoading] = useState(true);
  const [billboardsError, setBillboardsError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setBillboardsLoading(true);
      try {
        const res = await billboardApi.getAll();
        if (active && res.success && res.data) {
          setAllBillboards(res.data.filter((b) => b.status === "APPROVED"));
          setBillboardsError(false);
        } else {
          throw new Error("Failed");
        }
      } catch {
        if (active) {
          setBillboardsError(true);
          setAllBillboards([]);
        }
      } finally {
        if (active) setBillboardsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const availableBillboards = useMemo(() => {
    const list = filterAvailableBillboards(allBillboards, year, month, bookings);
    const kw = billboardSearch.toLowerCase();
    if (!kw) return list;
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(kw) ||
        b.district.toLowerCase().includes(kw) ||
        b.city.toLowerCase().includes(kw),
    );
  }, [allBillboards, bookings, billboardSearch, year, month]);

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

  const defaultImg =
    "https://images.unsplash.com/photo-1572945281861-68b1227368e5?w=600";

  return (
    <div className="space-y-8">
      {/* Available billboards */}
      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] p-6 text-white shadow-md">
          <p className="text-sm text-blue-100">Đặt chỗ mới</p>
          <h2 className="text-xl font-bold mt-1">
            Bảng QC đang trống — {formatMonthTitle(year, month)}
          </h2>
          <p className="text-sm text-blue-100/90 mt-2 max-w-2xl">
            Chọn bảng còn ngày trống trong tháng hiện tại để đặt chiến dịch. Lịch chi tiết
            và xác nhận ngày hiển thị trên trang từng bảng.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm bảng QC trống theo tên, quận..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              value={billboardSearch}
              onChange={(e) => setBillboardSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("/billboards")}
            className="px-4 py-2.5 rounded-xl border border-primary text-primary text-sm font-bold bg-card hover:bg-surface/50 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            Xem tất cả bảng QC
          </button>
        </div>

        {billboardsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-card rounded-xl border border-border/80 animate-pulse"
              />
            ))}
          </div>
        ) : billboardsError ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex gap-3 text-sm text-destructive">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Không tải được danh sách bảng QC</p>
              <p className="mt-1">Kiểm tra backend đang chạy và thử lại sau.</p>
            </div>
          </div>
        ) : availableBillboards.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-foreground">
              Không có bảng trống trong {formatMonthTitle(year, month)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Thử tháng khác trên trang chi tiết bảng hoặc xem marketplace.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableBillboards.map((bb) => {
              const thumb =
                bb.images?.find((i) => i.isThumbnail)?.imageUrl ||
                bb.images?.[0]?.imageUrl ||
                defaultImg;
              const freeDays = countAvailableDaysInMonth(
                bb.availabilities,
                year,
                month,
                bookings,
                bb.id,
              );
              return (
                <article
                  key={bb.id}
                  className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="relative h-40">
                    <img
                      src={thumb}
                      alt={bb.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3">
                      <StatusBadge variant="available" label="Còn trống" />
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-foreground line-clamp-1">
                      {bb.title}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {bb.district}, {bb.city}
                    </p>
                    <p className="text-xs text-emerald-600 font-bold">
                      {freeDays} ngày trống còn lại trong tháng
                    </p>
                    <p className="text-sm font-extrabold text-primary">
                      {(bb.pricePerDay / 1_000_000).toLocaleString("vi-VN")} Tr₫ / ngày
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate(`/billboard/${bb.id}`)}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-md shadow-primary/10 transition-all active:scale-95 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      Chọn ngày & đặt chỗ
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* My bookings */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-primary">Đặt chỗ của tôi</h3>
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
              Chưa có đặt chỗ nào. Hãy chọn bảng QC trống ở trên để bắt đầu.
            </div>
          ) : (
            <DataTable columns={columns} data={tableData} />
          )}
        </div>
      </section>
    </div>
  );
}
