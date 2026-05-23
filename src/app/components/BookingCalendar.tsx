import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  WEEKDAY_LABELS,
  buildMonthGrid,
  formatMonthTitle,
  shiftMonth,
} from "../utils/calendar";

interface BookingCalendarProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  bookedDays: Set<number>;
  selectedStartDay: number | null;
  selectedEndDay: number | null;
  onDayClick: (day: number) => void;
  compact?: boolean;
}

export function BookingCalendar({
  year,
  month,
  onMonthChange,
  bookedDays,
  selectedStartDay,
  selectedEndDay,
  onDayClick,
  compact = false,
}: BookingCalendarProps) {
  const cells = buildMonthGrid(year, month);
  const cellH = compact ? "h-10" : "h-14";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => {
            const prev = shiftMonth(year, month, -1);
            onMonthChange(prev.year, prev.month);
          }}
          className="w-8 h-8 rounded-lg border border-[#E3E8EF] flex items-center justify-center hover:bg-slate-50 cursor-pointer"
          aria-label="Tháng trước"
        >
          <ChevronLeft className="w-4 h-4 text-[#6B7A8D]" />
        </button>
        <p className="text-sm text-[#1D4ED8] font-semibold">
          Lịch đặt chỗ — {formatMonthTitle(year, month)}
        </p>
        <button
          type="button"
          onClick={() => {
            const next = shiftMonth(year, month, 1);
            onMonthChange(next.year, next.month);
          }}
          className="w-8 h-8 rounded-lg border border-[#E3E8EF] flex items-center justify-center hover:bg-slate-50 cursor-pointer"
          aria-label="Tháng sau"
        >
          <ChevronRight className="w-4 h-4 text-[#6B7A8D]" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-1 text-[#6B7A8D] font-medium">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (cell.day == null) {
            return <div key={i} className={cellH} />;
          }

          const isBooked = bookedDays.has(cell.day);
          const isPast = cell.isPast ?? false;
          const isSelected =
            selectedStartDay != null &&
            (selectedEndDay != null
              ? cell.day >= selectedStartDay && cell.day <= selectedEndDay
              : cell.day === selectedStartDay);

          const disabled = isBooked || isPast;

          return (
            <div
              key={i}
              role="button"
              tabIndex={disabled ? -1 : 0}
              onClick={() => !disabled && onDayClick(cell.day!)}
              onKeyDown={(e) => {
                if (!disabled && (e.key === "Enter" || e.key === " ")) {
                  onDayClick(cell.day!);
                }
              }}
              className={`${cellH} rounded-lg flex flex-col items-center justify-center gap-0.5 border transition-all ${
                isPast
                  ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                  : isBooked
                    ? "bg-red-50 border-red-200 cursor-not-allowed"
                    : isSelected
                      ? "bg-blue-50 border-blue-400 ring-2 ring-blue-400/20 cursor-pointer"
                      : "bg-emerald-50 border-emerald-200 cursor-pointer hover:bg-emerald-100"
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  isPast
                    ? "text-slate-300"
                    : isBooked
                      ? "text-red-700"
                      : isSelected
                        ? "text-blue-700"
                        : "text-emerald-800"
                }`}
              >
                {cell.day}
              </span>
              {!compact && !isPast && (
                <span
                  className={`text-[9px] px-1 py-px rounded font-semibold ${
                    isBooked
                      ? "bg-red-100 text-red-600"
                      : isSelected
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isBooked ? "BẬN" : isSelected ? "CHỌN" : "TRỐNG"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-[#6B7A8D]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
          Trống
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" />
          Đang chọn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-300" />
          Đã đặt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
          Đã qua
        </span>
      </div>
    </div>
  );
}
