import { BookingDto, BookingStatus } from "../../types/booking";
import { BillboardDto } from "../../types/billboard";

type BadgeVariant = "active" | "pending" | "booked" | "expired" | "available" | "unavailable";

export const mapBookingStatus = (
  status: string,
): { variant: BadgeVariant; label: string } => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return { variant: "pending", label: "Chờ duyệt" };
    case "ACCEPTED":
      return { variant: "booked", label: "Chờ thanh toán" };
    case "REJECTED":
      return { variant: "unavailable", label: "Bị từ chối" };
    case "CANCELLED":
      return { variant: "expired", label: "Đã hủy" };
    case "PAID":
      return { variant: "active", label: "Đang hoạt động" };
    case "COMPLETED":
      return { variant: "expired", label: "Hoàn thành" };
    default:
      return { variant: "expired", label: status };
  }
};

export const formatAdvertiserDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatVnd = (amount: number) => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("vi-VN")} Tr₫`;
  }
  return `${amount.toLocaleString("vi-VN")}₫`;
};

export function mergeBookings(...lists: BookingDto[][]): BookingDto[] {
  const map = new Map<number, BookingDto>();
  lists.flat().forEach((b) => map.set(b.id, b));
  return [...map.values()].sort(
    (a, b) =>
      new Date(b.createdAt ?? b.startDate).getTime() -
      new Date(a.createdAt ?? a.startDate).getTime(),
  );
}

export function bookingsToCampaigns(bookings: BookingDto[]) {
  const active = bookings.filter((b) =>
    ["PAID", "ACCEPTED", "PENDING"].includes(b.status),
  );
  return active.map((b) => {
    let status: "running" | "upcoming" | "finished" | "paused" = "upcoming";
    if (b.status === "PAID") status = "running";
    if (b.status === "PENDING") status = "upcoming";
    if (b.status === "COMPLETED" || b.status === "CANCELLED") status = "finished";
    if (b.status === "REJECTED") status = "paused";
    return {
      id: b.id,
      name: b.note || `Chiến dịch #${b.id}`,
      brand: b.billboard?.title ?? "Bảng QC",
      screens: b.billboard?.title ?? "—",
      location: b.billboard
        ? `${b.billboard.district}, ${b.billboard.city}`
        : "Đà Nẵng",
      startDate: formatAdvertiserDate(b.startDate),
      endDate: formatAdvertiserDate(b.endDate),
      budget: formatVnd(b.finalAmount),
      status,
      rawStatus: b.status,
    };
  });
}

export function bookingsToInvoices(bookings: BookingDto[]) {
  return bookings
    .filter((b) => ["PAID", "COMPLETED", "ACCEPTED"].includes(b.status))
    .map((b) => ({
      id: `INV-${b.id}`,
      bookingId: b.id,
      campaign: b.note || b.billboard?.title || `Booking #${b.id}`,
      billboard: b.billboard?.title ?? "—",
      createdAt: formatAdvertiserDate(b.createdAt ?? b.startDate),
      dueAt: formatAdvertiserDate(b.endDate),
      total: b.finalAmount,
      totalLabel: b.finalAmount.toLocaleString("vi-VN") + "₫",
      status:
        b.status === "PAID" || b.status === "COMPLETED"
          ? ("paid" as const)
          : b.status === "ACCEPTED"
            ? ("pending" as const)
            : ("pending" as const),
    }));
}

export function billboardAvailability(
  bb: BillboardDto,
): "available" | "booked" | "unavailable" {
  if (bb.status !== "APPROVED") return "unavailable";
  return "available";
}
