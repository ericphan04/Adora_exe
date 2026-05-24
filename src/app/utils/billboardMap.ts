import { BillboardDto } from "../../types/billboard";

export const DANANG_CENTER = { lat: 16.0544, lng: 108.2022 };

export type RentalStatus = "available" | "booked";

const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  "Hải Châu": { lat: 16.0678, lng: 108.2208 },
  "Sơn Trà": { lat: 16.102, lng: 108.251 },
  "Thanh Khê": { lat: 16.062, lng: 108.189 },
  "Ngũ Hành Sơn": { lat: 16.003, lng: 108.263 },
  "Liên Chiểu": { lat: 16.082, lng: 108.153 },
  "Cẩm Lệ": { lat: 16.018, lng: 108.21 },
  "Hòa Vang": { lat: 15.995, lng: 108.08 },
};

export function getBillboardThumbnail(b: BillboardDto): string {
  return (
    b.images?.find((img) => img.isThumbnail)?.imageUrl ||
    b.images?.[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1585504303098-9785dc784742?w=800"
  );
}

export function getBillboardRentalStatus(b: BillboardDto): RentalStatus {
  if (b.availabilities?.some((av) => av.status === "BOOKED" || av.status === "BLOCKED")) {
    return "booked";
  }
  return "available";
}

export function resolveBillboardPosition(
  b: BillboardDto,
  index = 0
): { lat: number; lng: number } {
  if (b.latitude != null && b.longitude != null) {
    return { lat: b.latitude, lng: b.longitude };
  }
  const base = DISTRICT_COORDS[b.district] ?? DANANG_CENTER;
  const angle = index * 0.9;
  const offset = 0.004 + (index % 3) * 0.002;
  return {
    lat: base.lat + Math.sin(angle) * offset,
    lng: base.lng + Math.cos(angle) * offset,
  };
}

export function formatBillboardPrice(b: BillboardDto): string {
  return `${b.pricePerDay.toLocaleString("vi-VN")}₫/ngày`;
}

export function formatBillboardSize(b: BillboardDto): string {
  return `${b.width}m × ${b.height}m`;
}

export function getGoogleMapsApiKey(): string {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? "";
  if (
    !key ||
    key === "YOUR_GOOGLE_MAPS_API_KEY" ||
    key === "your_google_maps_api_key_here" ||
    key.includes("YOUR_")
  ) {
    return "";
  }
  return key;
}

export const MAP_BILLBOARD_MOCKS: BillboardDto[] = [
  {
    id: 1,
    title: "Cầu Rồng LED",
    description: "Bảng quảng cáo vị trí đắc địa tại Cầu Rồng Đà Nẵng, lưu lượng giao thông cực kỳ đông đúc cả ngày lẫn đêm.",
    address: "Đường 2/9, Hải Châu",
    city: "Đà Nẵng",
    district: "Hải Châu",
    latitude: 16.0614,
    longitude: 108.2275,
    width: 14,
    height: 6,
    resolution: "1920x1080",
    brightness: 6500,
    refreshRate: 3840,
    screenType: "Outdoor LED",
    operatingHours: "16h/ngày",
    pricePerDay: 3000000,
    pricePerMonth: 85000000,
    locationSurcharge: 1.1,
    status: "APPROVED",
    dailyViews: 120000,
    isFeatured: true,
    demoVideoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    images: [{ id: 1, imageUrl: "https://images.unsplash.com/photo-1585504303098-9785dc784742?w=1080", isThumbnail: true }],
    features: [{ id: 1, name: "Độ sáng cao" }],
    availabilities: [],
  },
  {
    id: 2,
    title: "Bạch Đằng Digital",
    description: "Bảng quảng cáo ven sông Bạch Đằng hướng nhìn trực diện sông Hàn, phù hợp các chiến dịch thương hiệu cao cấp.",
    address: "Đường Bạch Đằng, Sơn Trà",
    city: "Đà Nẵng",
    district: "Sơn Trà",
    latitude: 16.0708,
    longitude: 108.2483,
    width: 10,
    height: 4,
    resolution: "1920x1080",
    brightness: 6000,
    refreshRate: 3840,
    screenType: "Outdoor LED",
    operatingHours: "16h/ngày",
    pricePerDay: 2000000,
    pricePerMonth: 55000000,
    locationSurcharge: 1.05,
    status: "APPROVED",
    dailyViews: 80000,
    isFeatured: true,
    demoVideoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    images: [{ id: 1, imageUrl: "https://images.unsplash.com/photo-1745725427643-8994370391e6?w=1080", isThumbnail: true }],
    features: [],
    availabilities: [],
  },
  {
    id: 3,
    title: "Nguyễn Văn Linh Screen",
    description: "Nằm ngay ngã ba Nguyễn Văn Linh và Nguyễn Tri Phương, đón đầu luồng giao thông từ sân bay vào trung tâm.",
    address: "Đường Nguyễn Văn Linh, Thanh Khê",
    city: "Đà Nẵng",
    district: "Thanh Khê",
    latitude: 16.0545,
    longitude: 108.202,
    width: 12,
    height: 5,
    resolution: "1280x720",
    brightness: 5000,
    refreshRate: 3840,
    screenType: "Outdoor LED",
    operatingHours: "16h/ngày",
    pricePerDay: 2500000,
    pricePerMonth: 68000000,
    locationSurcharge: 1,
    status: "APPROVED",
    dailyViews: 110000,
    isFeatured: true,
    images: [{ id: 1, imageUrl: "https://images.unsplash.com/photo-1765908310161-1005cf85586d?w=1080", isThumbnail: true }],
    features: [],
    availabilities: [{ id: 1, availableDate: "2026-05-23", status: "BOOKED" }],
  },
  {
    id: 4,
    title: "Mỹ Khê Beach LED",
    description: "Màn hình LED ven biển Mỹ Khê, tiếp cận du khách quốc tế và cộng đồng resort cao cấp.",
    address: "Võ Nguyên Giáp, Ngũ Hành Sơn",
    city: "Đà Nẵng",
    district: "Ngũ Hành Sơn",
    latitude: 16.003,
    longitude: 108.263,
    width: 8,
    height: 3,
    resolution: "1920x1080",
    brightness: 5500,
    refreshRate: 3840,
    screenType: "Outdoor LED",
    operatingHours: "14h/ngày",
    pricePerDay: 1400000,
    pricePerMonth: 42000000,
    locationSurcharge: 1,
    status: "APPROVED",
    dailyViews: 65000,
    isFeatured: false,
    images: [{ id: 1, imageUrl: "https://images.unsplash.com/photo-1766324488354-a189b706d3e2?w=1080", isThumbnail: true }],
    features: [],
    availabilities: [],
  },
  {
    id: 5,
    title: "Vincom Plaza LED",
    description: "Màn hình LED lớn ốp tường Vincom Plaza Hải Châu, tiếp cận hàng ngàn lượt mua sắm mỗi ngày.",
    address: "Ngô Quyền, Hải Châu",
    city: "Đà Nẵng",
    district: "Hải Châu",
    latitude: 16.0678,
    longitude: 108.2208,
    width: 16,
    height: 8,
    resolution: "1920x1080",
    brightness: 5500,
    refreshRate: 3840,
    screenType: "Building LED",
    operatingHours: "18h/ngày",
    pricePerDay: 4000000,
    pricePerMonth: 120000000,
    locationSurcharge: 1.15,
    status: "APPROVED",
    dailyViews: 150000,
    isFeatured: true,
    demoVideoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    images: [{ id: 1, imageUrl: "https://images.unsplash.com/photo-1676491405940-9cd5d8cbf954?w=1080", isThumbnail: true }],
    features: [],
    availabilities: [],
  },
];
