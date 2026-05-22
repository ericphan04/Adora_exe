import axiosClient from './axiosClient';
import { BookingDto, CreateBookingRequest } from '../types/booking';
import { ApiResponse } from '../types/api';

const bookingApi = {
  create: (data: CreateBookingRequest): Promise<ApiResponse<BookingDto>> => {
    return axiosClient.post('/api/renter/bookings', data);
  },
  getRenterBookings: (): Promise<ApiResponse<BookingDto[]>> => {
    return axiosClient.get('/api/renter/bookings');
  },
  getById: (id: number): Promise<ApiResponse<BookingDto>> => {
    return axiosClient.get(`/api/renter/bookings/${id}`);
  },
  cancel: (id: number): Promise<ApiResponse<BookingDto>> => {
    return axiosClient.patch(`/api/renter/bookings/${id}/cancel`);
  },
};

export default bookingApi;
