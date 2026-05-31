import axiosClient from './axiosClient';
import { ChangePasswordRequest, LoginRequest, LoginResponse, RegisterRequest, VerifyEmailRequest, ResendCodeRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth';
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
  verifyEmail: (data: VerifyEmailRequest): Promise<ApiResponse<void>> => {
    return axiosClient.post('/api/auth/verify', data);
  },
  resendCode: (data: ResendCodeRequest): Promise<ApiResponse<void>> => {
    return axiosClient.post('/api/auth/resend-code', data);
  },
  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    return axiosClient.post('/api/auth/change-password', data);
  },
  forgotPassword: (data: ForgotPasswordRequest): Promise<ApiResponse<void>> => {
    return axiosClient.post('/api/auth/forgot-password', data);
  },
  resetPassword: (data: ResetPasswordRequest): Promise<ApiResponse<void>> => {
    return axiosClient.post('/api/auth/reset-password', data);
  },
};

export default authApi;
