export type NotificationType =
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'BOOKING_PAID'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED';

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  bookingId?: number;
  paymentId?: number;
  isRead: boolean;
  createdAt: string;
}
