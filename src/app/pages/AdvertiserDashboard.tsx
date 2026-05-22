import React, { useEffect, useState, useMemo } from "react";
import { Megaphone, DollarSign, Calendar, Heart, MoreHorizontal, Eye, Download, AlertTriangle } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { DataTable } from "../components/DataTable";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import renterDashboardApi from "../../api/renterDashboardApi";
import bookingApi from "../../api/bookingApi";
import paymentApi from "../../api/paymentApi";
import reviewApi from "../../api/reviewApi";
import { RenterDashboardDto } from "../../types/dashboard";

type BadgeVariant = "active" | "pending" | "booked" | "expired" | "available" | "unavailable";

const mockDashboardData: RenterDashboardDto = {
  activeCampaigns: 8,
  totalSpending: 370000000,
  upcomingBookings: [
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
      billboard: {
        id: 102,
        title: "Bạch Đằng Digital",
        description: "",
        address: "Bạch Đằng, Sơn Trà",
        city: "Đà Nẵng",
        district: "Sơn Trà",
        width: 10,
        height: 5,
        resolution: "1920x1080",
        brightness: 6000,
        refreshRate: 60,
        screenType: "LED",
        operatingHours: "18h",
        pricePerDay: 2000000,
        pricePerMonth: 55000000,
        locationSurcharge: 0,
        status: "APPROVED",
        dailyViews: 100000,
        isFeatured: true,
        images: [],
        features: [],
        availabilities: []
      }
    },
    {
      id: 3,
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      totalPrice: 68000000,
      serviceFee: 3400000,
      locationSurcharge: 0,
      finalAmount: 71400000,
      status: "ACCEPTED",
      note: "Chiến dịch Nguyễn Văn Linh Screen",
      billboard: {
        id: 103,
        title: "Nguyễn Văn Linh Screen",
        description: "",
        address: "Nguyễn Văn Linh, Thanh Khê",
        city: "Đà Nẵng",
        district: "Thanh Khê",
        width: 8,
        height: 4,
        resolution: "1280x720",
        brightness: 5000,
        refreshRate: 60,
        screenType: "LED",
        operatingHours: "16h",
        pricePerDay: 1500000,
        pricePerMonth: 68000000,
        locationSurcharge: 0,
        status: "APPROVED",
        dailyViews: 80000,
        isFeatured: false,
        images: [],
        features: [],
        availabilities: []
      }
    }
  ],
  savedBillboards: [],
  recentBookings: [
    {
      id: 1,
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      totalPrice: 85000000,
      serviceFee: 4250000,
      locationSurcharge: 0,
      finalAmount: 89250000,
      status: "PAID",
      note: "Chiến dịch Cầu Rồng LED",
      billboard: {
        id: 101,
        title: "Cầu Rồng LED",
        description: "",
        address: "Hải Châu, Đà Nẵng",
        city: "Đà Nẵng",
        district: "Hải Châu",
        width: 12,
        height: 6,
        resolution: "1920x1080",
        brightness: 7000,
        refreshRate: 60,
        screenType: "LED",
        operatingHours: "24h",
        pricePerDay: 3000000,
        pricePerMonth: 85000000,
        locationSurcharge: 0,
        status: "APPROVED",
        dailyViews: 150000,
        isFeatured: true,
        images: [],
        features: [],
        availabilities: []
      }
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
      billboard: {
        id: 102,
        title: "Bạch Đằng Digital",
        description: "",
        address: "Bạch Đằng, Sơn Trà",
        city: "Đà Nẵng",
        district: "Sơn Trà",
        width: 10,
        height: 5,
        resolution: "1920x1080",
        brightness: 6000,
        refreshRate: 60,
        screenType: "LED",
        operatingHours: "18h",
        pricePerDay: 2000000,
        pricePerMonth: 55000000,
        locationSurcharge: 0,
        status: "APPROVED",
        dailyViews: 100000,
        isFeatured: true,
        images: [],
        features: [],
        availabilities: []
      }
    },
    {
      id: 3,
      startDate: "2026-04-01",
      endDate: "2026-04-30",
      totalPrice: 68000000,
      serviceFee: 3400000,
      locationSurcharge: 0,
      finalAmount: 71400000,
      status: "ACCEPTED",
      note: "Chiến dịch Nguyễn Văn Linh Screen",
      billboard: {
        id: 103,
        title: "Nguyễn Văn Linh Screen",
        description: "",
        address: "Nguyễn Văn Linh, Thanh Khê",
        city: "Đà Nẵng",
        district: "Thanh Khê",
        width: 8,
        height: 4,
        resolution: "1280x720",
        brightness: 5000,
        refreshRate: 60,
        screenType: "LED",
        operatingHours: "16h",
        pricePerDay: 1500000,
        pricePerMonth: 68000000,
        locationSurcharge: 0,
        status: "APPROVED",
        dailyViews: 80000,
        isFeatured: false,
        images: [],
        features: [],
        availabilities: []
      }
    },
    {
      id: 4,
      startDate: "2026-02-01",
      endDate: "2026-02-28",
      totalPrice: 42000000,
      serviceFee: 2100000,
      locationSurcharge: 0,
      finalAmount: 44100000,
      status: "CANCELLED",
      note: "Chiến dịch Mỹ Khê Beach LED",
      billboard: {
        id: 104,
        title: "Mỹ Khê Beach LED",
        description: "",
        address: "Võ Nguyên Giáp, Ngũ Hành Sơn",
        city: "Đà Nẵng",
        district: "Ngũ Hành Sơn",
        width: 10,
        height: 5,
        resolution: "1920x1080",
        brightness: 6500,
        refreshRate: 60,
        screenType: "LED",
        operatingHours: "24h",
        pricePerDay: 2500000,
        pricePerMonth: 42000000,
        locationSurcharge: 0,
        status: "APPROVED",
        dailyViews: 120000,
        isFeatured: true,
        images: [],
        features: [],
        availabilities: []
      }
    },
    {
      id: 5,
      startDate: "2026-03-10",
      endDate: "2026-04-10",
      totalPrice: 120000000,
      serviceFee: 6000000,
      locationSurcharge: 0,
      finalAmount: 126000000,
      status: "PAID",
      note: "Chiến dịch Vincom Đà Nẵng",
      billboard: {
        id: 105,
        title: "Vincom Đà Nẵng",
        description: "",
        address: "Ngô Quyền, Sơn Trà",
        city: "Đà Nẵng",
        district: "Sơn Trà",
        width: 12,
        height: 6,
        resolution: "1920x1080",
        brightness: 7000,
        refreshRate: 60,
        screenType: "LED",
        operatingHours: "18h",
        pricePerDay: 3500000,
        pricePerMonth: 120000000,
        locationSurcharge: 0,
        status: "APPROVED",
        dailyViews: 200000,
        isFeatured: true,
        images: [],
        features: [],
        availabilities: []
      }
    }
  ],
  campaignPerformance: [
    { month: "T9", impressions: 120000, clicks: 3400 },
    { month: "T10", impressions: 185000, clicks: 5200 },
    { month: "T11", impressions: 210000, clicks: 6100 },
    { month: "T12", impressions: 195000, clicks: 5800 },
    { month: "T1", impressions: 240000, clicks: 7200 },
    { month: "T2", impressions: 280000, clicks: 8400 }
  ]
};

const mapBookingStatus = (status: string): { variant: BadgeVariant; label: string } => {
  switch (status.toUpperCase()) {
    case "PENDING":
      return { variant: "pending", label: "Chờ duyệt" };
    case "ACCEPTED":
      return { variant: "booked", label: "Chờ thanh toán" };
    case "REJECTED":
      return { variant: "unavailable", label: "Bị từ chối" };
    case "CANCELLED":
      return { variant: "expired", label: "Đã hủy" };
    case "PAID":
      return { variant: "active", label: "Đang hoạt động" };
    case "COMPLETED":
      return { variant: "expired", label: "Hoàn thành" };
    default:
      return { variant: "expired", label: status };
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

export default function AdvertiserDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<RenterDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Review Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await renterDashboardApi.get();
      if (response.success && response.data) {
        setData(response.data);
        setIsUsingFallback(false);
      } else {
        throw new Error(response.message || "Failed to fetch");
      }
    } catch (error) {
      console.warn("Renter Dashboard API failed, falling back to mock:", error);
      setData(mockDashboardData);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đặt chỗ này?")) return;
    if (isUsingFallback) {
      setData((prev) => {
        if (!prev) return null;
        const updatedRecent = prev.recentBookings.map((b) =>
          b.id === bookingId ? { ...b, status: "CANCELLED" as const } : b
        );
        const updatedUpcoming = prev.upcomingBookings.filter((b) => b.id !== bookingId);
        return {
          ...prev,
          recentBookings: updatedRecent,
          upcomingBookings: updatedUpcoming,
        };
      });
      alert("Hủy đặt chỗ thành công! (Mô phỏng)");
      return;
    }

    try {
      const response = await bookingApi.cancel(bookingId);
      if (response.success) {
        alert("Hủy đặt chỗ thành công!");
        fetchDashboardData();
      } else {
        alert(response.message || "Không thể hủy đặt chỗ.");
      }
    } catch (error: any) {
      console.error("Cancel booking error:", error);
      alert(error?.response?.data?.message || "Lỗi khi hủy đặt chỗ.");
    }
  };

  const handlePayBooking = async (bookingId: number) => {
    if (isUsingFallback) {
      setData((prev) => {
        if (!prev) return null;
        const updatedRecent = prev.recentBookings.map((b) =>
          b.id === bookingId ? { ...b, status: "PAID" as const } : b
        );
        const updatedUpcoming = prev.upcomingBookings.map((b) =>
          b.id === bookingId ? { ...b, status: "PAID" as const } : b
        );
        return {
          ...prev,
          recentBookings: updatedRecent,
          upcomingBookings: updatedUpcoming,
        };
      });
      alert("Thanh toán thành công! (Mô phỏng)");
      return;
    }

    try {
      const response = await paymentApi.create({ bookingId, paymentMethod: "VNPAY" });
      if (response.success && response.data) {
        window.location.href = response.data;
      } else {
        alert(response.message || "Không thể khởi tạo thanh toán.");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      alert(error?.response?.data?.message || "Lỗi khi khởi tạo thanh toán.");
    }
  };

  const handleOpenReview = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setRating(5);
    setComment("");
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;
    setSubmittingReview(true);

    if (isUsingFallback) {
      alert("Gửi đánh giá thành công! (Mô phỏng)");
      setIsReviewModalOpen(false);
      setSubmittingReview(false);
      return;
    }

    try {
      const response = await reviewApi.create({
        bookingId: selectedBookingId,
        rating,
        comment,
      });
      if (response.success) {
        alert("Gửi đánh giá thành công!");
        setIsReviewModalOpen(false);
        fetchDashboardData();
      } else {
        alert(response.message || "Không thể gửi đánh giá.");
      }
    } catch (error: any) {
      console.error("Submit review error:", error);
      alert(error?.response?.data?.message || "Lỗi khi gửi đánh giá.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // KPI calculations
  const activeCampaigns = data?.activeCampaigns ?? 0;
  const totalSpending = data?.totalSpending ?? 0;
  const upcomingBookingsCount = data?.upcomingBookings?.length ?? 0;
  const savedBillboardsCount = data?.savedBillboards?.length ?? 0;

  const formatSpending = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toLocaleString("vi-VN")} Tr₫`;
    }
    return `${amount.toLocaleString("vi-VN")}₫`;
  };

  // Chart data mapping
  const chartData = useMemo(() => {
    return (data?.campaignPerformance || []).map((p) => ({
      month: p.month,
      impressions: p.views !== undefined ? p.views : p.impressions !== undefined ? p.impressions : 0,
      clicks: p.clicks !== undefined ? p.clicks : 0,
    }));
  }, [data]);

  // Bookings list mapping
  const tableData = useMemo(() => {
    return (data?.recentBookings || []).map((b) => ({
      id: b.id,
      billboard: b.billboard?.title || "Bảng quảng cáo",
      location: b.billboard ? `${b.billboard.district}, ${b.billboard.city}` : "Đà Nẵng",
      date: `${formatDate(b.startDate)} - ${formatDate(b.endDate)}`,
      status: b.status,
      rawStatus: b.status,
      payment: b.finalAmount.toLocaleString("vi-VN") + "₫",
    }));
  }, [data]);

  // Calendar events parsing for March 2026
  const parsedCalEvents = useMemo(() => {
    const events: Array<{ day: number; title: string; color: string }> = [];
    const bookingsList = [...(data?.upcomingBookings || []), ...(data?.recentBookings || [])];
    const seenIds = new Set<number>();

    bookingsList.forEach((b) => {
      if (seenIds.has(b.id)) return;
      seenIds.add(b.id);

      if (b.startDate && b.startDate.includes("-03-")) {
        const parts = b.startDate.split("-");
        const day = parseInt(parts[2], 10);
        if (!isNaN(day)) {
          events.push({
            day,
            title: `${b.billboard?.title || "QC"} - Bắt đầu`,
            color: "bg-[#3B82F6]",
          });
        }
      }
      if (b.endDate && b.endDate.includes("-03-")) {
        const parts = b.endDate.split("-");
        const day = parseInt(parts[2], 10);
        if (!isNaN(day)) {
          events.push({
            day,
            title: `${b.billboard?.title || "QC"} - Kết thúc`,
            color: "bg-emerald-500",
          });
        }
      }
    });

    events.sort((a, b) => a.day - b.day);
    return events;
  }, [data]);

  const columns = [
    {
      key: "billboard",
      label: "Bảng QC",
      render: (v: string) => (
        <span style={{ fontWeight: 500 }} className="text-[#1D4ED8]">
          {v}
        </span>
      ),
    },
    { key: "location", label: "Vị Trí" },
    { key: "date", label: "Thời Gian" },
    {
      key: "status",
      label: "Trạng Thái",
      render: (v: string) => {
        const { variant, label } = mapBookingStatus(v);
        return <StatusBadge variant={variant} label={label} />;
      },
    },
    {
      key: "payment",
      label: "Thanh Toán",
      render: (v: string) => (
        <span style={{ fontWeight: 600 }} className="text-[#1D4ED8]">
          {v}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao Tác",
      render: (_: any, row: any) => {
        const status = row.rawStatus;
        return (
          <div className="flex items-center gap-2">
            <button
              className="w-7 h-7 rounded-md hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer"
              title="Chi tiết"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {status === "PENDING" && (
              <button
                onClick={() => handleCancelBooking(row.id)}
                className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors cursor-pointer"
              >
                Hủy
              </button>
            )}
            {status === "ACCEPTED" && (
              <button
                onClick={() => handlePayBooking(row.id)}
                className="px-2 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
              >
                Thanh Toán
              </button>
            )}
            {(status === "PAID" || status === "COMPLETED") && (
              <button
                onClick={() => handleOpenReview(row.id)}
                className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors cursor-pointer"
              >
                Đánh giá
              </button>
            )}
          </div>
        );
      },
    },
  ];

  if (loading && !data) {
    return (
      <div className="flex h-screen bg-[#F0F9FF]">
        <DashboardSidebar role="advertiser" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E3E8EF] border-t-[#1D4ED8]"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F0F9FF]">
      <DashboardSidebar role="advertiser" />
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
                Tổng Quan
              </h1>
              <p className="text-sm text-[#6B7A8D] mt-0.5">
                Chào mừng trở lại, {user?.fullName || "Thành viên"}. Đây là tổng quan chiến dịch của bạn.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg px-3 py-2 text-sm text-[#1D4ED8] cursor-pointer">
                <option>30 Ngày Qua</option>
                <option>7 Ngày Qua</option>
                <option>90 Ngày Qua</option>
              </select>
              <button className="bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer">
                + Chiến Dịch Mới
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard
              title="Chiến Dịch Đang Chạy"
              value={activeCampaigns.toString()}
              change="+2"
              changeType="up"
              icon={<Megaphone className="w-5 h-5" />}
            />
            <KpiCard
              title="Tổng Chi Tiêu"
              value={formatSpending(totalSpending)}
              change="+12.5%"
              changeType="up"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <KpiCard
              title="Đặt Chỗ Sắp Tới"
              value={upcomingBookingsCount.toString()}
              change="+1"
              changeType="up"
              icon={<Calendar className="w-5 h-5" />}
            />
            <KpiCard
              title="Bảng QC Đã Lưu"
              value={savedBillboardsCount.toString()}
              change="+3"
              changeType="up"
              icon={<Heart className="w-5 h-5" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E8EF] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>
                  Hiệu Suất Chiến Dịch
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" /> Lượt Hiển Thị
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> Lượt Click
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                  <XAxis dataKey="month" tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="impressions" stroke="#1D4ED8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="clicks" stroke="#06B6D4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <h3 className="text-[#1D4ED8] mb-4" style={{ fontWeight: 600 }}>
                Tháng 3, 2026
              </h3>
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
                  <div key={d} className="py-1 text-[#6B7A8D]">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i + 1;
                  const event = parsedCalEvents.find((e) => e.day === day);
                  return (
                    <div
                      key={i}
                      className={`py-1.5 rounded relative ${
                        day <= 31 ? "text-[#1A2332]" : "text-transparent"
                      } ${event ? "bg-[#F0F9FF]" : ""}`}
                    >
                      {day <= 31 ? day : "0"}
                      {event && (
                        <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${event.color}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2 max-h-[140px] overflow-y-auto">
                {parsedCalEvents.length === 0 ? (
                  <div className="text-xs text-[#6B7A8D] italic text-center py-2">Không có sự kiện đặt chỗ nào trong tháng.</div>
                ) : (
                  parsedCalEvents.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={`w-2 h-2 rounded-full ${e.color}`} />
                      <span className="text-[#6B7A8D]">{e.day}/03</span>
                      <span className="text-[#1A2332] truncate max-w-[180px]" style={{ fontWeight: 500 }} title={e.title}>
                        {e.title}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>
                Đặt Chỗ Gần Đây
              </h3>
              <button className="text-sm text-[#06B6D4] hover:underline cursor-pointer">Xem Tất Cả</button>
            </div>
            {tableData.length === 0 ? (
              <div className="bg-white rounded-lg border border-[#E3E8EF] p-8 text-center text-[#6B7A8D]">
                Bạn chưa có lượt đặt chỗ nào.
              </div>
            ) : (
              <DataTable columns={columns} data={tableData} />
            )}
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E3E8EF] relative">
            <h3 className="text-lg font-bold text-[#1D4ED8] mb-4">Đánh giá chiến dịch</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6B7A8D] mb-1">Số sao (1-5)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl cursor-pointer transition-colors ${
                        star <= rating ? "text-amber-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7A8D] mb-1">Nhận xét</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Nhập trải nghiệm của bạn về vị trí và chất lượng hiển thị của bảng QC..."
                  className="w-full border border-[#E3E8EF] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-[#E3E8EF] rounded-lg text-sm text-[#6B7A8D] hover:bg-gray-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-[#1D4ED8] text-white rounded-lg text-sm hover:bg-[#3B82F6] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

