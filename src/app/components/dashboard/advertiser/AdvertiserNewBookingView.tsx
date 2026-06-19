import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Calendar,
  Monitor,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "../../StatusBadge";
import { BookingDto } from "../../../../types/booking";
import { BillboardDto } from "../../../../types/billboard";
import {
  countAvailableDaysInMonth,
  filterAvailableBillboards,
} from "../../../utils/availability";
import { formatMonthTitle, getTodayParts } from "../../../utils/calendar";
import billboardApi from "../../../../api/billboardApi";

interface AdvertiserNewBookingViewProps {
  bookings: BookingDto[];
}

export function AdvertiserNewBookingView({ bookings }: AdvertiserNewBookingViewProps) {
  const navigate = useNavigate();
  const { year, month } = getTodayParts();

  const [allBillboards, setAllBillboards] = useState<BillboardDto[]>([]);
  const [billboardsLoading, setBillboardsLoading] = useState(true);
  const [billboardsError, setBillboardsError] = useState(false);
  const [billboardSearch, setBillboardSearch] = useState("");

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

  const defaultImg =
    "https://images.unsplash.com/photo-1572945281861-68b1227368e5?w=600";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] p-6 text-white shadow-md">
        <p className="text-sm text-blue-100 font-semibold">Đặt chỗ mới</p>
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
    </div>
  );
}
