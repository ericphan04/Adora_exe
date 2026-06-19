import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  PlayCircle,
  Eye,
  MonitorPlay,
  Users,
  MapPin,
  ChevronDown,
  X,
  ChevronRight,
  ChevronLeft,
  Upload,
  Check,
  FileImage,
  Video,
  Megaphone,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Image,
  Sparkles,
  Star,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router";
import { KpiCard } from "../../KpiCard";
import { DataTable } from "../../DataTable";
import { StatusBadge } from "../../StatusBadge";
import { BookingDto } from "../../../../types/booking";
import { BillboardDto } from "../../../../types/billboard";
import { bookingsToCampaigns, formatVnd } from "../../../utils/advertiser";
import axiosClient from "../../../../api/axiosClient";
import { BillboardGoogleMap } from "../../map/BillboardGoogleMap";
import { notify, apiErrorMessage } from "../../../utils/notify";
import billboardApi from "../../../../api/billboardApi";
import bookingApi from "../../../../api/bookingApi";
import { parseBookingTime } from "../../../utils/calendar";

interface AdvertiserCampaignsViewProps {
  bookings: BookingDto[];
  onCancelBooking?: (id: number) => void;
  onPayBooking?: (id: number) => void;
  onReviewBooking?: (id: number) => void;
  onReportBooking?: (id: number, billboardId: number | null) => void;
}

/* ─── Mock billboard data for wizard step 2 ─── */
const WIZARD_BILLBOARDS = [
  {
    id: 1,
    title: "Cầu Rồng LED",
    address: "Hải Châu, Đà Nẵng",
    size: "12m×6m",
    resolution: "1920×1080",
    pricePerDay: 3000000,
    dailyViews: 150000,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400",
    latitude: 16.0614,
    longitude: 108.2275,
    operatingHours: "16h/ngày",
    brightness: "6500 nits",
    availabilities: [],
  },
  {
    id: 2,
    title: "Bạch Đằng Digital",
    address: "Sơn Trà, Đà Nẵng",
    size: "10m×5m",
    resolution: "1920×1080",
    pricePerDay: 2000000,
    dailyViews: 100000,
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400",
    latitude: 16.0708,
    longitude: 108.2483,
    operatingHours: "16h/ngày",
    brightness: "6000 nits",
    availabilities: [],
  },
  {
    id: 3,
    title: "Nguyễn Văn Linh Premium",
    address: "Hải Châu, Đà Nẵng",
    size: "14m×7m",
    resolution: "2560×1440",
    pricePerDay: 4500000,
    dailyViews: 200000,
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400",
    latitude: 16.0545,
    longitude: 108.202,
    operatingHours: "16h/ngày",
    brightness: "5000 nits",
    availabilities: [{ id: 1, availableDate: "2026-06-05", status: "BOOKED" }],
  },
  {
    id: 4,
    title: "Mỹ Khê Beach LED",
    address: "Ngũ Hành Sơn, Đà Nẵng",
    size: "8m×4m",
    resolution: "1920×1080",
    pricePerDay: 1800000,
    dailyViews: 80000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    latitude: 16.003,
    longitude: 108.263,
    operatingHours: "14h/ngày",
    brightness: "5500 nits",
    availabilities: [],
  },
  {
    id: 5,
    title: "Vincom Plaza Screen",
    address: "Hải Châu, Đà Nẵng",
    size: "16m×8m",
    resolution: "4K UHD",
    pricePerDay: 6000000,
    dailyViews: 250000,
    image: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=400",
    latitude: 16.0678,
    longitude: 108.2208,
    operatingHours: "18h/ngày",
    brightness: "5500 nits",
    availabilities: [],
  },
  {
    id: 6,
    title: "Sân Bay Đà Nẵng LED",
    address: "Cẩm Lệ, Đà Nẵng",
    size: "20m×6m",
    resolution: "4K UHD",
    pricePerDay: 8000000,
    dailyViews: 350000,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400",
    latitude: 16.0544,
    longitude: 108.1995,
    operatingHours: "16h/ngày",
    brightness: "6500 nits",
    availabilities: [],
  },
];

const CATEGORIES = ["Sản phẩm", "Dịch vụ", "Sự kiện", "Khuyến mãi", "Thương hiệu", "Khác"];
const WIZARD_STEPS = ["Nội Dung", "Chọn Bảng", "Preview", "Xác Nhận"];

/* ───────────────────────────────────────────────────────── */
function CampaignWizard({ onClose, onSuccess, bookings = [] }: { onClose: () => void; onSuccess: () => void; bookings?: BookingDto[] }) {
  const [step, setStep] = useState(1);

  // Step 1
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [creativePreview, setCreativePreview] = useState<string | null>(null);
  const [creativeType, setCreativeType] = useState<"image" | "video" | null>(null);
  const [creativeName, setCreativeName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2
  const [selectedBillboards, setSelectedBillboards] = useState<number[]>([]);
  const [bbSearch, setBbSearch] = useState("");
  const [billboards, setBillboards] = useState<BillboardDto[]>([]);
  const [loadingBillboards, setLoadingBillboards] = useState(false);

  useEffect(() => {
    const fetchBillboards = async () => {
      setLoadingBillboards(true);
      try {
        const response = await billboardApi.getAll();
        if (response.success && response.data) {
          setBillboards(response.data.filter(b => b.status === "APPROVED"));
        } else {
          throw new Error();
        }
      } catch (err) {
        // Fallback
        const fallbackList: BillboardDto[] = WIZARD_BILLBOARDS.map(wb => ({
          id: wb.id,
          title: wb.title,
          description: "Màn hình LED chất lượng cao tại vị trí đắc địa.",
          address: wb.address,
          formattedAddress: wb.address,
          city: "Đà Nẵng",
          district: wb.address.split(",")[0].trim(),
          width: parseInt(wb.size.split("m")[0]) || 12,
          height: parseInt(wb.size.split("×")[1]) || 6,
          resolution: wb.resolution,
          brightness: parseInt(wb.brightness) || 6000,
          refreshRate: 3840,
          screenType: "LED Outdoor",
          operatingHours: wb.operatingHours,
          pricePerDay: wb.pricePerDay,
          pricePerMonth: wb.pricePerDay * 30,
          locationSurcharge: 0,
          status: "APPROVED",
          dailyViews: wb.dailyViews,
          isFeatured: false,
          images: [{ id: 1, imageUrl: wb.image, isThumbnail: true }],
          features: [],
          availabilities: wb.availabilities,
          latitude: wb.latitude,
          longitude: wb.longitude,
        }));
        setBillboards(fallbackList);
      } finally {
        setLoadingBillboards(false);
      }
    };
    fetchBillboards();
  }, []);

  // Step 3
  const [previewIdx, setPreviewIdx] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  const checkBillboardAvailability = (
    bb: BillboardDto,
    sDateStr: string,
    eDateStr: string
  ): { available: boolean; conflictReason?: string } => {
    if (!sDateStr || !eDateStr) return { available: true };
    const start = new Date(sDateStr);
    const end = new Date(eDateStr);

    if (bb.availabilities && bb.availabilities.length > 0) {
      for (const av of bb.availabilities) {
        const avDate = new Date(av.availableDate);
        if (avDate >= start && avDate <= end) {
          if (av.status === "BOOKED" || av.status === "BLOCKED") {
            const formattedDate = new Date(av.availableDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
            return {
              available: false,
              conflictReason: `Bận vào ngày ${formattedDate}`,
            };
          }
        }
      }
    }

    for (const b of bookings) {
      if (b.billboard?.id === bb.id && ["PAID", "ACCEPTED", "PENDING"].includes(b.status)) {
        const bStart = new Date(b.startDate);
        const bEnd = new Date(b.endDate);
        if (
          (start >= bStart && start <= bEnd) ||
          (end >= bStart && end <= bEnd) ||
          (start <= bStart && end >= bEnd)
        ) {
          const compName = b.note ? (b.note.trim().startsWith("{") ? JSON.parse(b.note).campaignName : b.note) : "Đã đặt";
          return {
            available: false,
            conflictReason: `Trùng lịch chiến dịch khác (${compName})`,
          };
        }
      }
    }

    return { available: true };
  };

  const filteredBB = billboards.filter(
    bb => bb.title.toLowerCase().includes(bbSearch.toLowerCase()) || bb.address.toLowerCase().includes(bbSearch.toLowerCase())
  );

  const selectedBBDetails = billboards.filter(bb => selectedBillboards.includes(bb.id));

  const toggleBillboard = (bb: BillboardDto) => {
    const { available, conflictReason } = checkBillboardAvailability(bb, startDate, endDate);
    if (!available) {
      notify.error(`Màn hình "${bb.title}" bận trong khoảng thời gian đã chọn: ${conflictReason}`);
      return;
    }
    const id = bb.id;
    setSelectedBillboards(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const totalDays = (() => {
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(1, Math.ceil(diff / 86400000));
  })();

  const totalCost = selectedBBDetails.reduce((sum, bb) => sum + bb.pricePerDay * totalDays, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCreativeName(file.name);
    setCreativeType(file.type.startsWith("video/") ? "video" : "image");
    const reader = new FileReader();
    reader.onload = ev => setCreativePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const canNext = () => {
    if (step === 1) return !!(campaignName.trim() && category && startDate && endDate);
    if (step === 2) return selectedBillboards.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const noteMeta = JSON.stringify({
        campaignName: campaignName.trim(),
        description: description.trim(),
        category,
        budget: Number(budget) || 0,
        creativeUrl: creativePreview || "",
        creativeType: creativeType || "image",
        creativeName,
      });

      const promises = selectedBillboards.map(billboardId => {
        return bookingApi.create({
          billboardId,
          startDate: `${startDate}T00:00:00`,
          endDate: `${endDate}T00:00:00`,
          note: noteMeta,
        });
      });

      const results = await Promise.all(promises);
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        notify.error(failed[0].message || "Có lỗi xảy ra khi gửi yêu cầu.");
      } else {
        onSuccess();
      }
    } catch (err: any) {
      console.error(err);
      notify.error(apiErrorMessage(err, "Lỗi khi gửi yêu cầu đặt chiến dịch."));
    } finally {
      setSubmitting(false);
    }
  };

  const currentBB = selectedBBDetails[previewIdx] || selectedBBDetails[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-card rounded-2xl shadow-2xl w-full transition-all duration-300 ${step === 2 ? "max-w-5xl" : "max-w-2xl"} max-h-[90vh] flex flex-col border border-border overflow-hidden`}
        style={{ animation: "wizardIn .25s cubic-bezier(.4,0,.2,1)" }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-primary flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-primary">Tạo Chiến Dịch Mới</h2>
                <p className="text-xs text-muted-foreground">Bước {step}/4 — {WIZARD_STEPS[step - 1]}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center">
            {WIZARD_STEPS.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? "bg-primary border-primary text-white" : active ? "bg-card border-primary text-primary shadow" : "bg-muted border-border text-muted-foreground"}`}>
                      {done ? <Check className="w-3.5 h-3.5" /> : n}
                    </div>
                    <span className={`text-[10px] font-semibold hidden sm:block ${active ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
                  </div>
                  {i < WIZARD_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${done ? "bg-primary" : "bg-border"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Tên Chiến Dịch <span className="text-red-500">*</span></label>
                <input type="text" placeholder="VD: Tết 2027 – Đại Tiệc Mua Sắm" value={campaignName} onChange={e => setCampaignName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-surface/30 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Thể Loại <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 border border-border rounded-xl text-sm bg-surface/30 text-foreground outline-none focus:border-primary cursor-pointer appearance-none">
                      <option value="">Chọn...</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Ngân Sách (Triệu VND)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="number" placeholder="500" value={budget} onChange={e => setBudget(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 border border-border rounded-xl text-sm bg-surface/30 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Ngày Bắt Đầu <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 border border-border rounded-xl text-sm bg-surface/30 text-foreground outline-none focus:border-primary cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Ngày Kết Thúc <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="date" value={endDate} min={startDate} onChange={e => setEndDate(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 border border-border rounded-xl text-sm bg-surface/30 text-foreground outline-none focus:border-primary cursor-pointer" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Mô Tả / Ý Tưởng</label>
                <textarea rows={3} placeholder="Nội dung, thông điệp chính, đối tượng mục tiêu..." value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-xl text-sm bg-surface/30 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground" />
              </div>
              {/* Creative Upload */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Tải Lên Creative <span className="text-xs text-muted-foreground font-normal">(ảnh/video)</span>
                </label>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                {!creativePreview ? (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-primary/30 rounded-xl flex flex-col items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-primary">Nhấp để tải lên hoặc kéo thả</p>
                    <p className="text-[11px] text-muted-foreground">PNG, JPG, MP4 — tối đa 50MB</p>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-border bg-black h-40">
                    {creativeType === "image" ? (
                      <img src={creativePreview} alt="preview" className="w-full h-full object-contain" />
                    ) : (
                      <video src={creativePreview} className="w-full h-full object-contain" controls />
                    )}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {creativeType === "image" ? <FileImage className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                      <span className="max-w-[120px] truncate">{creativeName}</span>
                    </div>
                    <button onClick={() => { setCreativePreview(null); setCreativeType(null); setCreativeName(""); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[480px]">
              {/* Left Column: Billboard list & search (7/12) */}
              <div className="lg:col-span-7 flex flex-col h-full overflow-hidden space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Tìm bảng theo tên, vị trí..." value={bbSearch} onChange={e => setBbSearch(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border border-border rounded-xl text-sm bg-surface/30 text-foreground outline-none focus:border-primary transition-all placeholder:text-muted-foreground" />
                  </div>
                  {selectedBillboards.length > 0 && (
                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold shrink-0">{selectedBillboards.length} đã chọn</span>
                  )}
                </div>

                {loadingBillboards ? (
                  <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="flex-grow overflow-y-auto pr-1 space-y-3">
                    {filteredBB.map(bb => {
                      const sel = selectedBillboards.includes(bb.id);
                      const { available, conflictReason } = checkBillboardAvailability(bb, startDate, endDate);
                      
                      return (
                        <div key={bb.id} onClick={() => toggleBillboard(bb)}
                          className={`flex gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all bg-card/50 hover:bg-card/90 ${
                            sel
                              ? "border-primary shadow-sm"
                              : available
                              ? "border-border hover:border-primary/40"
                              : "border-border opacity-65 hover:border-red-400"
                          }`}>
                          <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 relative bg-muted">
                            {bb.images && bb.images.length > 0 ? (
                              <img src={bb.images.find(i => i.isThumbnail)?.imageUrl || bb.images[0].imageUrl} alt={bb.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">Không có ảnh</div>
                            )}
                            {sel && (
                              <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow">
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs font-bold text-foreground truncate">{bb.title}</h4>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${available ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                                  {available ? "● Khả dụng" : `● Bận (${conflictReason})`}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5 shrink-0" />{bb.address}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-muted-foreground">
                                <span>KT: {bb.width}m × {bb.height}m</span>
                                <span>Độ phân giải: {bb.resolution || "Full HD"}</span>
                                <span>Độ sáng: {bb.brightness || 6000} nits</span>
                                <span>HĐ: {bb.operatingHours || "16h/ngày"}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-border/40">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Eye className="w-3 h-3" />{bb.dailyViews?.toLocaleString() || "100.000"} views/ngày</span>
                              <span className="text-xs font-bold text-primary">{(bb.pricePerDay / 1000000).toFixed(1)}Tr/ngày</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredBB.length === 0 && (
                      <div className="text-center py-8 text-xs text-muted-foreground">Không tìm thấy bảng hiệu nào</div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Map (5/12) */}
              <div className="lg:col-span-5 h-full rounded-xl overflow-hidden border border-border relative bg-surface">
                <BillboardGoogleMap
                  billboards={filteredBB}
                  selectedId={selectedBillboards[selectedBillboards.length - 1] || null}
                  onSelect={(id) => {
                    if (id) {
                      const bb = billboards.find(x => x.id === id);
                      if (bb) toggleBillboard(bb);
                    }
                  }}
                  fitBounds={true}
                  className="absolute inset-0"
                />
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Preview Creative Trên Billboard</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Kiểm tra trước khi gửi chủ bảng duyệt</p>
                </div>
                {selectedBBDetails.length > 1 && (
                  <select value={previewIdx} onChange={e => setPreviewIdx(Number(e.target.value))}
                    className="px-3 py-1.5 border border-border rounded-lg text-xs bg-card text-foreground outline-none cursor-pointer">
                    {selectedBBDetails.map((bb, i) => <option key={bb.id} value={i}>{bb.title}</option>)}
                  </select>
                )}
              </div>
              {/* LED Frame */}
              <div className="bg-[#0A0A0A] rounded-xl p-3 border-4 border-[#1A1A2E]">
                <div className="relative rounded-lg overflow-hidden border-2 border-[#333]" style={{ aspectRatio: "16/9" }}>
                  {creativePreview ? (
                    creativeType === "image"
                      ? <img src={creativePreview} alt="Creative" className="w-full h-full object-cover" />
                      : <video src={creativePreview} className="w-full h-full object-cover" autoPlay muted loop />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1D4ED8] via-[#4F46E5] to-[#7C3AED] flex flex-col items-center justify-center gap-2">
                      <Image className="w-8 h-8 text-white/50" />
                      <p className="text-white/70 font-bold text-sm">{campaignName}</p>
                      <p className="text-white/40 text-xs">Chưa có creative</p>
                    </div>
                  )}
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(transparent 50%, rgba(0,0,0,0.04) 50%)", backgroundSize: "100% 4px" }} />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE PREVIEW
                  </div>
                  {currentBB && <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-md font-mono">{currentBB.resolution}</div>}
                </div>
              </div>
              {currentBB && (
                <div className="bg-surface/40 border border-border rounded-xl p-3 flex items-center gap-3">
                  <img src={currentBB.image} alt={currentBB.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{currentBB.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{currentBB.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">{currentBB.size}</p>
                    <p className="text-xs text-muted-foreground">{currentBB.resolution}</p>
                  </div>
                </div>
              )}
              {!creativePreview && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">Bạn chưa tải creative. Có thể gửi duyệt trước và upload sau.</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Xác Nhận & Gửi Duyệt</h3>
                <p className="text-xs text-muted-foreground mt-1">Chủ bảng sẽ xem và duyệt nội dung trước khi chiến dịch được phát sóng</p>
              </div>
              <div className="bg-surface/40 border border-border rounded-xl p-4 space-y-2 text-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Thông Tin Chiến Dịch</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Tên</span><span className="font-semibold text-foreground text-right max-w-[180px] truncate">{campaignName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Thể loại</span><span className="font-semibold text-foreground">{category}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Thời gian</span><span className="font-semibold text-foreground">{startDate} → {endDate}</span></div>
                {budget && <div className="flex justify-between"><span className="text-muted-foreground">Ngân sách</span><span className="font-semibold text-primary">{budget} Tr VND</span></div>}
              </div>
              <div className="bg-surface/40 border border-border rounded-xl p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Bảng Đã Chọn ({selectedBBDetails.length})</p>
                {selectedBBDetails.map(bb => (
                  <div key={bb.id} className="flex items-center gap-2.5 mb-2">
                    <img src={bb.image} alt={bb.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{bb.title}</p>
                      <p className="text-[11px] text-muted-foreground">{bb.address}</p>
                    </div>
                    <span className="text-xs font-bold text-primary shrink-0">{(bb.pricePerDay * totalDays).toLocaleString("vi-VN")}₫</span>
                  </div>
                ))}
                <div className="border-t border-border mt-2 pt-2 flex justify-between text-sm font-bold text-primary">
                  <span>Tổng ước tính</span><span>{totalCost.toLocaleString("vi-VN")}₫</span>
                </div>
              </div>
              {creativePreview && (
                <div className="bg-surface/40 border border-border rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0">
                    {creativeType === "image" ? <img src={creativePreview} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-900 flex items-center justify-center"><Video className="w-4 h-4 text-blue-400" /></div>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground truncate max-w-[200px]">{creativeName}</p>
                    <p className="text-[11px] text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Đã tải lên</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2.5 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <Star className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary/90 dark:text-accent">
                  <strong>Quy trình duyệt:</strong> Sau khi gửi, chủ bảng xem xét creative. Nếu được duyệt, chiến dịch sẽ lên lịch phát sóng. Nếu bị từ chối, bạn nhận được lý do để điều chỉnh.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface/30 flex items-center justify-between">
          <button onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer font-semibold">
            <ChevronLeft className="w-4 h-4" />{step === 1 ? "Hủy" : "Quay Lại"}
          </button>
          <div className="flex items-center gap-1.5">
            {[1,2,3,4].map(s => <div key={s} className={`rounded-full transition-all ${s === step ? "w-4 h-2 bg-primary" : s < step ? "w-2 h-2 bg-primary/50" : "w-2 h-2 bg-border"}`} />)}
          </div>
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${canNext() ? "bg-gradient-to-r from-[#4F46E5] to-primary text-white hover:shadow-lg hover:-translate-y-0.5" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
              Tiếp Tục <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
              {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang Gửi...</> : <><CheckCircle2 className="w-4 h-4" />Gửi Yêu Cầu Duyệt</>}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes wizardIn { from { opacity:0; transform:scale(.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Success Toast
───────────────────────────────────────────────────────── */
function SuccessToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] bg-card border border-emerald-200 dark:border-emerald-500/30 rounded-2xl shadow-2xl p-4 flex items-start gap-3 max-w-xs"
      style={{ animation: "wizardIn .3s cubic-bezier(.4,0,.2,1)" }}>
      <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">Yêu cầu đã được gửi!</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Chiến dịch đang chờ chủ bảng xem xét nội dung. Bạn sẽ nhận thông báo khi có phản hồi.</p>
        <button onClick={onDismiss} className="mt-1.5 text-xs text-emerald-600 font-semibold cursor-pointer hover:underline">Đóng</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
export function AdvertiserCampaignsView({
  bookings,
  onCancelBooking,
  onPayBooking,
  onReviewBooking,
  onReportBooking,
}: AdvertiserCampaignsViewProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showWizard, setShowWizard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const campaigns = useMemo(() => {
    const groups: Record<string, {
      id: number;
      name: string;
      brand: string;
      screens: string;
      location: string;
      startDate: string;
      endDate: string;
      budget: string;
      status: "running" | "upcoming" | "finished" | "paused" | "expired" | "pending_approval";
      rawStatus: string;
      bookings: BookingDto[];
      description: string;
      category: string;
      creativeUrl?: string;
      creativeType?: "image" | "video";
      creativeName?: string;
      hasSavedCreative?: boolean;
      totalAmount: number;
    }> = {};

    bookings.forEach(b => {
      let campaignName = b.note || `Chiến dịch #${b.id}`;
      let description = "";
      let category = "Chung";
      let budgetLabel = "";
      let creativeUrl = b.billboard?.images?.find(img => img.isThumbnail)?.imageUrl || b.billboard?.images?.[0]?.imageUrl || "";
      let creativeType: "image" | "video" = "image";
      let creativeName = "";
      let hasSavedCreative = false;

      try {
        if (b.note && b.note.trim().startsWith("{")) {
          const parsed = JSON.parse(b.note);
          campaignName = parsed.campaignName || campaignName;
          description = parsed.description || "";
          category = parsed.category || "Chung";
          budgetLabel = parsed.budget ? `${parsed.budget} Tr₫` : "";
          if (parsed.creativeUrl) {
            creativeUrl = parsed.creativeUrl;
            creativeType = parsed.creativeType || "image";
            creativeName = parsed.creativeName || "";
            hasSavedCreative = true;
          }
        }
      } catch (e) {}

      if (!groups[campaignName]) {
        groups[campaignName] = {
          id: b.id,
          name: campaignName,
          brand: b.billboard?.title || "Bảng QC",
          screens: "",
          location: "",
          startDate: b.startDate,
          endDate: b.endDate,
          budget: budgetLabel,
          status: "upcoming",
          rawStatus: b.status,
          bookings: [],
          description,
          category,
          creativeUrl,
          creativeType,
          creativeName,
          hasSavedCreative,
          totalAmount: 0,
        };
      }

      const g = groups[campaignName];
      g.bookings.push(b);
      g.totalAmount += b.finalAmount || b.totalPrice || 0;

      if (hasSavedCreative) {
        g.creativeUrl = creativeUrl;
        g.creativeType = creativeType;
        g.creativeName = creativeName;
        g.hasSavedCreative = true;
      }

      if (new Date(b.startDate) < new Date(g.startDate)) {
        g.startDate = b.startDate;
      }
      if (new Date(b.endDate) > new Date(g.endDate)) {
        g.endDate = b.endDate;
      }
    });

    return Object.values(groups).map(g => {
      const districts = [...new Set(g.bookings.map(b => b.billboard?.district).filter(Boolean))];
      g.location = districts.length > 0 ? districts.join(", ") : "Đà Nẵng";

      const screens = [...new Set(g.bookings.map(b => b.billboard?.title).filter(Boolean))];
      g.screens = screens.join(", ");
      g.brand = screens[0] || "Bảng QC";

      const today = new Date("2026-06-01");
      const start = new Date(g.startDate);
      const end = new Date(g.endDate);

      const hasPending = g.bookings.some(b => b.status === "PENDING");
      const hasRejected = g.bookings.some(b => b.status === "REJECTED");
      const hasPaid = g.bookings.some(b => b.status === "PAID");
      const hasAccepted = g.bookings.some(b => b.status === "ACCEPTED");

      if (hasPending && start < today) {
        g.status = "expired";
      } else if (end < today) {
        g.status = "expired";
      } else if (hasPending) {
        g.status = "pending_approval";
      } else if (hasRejected) {
        g.status = "paused";
      } else if (hasPaid) {
        if (today >= start && today <= end) {
          g.status = "running";
        } else if (today < start) {
          g.status = "upcoming";
        } else {
          g.status = "finished";
        }
      } else if (hasAccepted) {
        g.status = "upcoming";
      } else {
        g.status = "finished";
      }

      if (!g.budget) {
        g.budget = formatVnd(g.totalAmount);
      }

      return g;
    });
  }, [bookings]);

  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<any | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [previewUrlInput, setPreviewUrlInput] = useState("");
  const [previewUrlError, setPreviewUrlError] = useState("");
  const [customPreviewMap, setCustomPreviewMap] = useState<Record<number, { src: string; type: "image" | "video" }>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (selectedCampaignId === null && campaigns.length > 0) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  const getPreviewTypeFromUrl = (url: string) => {
    const n = url.split("?")[0].split("#")[0].toLowerCase();
    if (/\.(mp4|webm|ogg)$/i.test(n)) return "video" as const;
    if (/\.(jpe?g|png|gif|bmp|webp|avif|svg)$/i.test(n)) return "image" as const;
    return null;
  };

  const handlePreviewUrl = () => {
    if (!previewUrlInput.trim()) { setPreviewUrlError("Vui lòng nhập URL ảnh hoặc video."); return; }
    const type = getPreviewTypeFromUrl(previewUrlInput.trim());
    if (!type) { setPreviewUrlError("URL không hợp lệ. Dùng ảnh hoặc video MP4/WebM/OGG."); return; }
    if (selectedCampaignId !== null) {
      setCustomPreviewMap(prev => ({ ...prev, [selectedCampaignId]: { src: previewUrlInput.trim(), type } }));
      setPreviewUrlError("");
    }
  };

  const handleUploadFile = async (file?: File) => {
    if (!file || selectedCampaignId === null) return;
    const type = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : undefined;
    if (!type) { setPreviewUrlError("Chỉ chấp nhận ảnh hoặc video."); return; }
    setIsUploading(true);
    setPreviewUrlError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = (await axiosClient.post("/api/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })) as { url: string };
      setCustomPreviewMap(prev => ({ ...prev, [selectedCampaignId]: { src: response.url, type } }));
      setPreviewUrlInput(response.url);
    } catch (err: any) {
      setPreviewUrlError(err?.message || "Tải file lên thất bại.");
    } finally {
      setIsUploading(false);
    }
  };

  const filtered = campaigns.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some(c => c.id === selectedCampaignId)) {
      setSelectedCampaignId(filtered[0].id);
    }
  }, [filtered, selectedCampaignId]);

  const running = campaigns.filter(c => c.status === "running").length;
  const totalBudget = bookings.filter(b => b.status === "PAID").reduce((s, b) => s + b.finalAmount, 0);

  const runningBillboards = useMemo(() => {
    const list: { id: number; title: string; address: string }[] = [];
    const seenIds = new Set<number>();
    campaigns.forEach(c => {
      if (c.status === "running") {
        c.bookings.forEach(b => {
          if (b.billboard && !seenIds.has(b.billboard.id)) {
            seenIds.add(b.billboard.id);
            list.push({
              id: b.billboard.id,
              title: b.billboard.title,
              address: b.billboard.address || b.billboard.district || "",
            });
          }
        });
      }
    });
    return list;
  }, [campaigns]);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId) ?? campaigns[0];
  const selectedBooking = bookings.find(b => b.id === selectedCampaign?.id);
  const previewImage = selectedBooking?.billboard?.images?.find(img => img.isThumbnail)?.imageUrl ?? selectedBooking?.billboard?.images?.[0]?.imageUrl;
  const previewVideo = selectedBooking?.billboard?.demoVideoUrl;
  const customPreview = selectedCampaignId ? customPreviewMap[selectedCampaignId] : undefined;

  const previewSrc = customPreview?.src ?? 
                     (selectedCampaign?.hasSavedCreative ? selectedCampaign.creativeUrl : undefined) ?? 
                     previewVideo ?? 
                     previewImage;

  const previewType = customPreview?.type ?? 
                      (selectedCampaign?.hasSavedCreative ? selectedCampaign.creativeType : undefined) ?? 
                      (previewVideo ? "video" : "image");

  useEffect(() => {
    if (selectedCampaign) {
      const custom = selectedCampaignId ? customPreviewMap[selectedCampaignId] : undefined;
      if (custom) {
        setPreviewUrlInput(custom.src);
      } else if (selectedCampaign.hasSavedCreative && selectedCampaign.creativeUrl) {
        setPreviewUrlInput(selectedCampaign.creativeUrl);
      } else {
        setPreviewUrlInput("");
      }
      setPreviewUrlError("");
    }
  }, [selectedCampaignId, selectedCampaign, customPreviewMap]);

  const statusMap: Record<string, { variant: "active" | "pending" | "expired" | "unavailable"; label: string }> = {
    running: { variant: "active", label: "Đang chạy" },
    upcoming: { variant: "pending", label: "Sắp chạy" },
    finished: { variant: "expired", label: "Đã kết thúc" },
    paused: { variant: "unavailable", label: "Tạm dừng" },
    expired: { variant: "expired", label: "Hết hạn" },
    pending_approval: { variant: "pending", label: "Chờ duyệt" },
  };

  const columns = [
    {
      key: "name",
      label: "Chiến dịch",
      render: (v: string, row: { brand: string; location: string }) => (
        <div>
          <p className="text-sm font-medium text-foreground">{v}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />{row.brand} · {row.location}
          </p>
        </div>
      ),
    },
    {
      key: "time",
      label: "Thời gian",
      render: (_: unknown, row: { startDate: string; endDate: string }) => (
        <span className="text-sm text-foreground">{row.startDate} – {row.endDate}</span>
      ),
    },
    {
      key: "budget",
      label: "Ngân sách",
      render: (v: string) => <span className="font-semibold text-primary">{v}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_: unknown, row: { status: string }) => {
        const conf = statusMap[row.status] || statusMap.upcoming;
        return <StatusBadge variant={conf.variant} label={conf.label} />;
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (_: unknown, row: any) => (
        <button
          onClick={() => setSelectedCampaignDetail(row)}
          className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-primary cursor-pointer transition-colors"
        >
          Chi tiết
        </button>
      ),
    },
  ];

  const handleWizardSuccess = () => {
    setShowWizard(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 7000);
  };

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4F46E5] via-[#1D4ED8] to-[#06B6D4] p-6 text-white shadow-md">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="relative flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-sm text-indigo-100">Trung tâm chiến dịch</p>
            <h2 className="text-2xl font-bold mt-1">Quản lý quảng cáo LED</h2>
            <p className="text-sm text-indigo-100/90 mt-2">Tạo nội dung, chọn bảng và gửi duyệt — 4 bước đơn giản.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#1D4ED8] text-sm font-bold hover:bg-blue-50 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Chiến dịch mới
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Đang chạy" value={String(running)} icon={<PlayCircle className="w-5 h-5" />} />
        <KpiCard title="Tổng chiến dịch" value={String(campaigns.length)} icon={<MonitorPlay className="w-5 h-5" />} />
        <KpiCard title="Chi phí đã chi" value={formatVnd(totalBudget)} icon={<Users className="w-5 h-5" />} />
        <KpiCard title="Lượt hiển thị (ước tính)" value="2.4M" change="+15%" changeType="up" icon={<Eye className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-card rounded-xl border border-border/80 p-4 flex flex-wrap gap-3 items-center shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Tìm chiến dịch..." className="w-full pl-10 pr-4 py-2 bg-surface/30 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 bg-surface/30 border border-border rounded-lg px-3 py-1">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent border-none outline-none text-primary text-sm cursor-pointer">
                <option className="bg-card text-foreground" value="all">Tất cả</option>
                <option className="bg-card text-foreground" value="running">Đang chạy</option>
                <option className="bg-card text-foreground" value="upcoming">Sắp chạy</option>
                <option className="bg-card text-foreground" value="finished">Đã kết thúc</option>
              </select>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Danh sách chiến dịch</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} chiến dịch</p>
              </div>
              <button onClick={() => setShowWizard(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 cursor-pointer transition-colors">
                <Plus className="w-3.5 h-3.5" /> Tạo mới
              </button>
            </div>
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Megaphone className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-semibold text-foreground mb-1">Chưa có chiến dịch nào</p>
                <p className="text-xs text-muted-foreground mb-4">Tạo chiến dịch đầu tiên để bắt đầu quảng cáo LED</p>
                <button onClick={() => setShowWizard(true)}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 cursor-pointer transition-all active:scale-95">
                  Tạo Chiến Dịch Ngay
                </button>
              </div>
            ) : (
              <DataTable columns={columns} data={filtered} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Preview panel */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <div className="space-y-3.5 mb-4">
              <div>
                <h3 className="font-semibold text-primary">Xem trước creative</h3>
                <p className="text-xs text-muted-foreground mt-1">Hiển thị nội dung chiến dịch trên mô phỏng LED.</p>
              </div>
              {campaigns.length > 0 && (
                <div className="relative">
                  <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2 bg-surface/40 hover:bg-surface/60 border border-border rounded-xl text-sm text-foreground cursor-pointer focus:outline-none transition-all duration-200">
                    <span className="truncate font-semibold">{selectedCampaign?.name ?? "Chọn chiến dịch"}</span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <ul className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-card border border-border rounded-xl shadow-xl z-50 py-1 divide-y divide-border/10">
                        {campaigns.map(campaign => (
                          <li key={campaign.id} onClick={() => { setSelectedCampaignId(campaign.id); setIsDropdownOpen(false); }}
                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${campaign.id === selectedCampaign?.id ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-surface/50"}`}>
                            <span className="truncate">{campaign.name}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl overflow-hidden border-4 border-slate-800 bg-slate-950 shadow-2xl relative">
              <div className="absolute top-2.5 left-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><span>LED ACTIVE</span>
              </div>
              <div className="absolute top-2.5 right-3 z-10 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-bold text-white/60">1920 x 1080</div>
              <div className="relative h-48 overflow-hidden bg-slate-900 sm:h-52">
                {isUploading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white/90 p-4 text-center">
                    <div className="relative w-10 h-10 mb-2">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin" />
                    </div>
                    <p className="text-xs font-semibold text-primary animate-pulse">Đang tải file lên...</p>
                  </div>
                ) : previewType === "video" && previewSrc ? (
                  <video src={previewSrc} autoPlay muted loop controls={false} className="w-full h-full object-cover" />
                ) : previewType === "image" && previewSrc ? (
                  <img src={previewSrc} alt={selectedCampaign?.name ?? "Creative"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white/50 p-4 text-center">
                    <PlayCircle className="w-10 h-10 mb-2 opacity-85" />
                    <p className="text-xs font-semibold">Chưa có creative để xem trước</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tải lên ảnh/video hoặc dán URL</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <input type="text" placeholder="Dán URL ảnh hoặc video..." className="flex-1 px-3.5 py-2.5 bg-surface/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={previewUrlInput} disabled={isUploading} onChange={e => setPreviewUrlInput(e.target.value)} />
                <label className={`inline-flex items-center justify-center rounded-xl border border-border bg-surface/40 px-4 py-2.5 text-xs font-bold text-primary cursor-pointer hover:bg-surface/60 active:scale-95 transition-all shrink-0 ${isUploading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}>
                  Tải file
                  <input type="file" accept="image/*,video/*" className="hidden" disabled={isUploading} onChange={e => handleUploadFile(e.target.files?.[0])} />
                </label>
              </div>
              <button type="button" onClick={handlePreviewUrl} disabled={isUploading}
                className={`w-full rounded-xl bg-primary hover:bg-primary-hover py-2.5 text-sm font-bold text-white transition-all active:scale-95 shadow-md shadow-primary/10 cursor-pointer ${isUploading ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}>
                Xem trước
              </button>
              {previewUrlError && <p className="text-xs text-red-500 font-semibold">{previewUrlError}</p>}
            </div>
          </div>

          {/* Running locations */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h3 className="font-semibold text-primary mb-3">Vị trí đang chạy</h3>
            {runningBillboards.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Chưa có bảng nào đang chạy</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {runningBillboards.slice(0, 6).map(bb => (
                  <li key={bb.id} className="flex justify-between items-center p-2.5 rounded-lg bg-surface/40 border border-border/30 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{bb.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                        {bb.address}
                      </p>
                    </div>
                    <StatusBadge variant="active" label="Đang chạy" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Wizard Modal */}
      {showWizard && <CampaignWizard bookings={bookings} onClose={() => setShowWizard(false)} onSuccess={handleWizardSuccess} />}

      {/* Success Toast */}
      {showSuccess && <SuccessToast onDismiss={() => setShowSuccess(false)} />}

      {/* CAMPAIGN DETAIL MODAL */}
      {selectedCampaignDetail && (() => {
        const isCampaignExpired = selectedCampaignDetail.status === "expired";
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCampaignDetail(null)} />
            <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-3xl border border-border overflow-hidden animate-in fade-in duration-200 flex flex-col max-h-[85vh]">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5">
                <div>
                  <h3 className="text-base font-bold text-primary">Chi Tiết Chiến Dịch</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Thể loại: <strong className="text-foreground">{selectedCampaignDetail.category}</strong>
                  </p>
                </div>
                <button onClick={() => setSelectedCampaignDetail(null)}
                  className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground cursor-pointer transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs md:text-sm">
                
                {/* Status Warning if expired */}
                {isCampaignExpired && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl p-3.5 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Chiến dịch đã hết hạn / Quá hạn duyệt</p>
                      <p className="text-[11px] opacity-90 mt-0.5">Thời gian chiến dịch đã qua hoặc yêu cầu đã quá hạn mà chưa được duyệt. Vui lòng liên hệ với chủ bảng hoặc tạo chiến dịch mới.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  
                  {/* Left Column: General Info & Creative (5/12) */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="bg-surface/50 rounded-xl p-4 border border-border space-y-2.5">
                      <h4 className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Thông tin chung</h4>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Tên chiến dịch</span>
                        <span className="font-semibold text-foreground">{selectedCampaignDetail.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase">Bắt đầu</span>
                          <span className="font-semibold text-foreground">{selectedCampaignDetail.startDate}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px] uppercase">Kết thúc</span>
                          <span className="font-semibold text-foreground">{selectedCampaignDetail.endDate}</span>
                        </div>
                      </div>
                      <div className="pt-1">
                        <span className="text-muted-foreground block text-[10px] uppercase">Tổng ngân sách</span>
                        <span className="font-bold text-primary">{selectedCampaignDetail.budget}</span>
                      </div>
                      {selectedCampaignDetail.description && (
                        <div className="pt-1">
                          <span className="text-muted-foreground block text-[10px] uppercase">Mô tả</span>
                          <p className="text-foreground text-[11px] leading-relaxed mt-0.5">{selectedCampaignDetail.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Creative Preview */}
                    <div className="bg-[#0A0A0A] rounded-xl p-3 border border-border">
                      <div className="text-[10px] text-center text-white/40 mb-2 font-mono uppercase tracking-widest">Creative Preview</div>
                      {selectedCampaignDetail.creativeUrl ? (
                        <div className="relative rounded-lg overflow-hidden border border-[#333]" style={{ aspectRatio: "16/9" }}>
                          {selectedCampaignDetail.creativeType === "video" ? (
                            <video src={selectedCampaignDetail.creativeUrl} className="w-full h-full object-cover" autoPlay muted loop />
                          ) : (
                            <img src={selectedCampaignDetail.creativeUrl} alt="creative" className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(transparent 50%, rgba(0,0,0,0.04) 50%)", backgroundSize: "100% 4px" }} />
                        </div>
                      ) : (
                        <div className="aspect-[16/9] rounded-lg bg-slate-900 border border-[#333] flex items-center justify-center text-white/30 text-xs italic">
                          Chưa tải lên Creative
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Billboard list & action breakdown (7/12) */}
                  <div className="md:col-span-7 space-y-4">
                    <h4 className="font-bold text-xs text-primary border-l-2 border-primary pl-2 uppercase tracking-wider">Danh Sách Bảng LED & Đặt Chỗ</h4>
                    
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {selectedCampaignDetail.bookings.map((b: BookingDto, idx: number) => {
                        const statusConf = statusMap[b.status.toLowerCase()] || { variant: "pending" as const, label: b.status };
                        
                        return (
                          <div key={idx} className="bg-surface/30 border border-border/80 rounded-xl p-3.5 space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <p className="font-bold text-foreground text-xs leading-snug">{b.billboard?.title}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5"><MapPin className="w-2.5 h-2.5 inline shrink-0 -mt-0.5" /> {b.billboard?.address}</p>
                              </div>
                              <StatusBadge variant={statusConf.variant} label={statusConf.label} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-muted-foreground border-t border-border/30 pt-2">
                              <div>
                                {(() => {
                                  const timeInfo = parseBookingTime(b.startDate, b.endDate);
                                  return (
                                    <div className="flex flex-col gap-0.5">
                                      <span>Thời gian: <strong className="text-foreground">{timeInfo.detailLabel}</strong></span>
                                      <span className={`self-start px-2 py-0.5 rounded-full text-[8px] font-bold border mt-0.5 ${timeInfo.modeColor}`}>
                                        {timeInfo.modeLabel}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>
                              <div className="space-y-1 text-left sm:text-right">
                                <div>Kích thước: <strong className="text-foreground">{b.billboard?.width}m × {b.billboard?.height}m</strong></div>
                                <div>Thực thanh toán: <strong className="text-primary">{(b.finalAmount || b.totalPrice || 0).toLocaleString("vi-VN")}₫</strong></div>
                              </div>
                            </div>

                            {/* Booking Action buttons */}
                            <div className="flex justify-end gap-2 pt-1 border-t border-border/20">
                              {b.status === "PENDING" && (
                                <button
                                  onClick={() => {
                                    if (onCancelBooking) {
                                      onCancelBooking(b.id);
                                      setSelectedCampaignDetail(null);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 dark:border-red-950/30 dark:hover:bg-red-950/20 text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Hủy đặt chỗ
                                </button>
                              )}
                              {b.status === "ACCEPTED" && (
                                <button
                                  onClick={() => {
                                    if (onPayBooking) {
                                      onPayBooking(b.id);
                                      setSelectedCampaignDetail(null);
                                    }
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-[10px] font-bold cursor-pointer transition-colors shadow-sm"
                                >
                                  Thanh toán VNPay
                                </button>
                              )}
                              {(b.status === "PAID" || b.status === "COMPLETED") && (
                                <>
                                  <button
                                    onClick={() => {
                                      if (onReviewBooking) {
                                        onReviewBooking(b.id);
                                        setSelectedCampaignDetail(null);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-[10px] font-bold cursor-pointer transition-colors"
                                  >
                                    Đánh giá
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (onReportBooking) {
                                        onReportBooking(b.id, b.billboard?.id || null);
                                        setSelectedCampaignDetail(null);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-500/5 text-[10px] font-semibold cursor-pointer transition-colors"
                                  >
                                    Khiếu nại
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>

                </div>

                {/* Campaign map overview */}
                <div className="space-y-2">
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
              <div className="px-6 py-4 border-t border-border bg-surface/50 flex justify-end">
                <button onClick={() => setSelectedCampaignDetail(null)}
                  className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted cursor-pointer transition-colors">
                  Đóng
                </button>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
