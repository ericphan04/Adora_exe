import { BookingDto } from './booking';
import { BillboardDto } from './billboard';

export interface RenterDashboardDto {
  activeCampaigns: number;
  totalSpending: number;
  upcomingBookings: BookingDto[];
  savedBillboards: BillboardDto[];
  recentBookings: BookingDto[];
  campaignPerformance: Array<{
    [key: string]: any;
  }>;
}

export interface OwnerDashboardDto {
  totalBillboards: number;
  fillRate: number;
  monthlyRevenue: number;
  pendingRequests: number;
  revenueTrend: Array<{
    [key: string]: any;
  }>;
  recentBookingRequests: BookingDto[];
}

export interface AdminDashboardDto {
  totalUsers: number;
  totalBillboards: number;
  totalGMV: number;
  commissionRevenue: number;
  pendingBillboards: number;
  pendingReports: number;
  gmvChart: Array<{
    [key: string]: any;
  }>;
  bookingChart: Array<{
    [key: string]: any;
  }>;
}
