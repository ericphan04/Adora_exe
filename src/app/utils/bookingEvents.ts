import { BookingDto } from "../../types/booking";
import { daysInMonth, toIsoDate } from "./calendar";

export type MonthBookingEvent = {
  day: number;
  title: string;
  color: string;
};

/** Booking start/end markers for a given calendar month */
export function getBookingMonthEvents(
  bookings: BookingDto[],
  year: number,
  month: number,
): MonthBookingEvent[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  const events: MonthBookingEvent[] = [];
  const seenIds = new Set<number>();

  bookings
    .filter((b) => !["CANCELLED", "REJECTED"].includes(b.status))
    .forEach((b) => {
      if (seenIds.has(b.id)) return;
      seenIds.add(b.id);

      if (b.startDate?.startsWith(prefix)) {
        const day = parseInt(b.startDate.split("-")[2], 10);
        if (!isNaN(day)) {
          events.push({
            day,
            title: `${b.billboard?.title || b.renter?.fullName || "Đặt chỗ"} — bắt đầu`,
            color: "bg-[#3B82F6]",
          });
        }
      }
      if (b.endDate?.startsWith(prefix)) {
        const day = parseInt(b.endDate.split("-")[2], 10);
        if (!isNaN(day)) {
          events.push({
            day,
            title: `${b.billboard?.title || b.renter?.fullName || "Đặt chỗ"} — kết thúc`,
            color: "bg-emerald-500",
          });
        }
      }
    });

  return events.sort((a, b) => a.day - b.day);
}

/** Days in month covered by any active booking */
export function getBookedDaysFromBookings(
  bookings: BookingDto[],
  year: number,
  month: number,
  billboardId?: number,
): Set<number> {
  const booked = new Set<number>();
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;

  bookings
    .filter(
      (b) =>
        !["CANCELLED", "REJECTED"].includes(b.status) &&
        (billboardId == null || b.billboard?.id === billboardId),
    )
    .forEach((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      const total = daysInMonth(year, month);
      for (let d = 1; d <= total; d++) {
        const iso = toIsoDate(year, month, d);
        if (!iso.startsWith(prefix)) continue;
        const cur = new Date(iso);
        if (cur >= start && cur <= end) booked.add(d);
      }
    });

  return booked;
}
