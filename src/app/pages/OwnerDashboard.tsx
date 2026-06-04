import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Monitor, BarChart3, DollarSign, Clock, Check, X, Eye, Edit2, Trash2, AlertTriangle, Plus, MapPin, Sun, Moon, Settings, LogOut } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { DataTable } from "../components/DataTable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import ownerApi, { CreateBillboardRequest } from "../../api/ownerApi";
import axiosClient from "../../api/axiosClient";
import { OwnerDashboardDto } from "../../types/dashboard";
import { BillboardDto } from "../../types/billboard";
import { BookingDto } from "../../types/booking";
import { OwnerRevenueView } from "../components/dashboard/OwnerRevenueView";
import { OwnerSettingsView } from "../components/dashboard/OwnerSettingsView";
import { OwnerAvailabilityView } from "../components/dashboard/OwnerAvailabilityView";
import { MiniMonthCalendar } from "../components/dashboard/MiniMonthCalendar";
import { useConfirm } from "../context/ConfirmContext";
import { notify, apiErrorMessage } from "../utils/notify";
import { getBookingMonthEvents } from "../utils/bookingEvents";
import { getTodayParts } from "../utils/calendar";
import { MessagesView } from "../components/messages/MessagesView";
import LocationPicker from "../components/map/LocationPicker";
import { BillboardGoogleMap } from "../components/map/BillboardGoogleMap";

type BadgeVariant = "active" | "pending" | "booked" | "expired" | "available" | "unavailable";

const mockOwnerDashboard: OwnerDashboardDto = {
  totalBillboards: 5,
  fillRate: 80,
  monthlyRevenue: 245000000,
  pendingRequests: 2,
  revenueTrend: [
    { month: "T9", revenue: 180000000 },
    { month: "T10", revenue: 220000000 },
    { month: "T11", revenue: 280000000 },
    { month: "T12", revenue: 245000000 },
    { month: "T1", revenue: 310000000 },
    { month: "T2", revenue: 360000000 }
  ],
  recentBookingRequests: []
};

const mockBillboards: BillboardDto[] = [
  {
    id: 1,
    title: "Cầu Rồng LED",
    description: "Premium LED screen in central Da Nang",
    address: "Hải Châu, Đà Nẵng",
    city: "Đà Nẵng",
    district: "Hải Châu",
    width: 12,
    height: 6,
    resolution: "1920x1080",
    brightness: 7000,
    refreshRate: 60,
    screenType: "LED Outdoor",
    operatingHours: "24h",
    pricePerDay: 3000000,
    pricePerMonth: 85000000,
    locationSurcharge: 0,
    status: "APPROVED",
    dailyViews: 150000,
    isFeatured: true,
    images: [{ id: 1, imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", isThumbnail: true }],
    features: [],
    availabilities: [],
    createdAt: "2026-02-01"
  },
  {
    id: 2,
    title: "Bạch Đằng Digital",
    description: "High traffic LED display",
    address: "Bạch Đằng, Sơn Trà",
    city: "Đà Nẵng",
    district: "Sơn Trà",
    width: 10,
    height: 5,
    resolution: "1920x1080",
    brightness: 6000,
    refreshRate: 60,
    screenType: "LED Outdoor",
    operatingHours: "18h",
    pricePerDay: 2000000,
    pricePerMonth: 55000000,
    locationSurcharge: 0,
    status: "APPROVED",
    dailyViews: 100000,
    isFeatured: false,
    images: [],
    features: [],
    availabilities: [],
    createdAt: "2026-02-15"
  }
];

// Enriched bookings with mock creative data for content approval flow
const mockBookingCreatives: Record<number, { url: string; name: string; type: "image" | "video"; campaign: string; category: string }> = {
  1: {
    url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
    name: "tet2027_banner.jpg",
    type: "image",
    campaign: "Tết 2027 – Đại Tiệc Mua Sắm",
    category: "Khuyến mãi",
  },
  2: {
    url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
    name: "techzone_launch.jpg",
    type: "image",
    campaign: "Ra Mắt Sản Phẩm Mới TechZone",
    category: "Sản phẩm",
  },
};

const getBookingCreative = (b: BookingDto) => {
  if (!b) return null;
  try {
    if (b.note && b.note.trim().startsWith("{")) {
      const parsed = JSON.parse(b.note);
      if (parsed.creativeUrl) {
        return {
          url: parsed.creativeUrl,
          name: parsed.creativeName || "Creative",
          type: parsed.creativeType || "image",
          campaign: parsed.campaignName,
          category: parsed.category || "Chung",
        };
      }
    }
  } catch (e) {}
  return mockBookingCreatives[b.id];
};

const mockBookings: BookingDto[] = [
  {
    id: 1,
    startDate: "2026-03-05",
    endDate: "2026-04-05",
    totalPrice: 85000000,
    serviceFee: 4250000,
    locationSurcharge: 0,
    finalAmount: 89250000,
    status: "PENDING",
    note: "Chiến dịch Cầu Rồng LED",
    renter: { id: 10, fullName: "Công ty CP ABC", email: "abc@corp.vn", phone: "0905123456", role: "RENTER", status: "ACTIVE" },
    billboard: { id: 1, title: "Cầu Rồng LED" } as any
  },
  {
    id: 2,
    startDate: "2026-03-15",
    endDate: "2026-04-15",
    totalPrice: 55000000,
    serviceFee: 2750000,
    locationSurcharge: 0,
    finalAmount: 57750000,
    status: "PENDING",
    note: "Chiến dịch Bạch Đằng Digital",
    renter: { id: 11, fullName: "Đại Lý QC Số Việt", email: "qc@viet.vn", phone: "0905111222", role: "RENTER", status: "ACTIVE" },
    billboard: { id: 2, title: "Bạch Đằng Digital" } as any
  }
];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

export default function OwnerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const confirm = useConfirm();
  const { theme, resolvedTheme, toggleTheme } = useThemeContext();

  const [dashboardData, setDashboardData] = useState<OwnerDashboardDto | null>(null);
  const [billboards, setBillboards] = useState<BillboardDto[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".profile-dropdown-trigger")) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const initials = (user?.fullName || "OS")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Modal Billboard Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBillboardId, setEditingBillboardId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formFormattedAddress, setFormFormattedAddress] = useState("");
  const [formAddressDetail, setFormAddressDetail] = useState("");
  const [formWard, setFormWard] = useState("");
  const [formCity, setFormCity] = useState("Đà Nẵng");
  const [formDistrict, setFormDistrict] = useState("Hải Châu");
  const [formLatitude, setFormLatitude] = useState<number | undefined>(undefined);
  const [formLongitude, setFormLongitude] = useState<number | undefined>(undefined);
  const [formWidth, setFormWidth] = useState(10);
  const [formHeight, setFormHeight] = useState(5);
  const [formResolution, setFormResolution] = useState("1920x1080");
  const [formBrightness, setFormBrightness] = useState("6000 nits");
  const [formRefreshRate, setFormRefreshRate] = useState("3840Hz");
  const [formScreenType, setFormScreenType] = useState("Outdoor LED");
  const [formOperatingHours, setFormOperatingHours] = useState("18 hours");
  const [formPricePerDay, setFormPricePerDay] = useState(2000000);
  const [formPricePerMonth, setFormPricePerMonth] = useState(55000000);
  const [formLocationSurcharge, setFormLocationSurcharge] = useState(0);
  const [formImages, setFormImages] = useState<Array<{ id?: number; imageUrl: string; isThumbnail: boolean }>>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [formFeatures, setFormFeatures] = useState("UHD, HDR, weatherproof");
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<BookingDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Content approval preview modal
  const [contentPreviewBooking, setContentPreviewBooking] = useState<BookingDto | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const [approvalMode, setApprovalMode] = useState<"campaign" | "single">("campaign");
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<any | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<"all" | "unpaid" | "paid">("unpaid");

  const view = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/owner/billboards")) return "billboards";
    if (path.startsWith("/owner/bookings")) return "bookings";
    if (path.startsWith("/owner/availability")) return "availability";
    if (path.startsWith("/owner/revenue")) return "revenue";
    if (path.startsWith("/owner/settings")) return "settings";
    if (path.startsWith("/owner/messages")) return "messages";
    return "dashboard";
  }, [location.pathname]);

  const loadAllData = async () => {
    setLoading(true);
    let dbData: OwnerDashboardDto | null = null;
    let fallbackMode = false;

    // 1. Load main owner dashboard statistics first to clear the loading spinner immediately
    try {
      const dbRes = await ownerApi.getDashboardData();
      if (dbRes.success && dbRes.data) {
        dbData = dbRes.data;
        setDashboardData(dbData);
        setIsUsingFallback(false);
      } else {
        throw new Error("Owner Dashboard API failed");
      }
    } catch (error) {
      console.warn("Owner Dashboard stats API failed, loading simulated mode:", error);
      fallbackMode = true;
      dbData = mockOwnerDashboard;
      setDashboardData({
        ...mockOwnerDashboard,
        recentBookingRequests: mockBookings.filter((b) => b.status === "PENDING"),
      });
      setBillboards(mockBillboards);
      setBookings(mockBookings);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }

    if (fallbackMode) return;

    // 2. Fetch billboards and bookings asynchronously in the background
    try {
      const [bbRes, bkRes] = await Promise.all([
        ownerApi.getMyBillboards(),
        ownerApi.getBookings(),
      ]);

      const bkData = bkRes.success && bkRes.data ? bkRes.data : [];
      const bbData = bbRes.success && bbRes.data ? bbRes.data : [];

      setBillboards(bbData);
      setBookings(bkData);

      // Merge the actual booking requests status and count back into dashboardData state
      setDashboardData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          recentBookingRequests: bkData.filter((b) => b.status === "PENDING").slice(0, 5),
          pendingRequests: bkData.filter((b) => b.status === "PENDING").length,
        };
      });
    } catch (err) {
      console.error("Failed to load secondary owner billboards/bookings in background:", err);
    }
  };

  useEffect(() => {
    loadAllData();

    const handleNotification = (e: Event) => {
      console.log("WebSocket notification received, reloading owner dashboard data...");
      loadAllData();
    };

    window.addEventListener("notification-received", handleNotification);
    return () => {
      window.removeEventListener("notification-received", handleNotification);
    };
  }, []);

  // Accept Booking Request Handler
  const handleAcceptBooking = async (id: number) => {
    const ok = await confirm({
      title: "Chấp nhận đặt chỗ",
      description: "Bạn có chắc chắn muốn chấp nhận yêu cầu đặt chỗ này?",
      variant: "success",
      confirmLabel: "Chấp nhận",
    });
    if (!ok) return;
    if (isUsingFallback) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "ACCEPTED" as const } : b));
      setDashboardData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          recentBookingRequests: prev.recentBookingRequests.filter(b => b.id !== id),
          pendingRequests: Math.max(0, prev.pendingRequests - 1)
        };
      });
      notify.success("Đã chấp nhận yêu cầu đặt chỗ", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await ownerApi.acceptBooking(id);
      if (res.success) {
        notify.success("Đã chấp nhận yêu cầu đặt chỗ thành công");
        loadAllData();
      } else {
        notify.error(res.message || "Không thể chấp nhận yêu cầu.");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi hệ thống."));
    }
  };

  // Reject Booking Request Handler
  const handleRejectBooking = async (id: number) => {
    const ok = await confirm({
      title: "Từ chối đặt chỗ",
      description: "Bạn có chắc chắn muốn từ chối yêu cầu đặt chỗ này?",
      variant: "destructive",
      confirmLabel: "Từ chối",
    });
    if (!ok) return;
    if (isUsingFallback) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "REJECTED" as const } : b));
      setDashboardData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          recentBookingRequests: prev.recentBookingRequests.filter(b => b.id !== id),
          pendingRequests: Math.max(0, prev.pendingRequests - 1)
        };
      });
      notify.success("Đã từ chối yêu cầu đặt chỗ", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await ownerApi.rejectBooking(id);
      if (res.success) {
        notify.success("Đã từ chối yêu cầu đặt chỗ thành công");
        loadAllData();
      } else {
        notify.error(res.message || "Không thể từ chối yêu cầu.");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi hệ thống."));
    }
  };

  // Delete Billboard Handler
  const handleDeleteBillboard = async (id: number) => {
    const ok = await confirm({
      title: "Xóa bảng quảng cáo",
      description: "Bạn có chắc chắn muốn xóa bảng quảng cáo này? Hành động không thể hoàn tác.",
      variant: "destructive",
      confirmLabel: "Xóa",
    });
    if (!ok) return;
    if (isUsingFallback) {
      setBillboards(prev => prev.filter(b => b.id !== id));
      notify.success("Đã xóa bảng quảng cáo", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await ownerApi.deleteBillboard(id);
      if (res.success) {
        notify.success("Xóa bảng quảng cáo thành công");
        loadAllData();
      } else {
        notify.error(res.message || "Không thể xóa bảng quảng cáo.");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi khi xóa bảng quảng cáo."));
    }
  };

  const handleRemoveImage = (idx: number) => {
    const itemToDelete = formImages[idx];
    if (itemToDelete.id) {
      setDeletedImageIds(prev => [...prev, itemToDelete.id!]);
    }
    
    setFormImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      // If we deleted the thumbnail, assign the first remaining image as the new thumbnail
      if (itemToDelete.isThumbnail && next.length > 0) {
        next[0].isThumbnail = true;
      }
      return next;
    });
  };

  const handleSetThumbnail = (idx: number) => {
    setFormImages(prev => prev.map((img, i) => ({
      ...img,
      isThumbnail: i === idx
    })));
  };

  const handleViewBookingDetail = (booking: BookingDto) => {
    setSelectedBookingDetail(booking);
    setIsDetailModalOpen(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingBillboardId(null);
    setFormTitle("");
    setFormDescription("");
    setFormAddress("");
    setFormFormattedAddress("");
    setFormAddressDetail("");
    setFormWard("");
    setFormCity("Đà Nẵng");
    setFormDistrict("Hải Châu");
    setFormLatitude(undefined);
    setFormLongitude(undefined);
    setFormWidth(12);
    setFormHeight(6);
    setFormResolution("4K UHD");
    setFormBrightness("6500 nits");
    setFormRefreshRate("3840Hz");
    setFormScreenType("Outdoor LED");
    setFormOperatingHours("06:00 - 23:00");
    setFormPricePerDay(5000000);
    setFormPricePerMonth(120000000);
    setFormLocationSurcharge(500000);
    setFormImages([]);
    setDeletedImageIds([]);
    setFormFeatures("UHD, HDR, weatherproof");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (bb: BillboardDto) => {
    setEditingBillboardId(bb.id);
    setFormTitle(bb.title);
    setFormDescription(bb.description || "");
    setFormAddress(bb.address);
    setFormFormattedAddress(bb.formattedAddress || `${bb.address}, ${bb.city}`);
    setFormAddressDetail(bb.addressDetail || "");
    setFormWard(bb.ward || "");
    setFormCity(bb.city);
    setFormDistrict(bb.district);
    setFormLatitude(bb.latitude);
    setFormLongitude(bb.longitude);
    setFormWidth(bb.width);
    setFormHeight(bb.height);
    setFormResolution(bb.resolution);
    setFormBrightness(bb.brightness?.toString() || "");
    setFormRefreshRate(bb.refreshRate?.toString() || "");
    setFormScreenType(bb.screenType);
    setFormOperatingHours(bb.operatingHours);
    setFormPricePerDay(bb.pricePerDay);
    setFormPricePerMonth(bb.pricePerMonth);
    setFormLocationSurcharge(bb.locationSurcharge);
    const initialImages = bb.images?.map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
      isThumbnail: img.isThumbnail || false
    })) || [];
    setFormImages(initialImages);
    setDeletedImageIds([]);
    setFormFeatures(bb.features?.map(f => f.name).join(", ") || "");
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          notify.error(`File ${file.name} không phải là ảnh hợp lệ`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = (await axiosClient.post("/api/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })) as { url: string };
        
        uploadedUrls.push(response.url);
      }

      if (uploadedUrls.length > 0) {
        setFormImages(prev => {
          const next = [...prev];
          uploadedUrls.forEach((url) => {
            next.push({
              imageUrl: url,
              isThumbnail: next.length === 0
            });
          });
          return next;
        });
        notify.success(`Đã tải lên thành công ${uploadedUrls.length} ảnh`);
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      notify.error(err?.message || "Tải ảnh lên thất bại.");
    } finally {
      setImageUploading(false);
    }
  };

  // Form Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formLatitude == null || formLongitude == null) {
      notify.error("Vui lòng chọn vị trí chính xác trên bản đồ.");
      return;
    }

    setSubmitting(true);

    const featureList = formFeatures
      .split(",")
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const payload: CreateBillboardRequest = {
      title: formTitle,
      description: formDescription,
      address: formAddress || formFormattedAddress,
      formattedAddress: formFormattedAddress,
      addressDetail: formAddressDetail,
      ward: formWard,
      city: formCity,
      district: formDistrict,
      latitude: formLatitude,
      longitude: formLongitude,
      width: Number(formWidth),
      height: Number(formHeight),
      resolution: formResolution,
      brightness: formBrightness,
      refreshRate: formRefreshRate,
      screenType: formScreenType,
      operatingHours: formOperatingHours,
      pricePerDay: Number(formPricePerDay),
      pricePerMonth: Number(formPricePerMonth),
      locationSurcharge: Number(formLocationSurcharge),
      categoryId: 1,
      features: featureList
    };

    if (isUsingFallback) {
      if (editingBillboardId) {
        // Edit Mode Sim
        setBillboards(prev =>
          prev.map(bb =>
            bb.id === editingBillboardId
              ? {
                  ...bb,
                  ...payload,
                  brightness: Number(payload.brightness) || 6000,
                  refreshRate: Number(payload.refreshRate) || 60,
                  features: featureList.map((f, index) => ({ id: index, name: f })),
                  images: formImages.map((img, index) => ({ id: img.id ?? index, imageUrl: img.imageUrl, isThumbnail: img.isThumbnail }))
                }
              : bb
          )
        );
        notify.success("Cập nhật bảng quảng cáo thành công", "Chế độ mô phỏng");
      } else {
        // Create Mode Sim
        const newBb: BillboardDto = {
          id: Date.now(),
          ...payload,
          brightness: Number(payload.brightness) || 6000,
          refreshRate: Number(payload.refreshRate) || 60,
          status: "PENDING",
          dailyViews: 80000,
          isFeatured: false,
          features: featureList.map((f, index) => ({ id: index, name: f })),
          images: formImages.map((img, index) => ({ id: img.id ?? index, imageUrl: img.imageUrl, isThumbnail: img.isThumbnail })),
          availabilities: []
        };
        setBillboards(prev => [newBb, ...prev]);
        notify.success("Đăng ký bảng quảng cáo mới thành công", "Đang chờ ADMIN duyệt · Chế độ mô phỏng");
      }
      setIsModalOpen(false);
      setSubmitting(false);
      return;
    }

    try {
      if (editingBillboardId) {
        const res = await ownerApi.updateBillboard(editingBillboardId, payload);
        if (res.success && res.data) {
          // 1. Delete removed images
          for (const imgId of deletedImageIds) {
            try {
              await ownerApi.deleteBillboardImage(editingBillboardId, imgId);
            } catch (err) {
              console.error(`Failed to delete image ${imgId}:`, err);
            }
          }
          
          // 2. Upload new images (without ID)
          for (const img of formImages) {
            if (!img.id) {
              try {
                await ownerApi.addBillboardImage(editingBillboardId, {
                  imageUrl: img.imageUrl,
                  isThumbnail: img.isThumbnail
                });
              } catch (err) {
                console.error("Failed to upload new image:", err);
              }
            }
          }

          // 3. Update thumbnail if it's an existing image
          const thumbnailImage = formImages.find(img => img.isThumbnail);
          if (thumbnailImage && thumbnailImage.id) {
            try {
              await ownerApi.setBillboardThumbnail(editingBillboardId, thumbnailImage.id);
            } catch (err) {
              console.error("Failed to update thumbnail:", err);
            }
          }

          notify.success("Cập nhật bảng quảng cáo thành công");
          loadAllData();
          setIsModalOpen(false);
        } else {
          notify.error(res.message || "Cập nhật thất bại.");
        }
      } else {
        const res = await ownerApi.createBillboard(payload);
        if (res.success && res.data) {
          // Upload all images
          for (const img of formImages) {
            try {
              await ownerApi.addBillboardImage(res.data.id, {
                imageUrl: img.imageUrl,
                isThumbnail: img.isThumbnail
              });
            } catch (err) {
              console.error("Failed to upload image during creation:", err);
            }
          }
          notify.success("Đăng ký bảng quảng cáo mới thành công", "Tin đăng đang chờ ADMIN duyệt");
          loadAllData();
          setIsModalOpen(false);
        } else {
          notify.error(res.message || "Đăng ký thất bại.");
        }
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi kết nối máy chủ."));
    } finally {
      setSubmitting(false);
    }
  };

  const { year: calYear, month: calMonth } = getTodayParts();
  const parsedCalEvents = useMemo(
    () => getBookingMonthEvents(bookings, calYear, calMonth),
    [bookings, calYear, calMonth],
  );

  const campaignsGrouped = useMemo(() => {
    const groups: Record<string, {
      id: string | number;
      campaignName: string;
      renter: any;
      bookings: BookingDto[];
      totalAmount: number;
      startDate: string;
      endDate: string;
      creative: any;
      status: string;
    }> = {};

    bookings.forEach(b => {
      let campaignName = b.note || "Bảng lẻ - #" + b.id;
      let creative = null;

      try {
        if (b.note && b.note.trim().startsWith("{")) {
          const parsed = JSON.parse(b.note);
          campaignName = parsed.campaignName || campaignName;
          if (parsed.creativeUrl) {
            creative = {
              url: parsed.creativeUrl,
              name: parsed.creativeName || "Creative",
              type: parsed.creativeType || "image",
              campaign: campaignName,
              category: parsed.category || "Chung",
            };
          }
        }
      } catch (e) {}

      if (!creative) {
        creative = mockBookingCreatives[b.id];
        if (creative) {
          campaignName = creative.campaign || campaignName;
        }
      }
      
      if (!groups[campaignName]) {
        groups[campaignName] = {
          id: b.id,
          campaignName,
          renter: b.renter,
          bookings: [],
          totalAmount: 0,
          startDate: b.startDate,
          endDate: b.endDate,
          creative: creative,
          status: b.status,
        };
      }
      
      groups[campaignName].bookings.push(b);
      groups[campaignName].totalAmount += b.finalAmount || b.totalPrice;
      
      if (new Date(b.startDate) < new Date(groups[campaignName].startDate)) {
        groups[campaignName].startDate = b.startDate;
      }
      if (new Date(b.endDate) > new Date(groups[campaignName].endDate)) {
        groups[campaignName].endDate = b.endDate;
      }
    });

    Object.values(groups).forEach(g => {
      const today = new Date("2026-06-01");
      const start = new Date(g.startDate);
      const end = new Date(g.endDate);

      const hasPending = g.bookings.some(b => b.status === "PENDING");
      
      if (hasPending && start < today) {
        g.status = "OVERDUE";
      } else if (end < today) {
        g.status = "EXPIRED";
      } else {
        const bStatuses = g.bookings.map(b => b.status);
        if (bStatuses.includes("PENDING")) {
          g.status = "PENDING";
        } else if (bStatuses.includes("REJECTED")) {
          g.status = "REJECTED";
        } else if (bStatuses.includes("PAID")) {
          g.status = "PAID";
        } else if (bStatuses.includes("ACCEPTED")) {
          g.status = "ACCEPTED";
        } else {
          g.status = "COMPLETED";
        }
      }
    });

    return Object.values(groups);
  }, [bookings]);

  const bookingCounts = useMemo(() => {
    return {
      unpaid: bookings.filter(b => b.status === "PENDING" || b.status === "ACCEPTED").length,
      paid: bookings.filter(b => b.status === "PAID" || b.status === "COMPLETED").length,
      all: bookings.length,
    };
  }, [bookings]);

  const campaignCounts = useMemo(() => {
    return {
      unpaid: campaignsGrouped.filter(c => c.status === "PENDING" || c.status === "ACCEPTED" || c.status === "OVERDUE").length,
      paid: campaignsGrouped.filter(c => c.status === "PAID" || c.status === "COMPLETED").length,
      all: campaignsGrouped.length,
    };
  }, [campaignsGrouped]);

  const filteredBookings = useMemo(() => {
    if (paymentFilter === "unpaid") {
      return bookings.filter(b => b.status === "PENDING" || b.status === "ACCEPTED");
    }
    if (paymentFilter === "paid") {
      return bookings.filter(b => b.status === "PAID" || b.status === "COMPLETED");
    }
    return bookings;
  }, [bookings, paymentFilter]);

  const filteredCampaigns = useMemo(() => {
    if (paymentFilter === "unpaid") {
      return campaignsGrouped.filter(c => c.status === "PENDING" || c.status === "ACCEPTED" || c.status === "OVERDUE");
    }
    if (paymentFilter === "paid") {
      return campaignsGrouped.filter(c => c.status === "PAID" || c.status === "COMPLETED");
    }
    return campaignsGrouped;
  }, [campaignsGrouped, paymentFilter]);

  // Campaign handlers
  const handleAcceptCampaign = async (campaignName: string, campaignBookings: BookingDto[]) => {
    const ok = await confirm({
      title: "Chấp nhận toàn bộ chiến dịch",
      description: `Bạn có chắc chắn muốn duyệt toàn bộ chiến dịch "${campaignName}" gồm ${campaignBookings.length} bảng QC?`,
      variant: "success",
      confirmLabel: "Chấp nhận tất cả",
    });
    if (!ok) return;

    if (isUsingFallback) {
      const bookingIds = campaignBookings.map(b => b.id);
      setBookings(prev => prev.map(b => bookingIds.includes(b.id) ? { ...b, status: "ACCEPTED" as const } : b));
      setDashboardData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          recentBookingRequests: prev.recentBookingRequests.filter(b => !bookingIds.includes(b.id)),
          pendingRequests: Math.max(0, prev.pendingRequests - bookingIds.length)
        };
      });
      notify.success(`Đã duyệt chiến dịch "${campaignName}"`, "Chế độ mô phỏng");
      return;
    }

    setLoading(true);
    try {
      const promises = campaignBookings
        .filter(b => b.status === "PENDING")
        .map(b => ownerApi.acceptBooking(b.id));
      await Promise.all(promises);
      notify.success(`Đã duyệt chiến dịch "${campaignName}" thành công`);
      loadAllData();
    } catch (err) {
      notify.error("Lỗi khi duyệt chiến dịch.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCampaign = async (campaignName: string, campaignBookings: BookingDto[]) => {
    const ok = await confirm({
      title: "Từ chối toàn bộ chiến dịch",
      description: `Bạn có chắc chắn muốn từ chối toàn bộ chiến dịch "${campaignName}"?`,
      variant: "destructive",
      confirmLabel: "Từ chối tất cả",
    });
    if (!ok) return;

    if (isUsingFallback) {
      const bookingIds = campaignBookings.map(b => b.id);
      setBookings(prev => prev.map(b => bookingIds.includes(b.id) ? { ...b, status: "REJECTED" as const } : b));
      setDashboardData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          recentBookingRequests: prev.recentBookingRequests.filter(b => !bookingIds.includes(b.id)),
          pendingRequests: Math.max(0, prev.pendingRequests - bookingIds.length)
        };
      });
      notify.success(`Đã từ chối chiến dịch "${campaignName}"`, "Chế độ mô phỏng");
      return;
    }

    setLoading(true);
    try {
      const promises = campaignBookings
        .filter(b => b.status === "PENDING")
        .map(b => ownerApi.rejectBooking(b.id));
      await Promise.all(promises);
      notify.success(`Đã từ chối chiến dịch "${campaignName}"`);
      loadAllData();
    } catch (err) {
      notify.error("Lỗi khi từ chối chiến dịch.");
    } finally {
      setLoading(false);
    }
  };

  const campaignColumns = [
    {
      key: "campaignName",
      label: "Chiến dịch",
      render: (v: string, row: any) => (
        <div>
          <span style={{ fontWeight: 600 }} className="text-foreground text-sm">{v}</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">Renter: <strong className="text-foreground">{row.renter?.fullName || "Khách hàng"}</strong></p>
        </div>
      )
    },
    {
      key: "billboards",
      label: "Bảng LED",
      render: (_: any, row: any) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.bookings.map((b: any, idx: number) => (
            <span key={idx} className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {b.billboard?.title}
            </span>
          ))}
        </div>
      )
    },
    {
      key: "creative",
      label: "Nội Dung",
      render: (_: any, row: any) => {
        if (!row.creative) return <span className="text-xs text-muted-foreground italic">Chưa có</span>;
        return (
          <button
            onClick={() => setContentPreviewBooking(row.bookings[0])}
            className="flex items-center gap-2 group cursor-pointer"
            title="Xem preview nội dung"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0">
              <img src={row.creative.url} alt={row.creative.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[11px] text-accent group-hover:underline font-medium">{row.creative.category}</span>
          </button>
        );
      }
    },
    {
      key: "dates",
      label: "Thời Gian",
      render: (_: any, row: any) => <span>{formatDate(row.startDate)} - {formatDate(row.endDate)}</span>
    },
    {
      key: "totalAmount",
      label: "Tổng Tiền",
      render: (v: number) => <span style={{ fontWeight: 600 }} className="text-primary">{v?.toLocaleString("vi-VN")}₫</span>
    },
    {
      key: "status",
      label: "Trạng Thái",
      render: (v: string, row: any) => {
        let variant: BadgeVariant = "pending";
        let label = "Chờ duyệt";
        if (v === "OVERDUE") { variant = "expired"; label = "Quá hạn duyệt"; }
        else if (v === "EXPIRED") { variant = "expired"; label = "Đã hết hạn"; }
        else if (v === "PENDING") { variant = "pending"; label = "Chờ duyệt"; }
        else if (v === "ACCEPTED") { variant = "booked"; label = "Đã chấp nhận"; }
        else if (v === "REJECTED") { variant = "unavailable"; label = "Từ chối"; }
        else if (v === "PAID") { variant = "active"; label = "Đã thanh toán"; }
        return <StatusBadge variant={variant} label={label} />;
      }
    },
    {
      key: "actions",
      label: "Thao Tác",
      render: (_: any, row: any) => {
        const isPending = row.status === "PENDING";
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCampaignDetail(row)}
              className="px-2.5 py-1.5 rounded-md border border-border hover:bg-muted text-xs font-semibold text-muted-foreground cursor-pointer transition-colors"
              title="Xem chi tiết"
            >
              Chi tiết
            </button>
            {isPending && (
              <>
                <button
                  onClick={() => handleAcceptCampaign(row.campaignName, row.bookings)}
                  className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 px-2 py-1.5 rounded-md hover:bg-emerald-100 cursor-pointer font-semibold transition-colors"
                >
                  Duyệt cả
                </button>
                <button
                  onClick={() => handleRejectCampaign(row.campaignName, row.bookings)}
                  className="flex items-center gap-1 text-xs bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 px-2 py-1.5 rounded-md hover:bg-red-100 cursor-pointer font-semibold transition-colors"
                >
                  Từ chối
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  // Table columns for booking requests
  const bookingColumns = [
    {
      key: "renter",
      label: "Nhà Quảng Cáo",
      render: (v: any) => <span style={{ fontWeight: 500 }} className="text-[#1D4ED8]">{v?.fullName || "Khách hàng"}</span>
    },
    {
      key: "billboard",
      label: "Bảng QC",
      render: (v: any) => <span>{v?.title || "Bảng quảng cáo"}</span>
    },
    {
      key: "creative",
      label: "Nội Dung",
      render: (_: any, row: BookingDto) => {
        const c = getBookingCreative(row);
        if (!c) return <span className="text-xs text-muted-foreground italic">Chưa có</span>;
        return (
          <button
            onClick={() => setContentPreviewBooking(row)}
            className="flex items-center gap-2 group cursor-pointer"
            title="Xem preview nội dung"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0">
              <img src={c.url} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">{c.campaign}</p>
              <p className="text-[11px] text-accent hover:underline">{c.category}</p>
            </div>
          </button>
        );
      }
    },
    {
      key: "dates",
      label: "Thời Gian",
      render: (_: any, row: BookingDto) => <span>{formatDate(row.startDate)} - {formatDate(row.endDate)}</span>
    },
    {
      key: "finalAmount",
      label: "Số Tiền",
      render: (v: number) => <span style={{ fontWeight: 600 }} className="text-[#1D4ED8]">{v?.toLocaleString("vi-VN")}₫</span>
    },
    {
      key: "status",
      label: "Trạng Thái",
      render: (v: string, row: BookingDto) => {
        const hasCreative = !!getBookingCreative(row);
        const today = new Date("2026-06-01");
        const start = new Date(row.startDate);
        const end = new Date(row.endDate);

        let variant: BadgeVariant = "pending";
        let label = "Chờ duyệt";
        if (v === "PENDING" && start < today) { variant = "expired"; label = "Quá hạn duyệt"; }
        else if (end < today) { variant = "expired"; label = "Đã hết hạn"; }
        else if (v === "PENDING" && hasCreative) { variant = "pending"; label = "Chờ duyệt ND"; }
        else if (v === "ACCEPTED") { variant = "booked"; label = "Đã chấp nhận"; }
        else if (v === "REJECTED") { variant = "unavailable"; label = "Từ chối"; }
        else if (v === "CANCELLED") { variant = "expired"; label = "Đã hủy"; }
        else if (v === "PAID") { variant = "active"; label = "Đã thanh toán"; }
        else if (v === "COMPLETED") { variant = "expired"; label = "Hoàn thành"; }
        return <StatusBadge variant={variant} label={label} />;
      }
    },
    {
      key: "actions",
      label: "Thao Tác",
      render: (_: any, row: BookingDto) => {
        const hasCreative = !!getBookingCreative(row);
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewBookingDetail(row)}
              className="w-7 h-7 rounded-md border border-border hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer transition-colors"
              title="Xem chi tiết"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {row.status === "PENDING" && hasCreative && (
              <button
                onClick={() => { setContentPreviewBooking(row); setShowRejectInput(false); setRejectReason(""); }}
                className="flex items-center gap-1 text-xs bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#1D4ED8]/20 dark:text-[#60A5FA] px-2.5 py-1.5 rounded-md hover:bg-[#C7D2FE] dark:hover:bg-[#1D4ED8]/30 cursor-pointer font-semibold transition-colors"
              >
                <Eye className="w-3 h-3" /> Xem & Duyệt
              </button>
            )}
            {row.status === "PENDING" && !hasCreative && (
              <>
                <button
                  onClick={() => handleAcceptBooking(row.id)}
                  className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 px-2.5 py-1.5 rounded-md hover:bg-emerald-100 cursor-pointer font-semibold transition-colors"
                >
                  <Check className="w-3 h-3" /> Duyệt
                </button>
                <button
                  onClick={() => handleRejectBooking(row.id)}
                  className="flex items-center gap-1 text-xs bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 px-2.5 py-1.5 rounded-md hover:bg-red-100 cursor-pointer font-semibold transition-colors"
                >
                  <X className="w-3 h-3" /> Từ Chối
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  if (loading && !dashboardData) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <DashboardSidebar role="owner" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-border border-t-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar role="owner" />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-16 lg:pb-0">
        {isUsingFallback && (
          <div className="bg-amber-50/15 border-b border-amber-200/20 px-8 py-3 flex items-center gap-2 text-xs text-amber-500 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chế độ ngoại tuyến:</strong> Đang hiển thị dữ liệu mô phỏng do không kết nối được với máy chủ API.
            </span>
          </div>
        )}

        <div className="bg-card border-b border-border/30 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-primary" style={{ fontWeight: 700 }}>
                {view === "billboards"
                  ? "Bảng Quảng Cáo Của Tôi"
                  : view === "bookings"
                  ? "Quản Lý Đặt Chỗ"
                  : view === "availability"
                  ? "Xem Lịch Trống"
                  : view === "revenue"
                  ? "Doanh Thu & Chi Trả"
                  : view === "settings"
                  ? "Cài Đặt Tài Khoản"
                  : view === "messages"
                  ? "Tin Nhắn"
                  : "Tổng Quan Chủ Sở Hữu"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {view === "revenue"
                  ? "Theo dõi thu nhập ròng và lịch sử chi trả từ các chiến dịch."
                  : view === "settings"
                  ? "Hồ sơ, tài khoản ngân hàng và tùy chọn tin đăng mặc định."
                  : view === "messages"
                  ? "Trao đổi với nhà quảng cáo về yêu cầu đặt chỗ."
                  : `Chào mừng trở lại, ${user?.fullName || "Chủ sở hữu"}. Đây là danh mục quảng cáo của bạn.`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 border border-border/50 rounded-lg text-muted-foreground hover:text-accent hover:bg-surface/50 transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
                title="Đổi giao diện"
              >
                {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {user && (
                <div className="relative profile-dropdown-trigger">
                  <button
                    type="button"
                    onClick={() => setShowProfileDropdown((prev) => !prev)}
                    className="flex items-center gap-2 hover:bg-surface/50 p-1.5 rounded-lg border border-border/40 transition-colors cursor-pointer bg-transparent"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-primary/20">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-foreground max-w-[100px] truncate">
                      {user.fullName}
                    </span>
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileDropdown(false);
                            navigate("/owner/settings");
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors cursor-pointer flex items-center gap-2 border-none bg-transparent"
                        >
                          <Settings className="w-4 h-4 text-muted-foreground" />
                          Hồ sơ cá nhân
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileDropdown(false);
                            logout();
                            navigate("/");
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center gap-2 border-t border-border mt-1 bg-transparent"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                  )}
                </div>
              )}

              {view === "billboards" && (
                <button
                  onClick={openCreateModal}
                  className="bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer flex items-center gap-1 font-semibold shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Thêm Bảng QC
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 1. OVERVIEW DASHBOARD VIEW */}
        {view === "dashboard" && dashboardData && (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <KpiCard
                title="Tổng Tin Đăng"
                value={dashboardData.totalBillboards.toString()}
                change="+1"
                changeType="up"
                icon={<Monitor className="w-5 h-5" />}
              />
              <KpiCard
                title="Tỷ Lệ Lấp Đầy"
                value={`${Number(dashboardData.fillRate || 0).toFixed(2)}%`}
                change="+5%"
                changeType="up"
                icon={<BarChart3 className="w-5 h-5" />}
              />
              <KpiCard
                title="Doanh Thu Tháng"
                value={`${(dashboardData.monthlyRevenue / 1000000).toLocaleString("vi-VN")} Tr₫`}
                change="+15%"
                changeType="up"
                icon={<DollarSign className="w-5 h-5" />}
              />
              <KpiCard
                title="Chờ Xử Lý"
                value={dashboardData.pendingRequests.toString()}
                change={dashboardData.pendingRequests > 0 ? `+${dashboardData.pendingRequests}` : "0"}
                changeType={dashboardData.pendingRequests > 0 ? "up" : "down"}
                icon={<Clock className="w-5 h-5" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-primary font-semibold">
                    Xu Hướng Doanh Thu
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={dashboardData.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={resolvedTheme === "dark" ? "#30363D" : "#E3E8EF"} />
                    <XAxis dataKey="month" tick={{ fill: resolvedTheme === "dark" ? "#8B949E" : "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: resolvedTheme === "dark" ? "#8B949E" : "#6B7A8D", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => `${(v / 1000000).toFixed(0)}Tr`}
                    />
                    <Tooltip formatter={(value: number) => [`${(value / 1000000).toFixed(0)} Triệu ₫`, "Doanh Thu"]} />
                    <Line type="monotone" dataKey="revenue" stroke={resolvedTheme === "dark" ? "#60A5FA" : "#1D4ED8"} strokeWidth={2.5} dot={{ fill: resolvedTheme === "dark" ? "#60A5FA" : "#1D4ED8", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <MiniMonthCalendar events={parsedCalEvents} year={calYear} month={calMonth} />
              </div>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 border-b border-border/40 pb-2.5">
                <div className="flex flex-wrap items-center gap-4">
                  <h3 className="text-primary font-bold text-base shrink-0">
                    Yêu Cầu Chờ Duyệt
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setApprovalMode("campaign")}
                      className={`text-xs px-3.5 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                        approvalMode === "campaign"
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground/45"
                      }`}
                    >
                      Duyệt theo chiến dịch ({campaignsGrouped.filter(c => c.status === "PENDING").length})
                    </button>
                    <button
                      onClick={() => setApprovalMode("single")}
                      className={`text-xs px-3.5 py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
                        approvalMode === "single"
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground/45"
                      }`}
                    >
                      Duyệt theo bảng lẻ ({bookings.filter(b => b.status === "PENDING").length})
                    </button>
                  </div>
                </div>
                <button onClick={() => navigate("/owner/bookings")} className="text-sm text-accent hover:underline cursor-pointer shrink-0">
                  Xem Tất Cả
                </button>
              </div>
              {approvalMode === "campaign" ? (
                campaignsGrouped.filter(c => c.status === "PENDING").length === 0 ? (
                  <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground text-sm">
                    Không có yêu cầu duyệt chiến dịch nào chờ xử lý.
                  </div>
                ) : (
                  <DataTable columns={campaignColumns} data={campaignsGrouped.filter(c => c.status === "PENDING")} />
                )
              ) : (
                bookings.filter(b => b.status === "PENDING").length === 0 ? (
                  <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground text-sm">
                    Không có yêu cầu duyệt bảng lẻ nào chờ xử lý.
                  </div>
                ) : (
                  <DataTable columns={bookingColumns} data={bookings.filter(b => b.status === "PENDING")} />
                )
              )}
            </div>
          </div>
        )}

        {/* 2. MY BILLBOARDS VIEW */}
        {view === "billboards" && (
          <div className="p-8">
            {billboards.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center space-y-4">
                <Monitor className="w-12 h-12 text-[#94A3B8] mx-auto" />
                <h3 className="text-lg font-bold text-foreground">Chưa đăng bảng quảng cáo nào</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Bắt đầu kiếm doanh thu bằng cách đăng tải thông tin chi tiết bảng QC LED của bạn lên ADORA.
                </p>
                <button
                  onClick={openCreateModal}
                  className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm hover:bg-primary-hover font-semibold cursor-pointer"
                >
                  Đăng Tin Ngay
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {billboards.map(bb => {
                  const defaultImg = "https://images.unsplash.com/photo-1572945281861-68b1227368e5?w=500";
                  const thumb = bb.images?.find(img => img.isThumbnail)?.imageUrl || bb.images?.[0]?.imageUrl || defaultImg;
                  return (
                    <div key={bb.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="relative h-44 bg-muted">
                          <img src={thumb} alt={bb.title} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3">
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                                bb.status === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                  : bb.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                  : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                              }`}
                            >
                              {bb.status === "APPROVED" ? "Đã Duyệt" : bb.status === "PENDING" ? "Chờ Duyệt" : "Từ Chối"}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 space-y-3">
                          <h4 className="font-bold text-foreground text-base line-clamp-1">{bb.title}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{bb.district}, {bb.city}</span>
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">{bb.description}</div>
                          <div className="flex justify-between items-center pt-2 border-t border-border text-xs">
                            <span className="text-muted-foreground">Kích thước: <strong>{bb.width}m x {bb.height}m</strong></span>
                            <span className="text-muted-foreground">Loại: <strong>{bb.screenType}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-2 flex items-center justify-between bg-surface border-t border-border">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Giá Thuê Tháng</p>
                          <p className="font-extrabold text-sm text-primary">{(bb.pricePerMonth / 1000000).toLocaleString("vi-VN")}Tr / tháng</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(bb)}
                            className="w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer"
                            title="Sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBillboard(bb.id)}
                            className="w-8 h-8 rounded-lg border border-red-200/40 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. BOOKING REQUESTS VIEW */}
        {view === "bookings" && (
          <div className="p-8 space-y-6">
            {/* Pending content approvals banner */}
            {bookings.some(b => b.status === "PENDING" && getBookingCreative(b)) && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Có nội dung chiến dịch đang chờ duyệt</p>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">Nhà quảng cáo đã gửi creative để bạn xem xét. Vui lòng kiểm tra nội dung trước khi chấp nhận yêu cầu đặt chỗ.</p>
                </div>
              </div>
            )}

             <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <div>
                  <h3 className="text-primary font-bold text-lg">Yêu Cầu Đặt Chỗ Của Khách Hàng</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Quản lý và duyệt đặt bảng quảng cáo ngoài trời.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setApprovalMode("campaign")}
                    className={`text-xs px-4 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      approvalMode === "campaign"
                        ? "bg-primary text-white border-primary"
                        : "bg-surface border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Xem theo chiến dịch
                  </button>
                  <button
                    onClick={() => setApprovalMode("single")}
                    className={`text-xs px-4 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                      approvalMode === "single"
                        ? "bg-primary text-white border-primary"
                        : "bg-surface border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Xem theo bảng lẻ
                  </button>
                </div>
              </div>

              {/* Sub-tabs for Paid vs Unpaid bookings */}
              <div className="flex border-b border-border mb-6">
                <button
                  onClick={() => setPaymentFilter("unpaid")}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                    paymentFilter === "unpaid"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Chưa thanh toán
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    paymentFilter === "unpaid"
                      ? "bg-primary/15 text-primary font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {approvalMode === "campaign" ? campaignCounts.unpaid : bookingCounts.unpaid}
                  </span>
                </button>
                <button
                  onClick={() => setPaymentFilter("paid")}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                    paymentFilter === "paid"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Đã thanh toán
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    paymentFilter === "paid"
                      ? "bg-primary/15 text-primary font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {approvalMode === "campaign" ? campaignCounts.paid : bookingCounts.paid}
                  </span>
                </button>
                <button
                  onClick={() => setPaymentFilter("all")}
                  className={`px-4 py-2 text-sm font-semibold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
                    paymentFilter === "all"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tất cả
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    paymentFilter === "all"
                      ? "bg-primary/15 text-primary font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {approvalMode === "campaign" ? campaignCounts.all : bookingCounts.all}
                  </span>
                </button>
              </div>

              {approvalMode === "campaign" ? (
                filteredCampaigns.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {paymentFilter === "unpaid"
                      ? "Không có chiến dịch nào chưa thanh toán."
                      : paymentFilter === "paid"
                      ? "Không có chiến dịch nào đã thanh toán."
                      : "Chưa có chiến dịch nào."}
                  </div>
                ) : (
                  <DataTable columns={campaignColumns} data={filteredCampaigns} />
                )
              ) : (
                filteredBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {paymentFilter === "unpaid"
                      ? "Không có yêu cầu đặt chỗ nào chưa thanh toán."
                      : paymentFilter === "paid"
                      ? "Không có yêu cầu đặt chỗ nào đã thanh toán."
                      : "Chưa có yêu cầu đặt chỗ nào."}
                  </div>
                ) : (
                  <DataTable columns={bookingColumns} data={filteredBookings} />
                )
              )}
            </div>
          </div>
        )}

        {/* 4. REVENUE VIEW */}
        {view === "revenue" && dashboardData && (
          <OwnerRevenueView
            dashboardData={dashboardData}
            billboards={billboards}
            bookings={bookings}
          />
        )}

        {/* 5. SETTINGS VIEW */}
        {view === "settings" && <OwnerSettingsView />}

        {view === "messages" && <MessagesView role="OWNER" />}

        {view === "availability" && (
          <OwnerAvailabilityView
            billboards={billboards}
            bookings={bookings}
            isUsingFallback={isUsingFallback}
            onUpdated={loadAllData}
          />
        )}
      </main>

      {/* CONTENT APPROVAL PREVIEW MODAL */}
      {contentPreviewBooking && (() => {
        const creative = getBookingCreative(contentPreviewBooking);
        if (!creative) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setContentPreviewBooking(null)} />
            <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-2xl border border-border overflow-hidden"
              style={{ animation: "fadeIn 0.2s ease" }}>

              {/* Header */}
              <div className="px-5 py-4 border-b border-border flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-primary">Duyệt Nội Dung Chiến Dịch</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Từ: <strong className="text-foreground">{contentPreviewBooking.renter?.fullName}</strong>
                    {" · "}Bảng: <strong className="text-foreground">{contentPreviewBooking.billboard?.title}</strong>
                  </p>
                </div>
                <button onClick={() => setContentPreviewBooking(null)}
                  className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Campaign info */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-surface rounded-lg p-3 border border-border">
                    <p className="text-muted-foreground mb-0.5">Chiến dịch</p>
                    <p className="font-semibold text-foreground truncate">{creative.campaign}</p>
                  </div>
                  <div className="bg-surface rounded-lg p-3 border border-border">
                    <p className="text-muted-foreground mb-0.5">Thể loại</p>
                    <p className="font-semibold text-foreground">{creative.category}</p>
                  </div>
                  <div className="bg-surface rounded-lg p-3 border border-border">
                    <p className="text-muted-foreground mb-0.5">File</p>
                    <p className="font-semibold text-foreground truncate">{creative.name}</p>
                  </div>
                </div>

                {/* Billboard simulation */}
                <div className="bg-[#0A0A0A] rounded-xl p-3 border-2 border-[#1A1A2E]">
                  <div className="text-[10px] text-center text-white/40 mb-2 font-mono uppercase tracking-widest">
                    {contentPreviewBooking.billboard?.title} · Mô phỏng LED
                  </div>
                  <div className="relative rounded-lg overflow-hidden border-2 border-[#333]" style={{ aspectRatio: "16/9" }}>
                    {creative.type === "image" ? (
                      <img src={creative.url} alt={creative.name} className="w-full h-full object-cover" />
                    ) : (
                      <video src={creative.url} className="w-full h-full object-cover" autoPlay muted loop />
                    )}
                    {/* scan line */}
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(transparent 50%, rgba(0,0,0,0.04) 50%)", backgroundSize: "100% 4px" }} />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> PREVIEW
                    </div>
                  </div>
                </div>

                {/* Content guideline notice */}
                <div className="bg-[#EEF2FF] dark:bg-[#1D4ED8]/10 border border-[#C7D2FE] dark:border-[#1D4ED8]/30 rounded-xl p-3 text-xs text-[#4F46E5] dark:text-[#60A5FA]">
                  <strong>Tiêu chuẩn nội dung:</strong> Không chứa hình ảnh/nội dung chính trị, phản cảm, sai lệch thông tin hoặc vi phạm pháp luật. Nội dung phải phù hợp với môi trường công cộng.
                </div>

                {/* Reject reason input */}
                {showRejectInput && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Lý Do Từ Chối <span className="text-red-500">*</span></label>
                    <textarea
                      rows={3}
                      placeholder="Nội dung không phù hợp vì... / Vui lòng chỉnh sửa..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 resize-none transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Action footer */}
              <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-3 bg-surface/50">
                <button
                  onClick={() => setContentPreviewBooking(null)}
                  className="px-4 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted cursor-pointer font-semibold transition-colors"
                >
                  Đóng
                </button>
                <div className="flex items-center gap-2">
                  {!showRejectInput ? (
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 cursor-pointer transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Từ Chối Nội Dung
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                        className="px-3 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
                      >
                        Huỷ
                      </button>
                      <button
                        onClick={() => {
                          if (!rejectReason.trim()) return;
                          handleRejectBooking(contentPreviewBooking.id);
                          setContentPreviewBooking(null);
                        }}
                        disabled={!rejectReason.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-3.5 h-3.5" /> Xác Nhận Từ Chối
                      </button>
                    </>
                  )}
                  {!showRejectInput && (
                    <button
                      onClick={() => {
                        handleAcceptBooking(contentPreviewBooking.id);
                        setContentPreviewBooking(null);
                      }}
                      className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 cursor-pointer transition-colors shadow-md shadow-emerald-600/20"
                    >
                      <Check className="w-3.5 h-3.5" /> Duyệt Nội Dung
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* CAMPAIGN DETAIL MODAL */}
      {selectedCampaignDetail && (() => {
        const isPending = selectedCampaignDetail.status === "PENDING";
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedCampaignDetail(null)} />
            <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-3xl border border-border overflow-hidden animate-in fade-in duration-200">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-primary">Chi Tiết Chiến Dịch</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Nhà quảng cáo: <strong className="text-foreground">{selectedCampaignDetail.renter?.fullName}</strong> · {selectedCampaignDetail.renter?.email}
                  </p>
                </div>
                <button onClick={() => setSelectedCampaignDetail(null)}
                  className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs md:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left Column: Info & Creative Preview (5 cols) */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="bg-surface/50 rounded-xl p-4 border border-border space-y-2 text-xs">
                      <h4 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Thông tin chung</h4>
                      <div className="flex justify-between gap-2"><span className="text-muted-foreground">Tên chiến dịch:</span><span className="font-semibold text-foreground text-right">{selectedCampaignDetail.campaignName}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-muted-foreground">Thời gian:</span><span className="font-semibold text-foreground">{formatDate(selectedCampaignDetail.startDate)} - {formatDate(selectedCampaignDetail.endDate)}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-muted-foreground">Tổng ngân sách:</span><span className="font-bold text-primary">{selectedCampaignDetail.totalAmount.toLocaleString("vi-VN")}₫</span></div>
                      <div className="flex justify-between gap-2">
                        <span className="text-muted-foreground">Trạng thái:</span>
                        {(() => {
                          let variant: BadgeVariant = "pending";
                          let label = "Chờ duyệt";
                          const v = selectedCampaignDetail.status;
                          if (v === "OVERDUE") { variant = "expired"; label = "Quá hạn duyệt"; }
                          else if (v === "EXPIRED") { variant = "expired"; label = "Đã hết hạn"; }
                          else if (v === "PENDING") { variant = "pending"; label = "Chờ duyệt"; }
                          else if (v === "ACCEPTED") { variant = "booked"; label = "Đã chấp nhận"; }
                          else if (v === "REJECTED") { variant = "unavailable"; label = "Từ chối"; }
                          else if (v === "PAID") { variant = "active"; label = "Đã thanh toán"; }
                          return <StatusBadge variant={variant} label={label} />;
                        })()}
                      </div>
                    </div>

                    {selectedCampaignDetail.creative ? (
                      <div className="bg-[#0A0A0A] rounded-xl p-3 border border-border">
                        <div className="text-[10px] text-center text-white/40 mb-2 font-mono uppercase tracking-widest">Creative Preview</div>
                        <div className="relative rounded-lg overflow-hidden border border-[#333]" style={{ aspectRatio: "16/9" }}>
                          {selectedCampaignDetail.creative.type === "image" ? (
                            <img src={selectedCampaignDetail.creative.url} alt="creative" className="w-full h-full object-cover" />
                          ) : (
                            <video src={selectedCampaignDetail.creative.url} className="w-full h-full object-cover" autoPlay muted loop />
                          )}
                          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(transparent 50%, rgba(0,0,0,0.04) 50%)", backgroundSize: "100% 4px" }} />
                        </div>
                        <div className="mt-2 text-center text-xs">
                          <p className="font-semibold text-foreground">{selectedCampaignDetail.creative.name}</p>
                          <p className="text-muted-foreground text-[10px]">{selectedCampaignDetail.creative.category}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-surface rounded-xl p-6 border border-border text-center text-xs text-muted-foreground italic">
                        Chưa tải lên Creative cho chiến dịch này
                      </div>
                    )}
                  </div>

                  {/* Right Column: Billboard list & breakdown (7 cols) */}
                  <div className="md:col-span-7 space-y-4">
                    <h4 className="font-bold text-xs text-primary border-l-2 border-primary pl-2 uppercase tracking-wider">Danh Sách Bảng LED Trong Chiến Dịch</h4>
                    <div className="space-y-3">
                      {selectedCampaignDetail.bookings.map((b: BookingDto, idx: number) => {
                        const bPending = b.status === "PENDING";
                        return (
                          <div key={idx} className="bg-surface/30 border border-border/85 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-foreground">{b.billboard?.title}</p>
                              <p className="text-[10px] text-muted-foreground">{formatDate(b.startDate)} - {formatDate(b.endDate)}</p>
                              <p className="text-[10px] text-muted-foreground font-semibold">Giá trị thuê: <span className="text-foreground">{b.finalAmount?.toLocaleString("vi-VN")}₫</span></p>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {(() => {
                                const today = new Date("2026-06-01");
                                const start = new Date(b.startDate);
                                const end = new Date(b.endDate);
                                
                                let variant: BadgeVariant = "pending";
                                let label = "Chờ duyệt";
                                if (b.status === "PENDING" && start < today) {
                                  variant = "expired";
                                  label = "Quá hạn duyệt";
                                } else if (end < today) {
                                  variant = "expired";
                                  label = "Đã hết hạn";
                                } else if (b.status === "PENDING") {
                                  variant = "pending";
                                  label = "Chờ duyệt";
                                } else if (b.status === "ACCEPTED") {
                                  variant = "booked";
                                  label = "Chấp nhận";
                                } else if (b.status === "REJECTED") {
                                  variant = "unavailable";
                                  label = "Từ chối";
                                } else if (b.status === "PAID") {
                                  variant = "active";
                                  label = "Đã thanh toán";
                                }
                                return <StatusBadge variant={variant} label={label} />;
                              })()}
                              {bPending && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      handleAcceptBooking(b.id);
                                      if (isUsingFallback) {
                                        b.status = "ACCEPTED";
                                        setSelectedCampaignDetail({ ...selectedCampaignDetail });
                                      }
                                    }}
                                    className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 rounded cursor-pointer transition-colors"
                                    title="Duyệt bảng này"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleRejectBooking(b.id);
                                      if (isUsingFallback) {
                                        b.status = "REJECTED";
                                        setSelectedCampaignDetail({ ...selectedCampaignDetail });
                                      }
                                    }}
                                    className="p-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 rounded cursor-pointer transition-colors"
                                    title="Từ chối bảng này"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Campaign map overview */}
                <div className="space-y-2 mt-4 border-t border-border/30 pt-4">
                  <h4 className="font-bold text-xs text-primary border-l-2 border-primary pl-2 uppercase tracking-wider">Bản đồ vị trí các bảng LED</h4>
                  <div className="h-44 rounded-xl border border-border overflow-hidden relative bg-[#0D1117]">
                    <BillboardGoogleMap
                      billboards={selectedCampaignDetail.bookings.map((b: any) => b.billboard).filter(Boolean)}
                      selectedId={null}
                      fitBounds={true}
                      className="absolute inset-0"
                    />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-border bg-surface/50 flex items-center justify-between gap-3">
                <button onClick={() => setSelectedCampaignDetail(null)}
                  className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted cursor-pointer transition-colors">
                  Đóng
                </button>
                {isPending && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleRejectCampaign(selectedCampaignDetail.campaignName, selectedCampaignDetail.bookings);
                        setSelectedCampaignDetail(null);
                      }}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 dark:bg-red-500/10 dark:text-red-400 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                    >
                      Từ Chối Toàn Bộ
                    </button>
                    <button
                      onClick={() => {
                        handleAcceptCampaign(selectedCampaignDetail.campaignName, selectedCampaignDetail.bookings);
                        setSelectedCampaignDetail(null);
                      }}
                      className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 cursor-pointer transition-colors shadow-md shadow-emerald-600/20"
                    >
                      Duyệt Toàn Bộ
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {/* CREATE & EDIT BILLBOARD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-[#E3E8EF] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-[#1D4ED8]">
                {editingBillboardId ? "Cập nhật bảng quảng cáo" : "Đăng ký bảng quảng cáo mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B7A8D] hover:text-slate-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#6B7A8D] mb-1">Tên bảng quảng cáo *</label>
                <input
                  required
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="VD: LED Cầu Rồng"
                  className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/80 space-y-4">
                <h4 className="font-bold text-sm text-[#1D4ED8] pb-1 border-b border-[#E3E8EF]">
                  Vị trí bảng quảng cáo
                </h4>
                <LocationPicker
                  value={{
                    formattedAddress: formFormattedAddress,
                    addressDetail: formAddressDetail,
                    ward: formWard,
                    district: formDistrict,
                    city: formCity,
                    latitude: formLatitude,
                    longitude: formLongitude,
                  }}
                  onChange={(val) => {
                    setFormFormattedAddress(val.formattedAddress || "");
                    setFormAddress(val.addressDetail ? `${val.addressDetail}, ${val.formattedAddress}` : (val.formattedAddress || ""));
                    setFormAddressDetail(val.addressDetail || "");
                    setFormWard(val.ward || "");
                    setFormDistrict(val.district || "");
                    setFormCity(val.city || "");
                    setFormLatitude(val.latitude);
                    setFormLongitude(val.longitude);
                  }}
                />
                {(formLatitude == null || formLongitude == null) && (
                  <p className="text-red-500 font-semibold text-xs mt-1">
                    * Vui lòng chọn vị trí chính xác trên bản đồ.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Chiều rộng (m) *</label>
                  <input
                    required
                    type="number"
                    value={formWidth}
                    onChange={e => setFormWidth(Number(e.target.value))}
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Chiều cao (m) *</label>
                  <input
                    required
                    type="number"
                    value={formHeight}
                    onChange={e => setFormHeight(Number(e.target.value))}
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Độ phân giải *</label>
                  <input
                    required
                    type="text"
                    value={formResolution}
                    onChange={e => setFormResolution(e.target.value)}
                    placeholder="VD: 1920x1080"
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Độ sáng *</label>
                  <input
                    required
                    type="text"
                    value={formBrightness}
                    onChange={e => setFormBrightness(e.target.value)}
                    placeholder="VD: 6000 nits"
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Tần số quét *</label>
                  <input
                    required
                    type="text"
                    value={formRefreshRate}
                    onChange={e => setFormRefreshRate(e.target.value)}
                    placeholder="VD: 3840Hz"
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Loại màn hình *</label>
                  <input
                    required
                    type="text"
                    value={formScreenType}
                    onChange={e => setFormScreenType(e.target.value)}
                    placeholder="VD: Outdoor LED"
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Giờ hoạt động *</label>
                  <input
                    required
                    type="text"
                    value={formOperatingHours}
                    onChange={e => setFormOperatingHours(e.target.value)}
                    placeholder="VD: 06:00 - 23:00"
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Tính năng (phân tách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={formFeatures}
                    onChange={e => setFormFeatures(e.target.value)}
                    placeholder="VD: UHD, weatherproof, HDR"
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Giá thuê / ngày *</label>
                  <input
                    required
                    type="number"
                    value={formPricePerDay}
                    onChange={e => setFormPricePerDay(Number(e.target.value))}
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Giá thuê / tháng *</label>
                  <input
                    required
                    type="number"
                    value={formPricePerMonth}
                    onChange={e => setFormPricePerMonth(Number(e.target.value))}
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Phụ phí vị trí (nếu có)</label>
                  <input
                    type="number"
                    value={formLocationSurcharge}
                    onChange={e => setFormLocationSurcharge(Number(e.target.value))}
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#6B7A8D] mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Nhập thông tin mô tả về vị trí bảng..."
                  className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="block font-medium text-[#6B7A8D] mb-2 text-xs">Danh sách hình ảnh minh họa ({formImages.length} ảnh) *</label>
                
                <div className="grid grid-cols-5 gap-3 mb-2">
                  {formImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-[#E3E8EF] bg-slate-50 flex items-center justify-center">
                      <img src={img.imageUrl} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200 z-10"
                        title="Xóa ảnh này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {img.isThumbnail ? (
                        <span className="absolute bottom-1 left-1 bg-[#1D4ED8] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase z-10 shadow-sm">
                          Đại diện
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetThumbnail(idx)}
                          className="absolute bottom-1 left-1 bg-black/60 hover:bg-[#1D4ED8] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200 shadow-sm border border-white/10"
                        >
                          Đặt đại diện
                        </button>
                      )}
                    </div>
                  ))}

                  <label className={`aspect-square rounded-lg border-2 border-dashed border-[#E3E8EF] hover:border-[#1D4ED8] bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${imageUploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <Plus className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[9px] font-bold text-slate-500">{imageUploading ? "Đang tải..." : "Tải thêm"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={imageUploading}
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                
                <p className="text-[10px] text-slate-400">
                  * Nhấp vào dấu + để tải lên nhiều ảnh cùng lúc. Di chuột vào ảnh và nhấp "Đặt đại diện" để chọn ảnh hiển thị ở trang chủ.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E3E8EF] rounded-lg text-sm text-[#6B7A8D] hover:bg-gray-50 cursor-pointer font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting || formLatitude == null || formLongitude == null}
                  className="px-5 py-2 bg-[#1D4ED8] text-white rounded-lg text-sm hover:bg-[#3B82F6] transition-colors cursor-pointer font-bold disabled:opacity-50"
                >
                  {submitting ? "Đang gửi..." : "Đăng Ký"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING DETAIL MODAL */}
      {isDetailModalOpen && selectedBookingDetail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-xl max-w-xl w-full p-6 shadow-2xl border border-border/80 max-h-[90vh] overflow-y-auto text-xs md:text-sm">
            <div className="flex justify-between items-center border-b border-border/40 pb-3.5 mb-4">
              <div>
                <h3 className="text-base md:text-lg font-bold text-primary">Chi tiết yêu cầu đặt chỗ</h3>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Mã đặt chỗ: #{selectedBookingDetail.id}</p>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)} 
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md hover:bg-muted/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Status Header */}
              <div className="flex items-center justify-between bg-muted/30 border border-border/40 rounded-xl p-3.5">
                <span className="font-semibold text-muted-foreground">Trạng thái đặt chỗ:</span>
                <div>
                  {(() => {
                    let variant: BadgeVariant = "pending";
                    let label = "Chờ duyệt";
                    const v = selectedBookingDetail.status;
                    if (v === "ACCEPTED") { variant = "booked"; label = "Đã chấp nhận"; }
                    else if (v === "REJECTED") { variant = "unavailable"; label = "Từ chối"; }
                    else if (v === "CANCELLED") { variant = "expired"; label = "Đã hủy"; }
                    else if (v === "PAID") { variant = "active"; label = "Đã thanh toán"; }
                    else if (v === "COMPLETED") { variant = "expired"; label = "Hoàn thành"; }
                    return <StatusBadge variant={variant} label={label} />;
                  })()}
                </div>
              </div>

              {/* Renter Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-primary border-l-2 border-primary pl-2 uppercase tracking-wider text-[10px]">Nhà Quảng Cáo</h4>
                <div className="grid grid-cols-2 gap-3 bg-muted/20 border border-border/30 rounded-xl p-3.5">
                  <div>
                    <span className="block text-[10px] text-muted-foreground uppercase">Họ và tên</span>
                    <span className="font-semibold text-foreground">{selectedBookingDetail.renter?.fullName || "Chưa có"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground uppercase">Công ty</span>
                    <span className="font-semibold text-foreground">{selectedBookingDetail.renter?.companyName || "Cá nhân"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground uppercase">Email liên hệ</span>
                    <span className="font-medium text-foreground">{selectedBookingDetail.renter?.email || "Chưa có"}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground uppercase">Số điện thoại</span>
                    <span className="font-medium text-foreground">{selectedBookingDetail.renter?.phone || "Chưa có"}</span>
                  </div>
                </div>
              </div>

              {/* Billboard Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-primary border-l-2 border-primary pl-2 uppercase tracking-wider text-[10px]">Thông tin bảng quảng cáo</h4>
                <div className="bg-muted/20 border border-border/30 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-foreground text-sm">{selectedBookingDetail.billboard?.title}</span>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold uppercase">
                      {selectedBookingDetail.billboard?.screenType}
                    </span>
                  </div>
                  <div className="flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground/80" />
                    <span>{selectedBookingDetail.billboard?.address}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30 text-xs">
                    <div>Kích thước: <strong>{selectedBookingDetail.billboard?.width}m x {selectedBookingDetail.billboard?.height}m</strong></div>
                    <div>Độ phân giải: <strong>{selectedBookingDetail.billboard?.resolution}</strong></div>
                  </div>
                </div>
              </div>

              {/* Booking Period & Pricing */}
              <div className="space-y-2">
                <h4 className="font-bold text-primary border-l-2 border-primary pl-2 uppercase tracking-wider text-[10px]">Thời gian & chi phí thuê</h4>
                <div className="bg-muted/20 border border-border/30 rounded-xl p-3.5 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] text-muted-foreground uppercase">Ngày bắt đầu</span>
                      <span className="font-bold text-foreground">{formatDate(selectedBookingDetail.startDate)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-muted-foreground uppercase">Ngày kết thúc</span>
                      <span className="font-bold text-foreground">{formatDate(selectedBookingDetail.endDate)}</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-border/30 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giá thuê (tạm tính):</span>
                      <span className="font-semibold text-foreground">{selectedBookingDetail.totalPrice?.toLocaleString("vi-VN")}₫</span>
                    </div>
                    {selectedBookingDetail.locationSurcharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phụ phí vị trí:</span>
                        <span className="font-semibold text-foreground">+{selectedBookingDetail.locationSurcharge?.toLocaleString("vi-VN")}₫</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí dịch vụ sàn (5%):</span>
                      <span className="font-semibold text-red-500">-{selectedBookingDetail.serviceFee?.toLocaleString("vi-VN")}₫</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border/30 items-end">
                      <span className="font-bold text-sm">Thu nhập thực nhận (Net):</span>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {selectedBookingDetail.finalAmount?.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Notes */}
              {selectedBookingDetail.note && (
                <div className="space-y-2">
                  <h4 className="font-bold text-primary border-l-2 border-primary pl-2 uppercase tracking-wider text-[10px]">Thông điệp chiến dịch (Note)</h4>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 text-xs text-foreground italic leading-relaxed">
                    &ldquo;{selectedBookingDetail.note}&rdquo;
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border/30 mt-6">
              {selectedBookingDetail.status === "PENDING" ? (
                <>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleRejectBooking(selectedBookingDetail.id);
                    }}
                    className="px-4 py-2 border border-red-200 dark:border-red-950/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Từ Chối
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleAcceptBooking(selectedBookingDetail.id);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                  >
                    Chấp Nhận
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-hover cursor-pointer"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <MobileBottomNav />
    </div>
  );
}
