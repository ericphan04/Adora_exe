import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { MapPin, Star, Phone, ChevronLeft, ChevronRight, Heart, Share2, Monitor, Zap, Shield, Eye } from "lucide-react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { StatusBadge } from "../components/StatusBadge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { BookingCalendar } from "../components/BookingCalendar";
import billboardApi from "../../api/billboardApi";
import bookingApi from "../../api/bookingApi";
import { BillboardDto } from "../../types/billboard";
import { ReviewDto } from "../../types/review";
import { useAuth } from "../context/AuthContext";
import {
  getTodayParts,
  toIsoDate,
  formatDisplayDate,
  isPastDay,
} from "../utils/calendar";
import { getBookedDaysForMonth } from "../utils/availability";
import { notify, apiErrorMessage } from "../utils/notify";

const fallbackImages = [
  "https://images.unsplash.com/photo-1585504303098-9785dc784742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBkaWdpdGFsJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc3MjU0NjU5M3ww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1745725427643-8994370391e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmlsbGJvYXJkJTIwaGlnaHdheSUyMGFkdmVydGlzaW5nfGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1765908310161-1005cf85586d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1lcyUyMHNxdWFyZSUyMGRpZ2l0YWwlMjBkaXNwbGF5fGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1766324488354-a189b706d3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBzY3JlZW4lMjBidWlsZGluZyUyMGZhY2FkZXxlbnwxfHx8fDE3NzI1NDY1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

const fallbackReviewsList: ReviewDto[] = [
  { id: 1, bookingId: 101, rating: 5, comment: "Vị trí tuyệt vời với lưu lượng giao thông rất cao. Chất lượng màn hình xuất sắc, đúng như cam kết.", createdAt: "2026-02-15" },
  { id: 2, bookingId: 102, rating: 4, comment: "ROI rất tốt cho chiến dịch của chúng tôi. Quy trình đặt chỗ thuận tiện và đội ngũ hỗ trợ nhiệt tình.", createdAt: "2026-01-20" },
  { id: 3, bookingId: 103, rating: 5, comment: "Vị trí cao cấp, kết quả ấn tượng. Chắc chắn sẽ đặt lại cho chiến dịch tiếp theo.", createdAt: "2025-12-10" },
];

function calcBookingPrice(
  pricePerDay: number,
  daysCount: number,
  locationSurcharge: number,
) {
  const subtotal = pricePerDay * daysCount;
  const surcharge = locationSurcharge || 0;
  const beforeFee = subtotal + surcharge;
  const serviceFee = Math.round(beforeFee * 0.05);
  return { subtotal, surcharge, serviceFee, total: beforeFee + serviceFee, daysCount };
}

export default function BillboardDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const billboardId = Number(id);
  
  const { user } = useAuth();
  
  const [billboard, setBillboard] = useState<BillboardDto | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const today = getTodayParts();
  const [calendarYear, setCalendarYear] = useState(today.year);
  const [calendarMonth, setCalendarMonth] = useState(today.month);

  const [selectedStartDay, setSelectedStartDay] = useState<number | null>(null);
  const [selectedEndDay, setSelectedEndDay] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCalendarYear(year);
    setCalendarMonth(month);
    setSelectedStartDay(null);
    setSelectedEndDay(null);
    setBookingError(null);
  }, []);

  const bookedDaysSet = useMemo(
    () => getBookedDaysForMonth(billboard?.availabilities, calendarYear, calendarMonth),
    [billboard?.availabilities, calendarYear, calendarMonth],
  );

  useEffect(() => {
    let active = true;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [billboardRes, reviewsRes] = await Promise.all([
          billboardApi.getById(billboardId),
          billboardApi.getReviews(billboardId)
        ]);

        if (active) {
          if (billboardRes.success && billboardRes.data) {
            setBillboard(billboardRes.data);
          } else {
            throw new Error(billboardRes.message || "Failed to load details");
          }
          if (reviewsRes.success && reviewsRes.data) {
            setReviews(reviewsRes.data);
          }
        }
      } catch (err) {
        console.warn("Backend API not running, using fallback details:", err);
        if (active) {
          // Construct fallback BillboardDto matching standard mock listings
          const dummyBillboard: BillboardDto = {
            id: billboardId,
            title: billboardId === 2 ? "Bạch Đằng Digital" : billboardId === 3 ? "Nguyễn Văn Linh Screen" : "Cầu Rồng LED",
            description: "Bảng quảng cáo LED kỹ thuật số cao cấp tọa lạc tại vị trí đắc địa ở TP Đà Nẵng. Mang lại khả năng hiển thị vượt trội với ước tính hàng chục ngàn lượt đi qua mỗi ngày. Màn hình độ nét cao đảm bảo nội dung nổi bật cả ngày lẫn đêm.",
            address: billboardId === 2 ? "Đường Bạch Đằng" : billboardId === 3 ? "Nguyễn Văn Linh" : "Đường 2/9",
            city: "Đà Nẵng",
            district: billboardId === 2 ? "Sơn Trà" : billboardId === 3 ? "Thanh Khê" : "Hải Châu",
            width: billboardId === 2 ? 10 : billboardId === 3 ? 12 : 14,
            height: billboardId === 2 ? 4 : billboardId === 3 ? 5 : 6,
            resolution: "P10 4K UHD",
            brightness: 6500,
            refreshRate: 3840,
            screenType: "Outdoor Digital LED",
            operatingHours: "24/7",
            pricePerDay: billboardId === 2 ? 2000000 : billboardId === 3 ? 2300000 : 3000000,
            pricePerMonth: billboardId === 2 ? 55000000 : billboardId === 3 ? 68000000 : 85000000,
            locationSurcharge: billboardId === 2 ? 5000000 : billboardId === 3 ? 8000000 : 10000000,
            status: "APPROVED",
            dailyViews: billboardId === 2 ? 80000 : billboardId === 3 ? 110000 : 150000,
            isFeatured: true,
            images: fallbackImages.map((img, i) => ({ id: i, imageUrl: img, isThumbnail: i === 0 })),
            features: [
              { id: 1, name: "Độ phân giải 4K" },
              { id: 2, name: "Hỗ trợ HDR" },
              { id: 3, name: "Chống thời tiết IP65" },
              { id: 4, name: "Mật độ điểm ảnh 6mm" }
            ],
            availabilities: (() => {
              const { year, month } = getTodayParts();
              return [3, 4, 5, 8, 9, 10].map((day, i) => ({
                id: i + 1,
                availableDate: toIsoDate(year, month, day),
                status: "BOOKED" as const,
              }));
            })()
          };
          setBillboard(dummyBillboard);
          setReviews(fallbackReviewsList);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDetail();
    return () => { active = false; };
  }, [billboardId]);

  const handleDayClick = (day: number) => {
    if (isPastDay(calendarYear, calendarMonth, day)) return;

    if (selectedStartDay === null || (selectedStartDay !== null && selectedEndDay !== null)) {
      setSelectedStartDay(day);
      setSelectedEndDay(null);
      setBookingError(null);
      return;
    }

    if (day < selectedStartDay) {
      setSelectedStartDay(day);
      setSelectedEndDay(null);
      return;
    }

    let hasConflict = false;
    for (let d = selectedStartDay; d <= day; d++) {
      if (bookedDaysSet.has(d) || isPastDay(calendarYear, calendarMonth, d)) {
        hasConflict = true;
        break;
      }
    }
    if (hasConflict) {
      setBookingError("Khoảng thời gian chọn chứa ngày đã đặt hoặc đã qua. Vui lòng chọn khoảng khác.");
    } else {
      setSelectedEndDay(day);
      setBookingError(null);
    }
  };

  const handleBookingSubmit = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "RENTER") {
      setBookingError("Chỉ có tài khoản nhà quảng cáo (Advertiser) mới được đặt bảng.");
      return;
    }
    if (selectedStartDay === null || selectedEndDay === null) {
      setBookingError("Vui lòng chọn ngày bắt đầu và ngày kết thúc trên lịch.");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    try {
      const startDate = toIsoDate(calendarYear, calendarMonth, selectedStartDay);
      const endDate = toIsoDate(calendarYear, calendarMonth, selectedEndDay);

      const response = await bookingApi.create({
        billboardId,
        startDate,
        endDate,
        note: note.trim() || undefined,
      });

      if (response.success) {
        notify.success("Đặt chỗ thành công", "Chuyển đến trang đặt chỗ của bạn...");
        setSelectedStartDay(null);
        setSelectedEndDay(null);
        setNote("");
        setTimeout(() => navigate("/advertiser/bookings"), 1500);
      } else {
        throw new Error(response.message || "Đặt chỗ thất bại");
      }
    } catch (err: unknown) {
      const msg = apiErrorMessage(err, "Đặt chỗ thất bại. Vui lòng kiểm tra lại thông tin.");
      setBookingError(msg);
      notify.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex flex-col">
        <TopNav />
        <div className="flex-1 flex items-center justify-center font-semibold text-lg text-[#1D4ED8] animate-pulse py-20">
          Đang tải chi tiết bảng quảng cáo...
        </div>
        <Footer />
      </div>
    );
  }

  if (!billboard) {
    return (
      <div className="min-h-screen bg-[#F0F9FF] flex flex-col">
        <TopNav />
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-[#6B7A8D] font-semibold">Không tìm thấy thông tin bảng quảng cáo.</p>
          <button onClick={() => navigate("/billboards")} className="mt-4 bg-[#1D4ED8] text-white px-4 py-2 rounded-lg">
            Quay lại danh sách
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const imagesList = billboard.images?.map(img => img.imageUrl) || fallbackImages;

  const selectedDaysCount =
    selectedStartDay != null && selectedEndDay != null
      ? selectedEndDay - selectedStartDay + 1
      : 0;

  const priceBreakdown =
    selectedDaysCount > 0
      ? calcBookingPrice(
          billboard.pricePerDay,
          selectedDaysCount,
          billboard.locationSurcharge || 0,
        )
      : null;

  const tabs = [
    { key: "overview", label: "Tổng Quan" },
    { key: "specs", label: "Thông Số Kỹ Thuật" },
    { key: "reviews", label: `Đánh Giá (${reviews.length})` },
    { key: "map", label: "Bản Đồ" },
  ];

  return (
    <div className="min-h-screen bg-[#F0F9FF]">
      <TopNav />

      <div className="bg-white border-b border-[#E3E8EF]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate("/")} className="text-[#6B7A8D] hover:text-[#1D4ED8] cursor-pointer">Trang Chủ</button>
            <span className="text-[#E3E8EF]">/</span>
            <button onClick={() => navigate("/billboards")} className="text-[#6B7A8D] hover:text-[#1D4ED8] cursor-pointer">Bảng Quảng Cáo</button>
            <span className="text-[#E3E8EF]">/</span>
            <span className="text-[#1D4ED8]" style={{ fontWeight: 500 }}>{billboard.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Gallery */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden">
              <div className="relative h-96">
                <ImageWithFallback src={imagesList[activeImage] || fallbackImages[0]} alt={billboard.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => setActiveImage(Math.max(0, activeImage - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveImage(Math.min(imagesList.length - 1, activeImage + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
                    <Heart className="w-4 h-4 text-[#6B7A8D]" />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
                    <Share2 className="w-4 h-4 text-[#6B7A8D]" />
                  </button>
                </div>
                <div className="absolute top-3 left-3">
                  <StatusBadge variant="available" />
                </div>
              </div>
              <div className="p-3 flex gap-2 overflow-x-auto">
                {imagesList.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      i === activeImage ? "border-[#06B6D4]" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <ImageWithFallback src={img} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-6 bg-white rounded-xl border border-[#E3E8EF]">
              <div className="flex border-b border-[#E3E8EF]">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-5 py-3.5 text-sm transition-colors cursor-pointer relative ${
                      activeTab === tab.key ? "text-[#1D4ED8]" : "text-[#6B7A8D] hover:text-[#1D4ED8]"
                    }`}
                    style={activeTab === tab.key ? { fontWeight: 600 } : {}}
                  >
                    {tab.label}
                    {activeTab === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06B6D4]" />}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Giới Thiệu Bảng Quảng Cáo</h3>
                    <p className="text-sm text-[#6B7A8D] leading-relaxed">
                      {billboard.description}
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      {[
                        { icon: <Eye className="w-5 h-5" />, label: "Lượt Xem/Ngày", value: billboard.dailyViews?.toLocaleString() || "N/A" },
                        { icon: <Monitor className="w-5 h-5" />, label: "Màn Hình", value: billboard.screenType || "N/A" },
                        { icon: <Zap className="w-5 h-5" />, label: "Tần Số Quét", value: `${billboard.refreshRate} Hz` },
                      ].map((s, i) => (
                        <div key={i} className="bg-[#F0F9FF] rounded-lg p-4 text-center">
                          <div className="text-[#06B6D4] flex justify-center mb-2">{s.icon}</div>
                          <p className="text-xs text-[#6B7A8D] mb-0.5">{s.label}</p>
                          <p className="text-sm text-[#1D4ED8]" style={{ fontWeight: 600 }}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "specs" && (
                  <div>
                    <h3 className="text-[#1D4ED8] mb-4" style={{ fontWeight: 600 }}>Thông Số Kỹ Thuật</h3>
                    <div className="border border-[#E3E8EF] rounded-lg overflow-hidden">
                      {[
                        { label: "Loại Màn Hình", value: billboard.screenType },
                        { label: "Độ Phân Giải", value: billboard.resolution },
                        { label: "Kích Thước", value: `${billboard.width}m x ${billboard.height}m (${billboard.width * billboard.height} m²)` },
                        { label: "Độ Sáng", value: `${billboard.brightness.toLocaleString()} nits` },
                        { label: "Thời Gian Hoạt Động", value: billboard.operatingHours },
                        { label: "Tần Số Quét", value: `${billboard.refreshRate} Hz` },
                        { label: "Độ phân giải kĩ thuật", value: billboard.resolution },
                        { label: "Hệ thống chống nước", value: "IP65 Standard" }
                      ].map((s, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? "bg-[#F0F9FF]" : "bg-white"}`}>
                          <div className="w-48 px-4 py-3 text-sm text-[#6B7A8D]">{s.label}</div>
                          <div className="flex-1 px-4 py-3 text-sm text-[#1D4ED8]" style={{ fontWeight: 500 }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "reviews" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Đánh Giá ({reviews.length})</h3>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                        ))}
                        <span className="text-sm text-[#6B7A8D] ml-1">4.8/5</span>
                      </div>
                    </div>
                    {reviews.length === 0 ? (
                      <p className="text-sm text-[#6B7A8D] italic py-4">Chưa có đánh giá nào cho bảng này.</p>
                    ) : (
                      reviews.map((r) => (
                        <div key={r.id} className="border border-[#E3E8EF] rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm text-[#1D4ED8]" style={{ fontWeight: 600 }}>{r.renter?.fullName || "Khách Hàng ADORA"}</p>
                              <p className="text-xs text-[#6B7A8D]">{r.renter?.companyName || "Nhà quảng cáo"}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: r.rating }).map((_, j) => (
                                <Star key={j} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-[#6B7A8D]">{r.comment}</p>
                          <p className="text-xs text-[#6B7A8D]/60 mt-2">{r.createdAt?.substring(0, 10)}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
                {activeTab === "map" && (
                  <div>
                    <h3 className="text-[#1D4ED8] mb-4" style={{ fontWeight: 600 }}>Vị Trí Bản Đồ</h3>
                    <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden shadow-sm h-[400px] flex flex-col">
                      <div className="flex-1 w-full h-full relative">
                        <iframe
                          title="Bản đồ vị trí bảng quảng cáo"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(
                            billboard.latitude && billboard.longitude
                              ? `${billboard.latitude},${billboard.longitude}`
                              : `${billboard.address}, ${billboard.district}, ${billboard.city}`
                          )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          allowFullScreen
                          loading="lazy"
                          className="w-full h-full"
                        ></iframe>
                      </div>
                      <div className="p-4 bg-[#F8FAFC] border-t border-[#E3E8EF]">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#06B6D4] shrink-0" />
                          <p className="text-sm text-[#1A2332]" style={{ fontWeight: 500 }}>
                            {billboard.address}, {billboard.district}, {billboard.city}
                          </p>
                        </div>
                        {(billboard.latitude || billboard.longitude) && (
                          <p className="text-xs text-[#6B7A8D] mt-1 ml-6">
                            Tọa độ: {billboard.latitude}° N, {billboard.longitude}° E
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[420px] shrink-0 space-y-6">
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge variant="available" />
                <span className="text-xs text-[#6B7A8D] bg-[#1D4ED8]/5 px-2 py-0.5 rounded">Lưu lượng Cao</span>
              </div>
              <h2 className="text-xl text-[#1D4ED8] mt-3 mb-1" style={{ fontWeight: 700 }}>{billboard.title}</h2>
              <div className="flex items-center gap-1 text-sm text-[#6B7A8D] mb-4">
                <MapPin className="w-3.5 h-3.5" />
                <span>{billboard.address}, {billboard.district}, {billboard.city}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Kích Thước", value: `${billboard.width}m x ${billboard.height}m` },
                  { label: "Độ Phân Giải", value: billboard.resolution },
                  { label: "Lượt Xem/Ngày", value: billboard.dailyViews?.toLocaleString() || "N/A" },
                  { label: "Đánh Giá", value: "4.8/5 ★" },
                ].map((s, i) => (
                  <div key={i} className="bg-[#F0F9FF] rounded-lg p-3">
                    <p className="text-xs text-[#6B7A8D]">{s.label}</p>
                    <p className="text-sm text-[#1D4ED8]" style={{ fontWeight: 600 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="border border-[#E3E8EF] rounded-lg p-4 mb-5">
                <p className="text-xs text-[#6B7A8D] mb-2">Chi tiết giá</p>
                <div className="space-y-2 text-sm">
                  {priceBreakdown ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#6B7A8D]">
                          {billboard.pricePerDay.toLocaleString("vi-VN")}₫ × {priceBreakdown.daysCount} ngày
                        </span>
                        <span className="text-[#1D4ED8]">
                          {priceBreakdown.subtotal.toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                      {priceBreakdown.surcharge > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#6B7A8D]">Phụ phí vị trí</span>
                          <span className="text-[#1D4ED8]">
                            +{priceBreakdown.surcharge.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#6B7A8D]">Phí nền tảng (5%)</span>
                        <span className="text-[#1D4ED8]">
                          {priceBreakdown.serviceFee.toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                      <div className="border-t border-[#E3E8EF] pt-2 flex justify-between">
                        <span className="text-[#1D4ED8] font-semibold">Tổng ước tính</span>
                        <span className="text-xl text-[#1D4ED8] font-bold">
                          {priceBreakdown.total.toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#6B7A8D]">Giá theo ngày</span>
                        <span className="text-[#1D4ED8] font-semibold">
                          {billboard.pricePerDay.toLocaleString("vi-VN")}₫/ngày
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7A8D] pt-1">
                        Chọn khoảng ngày trên lịch để xem tổng chi phí.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-5">
                {bookingError && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-xs">
                    {bookingError}
                  </div>
                )}

                <BookingCalendar
                  year={calendarYear}
                  month={calendarMonth}
                  onMonthChange={handleMonthChange}
                  bookedDays={bookedDaysSet}
                  selectedStartDay={selectedStartDay}
                  selectedEndDay={selectedEndDay}
                  onDayClick={handleDayClick}
                />
              </div>

              {selectedStartDay && selectedEndDay && (
                <div className="mb-4">
                  <label className="text-xs text-[#6B7A8D] mb-1.5 block">Ghi chú chiến dịch (Note)</label>
                  <input
                    type="text"
                    placeholder="Ghi chú cho chủ sở hữu..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] transition-all"
                  />
                </div>
              )}

              <button
                onClick={handleBookingSubmit}
                disabled={bookingLoading || (!!user && user.role !== "RENTER")}
                className="w-full bg-[#06B6D4] text-white py-3 rounded-lg hover:bg-[#0891B2] transition-colors cursor-pointer mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading
                  ? "Đang xử lý..."
                  : !user
                    ? "Đăng nhập để đặt lịch"
                    : user.role !== "RENTER"
                      ? "Chỉ dành cho nhà quảng cáo"
                      : selectedStartDay && selectedEndDay
                        ? `Đặt lịch (${formatDisplayDate(toIsoDate(calendarYear, calendarMonth, selectedStartDay))} – ${formatDisplayDate(toIsoDate(calendarYear, calendarMonth, selectedEndDay))})`
                        : "Đặt ngay (chọn ngày trên lịch)"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                    return;
                  }
                  if (user.role !== "RENTER") {
                    notify.error("Chỉ tài khoản nhà quảng cáo mới có thể nhắn tin với chủ bảng.");
                    return;
                  }
                  navigate(`/advertiser/messages?billboardId=${billboardId}`);
                }}
                className="w-full border border-[#E3E8EF] text-[#1D4ED8] py-3 rounded-lg hover:bg-[#F0F9FF] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Liên Hệ Chủ Sở Hữu
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#E3E8EF] p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-[#1D4ED8]" style={{ fontWeight: 600 }}>Đặt Chỗ An Toàn</p>
                  <p className="text-xs text-[#6B7A8D]">Được bảo vệ bởi hệ thống ký quỹ ADORA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
