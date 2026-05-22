import { User } from './user';

export interface ReviewDto {
  id: number;
  bookingId: number;
  renter?: User;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface CreateReviewRequest {
  bookingId: number;
  rating: number;
  comment: string;
}
