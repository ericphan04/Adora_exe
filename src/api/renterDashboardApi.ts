import axiosClient from './axiosClient';
import { RenterDashboardDto } from '../types/dashboard';
import { ApiResponse } from '../types/api';

const renterDashboardApi = {
  get: (): Promise<ApiResponse<RenterDashboardDto>> => {
    return axiosClient.get('/api/renter/dashboard');
  },
};

export default renterDashboardApi;
