import axiosClient from './axiosClient';
import { CreateReviewRequest, ReviewDto } from '../types/review';
import { ApiResponse } from '../types/api';

const reviewApi = {
  create: (data: CreateReviewRequest): Promise<ApiResponse<ReviewDto>> => {
    return axiosClient.post('/api/renter/reviews', data);
  },
};

export default reviewApi;
