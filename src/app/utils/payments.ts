import { PaymentDto } from "../../types/payment";
import { formatAdvertiserDate } from "./advertiser";

export function paymentsToInvoices(payments: PaymentDto[]) {
  return payments.map((p) => ({
    id: `PAY-${p.id}`,
    paymentId: p.id,
    bookingId: p.bookingId,
    campaign: `Booking #${p.bookingId}`,
    billboard: `Đặt chỗ #${p.bookingId}`,
    createdAt: formatAdvertiserDate(p.createdAt ?? p.paidAt),
    dueAt: formatAdvertiserDate(p.paidAt),
    total: p.amount,
    totalLabel: p.amount.toLocaleString("vi-VN") + "₫",
    transactionCode: p.transactionCode,
    status:
      p.paymentStatus === "SUCCESS"
        ? ("paid" as const)
        : p.paymentStatus === "FAILED"
          ? ("overdue" as const)
          : ("pending" as const),
  }));
}
