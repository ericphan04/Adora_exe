export type NotificationType =
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'BOOKING_PAID'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED';

export interface NotificationDto {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: number;
  paymentId?: number;
  read: boolean;
  createdAt: string;
}
