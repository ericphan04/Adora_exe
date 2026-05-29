import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { OwnerDashboardDto } from '../types/dashboard';
import { BillboardDto } from '../types/billboard';
import { BookingDto } from '../types/booking';

export interface CreateBillboardRequest {
  title: string;
  description: string;
  address: string;
  formattedAddress: string;
  addressDetail?: string;
  ward?: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  resolution: string;
  brightness: string;
  refreshRate: string;
  screenType: string;
  operatingHours: string;
  pricePerDay: number;
  pricePerMonth: number;
  locationSurcharge: number;
  categoryId: number;
  features: string[];
}

const ownerApi = {
  getDashboardData: (): Promise<ApiResponse<OwnerDashboardDto>> => {
    return axiosClient.get('/api/owner/dashboard');
  },
  getMyBillboards: (): Promise<ApiResponse<BillboardDto[]>> => {
    return axiosClient.get('/api/owner/billboards');
  },
  createBillboard: (data: CreateBillboardRequest): Promise<ApiResponse<BillboardDto>> => {
    return axiosClient.post('/api/owner/billboards', data);
  },
  updateBillboard: (id: number, data: Partial<CreateBillboardRequest>): Promise<ApiResponse<BillboardDto>> => {
    return axiosClient.put(`/api/owner/billboards/${id}`, data);
  },
  deleteBillboard: (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/api/owner/billboards/${id}`);
  },
  addBillboardImage: (id: number, data: { imageUrl: string; isThumbnail: boolean }): Promise<ApiResponse<BillboardDto>> => {
    return axiosClient.post(`/api/owner/billboards/${id}/images`, data);
  },
  getBookings: (): Promise<ApiResponse<BookingDto[]>> => {
    return axiosClient.get('/api/owner/bookings');
  },
  acceptBooking: (id: number): Promise<ApiResponse<BookingDto>> => {
    return axiosClient.patch(`/api/owner/bookings/${id}/accept`);
  },
  rejectBooking: (id: number): Promise<ApiResponse<BookingDto>> => {
    return axiosClient.patch(`/api/owner/bookings/${id}/reject`);
  },
  setAvailability: (
    billboardId: number,
    data: {
      startDate: string;
      endDate: string;
      status: "AVAILABLE" | "BOOKED" | "BLOCKED";
    },
  ): Promise<ApiResponse<BillboardDto>> => {
    return axiosClient.post(
      `/api/owner/billboards/${billboardId}/availability`,
      data,
    );
  },
};

export default ownerApi;
