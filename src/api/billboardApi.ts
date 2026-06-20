import axiosClient from './axiosClient';
import { BillboardDto } from '../types/billboard';
import { ReviewDto } from '../types/review';
import { ApiResponse } from '../types/api';

export interface BillboardFilters {
  keyword?: string;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  featured?: boolean;
  feature?: string;
}

const billboardApi = {
  getAll: (filters?: BillboardFilters): Promise<ApiResponse<BillboardDto[]>> => {
    return axiosClient.get('/api/billboards', { params: filters });
  },
  getFeatured: (): Promise<ApiResponse<BillboardDto[]>> => {
    return axiosClient.get('/api/billboards/featured');
  },
  getById: (id: number): Promise<ApiResponse<BillboardDto>> => {
    return axiosClient.get(`/api/billboards/${id}`);
  },
  getReviews: (id: number): Promise<ApiResponse<ReviewDto[]>> => {
    return axiosClient.get(`/api/billboards/${id}/reviews`);
  },
  getBookedSlots: (id: number, date: string): Promise<ApiResponse<{ startHour: number; endHour: number }[]>> => {
    return axiosClient.get(`/api/billboards/${id}/booked-slots`, { params: { date } });
  },
  getLandingPageConfig: (): Promise<ApiResponse<any>> => {
    return axiosClient.get('/api/landing-page/config');
  },
};

export default billboardApi;
