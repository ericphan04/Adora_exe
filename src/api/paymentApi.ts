import axiosClient from './axiosClient';
import { CreatePaymentRequest, PaymentDto } from '../types/payment';
import { ApiResponse } from '../types/api';

const paymentApi = {
  create: (data: CreatePaymentRequest): Promise<ApiResponse<string>> => {
    return axiosClient.post('/api/renter/payments', data);
  },
  getById: (id: number): Promise<ApiResponse<PaymentDto>> => {
    return axiosClient.get(`/api/renter/payments/${id}`);
  },
};

export default paymentApi;
