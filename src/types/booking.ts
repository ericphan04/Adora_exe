import { User } from './user';
import { BillboardDto } from './billboard';

export type BookingStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'PAID' | 'COMPLETED';

export interface BookingDto {
  id: number;
  renter?: User;
  billboard?: BillboardDto;
  startDate: string;
  endDate: string;
  totalPrice: number;
  serviceFee: number;
  locationSurcharge: number;
  finalAmount: number;
  status: BookingStatus;
  note?: string;
  spotPackage?: string;
  premiumSurcharge?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingRequest {
  billboardId: number;
  startDate: string;
  endDate: string;
  note?: string;
  spotPackage?: string;
}

