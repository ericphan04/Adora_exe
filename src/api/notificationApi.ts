import axiosClient from './axiosClient';
import { NotificationDto } from '../types/notification';
import { ApiResponse } from '../types/api';

const notificationApi = {
  getAll: (): Promise<ApiResponse<NotificationDto[]>> => {
    return axiosClient.get('/api/me/notifications');
  },
  getUnreadCount: (): Promise<ApiResponse<number>> => {
    return axiosClient.get('/api/me/notifications/unread-count');
  },
  markAsRead: (id: number): Promise<ApiResponse<NotificationDto>> => {
    return axiosClient.patch(`/api/me/notifications/${id}/read`);
  },
  markAllAsRead: (): Promise<ApiResponse<void>> => {
    return axiosClient.patch('/api/me/notifications/read-all');
  },
};

export default notificationApi;
