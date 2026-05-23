import { BillboardDto, BillboardAvailabilityDto } from "../../types/billboard";
import { BookingDto } from "../../types/booking";
import { toIsoDate, daysInMonth } from "./calendar";

export function getBookedDaysForMonth(
  availabilities: BillboardAvailabilityDto[] | undefined,
  year: number,
  month: number,
): Set<number> {
  const booked = new Set<number>();
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  (availabilities ?? []).forEach((av) => {
    if (
      av.availableDate.startsWith(prefix) &&
      (av.status === "BOOKED" || av.status === "BLOCKED")
    ) {
      const day = parseInt(av.availableDate.split("-")[2], 10);
      if (!isNaN(day)) booked.add(day);
    }
  });
  return booked;
}

/** Merge booking ranges into booked day set for a given month */
export function mergeBookingDaysIntoMonth(
  bookings: BookingDto[],
  billboardId: number,
  year: number,
  month: number,
  booked: Set<number>,
) {
  const total = daysInMonth(year, month);
  bookings
    .filter(
      (b) =>
        b.billboard?.id === billboardId &&
        !["CANCELLED", "REJECTED"].includes(b.status),
    )
    .forEach((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      for (let d = 1; d <= total; d++) {
        const iso = toIsoDate(year, month, d);
        const cur = new Date(iso);
        if (cur >= start && cur <= end) booked.add(d);
      }
    });
}

export function countAvailableDaysInMonth(
  availabilities: BillboardAvailabilityDto[] | undefined,
  year: number,
  month: number,
  extraBookings: BookingDto[] = [],
  billboardId?: number,
) {
  const total = daysInMonth(year, month);
  const booked = getBookedDaysForMonth(availabilities, year, month);
  if (billboardId != null) {
    mergeBookingDaysIntoMonth(extraBookings, billboardId, year, month, booked);
  }
  let available = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let d = 1; d <= total; d++) {
    const cell = new Date(year, month - 1, d);
    if (cell < today) continue;
    if (!booked.has(d)) available++;
  }
  return available;
}

/** Billboard has at least one future-available day this month */
export function isBillboardBookableInMonth(
  billboard: BillboardDto,
  year: number,
  month: number,
  allBookings: BookingDto[] = [],
) {
  if (billboard.status !== "APPROVED") return false;
  return (
    countAvailableDaysInMonth(
      billboard.availabilities,
      year,
      month,
      allBookings,
      billboard.id,
    ) > 0
  );
}

export function filterAvailableBillboards(
  billboards: BillboardDto[],
  year: number,
  month: number,
  allBookings: BookingDto[] = [],
) {
  return billboards.filter((b) =>
    isBillboardBookableInMonth(b, year, month, allBookings),
  );
}
