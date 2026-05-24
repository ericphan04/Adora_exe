import { User } from './user';

export type ReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

export interface ReportDto {
  id: number;
  reporter?: User;
  targetType: string;
  targetId: number;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export interface CreateReportRequest {
  targetType: 'BILLBOARD' | 'USER';
  targetId: number;
  reason: string;
}
