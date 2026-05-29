import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Monitor, BarChart3, DollarSign, Clock, Check, X, Eye, Edit2, Trash2, AlertTriangle, Plus, MapPin } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { DataTable } from "../components/DataTable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import ownerApi, { CreateBillboardRequest } from "../../api/ownerApi";
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
  const { user } = useAuth();
  const confirm = useConfirm();

  const [dashboardData, setDashboardData] = useState<OwnerDashboardDto | null>(null);
  const [billboards, setBillboards] = useState<BillboardDto[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

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
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formFeatures, setFormFeatures] = useState("UHD, weather-proof");
  const [submitting, setSubmitting] = useState(false);

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
    try {
      const [dbRes, bbRes, bkRes] = await Promise.all([
        ownerApi.getDashboardData(),
        ownerApi.getMyBillboards(),
        ownerApi.getBookings(),
      ]);

      const bkData = bkRes.success && bkRes.data ? bkRes.data : [];
      const bbData = bbRes.success && bbRes.data ? bbRes.data : [];
      const dbData = dbRes.success && dbRes.data ? dbRes.data : null;

      if (!dbRes.success && !bbRes.success && !bkRes.success) {
        throw new Error("All owner APIs failed");
      }

      setDashboardData({
        ...(dbData ?? mockOwnerDashboard),
        recentBookingRequests: bkData.filter((b) => b.status === "PENDING").slice(0, 5),
        pendingRequests: bkData.filter((b) => b.status === "PENDING").length,
      });
      setBillboards(bbData);
      setBookings(bkData);
      setIsUsingFallback(false);
    } catch (error) {
      console.warn("Owner Dashboard APIs failed, loading simulated mode:", error);
      setIsUsingFallback(true);
      setDashboardData({
        ...mockOwnerDashboard,
        recentBookingRequests: mockBookings.filter((b) => b.status === "PENDING"),
      });
      setBillboards(mockBillboards);
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
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
    setFormImageUrl("");
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
    setFormImageUrl(bb.images?.[0]?.imageUrl || "");
    setFormFeatures(bb.features?.map(f => f.name).join(", ") || "");
    setIsModalOpen(true);
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
                  images: formImageUrl ? [{ id: 999, imageUrl: formImageUrl, isThumbnail: true }] : bb.images
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
          images: formImageUrl ? [{ id: Date.now(), imageUrl: formImageUrl, isThumbnail: true }] : [],
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
          if (formImageUrl) {
            await ownerApi.addBillboardImage(res.data.id, { imageUrl: formImageUrl, isThumbnail: true });
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
          if (formImageUrl) {
            await ownerApi.addBillboardImage(res.data.id, { imageUrl: formImageUrl, isThumbnail: true });
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
      render: (v: string) => {
        let variant: BadgeVariant = "pending";
        let label = "Chờ duyệt";
        if (v === "ACCEPTED") { variant = "booked"; label = "Đã chấp nhận"; }
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
      render: (_: any, row: BookingDto) => (
        <div className="flex items-center gap-2">
          {row.status === "PENDING" ? (
            <>
              <button
                onClick={() => handleAcceptBooking(row.id)}
                className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-md hover:bg-emerald-100 cursor-pointer font-semibold"
              >
                <Check className="w-3 h-3" /> Chấp Nhận
              </button>
              <button
                onClick={() => handleRejectBooking(row.id)}
                className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-md hover:bg-red-100 cursor-pointer font-semibold"
              >
                <X className="w-3 h-3" /> Từ Chối
              </button>
            </>
          ) : (
            <button className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer">
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  if (loading && !dashboardData) {
    return (
      <div className="flex h-screen bg-[#F0F9FF]">
        <DashboardSidebar role="owner" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E3E8EF] border-t-[#1D4ED8]"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F0F9FF]">
      <DashboardSidebar role="owner" />
      <main className="flex-1 overflow-y-auto">
        {isUsingFallback && (
          <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex items-center gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chế độ ngoại tuyến:</strong> Đang hiển thị dữ liệu mô phỏng do không kết nối được với máy chủ API.
            </span>
          </div>
        )}

        <div className="bg-white border-b border-[#E3E8EF] px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#1D4ED8]" style={{ fontWeight: 700 }}>
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
              <p className="text-sm text-[#6B7A8D] mt-0.5">
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
                value={`${dashboardData.fillRate}%`}
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
              <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E8EF] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>
                    Xu Hướng Doanh Thu
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={dashboardData.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                    <XAxis dataKey="month" tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: "#6B7A8D", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => `${(v / 1000000).toFixed(0)}Tr`}
                    />
                    <Tooltip formatter={(value: number) => [`${(value / 1000000).toFixed(0)} Triệu ₫`, "Doanh Thu"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#1D4ED8" strokeWidth={2.5} dot={{ fill: "#1D4ED8", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
                <MiniMonthCalendar events={parsedCalEvents} year={calYear} month={calMonth} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>
                  Yêu Cầu Đặt Chỗ Chờ Duyệt
                </h3>
                <button onClick={() => navigate("/owner/bookings")} className="text-sm text-[#06B6D4] hover:underline cursor-pointer">
                  Xem Tất Cả
                </button>
              </div>
              {dashboardData.recentBookingRequests.length === 0 ? (
                <div className="bg-white rounded-lg border border-[#E3E8EF] p-8 text-center text-[#6B7A8D] text-sm">
                  Không có yêu cầu đặt chỗ nào chờ xử lý.
                </div>
              ) : (
                <DataTable columns={bookingColumns} data={dashboardData.recentBookingRequests} />
              )}
            </div>
          </div>
        )}

        {/* 2. MY BILLBOARDS VIEW */}
        {view === "billboards" && (
          <div className="p-8">
            {billboards.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E3E8EF] p-12 text-center space-y-4">
                <Monitor className="w-12 h-12 text-[#94A3B8] mx-auto" />
                <h3 className="text-lg font-bold text-[#1E293B]">Chưa đăng bảng quảng cáo nào</h3>
                <p className="text-[#6B7A8D] text-sm max-w-sm mx-auto">
                  Bắt đầu kiếm doanh thu bằng cách đăng tải thông tin chi tiết bảng QC LED của bạn lên ADORA.
                </p>
                <button
                  onClick={openCreateModal}
                  className="bg-[#1D4ED8] text-white px-5 py-2.5 rounded-lg text-sm hover:bg-[#3B82F6] font-semibold cursor-pointer"
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
                    <div key={bb.id} className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="relative h-44 bg-slate-100">
                          <img src={thumb} alt={bb.title} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3">
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                                bb.status === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : bb.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              }`}
                            >
                              {bb.status === "APPROVED" ? "Đã Duyệt" : bb.status === "PENDING" ? "Chờ Duyệt" : "Từ Chối"}
                            </span>
                          </div>
                        </div>
                        <div className="p-5 space-y-3">
                          <h4 className="font-bold text-[#1E293B] text-base line-clamp-1">{bb.title}</h4>
                          <div className="flex items-center gap-1 text-xs text-[#6B7A8D]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{bb.district}, {bb.city}</span>
                          </div>
                          <div className="text-xs text-[#6B7A8D] line-clamp-2 min-h-[32px]">{bb.description}</div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs">
                            <span className="text-[#6B7A8D]">Kích thước: <strong>{bb.width}m x {bb.height}m</strong></span>
                            <span className="text-[#6B7A8D]">Loại: <strong>{bb.screenType}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="px-5 pb-5 pt-2 flex items-center justify-between bg-slate-50 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] text-[#6B7A8D] uppercase font-bold">Giá Thuê Tháng</p>
                          <p className="font-extrabold text-sm text-[#1D4ED8]">{(bb.pricePerMonth / 1000000).toLocaleString("vi-VN")}Tr / tháng</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(bb)}
                            className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                            title="Sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBillboard(bb.id)}
                            className="w-8 h-8 rounded-lg border border-red-200 hover:bg-red-50 flex items-center justify-center text-red-600 cursor-pointer"
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
          <div className="p-8">
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <h3 className="text-[#1D4ED8] font-bold text-lg mb-6">Yêu Cầu Đặt Chỗ Của Khách Hàng</h3>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-[#6B7A8D] text-sm">Chưa có yêu cầu đặt chỗ nào.</div>
              ) : (
                <DataTable columns={bookingColumns} data={bookings} />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#6B7A8D] mb-1">Đường dẫn hình ảnh minh họa (URL)</label>
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={e => setFormImageUrl(e.target.value)}
                    placeholder="VD: https://example.com/image.jpg"
                    className="w-full border border-[#E3E8EF] rounded-lg p-2 focus:outline-none focus:border-[#1D4ED8]"
                  />
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
    </div>
  );
}
