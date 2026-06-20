import { User } from './user';

export type BillboardStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'HIDDEN';

export interface BillboardCategoryDto {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
}

export interface BillboardImageDto {
  id: number;
  imageUrl: string;
  isThumbnail: boolean;
}

export interface BillboardFeatureDto {
  id: number;
  name: string;
}

export interface BillboardAvailabilityDto {
  id: number;
  availableDate: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
}

export interface BillboardDto {
  id: number;
  owner?: User;
  category?: BillboardCategoryDto;
  title: string;
  description: string;
  address: string;
  formattedAddress: string;
  addressDetail?: string;
  ward?: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  demoVideoUrl?: string;
  width: number;
  height: number;
  resolution: string;
  brightness: number;
  refreshRate: number;
  screenType: string;
  operatingHours: string;
  pricePerDay: number;
  pricePerMonth: number;
  locationSurcharge: number;
  premiumSurcharge?: number;
  status: BillboardStatus;

  dailyViews: number;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
  images: BillboardImageDto[];
  features: BillboardFeatureDto[];
  availabilities: BillboardAvailabilityDto[];
}
