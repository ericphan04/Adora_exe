import React, { useMemo, useState } from "react";
import { Calendar, Lock, Unlock } from "lucide-react";
import { BillboardDto } from "../../../types/billboard";
import { BookingDto } from "../../../types/booking";
import { BookingCalendar } from "../BookingCalendar";
import { getTodayParts, toIsoDate } from "../../utils/calendar";
import {
  getBookedDaysForMonth,
  mergeBookingDaysIntoMonth,
} from "../../utils/availability";
import ownerApi from "../../../api/ownerApi";
import { notify, apiErrorMessage } from "../../utils/notify";
import { useThemeContext } from "../../context/ThemeContext";

interface OwnerAvailabilityViewProps {
  billboards: BillboardDto[];
  bookings: BookingDto[];
  isUsingFallback: boolean;
  onUpdated: () => void;
}

export function OwnerAvailabilityView({
  billboards,
  bookings,
  isUsingFallback,
  onUpdated,
}: OwnerAvailabilityViewProps) {
  const { resolvedTheme } = useThemeContext();
  const today = getTodayParts();
  const [calendarYear, setCalendarYear] = useState(today.year);
  const [calendarMonth, setCalendarMonth] = useState(today.month);
  const [selectedBillboardId, setSelectedBillboardId] = useState<number | "">(
    billboards[0]?.id ?? "",
  );
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);
  const [blockMode, setBlockMode] = useState<"BLOCKED" | "AVAILABLE">("BLOCKED");
  const [submitting, setSubmitting] = useState(false);

  const selectedBillboard = billboards.find((b) => b.id === selectedBillboardId);

  const bookedDays = useMemo(() => {
    if (!selectedBillboard) return new Set<number>();
    const days = getBookedDaysForMonth(
      selectedBillboard.availabilities,
      calendarYear,
      calendarMonth,
    );
    mergeBookingDaysIntoMonth(
      bookings,
      selectedBillboard.id,
      calendarYear,
      calendarMonth,
      days,
    );
    return days;
  }, [selectedBillboard, bookings, calendarYear, calendarMonth]);

  const handleMonthChange = (year: number, month: number) => {
    setCalendarYear(year);
    setCalendarMonth(month);
    setRangeStart(null);
    setRangeEnd(null);
  };

  const handleDayClick = (day: number) => {
    if (rangeStart === null || (rangeStart !== null && rangeEnd !== null)) {
      setRangeStart(day);
      setRangeEnd(null);
      return;
    }
    if (day < rangeStart) {
      setRangeStart(day);
      setRangeEnd(null);
    } else {
      setRangeEnd(day);
    }
  };

  const handleApply = async () => {
    if (!selectedBillboard || rangeStart == null || rangeEnd == null) {
      notify.error("Chọn bảng QC và khoảng ngày trên lịch.");
      return;
    }
    if (isUsingFallback) {
      notify.info("Chế độ mô phỏng — cần backend để lưu lịch trống.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await ownerApi.setAvailability(selectedBillboard.id, {
        startDate: toIsoDate(calendarYear, calendarMonth, rangeStart),
        endDate: toIsoDate(calendarYear, calendarMonth, rangeEnd),
        status: blockMode,
      });
      if (res.success) {
        notify.success(
          blockMode === "BLOCKED"
            ? "Đã chặn lịch thành công"
            : "Đã mở lịch thành công",
        );
        setRangeStart(null);
        setRangeEnd(null);
        onUpdated();
      } else {
        notify.error(res.message || "Không thể cập nhật lịch.");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi cập nhật lịch."));
    } finally {
      setSubmitting(false);
    }
  };

  if (billboards.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Bạn chưa có bảng QC nào. Thêm bảng trong mục &quot;Bảng QC của tôi&quot;.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] rounded-2xl p-6 text-white">
        <p className="text-sm text-blue-100">Quản lý lịch trống</p>
        <h2 className="text-xl font-bold mt-1">Chặn hoặc mở ngày cho từng bảng QC</h2>
        <p className="text-sm text-blue-100/90 mt-2 max-w-2xl">
          Chọn bảng, khoảng ngày trên lịch và trạng thái. Dữ liệu đồng bộ với marketplace
          và đặt chỗ của nhà quảng cáo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <label className="text-xs font-semibold text-muted-foreground block mb-2">
            Bảng quảng cáo
          </label>
          <select
            value={selectedBillboardId}
            onChange={(e) => {
              setSelectedBillboardId(Number(e.target.value));
              setRangeStart(null);
              setRangeEnd(null);
            }}
            className="w-full mb-6 px-3 py-2.5 border border-border rounded-lg text-sm cursor-pointer bg-card text-foreground focus:outline-none focus:border-primary"
          >
            {billboards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} — {b.district}
              </option>
            ))}
          </select>

          <BookingCalendar
            year={calendarYear}
            month={calendarMonth}
            onMonthChange={handleMonthChange}
            bookedDays={bookedDays}
            selectedStartDay={rangeStart}
            selectedEndDay={rangeEnd}
            onDayClick={handleDayClick}
          />
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4 h-fit">
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Thao tác
          </h3>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setBlockMode("BLOCKED")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold cursor-pointer transition-colors ${
                blockMode === "BLOCKED"
                  ? "border-red-300 bg-red-50 text-red-700 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-400"
                  : "border-border text-muted-foreground hover:bg-muted/55"
              }`}
            >
              <Lock className="w-4 h-4" />
              Chặn (không cho đặt)
            </button>
            <button
              type="button"
              onClick={() => setBlockMode("AVAILABLE")}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-semibold cursor-pointer transition-colors ${
                blockMode === "AVAILABLE"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-950/40 dark:bg-emerald-950/20 dark:text-emerald-400"
                  : "border-border text-muted-foreground hover:bg-muted/55"
              }`}
            >
              <Unlock className="w-4 h-4" />
              Mở trống
            </button>
          </div>

          {rangeStart != null && rangeEnd != null && (
            <p className="text-xs text-muted-foreground">
              Khoảng: {rangeStart}/{calendarMonth}/{calendarYear} – {rangeEnd}/
              {calendarMonth}/{calendarYear}
            </p>
          )}

          <button
            type="button"
            disabled={submitting || rangeStart == null || rangeEnd == null}
            onClick={handleApply}
            className="w-full py-3 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover disabled:opacity-50 cursor-pointer transition-colors"
          >
            {submitting ? "Đang lưu..." : "Áp dụng lên lịch"}
          </button>
        </div>
      </div>
    </div>
  );
}
