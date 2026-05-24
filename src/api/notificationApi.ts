import axiosClient from './axiosClient';
import { NotificationDto } from '../types/notification';
import { ApiResponse } from '../types/api';

const notificationApi = {
  getAll: (): Promise<ApiResponse<NotificationDto[]>> => {
    return axiosClient.get('/api/notifications');
  },
  getUnreadCount: (): Promise<ApiResponse<number>> => {
    return axiosClient.get('/api/notifications/unread-count');
  },
  markAsRead: (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.patch(`/api/notifications/${id}/read`);
  },
  markAllAsRead: (): Promise<ApiResponse<void>> => {
    return axiosClient.patch('/api/notifications/read-all');
  },
};

export default notificationApi;
