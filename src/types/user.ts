export type Role = 'ADMIN' | 'RENTER' | 'OWNER';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
  companyName?: string;
  createdAt?: string;
  updatedAt?: string;
}
