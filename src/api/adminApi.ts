import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { AdminDashboardDto } from '../types/dashboard';
import { User, Role, UserStatus } from '../types/user';
import { BillboardDto } from '../types/billboard';
import { BookingDto } from '../types/booking';
import { PaymentDto } from '../types/payment';

export interface UserSearchFilters {
  keyword?: string;
  role?: Role;
  status?: UserStatus;
}

const adminApi = {
  getDashboardData: (): Promise<ApiResponse<AdminDashboardDto>> => {
    return axiosClient.get('/api/admin/dashboard');
  },
  getUsers: (filters?: UserSearchFilters): Promise<ApiResponse<User[]>> => {
    return axiosClient.get('/api/admin/users', { params: filters });
  },
  getUserById: (id: number): Promise<ApiResponse<User>> => {
    return axiosClient.get(`/api/admin/users/${id}`);
  },
  updateUserStatus: (id: number, status: UserStatus): Promise<ApiResponse<User>> => {
    return axiosClient.patch(`/api/admin/users/${id}/status`, { status });
  },
  getAllBillboards: (): Promise<ApiResponse<BillboardDto[]>> => {
    return axiosClient.get('/api/admin/billboards');
  },
  getPendingBillboards: (): Promise<ApiResponse<BillboardDto[]>> => {
    return axiosClient.get('/api/admin/billboards/pending');
  },
  approveBillboard: (id: number): Promise<ApiResponse<BillboardDto>> => {
    return axiosClient.patch(`/api/admin/billboards/${id}/approve`);
  },
  rejectBillboard: (id: number): Promise<ApiResponse<BillboardDto>> => {
    return axiosClient.patch(`/api/admin/billboards/${id}/reject`);
  },
  hideBillboard: (id: number): Promise<ApiResponse<BillboardDto>> => {
    return axiosClient.patch(`/api/admin/billboards/${id}/hide`);
  },
  deleteBillboard: (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/api/admin/billboards/${id}`);
  },
  getBookings: (): Promise<ApiResponse<BookingDto[]>> => {
    return axiosClient.get('/api/admin/bookings');
  },
  getBookingById: (id: number): Promise<ApiResponse<BookingDto>> => {
    return axiosClient.get(`/api/admin/bookings/${id}`);
  },
  getPayments: (): Promise<ApiResponse<PaymentDto[]>> => {
    return axiosClient.get('/api/admin/payments');
  },
};

export default adminApi;
