/** Calendar helpers — month is 1-based (1 = January). Week starts Sunday (CN). */

export const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const MONTH_NAMES_VI = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export function getTodayParts() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

export function formatMonthTitle(year: number, month: number) {
  return `${MONTH_NAMES_VI[month - 1]}, ${year}`;
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function monthStartWeekday(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isPastDay(year: number, month: number, day: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cell = new Date(year, month - 1, day);
  cell.setHours(0, 0, 0, 0);
  return cell < today;
}

export function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export type CalendarCell = {
  day: number | null;
  isoDate?: string;
  isPast?: boolean;
};

export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const totalDays = daysInMonth(year, month);
  const offset = monthStartWeekday(year, month);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < offset; i++) {
    cells.push({ day: null });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({
      day: d,
      isoDate: toIsoDate(year, month, d),
      isPast: isPastDay(year, month, d),
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: null });
  }
  return cells;
}

export function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
