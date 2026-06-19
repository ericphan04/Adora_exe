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

export function parseBookingTime(startDateStr: string, endDateStr: string) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  const startHour = start.getHours();
  const startMin = start.getMinutes();
  const endHour = end.getHours();
  const endMin = end.getMinutes();
  
  const isDaily = startHour === 0 && startMin === 0 && endHour === 0 && endMin === 0;
  
  const formatDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const formatTime = (d: Date) => {
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };
  
  if (isDaily) {
    // For end date, subtract 1 day to show the actual final rental day because backend stores T00:00:00 of next day
    const actualEnd = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    const startFmt = formatDate(start);
    const endFmt = formatDate(actualEnd);
    const days = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    
    return {
      isDaily: true,
      modeLabel: "Theo Ngày",
      modeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      timeLabel: startFmt === endFmt ? startFmt : `${startFmt} - ${endFmt}`,
      detailLabel: startFmt === endFmt ? `${startFmt} (1 ngày)` : `${startFmt} - ${endFmt} (${days} ngày)`
    };
  } else {
    const dateFmt = formatDate(start);
    const startVal = formatTime(start);
    const endVal = formatTime(end);
    const hours = Math.round((end.getTime() - start.getTime()) / (60 * 60 * 1000));
    
    return {
      isDaily: false,
      modeLabel: "Theo Giờ",
      modeColor: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
      timeLabel: `${dateFmt} (${startVal} - ${endVal})`,
      detailLabel: `${dateFmt} • Khung giờ: ${startVal} - ${endVal} (${hours} giờ)`
    };
  }
}

