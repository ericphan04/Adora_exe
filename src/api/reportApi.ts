import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { ReportDto, ReportStatus } from '../types/report';

const reportApi = {
  getReports: (status?: ReportStatus): Promise<ApiResponse<ReportDto[]>> => {
    return axiosClient.get('/api/admin/reports', { params: { status } });
  },
  resolveReport: (id: number): Promise<ApiResponse<ReportDto>> => {
    return axiosClient.patch(`/api/admin/reports/${id}/resolve`);
  },
  rejectReport: (id: number): Promise<ApiResponse<ReportDto>> => {
    return axiosClient.patch(`/api/admin/reports/${id}/reject`);
  },
  createReport: (data: { targetType: 'BILLBOARD' | 'USER'; targetId: number; reason: string }): Promise<ApiResponse<ReportDto>> => {
    return axiosClient.post('/api/reports', data);
  },
};

export default reportApi;
