import React from "react";
import {
  WEEKDAY_LABELS,
  buildMonthGrid,
  formatMonthTitle,
  getTodayParts,
} from "../../utils/calendar";
import { MonthBookingEvent } from "../../utils/bookingEvents";

interface MiniMonthCalendarProps {
  events: MonthBookingEvent[];
  year?: number;
  month?: number;
}

export function MiniMonthCalendar({
  events,
  year: yearProp,
  month: monthProp,
}: MiniMonthCalendarProps) {
  const today = getTodayParts();
  const year = yearProp ?? today.year;
  const month = monthProp ?? today.month;
  const cells = buildMonthGrid(year, month);
  const eventByDay = new Map(events.map((e) => [e.day, e]));

  return (
    <div>
      <h3 className="text-[#1D4ED8] font-semibold mb-4">
        {formatMonthTitle(year, month)}
      </h3>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-1 text-[#6B7A8D]">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {cells.map((cell, i) => {
          if (cell.day == null) return <div key={i} className="py-1.5" />;
          const event = eventByDay.get(cell.day);
          return (
            <div
              key={i}
              title={event?.title}
              className={`py-1.5 rounded relative ${event ? "bg-[#F0F9FF] font-semibold" : ""} ${cell.isPast ? "text-[#94A3B8]" : "text-[#1A2332]"}`}
            >
              {cell.day}
              {event && (
                <span
                  className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${event.color}`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 space-y-2 max-h-[140px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-xs text-[#6B7A8D] italic text-center py-1">
            Không có sự kiện đặt chỗ trong tháng này.
          </p>
        ) : (
          events.slice(0, 6).map((e, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${e.color}`} />
              <span className="text-[#6B7A8D]">
                {e.day}/{month}
              </span>
              <span className="text-[#1A2332] truncate max-w-[170px] font-medium">
                {e.title}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
