import axiosClient from './axiosClient';
import { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';
import { User } from '../types/user';
import { ApiResponse } from '../types/api';

const authApi = {
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return axiosClient.post('/api/auth/login', data);
  },
  register: (data: RegisterRequest): Promise<ApiResponse<User>> => {
    return axiosClient.post('/api/auth/register', data);
  },
  getCurrentUser: (): Promise<ApiResponse<User>> => {
    return axiosClient.get('/api/auth/me');
  },
  loginWithGoogle: (idToken: string): Promise<ApiResponse<LoginResponse>> => {
    return axiosClient.post('/api/auth/google', { idToken });
  },
};

export default authApi;
