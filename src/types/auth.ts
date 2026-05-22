import { User } from './user';

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  role: 'RENTER' | 'OWNER';
  companyName?: string;
}
