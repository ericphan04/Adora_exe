import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import {
  ConversationDto,
  CreateConversationRequest,
  MessageDto,
  SendMessageRequest,
} from '../types/conversation';

export type ConversationApiRole = 'renter' | 'owner' | 'admin';

function base(role: ConversationApiRole) {
  return `/api/${role}/conversations`;
}

export function conversationApiFor(role: ConversationApiRole) {
  const prefix = base(role);
  return {
    list: (): Promise<ApiResponse<ConversationDto[]>> =>
      axiosClient.get(prefix),
    getById: (id: number): Promise<ApiResponse<ConversationDto>> =>
      axiosClient.get(`${prefix}/${id}`),
    create: (data: CreateConversationRequest): Promise<ApiResponse<ConversationDto>> =>
      role === 'admin'
        ? Promise.reject(new Error('Admin cannot create conversations'))
        : axiosClient.post(prefix, data),
    sendMessage: (id: number, data: SendMessageRequest): Promise<ApiResponse<MessageDto>> =>
      axiosClient.post(`${prefix}/${id}/messages`, data),
    markRead: (id: number): Promise<ApiResponse<ConversationDto>> =>
      axiosClient.patch(`${prefix}/${id}/read`),
  };
}

export default conversationApiFor;
