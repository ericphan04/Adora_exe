import { PaymentDto } from "../../types/payment";
import { formatAdvertiserDate } from "./advertiser";

export function paymentsToInvoices(
  payments: PaymentDto[],
  bookings?: { id: number; note?: string; billboard?: { title: string } }[],
) {
  const bookingsMap = new Map(bookings?.map((b) => [b.id, b]) ?? []);

  return payments.map((p) => {
    const booking = bookingsMap.get(p.bookingId);
    const amountVal = p.amount ?? 0;
    return {
      id: `PAY-${p.id}`,
      paymentId: p.id,
      bookingId: p.bookingId,
      campaign: booking?.note || booking?.billboard?.title || `Booking #${p.bookingId}`,
      billboard: booking?.billboard?.title ?? `Đặt chỗ #${p.bookingId}`,
      createdAt: formatAdvertiserDate(p.createdAt ?? p.paidAt),
      dueAt: formatAdvertiserDate(p.paidAt),
      total: amountVal,
      totalLabel: amountVal.toLocaleString("vi-VN") + "₫",
      transactionCode: p.transactionCode,
      status:
        p.paymentStatus === "SUCCESS"
          ? ("paid" as const)
          : p.paymentStatus === "FAILED"
            ? ("overdue" as const)
            : ("pending" as const),
    };
  });
}
