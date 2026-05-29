import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { MapPin, Star, Phone, ChevronLeft, ChevronRight, Heart, Share2, Monitor, Zap, Shield, Eye, ExternalLink, Info, Maximize, Lightbulb, Grid, CheckCircle, HelpCircle, Users, Calendar } from "lucide-react";
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

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCalendarYear(year);
    setCalendarMonth(month);
    setSelectedStartDay(null);
    setSelectedEndDay(null);
    setBookingError(null);
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

  const imagesList = useMemo(() => {
    if (!billboard.images || billboard.images.length === 0) return [];
    return billboard.images.map((img: any) => typeof img === "string" ? img : img.imageUrl);
  }, [billboard.images]);

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
                      <img
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
                  <img
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
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
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
                  <img
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
                      <img
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
                <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold">
                  {billboard.district}, {billboard.city}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">{billboard.title}</h1>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed flex items-start gap-1.5">
                <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                {billboard.address}
              </p>
            </div>

            {/* Specification cards (Bento Grid) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-accent/40 transition-all duration-300">
                <Maximize className="text-accent w-6 h-6" />
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Độ phân giải</span>
                <span className="font-bold text-sm md:text-base truncate">{billboard.resolution || "4K UHD Premium"}</span>
              </div>
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-accent/40 transition-all duration-300">
                <Lightbulb className="text-accent w-6 h-6" />
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Độ sáng</span>
                <span className="font-bold text-sm md:text-base truncate">
                  {billboard.brightness ? `${billboard.brightness.toLocaleString()} Nits` : "8,500 Nits"}
                </span>
              </div>
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-accent/40 transition-all duration-300">
                <Grid className="text-accent w-6 h-6" />
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Loại màn hình</span>
                <span className="font-bold text-sm md:text-base truncate">{billboard.screenType || "P3 Outdoor SMD"}</span>
              </div>
              <div className="glass-card p-6 rounded-2xl flex flex-col gap-2 shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-accent/40 transition-all duration-300">
                <Monitor className="text-accent w-6 h-6" />
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Kích thước</span>
                <span className="font-bold text-sm md:text-base truncate">
                  {billboard.width * billboard.height}m² ({billboard.width}m x {billboard.height}m)
                </span>
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
              
              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-border/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Users className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">
                      {billboard.dailyViews ? `${billboard.dailyViews.toLocaleString()}+` : "550,000+"}
                    </h4>
                    <p className="text-muted-foreground text-xs md:text-sm">Lượt tiếp cận/ngày</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <Zap className="text-accent w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-foreground">{billboard.refreshRate} Hz</h4>
                    <p className="text-muted-foreground text-xs md:text-sm">Tần suất làm mới màn hình</p>
                  </div>
                </div>
              </div>
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
                  <p className="text-sm font-bold text-foreground">15s / lượt (60 - 120 lượt/ngày)</p>
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

              {/* Booking Calendar Input Simulation */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Lịch Trống Màn Hình</label>
                  
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

                {/* Campaign Notes */}
                {selectedStartDay && selectedEndDay && (
                  <div className="animate-in fade-in duration-300">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Ghi chú chiến dịch (Note)</label>
                    <input
                      type="text"
                      placeholder="Thông điệp gửi chủ sở hữu..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full bg-background border border-border/50 rounded-xl px-3.5 py-3 text-xs outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-foreground"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Price Calculation breakdown */}
              <div className="bg-surface/50 rounded-xl p-4.5 border border-border/30 space-y-3">
                {priceBreakdown ? (
                  <>
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-muted-foreground font-medium">
                        Giá thuê ({priceBreakdown.daysCount} ngày)
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
                    Chọn khoảng ngày trên lịch để tính giá thuê
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBookingSubmit}
                  disabled={bookingLoading || (!!user && user.role !== "RENTER")}
                  className="w-full py-4 bg-primary text-white hover:bg-primary/95 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] shadow-[0_4px_20px_rgba(29,78,216,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {bookingLoading
                    ? "ĐANG XỬ LÝ..."
                    : !user
                      ? "ĐĂNG NHẬP ĐỂ ĐẶT LỊCH"
                      : user.role !== "RENTER"
                        ? "CHỈ DÀNH CHO NHÀ QUẢNG CÁO"
                        : selectedStartDay && selectedEndDay
                          ? `ĐẶT LỊCH NGAY (${selectedDaysCount} ngày)`
                          : "ĐẶT LỊCH NGAY (CHỌN LỊCH)"}
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
                <img
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
                    <img src={img} alt={`Lightbox thumb ${idx}`} className="w-full h-full object-cover" />
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
