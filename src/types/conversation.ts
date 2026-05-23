import { User } from './user';
import { Role } from './user';

export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: Role;
  content: string;
  createdAt: string;
  mine: boolean;
}

export interface ConversationDto {
  id: number;
  renter?: User;
  owner?: User;
  peer?: User;
  bookingId?: number;
  bookingStatus?: string;
  billboardId?: number;
  billboardTitle?: string;
  lastMessagePreview?: string;
  lastMessageAt?: string;
  unreadCount: number;
  messages?: MessageDto[];
  createdAt?: string;
}

export interface CreateConversationRequest {
  ownerId?: number;
  renterId?: number;
  bookingId?: number;
  billboardId?: number;
  initialMessage?: string;
}

export interface SendMessageRequest {
  content: string;
}
