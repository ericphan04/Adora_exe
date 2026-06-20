import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { MapPin, Star, Phone, ChevronLeft, ChevronRight, Heart, Share2, Monitor, Zap, Shield, Eye, ExternalLink, Info, Maximize, Lightbulb, Grid, CheckCircle, HelpCircle, Users, Calendar, X, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { BillboardGoogleMap } from "../components/map/BillboardGoogleMap";
import { getBillboardRentalStatus, MAP_BILLBOARD_MOCKS } from "../utils/billboardMap";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { StatusBadge } from "../components/StatusBadge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { BookingCalendar } from "../components/BookingCalendar";
import billboardApi from "../../api/billboardApi";
import bookingApi from "../../api/bookingApi";
import { BillboardDto } from "../../types/billboard";
import { addSavedBillboard, removeSavedBillboard, isBillboardSaved } from "../utils/savedBillboards";
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
  spotPackage: string = "30x15",
  premiumSurchargePerDay: number = 0,
) {
  const subtotalRaw = pricePerDay * daysCount;
  const subtotal = Math.round(subtotalRaw / 1000) * 1000;
  const surchargeRaw = locationSurcharge || 0;
  const surcharge = Math.round(surchargeRaw / 1000) * 1000;
  const beforeFee = subtotal + surcharge;
  const serviceFee = Math.round((beforeFee * 0.05) / 1000) * 1000;

  let premiumSurcharge = 0;
  if (spotPackage === "15x20") {
    const pSurchargeRaw = premiumSurchargePerDay * daysCount;
    premiumSurcharge = Math.round(pSurchargeRaw / 1000) * 1000;
  }

  return { 
    subtotal, 
    surcharge, 
    serviceFee, 
    premiumSurcharge,
    total: beforeFee + serviceFee + premiumSurcharge, 
    daysCount 
  };
}

const formatBrightness = (val: string | number | undefined | null) => {
  if (!val) return "8,500 Nits";
  const str = String(val);
  if (str.toLowerCase().includes("nit")) {
    return str.replace(/nits?/i, "Nits").trim();
  }
  return `${str} Nits`;
};

const formatRefreshRate = (val: string | number | undefined | null) => {
  if (!val) return "3840 Hz";
  const str = String(val);
  if (str.toLowerCase().includes("hz")) {
    return str.replace(/hz/i, " Hz").replace(/\s+/g, " ").trim();
  }
  return `${str} Hz`;
};

export default function BillboardDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const billboardId = Number(id);
  
  const { user } = useAuth();
  
  const [billboard, setBillboard] = useState<BillboardDto | null>(null);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [saved, setSaved] = useState(() => isBillboardSaved(billboardId));

  const today = getTodayParts();
  const [calendarYear, setCalendarYear] = useState(today.year);
  const [calendarMonth, setCalendarMonth] = useState(today.month);

  const [selectedStartDay, setSelectedStartDay] = useState<number | null>(null);
  const [selectedEndDay, setSelectedEndDay] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [startHour, setStartHour] = useState<number>(8);
  const [endHour, setEndHour] = useState<number>(12);
  const [bookedSlots, setBookedSlots] = useState<{ startHour: number; endHour: number }[]>([]);
  const [showTechSpecs, setShowTechSpecs] = useState(false);

  // Spot package: "30x15" = 30 lần/giờ – 15s/spot | "15x20" = 15 lần/giờ – 20s/spot
  type SpotPackage = "30x15" | "15x20";
  const SPOT_PACKAGES: { id: SpotPackage; label: string; desc: string; badge: string; details: { icon: string; text: string }[] }[] = [
    {
      id: "30x15",
      label: "30 lần/giờ – 15s/spot",
      desc: "Tần suất cao, hiển thị dày đặc",
      badge: "PHỔ BIẾN",
      details: [
        { icon: "⚡", text: "Quảng cáo phát 30 lần mỗi giờ — trung bình 2 phút/lần" },
        { icon: "⏱️", text: "Mỗi lượt phát kéo dài 15 giây" },
        { icon: "📺", text: "Tổng ~480 lượt phát/ngày (tính trên 16h hoạt động)" },
        { icon: "🎯", text: "Phù hợp: thương hiệu FMCG, khuyến mãi ngắn hạn, sản phẩm mới" },
        { icon: "✅", text: "Lý tưởng để tăng độ nhận diện thương hiệu nhanh chóng" },
      ],
    },
    {
      id: "15x20",
      label: "15 lần/giờ – 20s/spot",
      desc: "Thời lượng dài hơn, nội dung phong phú",
      badge: "PREMIUM",
      details: [
        { icon: "🎬", text: "Quảng cáo phát 15 lần mỗi giờ — trung bình 4 phút/lần" },
        { icon: "⏱️", text: "Mỗi lượt phát kéo dài 20 giây — thêm 5 giây kể câu chuyện" },
        { icon: "📺", text: "Tổng ~240 lượt phát/ngày (tính trên 16h hoạt động)" },
        { icon: "🎯", text: "Phù hợp: bất động sản, ô tô, dịch vụ tài chính, thương hiệu cao cấp" },
        { icon: "✅", text: "Lý tưởng để truyền tải thông điệp chi tiết, tạo ấn tượng sâu" },
      ],
    },
  ];
  const [spotPackage, setSpotPackage] = useState<SpotPackage>("30x15");

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCalendarYear(year);
    setCalendarMonth(month);
    setSelectedStartDay(null);
    setSelectedEndDay(null);
    setBookingError(null);
    setBookedSlots([]);
  }, []);

  const handleToggleSaved = useCallback(() => {
    if (!billboard) return;
    if (saved) {
      removeSavedBillboard(billboard.id);
      setSaved(false);
      notify.success("Đã bỏ lưu bảng quảng cáo");
      return;
    }
    addSavedBillboard(billboard);
    setSaved(true);
    notify.success("Đã lưu bảng quảng cáo");
  }, [billboard, saved]);

  const bookedDaysSet = useMemo(
    () => getBookedDaysForMonth(billboard?.availabilities, calendarYear, calendarMonth),
    [billboard?.availabilities, calendarYear, calendarMonth],
  );

  const imagesList = useMemo(() => {
    if (!billboard || !billboard.images || billboard.images.length === 0) return [];
    const sorted = [...billboard.images].sort((a: any, b: any) => {
      const aThumb = typeof a === "string" ? false : !!a.isThumbnail;
      const bThumb = typeof b === "string" ? false : !!b.isThumbnail;
      if (aThumb && !bThumb) return -1;
      if (!aThumb && bThumb) return 1;
      return 0;
    });
    return sorted.map((img: any) => typeof img === "string" ? img : img.imageUrl);
  }, [billboard]);

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
          const found = MAP_BILLBOARD_MOCKS.find(b => b.id === billboardId);
          if (found) {
            const mockWithAvailability = {
              ...found,
              availabilities: found.availabilities && found.availabilities.length > 0 ? found.availabilities : (() => {
                const { year, month } = getTodayParts();
                return [3, 4, 5, 8, 9, 10].map((day, i) => ({
                  id: i + 1,
                  availableDate: toIsoDate(year, month, day),
                  status: "BOOKED" as const,
                }));
              })()
            };
            setBillboard(mockWithAvailability);
            setReviews(fallbackReviewsList);
          } else {
            const dummyBillboard: BillboardDto = {
              id: billboardId,
              title: billboardId === 2 ? "Bạch Đằng Digital" : billboardId === 3 ? "Nguyễn Văn Linh Screen" : "Cầu Rồng LED",
              description: "Bảng quảng cáo LED kỹ thuật số cao cấp tọa lạc tại vị trí đắc địa ở TP Đà Nẵng. Mang lại khả năng hiển thị vượt trội với ước tính hàng chục ngàn lượt đi qua mỗi ngày. Màn hình độ nét cao đảm bảo nội dung nổi bật cả ngày lẫn đêm.",
              address: billboardId === 2 ? "Đường Bạch Đằng" : billboardId === 3 ? "Nguyễn Văn Linh" : "Đường 2/9",
              city: "Đà Nẵng",
              district: billboardId === 2 ? "Sơn Trà" : billboardId === 3 ? "Thanh Khê" : "Hải Châu",
              latitude: billboardId === 2 ? 16.0708 : billboardId === 3 ? 16.0545 : 16.0614,
              longitude: billboardId === 2 ? 108.2483 : billboardId === 3 ? 108.2020 : 108.2275,
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
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDetail();
    return () => { active = false; };
  }, [billboardId]);

  const [bookingMode, setBookingMode] = useState<"hour" | "day">("hour");
  const [isSelectingEndHour, setIsSelectingEndHour] = useState(false);

  const handleBookingModeChange = (mode: "hour" | "day") => {
    setBookingMode(mode);
    setSelectedStartDay(null);
    setSelectedEndDay(null);
    setBookingError(null);
    setBookedSlots([]);
    setIsSelectingEndHour(false);
  };

  const handleHourClick = (h: number) => {
    const isBooked = bookedSlots.some(slot => h >= slot.startHour && h < slot.endHour);
    if (isBooked) return;

    if (!isSelectingEndHour) {
      setStartHour(h);
      setEndHour(h + 1);
      setIsSelectingEndHour(true);
    } else {
      if (h >= startHour) {
        // Check if there are booked slots in between
        let hasBookedBetween = false;
        for (let i = startHour; i <= h; i++) {
          if (bookedSlots.some(slot => i >= slot.startHour && i < slot.endHour)) {
            hasBookedBetween = true;
            break;
          }
        }
        if (hasBookedBetween) {
          notify.error("Không thể chọn khung giờ chứa giờ đã bận.");
          setStartHour(h);
          setEndHour(h + 1);
        } else {
          setEndHour(h + 1);
          setIsSelectingEndHour(false);
        }
      } else {
        setStartHour(h);
        setEndHour(h + 1);
      }
    }
  };

  const handleDayClick = async (day: number) => {
    if (isPastDay(calendarYear, calendarMonth, day)) return;

    if (bookingMode === "day") {
      if (selectedStartDay === null || (selectedStartDay !== null && selectedEndDay !== null)) {
        setSelectedStartDay(day);
        setSelectedEndDay(null);
        setBookingError(null);
      } else {
        if (day >= selectedStartDay) {
          // Check if there are booked days in between
          let hasBookedBetween = false;
          for (let d = selectedStartDay; d <= day; d++) {
            if (bookedDaysSet.has(d)) {
              hasBookedBetween = true;
              break;
            }
          }
          if (hasBookedBetween) {
            setBookingError("Không thể chọn khoảng ngày chứa ngày đã được đặt.");
            setSelectedStartDay(day);
            setSelectedEndDay(null);
          } else {
            setSelectedEndDay(day);
            setBookingError(null);
          }
        } else {
          setSelectedStartDay(day);
          setSelectedEndDay(null);
          setBookingError(null);
        }
      }
    } else {
      setSelectedStartDay(day);
      setSelectedEndDay(day);
      setBookingError(null);

      const dateStr = toIsoDate(calendarYear, calendarMonth, day);
      try {
        const res = await billboardApi.getBookedSlots(billboardId, dateStr);
        if (res.success && res.data) {
          setBookedSlots(res.data);
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        console.error("Failed to fetch booked slots", err);
        setBookedSlots([]);
      }
    }
  };

  const hasOverlapConflict = useMemo(() => {
    if (selectedStartDay == null) return false;
    if (bookingMode === "day") return false;
    return bookedSlots.some(slot => {
      return !(endHour <= slot.startHour || startHour >= slot.endHour);
    });
  }, [selectedStartDay, startHour, endHour, bookedSlots, bookingMode]);

  const handleBookingSubmit = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "RENTER") {
      setBookingError("Chỉ có tài khoản nhà quảng cáo (Advertiser) mới được đặt bảng.");
      return;
    }
    if (selectedStartDay === null) {
      setBookingError("Vui lòng chọn ngày đặt chỗ trên lịch.");
      return;
    }
    if (bookingMode === "hour" && hasOverlapConflict) {
      setBookingError("Khung giờ bạn chọn đã bị trùng với lịch đặt trước. Vui lòng chọn khung giờ khác.");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);
    try {
      let startDate = "";
      let endDate = "";

      if (bookingMode === "day") {
        const startStr = toIsoDate(calendarYear, calendarMonth, selectedStartDay);
        const endDayVal = selectedEndDay ?? selectedStartDay;
        const endStr = toIsoDate(calendarYear, calendarMonth, endDayVal);

        const [y, m, d] = endStr.split("-").map(Number);
        const nextDayDate = new Date(y, m - 1, d + 1);
        const nextDayYear = nextDayDate.getFullYear();
        const nextDayMonth = String(nextDayDate.getMonth() + 1).padStart(2, "0");
        const nextDayDay = String(nextDayDate.getDate()).padStart(2, "0");
        const nextDayStr = `${nextDayYear}-${nextDayMonth}-${nextDayDay}`;

        startDate = `${startStr}T00:00:00`;
        endDate = `${nextDayStr}T00:00:00`;
      } else {
        const dateStr = toIsoDate(calendarYear, calendarMonth, selectedStartDay);
        startDate = `${dateStr}T${String(startHour).padStart(2, "0")}:00:00`;
        endDate = `${dateStr}T${String(endHour).padStart(2, "0")}:00:00`;
      }

      const spotLabel = spotPackage === "30x15" ? "30 lần/giờ – 15s/spot" : "15 lần/giờ – 20s/spot";
      const fullNote = [note.trim(), `[Gói spot: ${spotLabel}]`].filter(Boolean).join(" | ");

      const response = await bookingApi.create({
        billboardId,
        startDate,
        endDate,
        note: fullNote || undefined,
        spotPackage,
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

  const selectedHoursCount = selectedStartDay != null ? endHour - startHour : 0;

  const priceBreakdown = useMemo(() => {
    if (!billboard || selectedStartDay == null) return null;
    
    if (bookingMode === "day") {
      const daysCount = selectedEndDay != null ? (selectedEndDay - selectedStartDay + 1) : 1;
      return calcBookingPrice(
        billboard.pricePerDay, 
        daysCount, 
        billboard.locationSurcharge || 0,
        spotPackage,
        billboard.premiumSurcharge || 0
      );
    } else {
      if (hasOverlapConflict) return null;
      const hourlyPrice = billboard.pricePerDay / 24;
      const subtotalRaw = hourlyPrice * selectedHoursCount;
      const subtotal = Math.round(subtotalRaw / 1000) * 1000;
      
      const surchargeRaw = billboard.locationSurcharge || 0;
      const surcharge = Math.round(surchargeRaw / 1000) * 1000;
      
      const beforeFee = subtotal + surcharge;
      const serviceFee = Math.round((beforeFee * 0.05) / 1000) * 1000;

      let premiumSurcharge = 0;
      if (spotPackage === "15x20") {
        const premiumSurchargeHourly = (billboard.premiumSurcharge || 0) / 24;
        const premiumSurchargeRaw = premiumSurchargeHourly * selectedHoursCount;
        premiumSurcharge = Math.round(premiumSurchargeRaw / 1000) * 1000;
      }
      
      return {
        subtotal,
        surcharge,
        serviceFee,
        premiumSurcharge,
        total: beforeFee + serviceFee + premiumSurcharge,
        hoursCount: selectedHoursCount
      };
    }
  }, [billboard, selectedStartDay, selectedEndDay, selectedHoursCount, hasOverlapConflict, bookingMode, spotPackage]);

  // Reference priceBreakdown before early returns to prevent compiler/bundler reordering hook calls
  if (loading && priceBreakdown !== undefined) {
    (window as any)._tmpPrice = priceBreakdown;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <TopNav />
        <div className="flex-grow flex items-center justify-center font-bold text-lg text-primary animate-pulse py-32">
          Đang tải chi tiết bảng quảng cáo...
        </div>
        <Footer />
      </div>
    );
  }

  if (!billboard) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <TopNav />
        <div className="flex-grow flex flex-col items-center justify-center py-32 text-center space-y-4">
          <HelpCircle className="w-16 h-16 text-muted-foreground" />
          <p className="text-lg text-muted-foreground font-semibold">Không tìm thấy thông tin bảng quảng cáo.</p>
          <button 
            onClick={() => navigate("/billboards")} 
            className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-xl font-semibold cursor-pointer active:scale-95"
          >
            Quay lại danh sách
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imagesList.length === 0) return;
    setSelectedImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imagesList.length === 0) return;
    setSelectedImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handleMobileScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (container.clientWidth === 0) return;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    if (index !== selectedImageIndex && index >= 0 && index < imagesList.length) {
      setSelectedImageIndex(index);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <TopNav />

      {/* Breadcrumbs */}
      <div className="border-b border-border/30 bg-surface/50 backdrop-blur-md pt-16">
        <div className="max-w-7xl mx-auto px-6 py-3.5">
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <button onClick={() => navigate("/")} className="hover:text-primary cursor-pointer transition-colors">Trang Chủ</button>
            <span>/</span>
            <button onClick={() => navigate("/billboards")} className="hover:text-primary cursor-pointer transition-colors">Bảng Quảng Cáo</button>
            <span>/</span>
            <span className="text-primary font-semibold truncate max-w-[200px]">{billboard.title}</span>
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 space-y-10">
        
        {/* ── IMAGE GALLERY SECTION ───────────────────────────────────────────── */}
        <section className="w-full">
          {imagesList.length === 0 ? (
            /* Empty/No Images Placeholder state */
            <div className="w-full h-[300px] md:h-[450px] bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400">
              <Monitor className="w-12 h-12 text-slate-300 animate-pulse" />
              <span className="font-medium text-sm">Không có hình ảnh màn hình khả dụng</span>
            </div>
          ) : (
            <>
              {/* 1. Mobile view: horizontal swipeable image carousel */}
              <div 
                onScroll={handleMobileScroll}
                className="md:hidden relative w-full h-[260px] overflow-hidden rounded-2xl shadow-sm border border-border/30"
              >
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none h-full w-full">
                  {imagesList.map((img, idx) => (
                    <div key={idx} className="w-full h-full shrink-0 snap-center relative">
                      <ImageWithFallback
                        src={img}
                        alt={`Billboard View ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {/* Mobile indicators & buttons */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full font-medium z-10">
                  {selectedImageIndex + 1} / {imagesList.length}
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={handleToggleSaved}
                    className={`flex items-center justify-center w-9 h-9 rounded-full shadow-md transition-colors ${saved ? "bg-red-500 text-white" : "bg-white/90 text-primary hover:bg-white"}`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${saved ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              {/* 2. Tablet view: main image on top, thumbnails below */}
              <div className="hidden md:block lg:hidden space-y-3">
                <div className="relative w-full h-[380px] rounded-2xl overflow-hidden shadow-sm border border-border/30 group">
                  <ImageWithFallback
                    src={imagesList[selectedImageIndex] || fallbackImages[0]}
                    alt="Main Billboard View"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Arrows */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 text-primary hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100 active:scale-95 z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 text-primary hover:bg-white shadow-md transition-all opacity-0 group-hover:opacity-100 active:scale-95 z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-full font-medium z-10">
                    {selectedImageIndex + 1} / {imagesList.length}
                  </div>

                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={handleToggleSaved}
                      className={`flex items-center justify-center w-10 h-10 rounded-full shadow-md transition-colors ${saved ? "bg-red-500 text-white" : "bg-white/90 text-primary hover:bg-white"}`}
                    >
                      <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Thumbnails row below */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${selectedImageIndex === idx ? "border-accent opacity-100 scale-95" : "border-transparent opacity-70 hover:opacity-90"}`}
                    >
                      <ImageWithFallback src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="w-20 h-14 rounded-lg bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 flex flex-col items-center justify-center gap-0.5 text-slate-500 text-[10px] font-bold shrink-0 transition-colors"
                  >
                    <Grid className="w-4 h-4 text-slate-400" />
                    Tất cả ảnh
                  </button>
                </div>
              </div>

              {/* 3. Desktop view: large image left + thumbnail grid right */}
              <div className="hidden lg:grid grid-cols-12 gap-3 h-[460px] lg:h-[500px]">
                {/* Large Main Image */}
                <div className="col-span-8 relative rounded-2xl overflow-hidden shadow-sm border border-border/30 group">
                  <ImageWithFallback
                    src={imagesList[selectedImageIndex] || fallbackImages[0]}
                    alt="Main Billboard View"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-101"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Left/Right navigation */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/95 text-primary hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100 active:scale-95 z-10"
                  >
                    <ChevronLeft className="w-5.5 h-5.5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/95 text-primary hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100 active:scale-95 z-10"
                  >
                    <ChevronRight className="w-5.5 h-5.5" />
                  </button>

                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium z-10">
                    {selectedImageIndex + 1} / {imagesList.length}
                  </div>

                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={handleToggleSaved}
                      className={`flex items-center justify-center w-11 h-11 rounded-full shadow-lg transition-all ${saved ? "bg-red-500 text-white" : "bg-white/90 text-primary hover:bg-white"}`}
                    >
                      <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Smaller Thumbnails Grid */}
                <div className="col-span-4 grid grid-cols-2 gap-3 h-full relative">
                  {imagesList.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-full h-full rounded-xl overflow-hidden border-2 transition-all group ${selectedImageIndex === idx ? "border-accent opacity-100" : "border-transparent opacity-85 hover:opacity-100"}`}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={`Billboard View ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
                      />
                    </button>
                  ))}

                  {/* "View all photos" button overlay */}
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-1.5 transition-all active:scale-95 z-10"
                  >
                    <Grid className="w-4 h-4 text-slate-500" />
                    Xem tất cả ảnh
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ── MAIN CONTENT LAYOUT ────────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN: DETAILS & SPECS ─────────────────────────────────── */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            
            {/* Billboard Title & Address */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-semibold border border-accent/30 flex items-center gap-1.5 backdrop-blur-md shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span> TRỰC TUYẾN
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                  {billboard.district}, {billboard.city}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{billboard.title}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed flex items-start gap-1.5">
                <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                {billboard.address}
              </p>
            </div>

            {/* Specification cards (Bento Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-accent/40 transition-all duration-300">
                <Maximize className="text-accent w-6 h-6" />
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Kích thước</span>
                <span className="font-bold text-sm md:text-base truncate">
                  {billboard.width * billboard.height}m² ({billboard.width}m x {billboard.height}m)
                </span>
              </div>
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-accent/40 transition-all duration-300">
                <Grid className="text-accent w-6 h-6" />
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Loại màn hình</span>
                <span className="font-bold text-sm md:text-base truncate">{billboard.screenType || "P3 Outdoor SMD"}</span>
              </div>
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-accent/40 transition-all duration-300">
                <Users className="text-accent w-6 h-6" />
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Lượt tiếp cận/ngày</span>
                <span className="font-bold text-sm md:text-base truncate">
                  {billboard.dailyViews ? `${billboard.dailyViews.toLocaleString()}+` : "550,000+"}
                </span>
              </div>
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-accent/40 transition-all duration-300">
                <Clock className="text-accent w-6 h-6" />
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Thời gian hoạt động</span>
                <span className="font-bold text-sm md:text-base truncate">{billboard.operatingHours || "16h/ngày"}</span>
              </div>
            </div>
 
            {/* Location Detail & Description Card */}
            <div className="glass-card p-8 rounded-2xl space-y-6 shadow-md">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Info className="text-primary w-5.5 h-5.5" /> Chi tiết vị trí
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {billboard.description}
              </p>
            </div>
 
            {/* Collapsible Technical Specifications Section */}
            <div className="glass-card p-6 rounded-2xl shadow-md space-y-4">
              <button
                type="button"
                onClick={() => setShowTechSpecs(!showTechSpecs)}
                className="w-full flex items-center justify-between font-bold text-slate-800 dark:text-foreground text-left focus:outline-none cursor-pointer bg-transparent border-none p-0"
              >
                <div className="flex items-center gap-2">
                  <Zap className="text-accent w-5 h-5" />
                  <span>Thông số kỹ thuật chi tiết</span>
                </div>
                {showTechSpecs ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>
 
              {showTechSpecs && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/30 animate-in fade-in duration-200">
                  <div className="border border-border/50 rounded-xl p-4 bg-surface/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Độ phân giải</span>
                    <p className="text-sm font-bold text-foreground">{billboard.resolution || "1920x1080"}</p>
                  </div>
                  <div className="border border-border/50 rounded-xl p-4 bg-surface/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Độ sáng</span>
                    <p className="text-sm font-bold text-foreground">{formatBrightness(billboard.brightness)}</p>
                  </div>
                  <div className="border border-border/50 rounded-xl p-4 bg-surface/20">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Tần số quét</span>
                    <p className="text-sm font-bold text-foreground">{formatRefreshRate(billboard.refreshRate)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Google Interactive Map section */}
            <div className="glass-card h-80 rounded-2xl overflow-hidden relative border border-border/30 shadow-md">
              <BillboardGoogleMap
                billboards={[billboard]}
                selectedId={billboard.id}
                singleMarker
                zoom={15}
                className="w-full h-full"
              />
              <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-md px-4 py-2.5 rounded-lg border border-border/50 z-10">
                <span className="text-xs md:text-sm font-bold text-foreground">{billboard.address}, {billboard.district}</span>
              </div>
            </div>

            {/* Media Requirements Section */}
            <div className="glass-card p-8 rounded-2xl space-y-5 shadow-md">
              <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Monitor className="text-primary w-5.5 h-5.5" /> Yêu cầu file quảng cáo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-border/50 rounded-xl p-4 bg-surface/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Định dạng file</span>
                  <p className="text-sm font-bold text-foreground">MP4 (H.264), JPG, PNG</p>
                </div>
                <div className="border border-border/50 rounded-xl p-4 bg-surface/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Tỷ lệ khung hình</span>
                  <p className="text-sm font-bold text-foreground">{billboard.width}:{billboard.height} (Tỉ lệ chuẩn)</p>
                </div>
                <div className="border border-border/50 rounded-xl p-4 bg-surface/20">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Thời lượng phát</span>
                  <p className="text-sm font-bold text-foreground">15s hoặc 20s/spot</p>
                  <p className="text-[10px] text-muted-foreground mt-1">30 lần/giờ (15s) · 15 lần/giờ (20s)</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-300">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Thiết kế quảng cáo của bạn phải được gửi phê duyệt tối thiểu 3 ngày làm việc trước thời điểm bắt đầu chiến dịch phát sóng.</span>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="glass-card p-8 rounded-2xl space-y-6 shadow-md">
              <div className="flex items-center justify-between border-b border-border/30 pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Star className="text-accent fill-accent w-5.5 h-5.5" /> Đánh giá ({reviews.length})
                </h3>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1 text-sm font-semibold">
                     <span className="text-accent">4.8</span>
                     <span className="text-muted-foreground">/ 5 ★</span>
                  </div>
                )}
              </div>
              
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-2">Chưa có đánh giá nào cho bảng này.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border border-border/50 rounded-xl p-5 bg-surface/20 hover:border-accent/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-bold text-primary">{r.renter?.fullName || "Khách Hàng ADORA"}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{r.renter?.companyName || "Nhà quảng cáo"}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: r.rating }).map((_, j) => (
                            <Star key={j} className="w-3.5 h-3.5 fill-accent text-accent" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-3 font-medium">{r.createdAt?.substring(0, 10)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT COLUMN: STICKY BOOKING CARD ────────────────────────────── */}
          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 glass-card p-6 rounded-2xl border border-accent/20 shadow-xl space-y-6">
              
              {/* Widget Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block mb-1">Giá thuê ngày</span>
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-3xl font-extrabold text-accent">{(billboard.pricePerDay / 1000).toLocaleString("vi-VN")}K</h3>
                    <span className="text-muted-foreground text-xs font-semibold">đ/ngày</span>
                  </div>
                </div>
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 fill-primary" />
                </div>
              </div>

              {/* Tab Selector for Booking Mode */}
              <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleBookingModeChange("hour")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    bookingMode === "hour"
                      ? "bg-white dark:bg-[#1C2128] text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Đặt theo giờ
                </button>
                <button
                  type="button"
                  onClick={() => handleBookingModeChange("day")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    bookingMode === "day"
                      ? "bg-white dark:bg-[#1C2128] text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Đặt theo ngày
                </button>
              </div>

              {/* Booking Calendar Input Simulation */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    {bookingMode === "day" ? "Chọn khoảng ngày thuê" : "Lịch Trống Màn Hình"}
                  </label>
                  
                  {bookingError && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium">
                      {bookingError}
                    </div>
                  )}

                  <div className="border border-border/50 rounded-xl p-2 bg-background/50">
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
                </div>

                {selectedStartDay && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {bookingMode === "day" ? (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Khoảng ngày thuê</div>
                        <div className="text-sm font-bold text-primary flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-accent" />
                          {selectedEndDay != null
                            ? `Từ ngày ${selectedStartDay} đến ${selectedEndDay} (Tổng: ${selectedEndDay - selectedStartDay + 1} ngày)`
                            : `Ngày bắt đầu: ${selectedStartDay} (Chọn thêm ngày kết thúc trên lịch)`}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                            Chọn Khung Giờ (Lưới 24h)
                          </label>
                          {startHour !== null && endHour !== null && (
                            <span className="text-[11px] font-bold text-accent">
                              {String(startHour).padStart(2, "0")}:00 - {String(endHour).padStart(2, "0")}:00 ({endHour - startHour}h)
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-4 gap-1.5 max-h-60 overflow-y-auto p-1 border border-border/30 rounded-xl bg-background/30 scrollbar-thin">
                          {Array.from({ length: 24 }).map((_, h) => {
                            const isBooked = bookedSlots.some(slot => h >= slot.startHour && h < slot.endHour);
                            const isSelected = h >= startHour && h < endHour;
                            
                            return (
                              <button
                                key={h}
                                type="button"
                                onClick={() => handleHourClick(h)}
                                disabled={isBooked}
                                className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all flex flex-col items-center justify-center cursor-pointer ${
                                  isBooked
                                    ? "bg-red-50 border-red-200 text-red-400 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-800 cursor-not-allowed opacity-60"
                                    : isSelected
                                      ? "bg-primary border-primary text-white shadow-md active:scale-95"
                                      : "bg-emerald-50/50 hover:bg-emerald-100/80 border-emerald-100 text-emerald-800 dark:bg-emerald-950/15 dark:hover:bg-emerald-950/30 dark:border-emerald-900/20 dark:text-emerald-500 active:scale-95"
                                }`}
                              >
                                <span>{String(h).padStart(2, "0")}:00</span>
                                <span className={`text-[8px] font-semibold mt-0.5 ${isBooked ? "text-red-400" : isSelected ? "text-white/80" : "text-emerald-600/80"}`}>
                                  {isBooked ? "ĐÃ BẬN" : isSelected ? "CHỌN" : "TRỐNG"}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/40" />
                            Trống
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-primary border border-primary" />
                            Đang chọn
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-red-50 dark:bg-red-950/25 border border-red-200 dark:border-red-900/40" />
                            Đã bận
                          </span>
                        </div>
                      </div>
                    )}

                    {bookingMode === "hour" && hasOverlapConflict && (
                      <div className="p-2.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold leading-relaxed">
                        Khoảng giờ bạn chọn bị trùng với một lịch đã đặt. Vui lòng chọn khung giờ khác.
                      </div>
                    )}

                    {/* ── Spot Package Selector ─────────────────────────── */}
                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-accent" /> Chọn Gói Spot
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {SPOT_PACKAGES.map((pkg) => (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setSpotPackage(pkg.id)}
                            className={`relative w-full text-left px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                              spotPackage === pkg.id
                                ? "border-accent bg-accent/10 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                                : "border-border/50 bg-surface/20 hover:border-accent/50 hover:bg-surface/40"
                            }`}
                          >
                            <span
                              className={`absolute top-2 right-2 text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                pkg.id === "30x15"
                                  ? "bg-primary/15 text-primary"
                                  : "bg-amber-400/15 text-amber-500"
                              }`}
                            >
                              {pkg.badge}
                            </span>
                            <p className={`text-xs font-bold leading-snug ${ spotPackage === pkg.id ? "text-accent" : "text-foreground" }`}>
                              {pkg.label}
                            </p>
                            <div className="flex justify-between items-center mt-0.5">
                              <p className="text-[10px] text-muted-foreground">{pkg.desc}</p>
                              {pkg.id === "15x20" ? (
                                <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                  {billboard.premiumSurcharge && billboard.premiumSurcharge > 0 
                                    ? `+${(billboard.premiumSurcharge).toLocaleString("vi-VN")}₫/ngày` 
                                    : "Miễn phí phụ thu"}
                                </p>
                              ) : (
                                <p className="text-[10px] font-semibold text-green-600 dark:text-green-400">Miễn phí</p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Explanation panel for selected package */}
                      {(() => {
                        const selected = SPOT_PACKAGES.find(p => p.id === spotPackage)!;
                        return (
                          <div className={`mt-2 rounded-xl p-4 border transition-all duration-300 ${
                            spotPackage === "30x15"
                              ? "bg-primary/5 border-primary/20"
                              : "bg-amber-400/5 border-amber-400/20"
                          }`}>
                            <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-2.5 ${
                              spotPackage === "30x15" ? "text-primary" : "text-amber-500"
                            }`}>
                              📋 Chi tiết gói · {selected.label}
                            </p>
                            <ul className="space-y-1.5">
                              {selected.details.map((d, i) => (
                                <li key={i} className="flex items-start gap-2 text-[11px] text-foreground/80 leading-snug">
                                  <span className="text-[13px] shrink-0 mt-[-1px]">{d.icon}</span>
                                  <span>{d.text}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Ghi chú chiến dịch (Note)</label>
                      <input
                        type="text"
                        placeholder="Thông điệp gửi chủ sở hữu..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-background border border-border/50 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-foreground"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Price Calculation breakdown */}
              <div className="bg-surface/50 rounded-xl p-4.5 border border-border/30 space-y-3">
                {priceBreakdown ? (
                  <>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-muted-foreground font-medium">
                        {priceBreakdown.daysCount !== undefined
                          ? `Giá thuê (${priceBreakdown.daysCount} ngày)`
                          : `Giá thuê (${priceBreakdown.hoursCount} giờ)`}
                      </span>
                      <span className="text-foreground font-semibold">
                        {priceBreakdown.subtotal.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    {priceBreakdown.surcharge > 0 && (
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-muted-foreground font-medium">Phụ phí vị trí</span>
                        <span className="text-foreground font-semibold">
                          +{priceBreakdown.surcharge.toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    )}
                    {priceBreakdown.premiumSurcharge > 0 && (
                      <div className="flex justify-between text-xs md:text-sm text-amber-600 dark:text-amber-400">
                        <span className="font-medium">Phụ thu gói Premium (100% về chủ)</span>
                        <span className="font-semibold">
                          +{priceBreakdown.premiumSurcharge.toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-muted-foreground font-medium">Phí dịch vụ sàn (5%)</span>
                      <span className="text-foreground font-semibold">
                        {priceBreakdown.serviceFee.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                    <div className="pt-3 border-t border-border/30 flex justify-between items-end">
                      <span className="font-bold text-sm">Tổng tạm tính</span>
                      <span className="text-xl font-extrabold text-foreground" id="total-price">
                        {priceBreakdown.total.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-xs text-muted-foreground font-semibold">
                    <Calendar className="w-5 h-5 text-accent mx-auto mb-2 animate-bounce" />
                    Chọn ngày trên lịch và khung giờ để tính giá thuê
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBookingSubmit}
                  disabled={bookingLoading || (!!user && user.role !== "RENTER") || hasOverlapConflict || selectedStartDay == null}
                  className="w-full py-4 bg-primary text-white hover:bg-primary/95 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-[0_4px_20px_rgba(29,78,216,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {bookingLoading
                    ? "ĐANG XỬ LÝ..."
                    : !user
                      ? "ĐĂNG NHẬP ĐỂ ĐẶT LỊCH"
                      : user.role !== "RENTER"
                        ? "CHỈ DÀNH CHO NHÀ QUẢNG CÁO"
                        : bookingMode === "hour" && hasOverlapConflict
                          ? "TRÙNG LỊCH (CHỌN KHUNG GIỜ)"
                          : selectedStartDay
                            ? bookingMode === "day"
                              ? `ĐẶT LỊCH NGAY (${selectedEndDay ? selectedEndDay - selectedStartDay + 1 : 1} ngày)`
                              : `ĐẶT LỊCH NGAY (${selectedHoursCount} giờ)`
                            : "ĐẶT LỊCH NGAY (CHỌN NGÀY)"}
                </button>
                
                <button
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
                  className="w-full py-3.5 border border-border hover:bg-surface/30 text-primary rounded-xl font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  LIÊN HỆ CHỦ SỞ HỮU
                </button>
              </div>

              {/* Security Banner */}
              <div className="bg-surface/30 rounded-xl p-4 border border-border/20 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-primary">Đặt Chỗ An Toàn</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">Được bảo vệ bởi hệ thống ký quỹ ADORA</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── LIGHTBOX / MODAL DIALOG ────────────────────────────────────────── */}
        {isLightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="max-w-5xl w-full flex flex-col items-center gap-4">
              {/* Large Image inside lightbox */}
              <div className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center">
                <ImageWithFallback
                  src={imagesList[selectedImageIndex]}
                  alt={`Large Billboard View ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                />
                
                {/* Arrow navigation inside lightbox */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 md:left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 md:right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
              
              {/* Thumbnails row inside lightbox */}
              <div className="flex gap-2 overflow-x-auto py-2 max-w-full scrollbar-thin">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${selectedImageIndex === idx ? "border-accent opacity-100" : "border-transparent opacity-60 hover:opacity-85"}`}
                  >
                    <ImageWithFallback src={img} alt={`Lightbox thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
