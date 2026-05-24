export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface PaymentDto {
  id: number;
  bookingId: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionCode: string;
  platformCommission: number;
  ownerRevenue: number;
  paidAt?: string;
  createdAt?: string;
}

export interface CreatePaymentRequest {
  bookingId: number;
  paymentMethod: string;
}
