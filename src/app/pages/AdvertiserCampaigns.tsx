import React, { useState, useRef } from "react";
import {
  Search, Plus, Filter, Calendar, MapPin, Users, PlayCircle,
  PauseCircle, Pencil, Eye, MonitorPlay, X, ChevronRight,
  ChevronLeft, Upload, Check, FileImage, Video, Building2,
  Megaphone, Tag, DollarSign, Clock, AlertCircle, CheckCircle2,
  Image, Sparkles, Star
} from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { KpiCard } from "../components/KpiCard";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { BillboardGoogleMap } from "../components/map/BillboardGoogleMap";

/* ─────────────────────────────────────────────────────────
   Mock data
───────────────────────────────────────────────────────── */
const campaigns = [
  {
    name: "Tết 2026 - Đại Tiệc Mua Sắm",
    brand: "Vincom Retail",
    screens: "Cầu Rồng LED, Bạch Đằng Digital",
    startDate: "05/01/2026",
    endDate: "15/02/2026",
    budget: "1.200.000.000₫",
    status: "running",
    creative: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400",
  },
  {
    name: "Ra Mắt Sản Phẩm Mới",
    brand: "TechZone",
    screens: "Nguyễn Văn Linh Screen",
    startDate: "01/03/2026",
    endDate: "31/03/2026",
    budget: "450.000.000₫",
    status: "upcoming",
    creative: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
  },
  {
    name: "Mùa Hè Sôi Động",
    brand: "Coca-Cola",
    screens: "Mỹ Khê Beach LED",
    startDate: "01/06/2025",
    endDate: "31/08/2025",
    budget: "900.000.000₫",
    status: "finished",
    creative: "https://images.unsplash.com/photo-1624552184280-9e9cdc45a6fb?w=400",
  },
  {
    name: "Khuyến Mãi Cuối Tuần",
    brand: "MegaMart",
    screens: "Vincom Đà Nẵng, Cầu Rồng LED",
    startDate: "10/03/2026",
    endDate: "30/03/2026",
    budget: "320.000.000₫",
    status: "paused",
    creative: "",
  },
];

const mockBillboards = [
  {
    id: 1,
    title: "Cầu Rồng LED",
    address: "Hải Châu, Đà Nẵng",
    size: "12m × 6m",
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
    size: "10m × 5m",
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
    size: "14m × 7m",
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
    size: "8m × 4m",
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
    size: "16m × 8m",
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
    size: "20m × 6m",
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
const WIZARD_STEPS = ["Nội Dung Chiến Dịch", "Chọn Bảng LED", "Preview Creative", "Xác Nhận & Gửi"];

/* ─────────────────────────────────────────────────────────
   Campaign List Columns
───────────────────────────────────────────────────────── */
const columns = [
  {
    key: "name",
    label: "Tên Chiến Dịch",
    render: (v: string, row: any) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#EEF2FF] shrink-0 border border-[#E3E8EF]">
          {row.creative ? (
            <img src={row.creative} alt={v} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="w-4 h-4 text-[#6B7A8D]" />
            </div>
          )}
        </div>
        <div>
          <div className="text-sm text-[#1A2332]" style={{ fontWeight: 500 }}>{v}</div>
          <div className="text-xs text-[#6B7A8D] flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3" />
            <span>{row.brand}</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "screens",
    label: "Màn Hình Quảng Cáo",
    render: (v: string) => (
      <span className="text-sm text-[#1A2332]">{v}</span>
    ),
  },
  {
    key: "time",
    label: "Thời Gian",
    render: (_: any, row: any) => (
      <div className="text-sm text-[#1A2332]">{row.startDate} - {row.endDate}</div>
    ),
  },
  {
    key: "budget",
    label: "Ngân Sách",
    render: (v: string) => (
      <span className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>{v}</span>
    ),
  },
  {
    key: "status",
    label: "Trạng Thái",
    render: (_: any, row: any) => {
      const map: Record<string, { variant: any; label: string }> = {
        running: { variant: "active", label: "Đang chạy" },
        upcoming: { variant: "pending", label: "Sắp chạy" },
        finished: { variant: "expired", label: "Đã kết thúc" },
        paused: { variant: "unavailable", label: "Tạm dừng" },
        pending_approval: { variant: "pending", label: "Chờ duyệt nội dung" },
      };
      const conf = map[row.status] || map.running;
      return <StatusBadge variant={conf.variant} label={conf.label} />;
    },
  },
  {
    key: "actions",
    label: "Thao Tác",
    render: () => (
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer">
          <Eye className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#F0F9FF] flex items-center justify-center text-[#6B7A8D] cursor-pointer">
          <Pencil className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-[#FEF2F2] flex items-center justify-center text-[#EF4444] cursor-pointer">
          <PauseCircle className="w-4 h-4" />
        </button>
      </div>
    ),
  },
];

/* ─────────────────────────────────────────────────────────
   Campaign Wizard Modal
───────────────────────────────────────────────────────── */
function CampaignWizard({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState(1);

  // Step 1 data
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

  // Step 2 data
  const [selectedBillboards, setSelectedBillboards] = useState<number[]>([]);
  const [bbSearch, setBbSearch] = useState("");

  // Step 3 data
  const [previewBillboard, setPreviewBillboard] = useState(0);

  const [submitting, setSubmitting] = useState(false);

  const filteredBillboards = mockBillboards.filter(bb =>
    bb.title.toLowerCase().includes(bbSearch.toLowerCase()) ||
    bb.address.toLowerCase().includes(bbSearch.toLowerCase())
  );

  const toggleBillboard = (id: number) => {
    setSelectedBillboards(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectedBBDetails = mockBillboards.filter(bb => selectedBillboards.includes(bb.id));

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
    const isVideo = file.type.startsWith("video/");
    setCreativeType(isVideo ? "video" : "image");
    const reader = new FileReader();
    reader.onload = (ev) => setCreativePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const canGoNext = () => {
    if (step === 1) return campaignName.trim() && category && startDate && endDate;
    if (step === 2) return selectedBillboards.length > 0;
    if (step === 3) return true;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    setSubmitting(false);
    onSuccess();
  };

  const currentPreviewBB = selectedBBDetails[previewBillboard] || selectedBBDetails[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative bg-white dark:bg-[#161B22] rounded-2xl shadow-2xl w-full transition-all duration-300 ${step === 2 ? "max-w-5xl" : "max-w-3xl"} max-h-[90vh] flex flex-col overflow-hidden border border-[#E3E8EF] dark:border-[#30363D]`}
        style={{ animation: "modalIn 0.25s cubic-bezier(.4,0,.2,1)" }}>

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E3E8EF] dark:border-[#30363D] bg-gradient-to-r from-[#EEF2FF] to-[#F0F9FF] dark:from-[#1D4ED8]/10 dark:to-[#0891B2]/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#1D4ED8] flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1D4ED8]">Tạo Chiến Dịch Mới</h2>
                <p className="text-xs text-[#6B7A8D]">Bước {step}/4 — {WIZARD_STEPS[step - 1]}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#E3E8EF] dark:hover:bg-[#21262D] flex items-center justify-center text-[#6B7A8D] cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center gap-0">
            {WIZARD_STEPS.map((label, i) => {
              const stepNum = i + 1;
              const done = stepNum < step;
              const active = stepNum === step;
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      done ? "bg-[#1D4ED8] border-[#1D4ED8] text-white"
                        : active ? "bg-white border-[#1D4ED8] text-[#1D4ED8] shadow-md"
                        : "bg-[#F0F9FF] dark:bg-[#21262D] border-[#E3E8EF] dark:border-[#30363D] text-[#6B7A8D]"
                    }`}>
                      {done ? <Check className="w-3.5 h-3.5" /> : stepNum}
                    </div>
                    <span className={`text-[10px] font-semibold hidden md:block text-center leading-tight w-20 ${active ? "text-[#1D4ED8]" : "text-[#6B7A8D]"}`}>
                      {label}
                    </span>
                  </div>
                  {i < WIZARD_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all ${done ? "bg-[#1D4ED8]" : "bg-[#E3E8EF] dark:bg-[#30363D]"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── STEP 1: Campaign Content ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1A2332] dark:text-[#E6EDF3] mb-1.5">
                  Tên Chiến Dịch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tết 2027 – Đại Tiệc Mua Sắm"
                  value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E3E8EF] dark:border-[#30363D] rounded-xl text-sm bg-[#F9FAFB] dark:bg-[#21262D] text-[#1A2332] dark:text-[#E6EDF3] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2332] dark:text-[#E6EDF3] mb-1.5">
                    Thể Loại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-[#E3E8EF] dark:border-[#30363D] rounded-xl text-sm bg-[#F9FAFB] dark:bg-[#21262D] text-[#1A2332] dark:text-[#E6EDF3] outline-none focus:border-[#1D4ED8] cursor-pointer appearance-none"
                    >
                      <option value="">Chọn thể loại...</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2332] dark:text-[#E6EDF3] mb-1.5">Ngân Sách (Triệu VND)</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      placeholder="500"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-[#E3E8EF] dark:border-[#30363D] rounded-xl text-sm bg-[#F9FAFB] dark:bg-[#21262D] text-[#1A2332] dark:text-[#E6EDF3] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A2332] dark:text-[#E6EDF3] mb-1.5">
                    Ngày Bắt Đầu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-[#E3E8EF] dark:border-[#30363D] rounded-xl text-sm bg-[#F9FAFB] dark:bg-[#21262D] text-[#1A2332] dark:text-[#E6EDF3] outline-none focus:border-[#1D4ED8] cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2332] dark:text-[#E6EDF3] mb-1.5">
                    Ngày Kết Thúc <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-[#E3E8EF] dark:border-[#30363D] rounded-xl text-sm bg-[#F9FAFB] dark:bg-[#21262D] text-[#1A2332] dark:text-[#E6EDF3] outline-none focus:border-[#1D4ED8] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A2332] dark:text-[#E6EDF3] mb-1.5">Mô Tả / Ý Tưởng Chiến Dịch</label>
                <textarea
                  placeholder="Nội dung, thông điệp chính, tệp khách hàng mục tiêu..."
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E3E8EF] dark:border-[#30363D] rounded-xl text-sm bg-[#F9FAFB] dark:bg-[#21262D] text-[#1A2332] dark:text-[#E6EDF3] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 transition-all resize-none"
                />
              </div>

              {/* Creative Upload */}
              <div>
                <label className="block text-sm font-semibold text-[#1A2332] dark:text-[#E6EDF3] mb-1.5">
                  Tải Lên Creative <span className="text-xs text-[#6B7A8D] font-normal">(ảnh PNG/JPG hoặc video MP4)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {!creativePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-36 border-2 border-dashed border-[#C7D2FE] dark:border-[#30363D] rounded-xl flex flex-col items-center justify-center gap-3 bg-[#EEF2FF]/40 dark:bg-[#1D4ED8]/5 hover:bg-[#EEF2FF] dark:hover:bg-[#1D4ED8]/10 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#EEF2FF] dark:bg-[#1D4ED8]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-[#4F46E5]" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-[#4F46E5]">Nhấp để tải lên hoặc kéo thả file</p>
                      <p className="text-xs text-[#6B7A8D] mt-0.5">PNG, JPG, MP4 — tối đa 50MB</p>
                    </div>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-[#E3E8EF] dark:border-[#30363D] bg-black h-48">
                    {creativeType === "image" ? (
                      <img src={creativePreview} alt="preview" className="w-full h-full object-contain" />
                    ) : (
                            {/* ── STEP 2: Select Billboards ── */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[480px]">
              {/* Left Column: Billboard list & search (7/12) */}
              <div className="lg:col-span-7 flex flex-col h-full overflow-hidden space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm bảng theo tên, vị trí..."
                      value={bbSearch}
                      onChange={e => setBbSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-[#E3E8EF] dark:border-[#30363D] rounded-xl text-sm bg-[#F9FAFB] dark:bg-[#21262D] text-[#1A2332] dark:text-[#E6EDF3] outline-none focus:border-[#1D4ED8] transition-all"
                    />
                  </div>
                  {selectedBillboards.length > 0 && (
                    <div className="px-3 py-1.5 bg-[#EEF2FF] dark:bg-[#1D4ED8]/20 text-[#4F46E5] dark:text-[#60A5FA] rounded-lg text-xs font-semibold shrink-0">
                      {selectedBillboards.length} bảng đã chọn
                    </div>
                  )}
                </div>

                <div className="flex-grow overflow-y-auto pr-1 space-y-3">
                  {filteredBillboards.map(bb => {
                    const selected = selectedBillboards.includes(bb.id);
                    const isAvailable = bb.availabilities?.length === 0;
                    return (
                      <div key={bb.id} onClick={() => toggleBillboard(bb.id)}
                        className={`flex gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all bg-white dark:bg-[#161B22] hover:bg-gray-50 dark:hover:bg-[#21262D] ${
                          selected
                            ? "border-[#1D4ED8] shadow-md shadow-[#1D4ED8]/10"
                            : "border-[#E3E8EF] dark:border-[#30363D] hover:border-[#93C5FD] dark:hover:border-[#1D4ED8]/50"
                        }`}>
                        <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0 relative">
                          <img src={bb.image} alt={bb.title} className="w-full h-full object-cover" />
                          {selected && (
                            <div className="absolute inset-0 bg-[#1D4ED8]/10 flex items-center justify-center">
                              <div className="w-6 h-6 bg-[#1D4ED8] rounded-full flex items-center justify-center shadow-md">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-bold text-[#1A2332] dark:text-[#E6EDF3] truncate">{bb.title}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isAvailable ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                                {isAvailable ? "● Trống" : "● Bận một số ngày"}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B7A8D] flex items-center gap-1 mt-0.5"><MapPin className="w-2.5 h-2.5 shrink-0" />{bb.address}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-[#6B7A8D]">
                              <span>KT: {bb.size}</span>
                              <span>Độ phân giải: {bb.resolution}</span>
                              <span>Độ sáng: {bb.brightness}</span>
                              <span>HĐ: {bb.operatingHours}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-[#E3E8EF] dark:border-[#30363D]">
                            <span className="text-[10px] text-[#6B7A8D] flex items-center gap-1"><Eye className="w-3 h-3" />{bb.dailyViews.toLocaleString()} views/ngày</span>
                            <span className="text-xs font-bold text-[#1D4ED8]">{(bb.pricePerDay / 1000000).toFixed(1)}Tr/ngày</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredBillboards.length === 0 && (
                    <div className="text-center py-8 text-xs text-[#6B7A8D]">Không tìm thấy bảng hiệu nào</div>
                  )}
                </div>
              </div>

              {/* Right Column: Map (5/12) */}
              <div className="lg:col-span-5 h-full rounded-xl overflow-hidden border border-[#E3E8EF] dark:border-[#30363D] relative bg-[#0D1117]">
                <BillboardGoogleMap
                  billboards={filteredBillboards.map(bb => ({
                    ...bb,
                    width: parseInt(bb.size.split("m")[0]) || 10,
                    height: parseInt(bb.size.split("×")[1]) || 5,
                    pricePerMonth: bb.pricePerDay * 30,
                    status: "APPROVED",
                    isFeatured: false,
                    images: [{ id: 1, imageUrl: bb.image, isThumbnail: true }],
                    features: [],
                    latitude: bb.latitude,
                    longitude: bb.longitude,
                    availabilities: bb.availabilities,
                  })) as any}
                  selectedId={selectedBillboards[selectedBillboards.length - 1] || null}
                  onSelect={(id) => {
                    if (id) {
                      setSelectedBillboards(prev =>
                        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                      );
                    }
                  }}
                  fitBounds={true}
                  className="absolute inset-0"
                />
              </div>
            </div>
          )}border-[#C7D2FE] dark:border-[#1D4ED8]/30">
                  <p className="text-xs font-semibold text-[#4F46E5] mb-2 uppercase tracking-wider">Ước Tính Chi Phí</p>
                  <div className="space-y-1.5">
                    {selectedBBDetails.map(bb => (
                      <div key={bb.id} className="flex items-center justify-between text-xs text-[#1A2332] dark:text-[#E6EDF3]">
                        <span>{bb.title} × {totalDays} ngày</span>
                        <span className="font-semibold">{(bb.pricePerDay * totalDays).toLocaleString("vi-VN")}₫</span>
                      </div>
                    ))}
                    <div className="border-t border-[#C7D2FE] dark:border-[#1D4ED8]/30 pt-1.5 flex items-center justify-between text-sm font-bold text-[#1D4ED8]">
                      <span>Tổng cộng</span>
                      <span>{totalCost.toLocaleString("vi-VN")}₫</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Preview ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#1A2332] dark:text-[#E6EDF3]">Xem Trước Nội Dung Trên Billboard</h3>
                  <p className="text-xs text-[#6B7A8D] mt-0.5">Kiểm tra trước khi gửi cho chủ bảng duyệt</p>
                </div>
                {selectedBBDetails.length > 1 && (
                  <select
                    value={previewBillboard}
                    onChange={e => setPreviewBillboard(Number(e.target.value))}
                    className="px-3 py-1.5 border border-[#E3E8EF] dark:border-[#30363D] rounded-lg text-xs bg-white dark:bg-[#21262D] text-[#1A2332] dark:text-[#E6EDF3] outline-none cursor-pointer"
                  >
                    {selectedBBDetails.map((bb, i) => (
                      <option key={bb.id} value={i}>{bb.title}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Billboard simulation frame */}
              <div className="relative bg-[#0A0A0A] rounded-2xl p-4 border-4 border-[#1A1A2E] shadow-2xl">
                {/* LED grid effect */}
                <div className="absolute inset-0 rounded-xl opacity-5"
                  style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "8px 8px" }} />

                {/* Screen border glow */}
                <div className="relative rounded-lg overflow-hidden border-2 border-[#333] shadow-inner"
                  style={{ aspectRatio: "16/9" }}>

                  {creativePreview ? (
                    creativeType === "image" ? (
                      <img src={creativePreview} alt="Creative preview" className="w-full h-full object-cover" />
                    ) : (
                      <video src={creativePreview} className="w-full h-full object-cover" autoPlay muted loop />
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1D4ED8] via-[#4F46E5] to-[#7C3AED] flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                        <Image className="w-8 h-8 text-white/60" />
                      </div>
                      <div className="text-center">
                        <p className="text-white/80 font-bold text-sm">{campaignName || "TÊN CHIẾN DỊCH"}</p>
                        <p className="text-white/50 text-xs mt-1">Chưa có creative — nội dung mẫu</p>
                      </div>
                    </div>
                  )}

                  {/* Scan line overlay */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(transparent 50%, rgba(0,0,0,0.03) 50%)", backgroundSize: "100% 4px" }} />

                  {/* Active badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#22C55E] text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE PREVIEW
                  </div>

                  {/* Resolution badge */}
                  {currentPreviewBB && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-[10px] rounded-md font-mono">
                      {currentPreviewBB.resolution}
                    </div>
                  )}
                </div>

                {/* LED stand */}
                <div className="flex justify-center mt-1">
                  <div className="w-16 h-3 bg-[#1A1A1A] rounded-b-lg" />
                </div>
              </div>

              {/* Billboard info */}
              {currentPreviewBB && (
                <div className="bg-[#F9FAFB] dark:bg-[#21262D] rounded-xl p-4 border border-[#E3E8EF] dark:border-[#30363D]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <img src={currentPreviewBB.image} alt={currentPreviewBB.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1A2332] dark:text-[#E6EDF3] truncate">{currentPreviewBB.title}</p>
                      <p className="text-xs text-[#6B7A8D] flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {currentPreviewBB.address}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#1D4ED8]">{currentPreviewBB.size}</p>
                      <p className="text-xs text-[#6B7A8D]">{currentPreviewBB.resolution}</p>
                    </div>
                  </div>
                </div>
              )}

              {!creativePreview && (
                <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Bạn chưa tải creative lên. Chủ bảng sẽ xem file mẫu. Bạn có thể gửi duyệt trước và upload creative sau.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Confirm & Submit ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-200 dark:shadow-green-900/30">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-base font-bold text-[#1A2332] dark:text-[#E6EDF3]">Xác Nhận Chiến Dịch</h3>
                <p className="text-sm text-[#6B7A8D] mt-1">Kiểm tra lại thông tin trước khi gửi cho chủ bảng duyệt nội dung</p>
              </div>

              {/* Summary cards */}
              <div className="space-y-3">
                <div className="bg-[#F9FAFB] dark:bg-[#21262D] rounded-xl p-4 border border-[#E3E8EF] dark:border-[#30363D]">
                  <p className="text-xs font-bold text-[#6B7A8D] uppercase tracking-wider mb-3">Thông Tin Chiến Dịch</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#6B7A8D]">Tên chiến dịch</span>
                      <span className="font-semibold text-[#1A2332] dark:text-[#E6EDF3] text-right max-w-[200px] truncate">{campaignName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7A8D]">Thể loại</span>
                      <span className="font-semibold text-[#1A2332] dark:text-[#E6EDF3]">{category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B7A8D]">Thời gian</span>
                      <span className="font-semibold text-[#1A2332] dark:text-[#E6EDF3]">{startDate} → {endDate} ({totalDays} ngày)</span>
                    </div>
                    {budget && (
                      <div className="flex justify-between">
                        <span className="text-[#6B7A8D]">Ngân sách</span>
                        <span className="font-semibold text-[#1D4ED8]">{budget} Triệu VND</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#F9FAFB] dark:bg-[#21262D] rounded-xl p-4 border border-[#E3E8EF] dark:border-[#30363D]">
                  <p className="text-xs font-bold text-[#6B7A8D] uppercase tracking-wider mb-3">
                    Bảng Quảng Cáo Đã Chọn ({selectedBillboards.length})
                  </p>
                  <div className="space-y-2">
                    {selectedBBDetails.map(bb => (
                      <div key={bb.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                          <img src={bb.image} alt={bb.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1A2332] dark:text-[#E6EDF3] truncate">{bb.title}</p>
                          <p className="text-[11px] text-[#6B7A8D]">{bb.address}</p>
                        </div>
                        <span className="text-xs font-bold text-[#1D4ED8] shrink-0">{(bb.pricePerDay * totalDays).toLocaleString("vi-VN")}₫</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#E3E8EF] dark:border-[#30363D] mt-3 pt-3 flex justify-between">
                    <span className="text-sm font-bold text-[#1A2332] dark:text-[#E6EDF3]">Tổng Chi Phí Ước Tính</span>
                    <span className="text-sm font-bold text-[#1D4ED8]">{totalCost.toLocaleString("vi-VN")}₫</span>
                  </div>
                </div>

                {/* Creative summary */}
                <div className="bg-[#F9FAFB] dark:bg-[#21262D] rounded-xl p-4 border border-[#E3E8EF] dark:border-[#30363D]">
                  <p className="text-xs font-bold text-[#6B7A8D] uppercase tracking-wider mb-3">Creative</p>
                  {creativePreview ? (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#E3E8EF] dark:border-[#30363D] shrink-0">
                        {creativeType === "image" ? (
                          <img src={creativePreview} alt="creative" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#0F172A] flex items-center justify-center">
                            <Video className="w-5 h-5 text-[#60A5FA]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1A2332] dark:text-[#E6EDF3] truncate max-w-[200px]">{creativeName}</p>
                        <p className="text-[11px] text-[#22C55E] flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Đã tải lên
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Chưa có creative — sẽ gửi duyệt không kèm file
                    </p>
                  )}
                </div>
              </div>

              {/* Approval notice */}
              <div className="flex items-start gap-3 p-4 bg-[#EEF2FF] dark:bg-[#1D4ED8]/10 rounded-xl border border-[#C7D2FE] dark:border-[#1D4ED8]/30">
                <Star className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                <div className="text-xs text-[#4F46E5] dark:text-[#60A5FA]">
                  <strong>Quy trình duyệt nội dung:</strong> Sau khi gửi, chủ bảng sẽ xem xét creative của bạn. Nếu nội dung phù hợp, họ sẽ chấp nhận và chiến dịch sẽ được lên lịch phát sóng. Nếu bị từ chối, bạn sẽ nhận được lý do để chỉnh sửa.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="px-6 py-4 border-t border-[#E3E8EF] dark:border-[#30363D] bg-[#F9FAFB] dark:bg-[#0D1117] flex items-center justify-between">
          <button
            onClick={step === 1 ? onClose : () => setStep(s => s - 1)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#E3E8EF] dark:border-[#30363D] rounded-xl text-sm text-[#6B7A8D] hover:bg-white dark:hover:bg-[#21262D] hover:text-[#1A2332] dark:hover:text-[#E6EDF3] transition-all cursor-pointer font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? "Hủy" : "Quay Lại"}
          </button>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`rounded-full transition-all ${s === step ? "w-5 h-2 bg-[#1D4ED8]" : s < step ? "w-2 h-2 bg-[#1D4ED8]/50" : "w-2 h-2 bg-[#E3E8EF] dark:bg-[#30363D]"}`} />
            ))}
          </div>

          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canGoNext()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                canGoNext()
                  ? "bg-gradient-to-r from-[#4F46E5] to-[#1D4ED8] text-white hover:shadow-lg hover:shadow-[#1D4ED8]/25 hover:-translate-y-0.5"
                  : "bg-[#E3E8EF] dark:bg-[#21262D] text-[#6B7A8D] cursor-not-allowed"
              }`}
            >
              Tiếp Tục <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang Gửi...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Gửi Yêu Cầu Duyệt
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Success Toast
───────────────────────────────────────────────────────── */
function SuccessToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-[#161B22] border border-[#BBF7D0] dark:border-[#22C55E]/30 rounded-2xl shadow-2xl p-5 flex items-start gap-4 max-w-sm"
      style={{ animation: "modalIn 0.3s cubic-bezier(.4,0,.2,1)" }}>
      <div className="w-10 h-10 rounded-xl bg-[#22C55E] flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-[#1A2332] dark:text-[#E6EDF3]">Yêu cầu đã được gửi!</p>
        <p className="text-xs text-[#6B7A8D] mt-1 leading-relaxed">
          Chiến dịch của bạn đang chờ chủ bảng xem xét và duyệt nội dung. Bạn sẽ nhận thông báo khi có phản hồi.
        </p>
        <button onClick={onDismiss} className="mt-2 text-xs text-[#22C55E] font-semibold cursor-pointer hover:underline">
          Đóng
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────── */
export default function AdvertiserCampaigns() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showWizard, setShowWizard] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : c.status === statusFilter;
    const matchesLocation =
      locationFilter === "all"
        ? true
        : c.screens.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const handleWizardSuccess = () => {
    setShowWizard(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 6000);
  };

  return (
    <div className="flex h-screen bg-[#F0F9FF] dark:bg-[#0D1117]">
      <DashboardSidebar role="advertiser" />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#161B22] border-b border-[#E3E8EF] dark:border-[#30363D] px-8 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl text-[#1D4ED8]" style={{ fontWeight: 700 }}>Quản Lý Chiến Dịch</h1>
              <p className="text-sm text-[#6B7A8D] mt-0.5">Theo dõi, tối ưu và kiểm soát các chiến dịch quảng cáo ngoài trời của bạn.</p>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chiến dịch, thương hiệu..."
                  className="w-full pl-10 pr-4 py-2 border border-[#E3E8EF] dark:border-[#30363D] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] bg-[#F9FAFB] dark:bg-[#21262D] text-[#1A2332] dark:text-[#E6EDF3]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowWizard(true)}
                className="bg-gradient-to-r from-[#4F46E5] to-[#1D4ED8] text-white text-sm px-5 py-2.5 rounded-lg hover:shadow-lg hover:shadow-[#1D4ED8]/25 hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 font-semibold"
              >
                <Plus className="w-4 h-4" /> Tạo Chiến Dịch Mới
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* KPI section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard title="Đang Chạy" value="3" change="+8%" changeType="up" icon={<PlayCircle className="w-5 h-5" />} />
            <KpiCard title="Tổng Chiến Dịch" value="8" change="+2" changeType="up" icon={<Megaphone className="w-5 h-5" />} />
            <KpiCard title="Chi Phí Đã Chi" value="125 Tr₫" change="+5%" changeType="up" icon={<MonitorPlay className="w-5 h-5" />} />
            <KpiCard title="Lượt Hiển Thị" value="2.4M" change="+15%" changeType="up" icon={<Eye className="w-5 h-5" />} />
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 space-y-4">
              {/* Filters */}
              <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E3E8EF] dark:border-[#30363D] p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7A8D]">Trạng thái</span>
                    <select
                      className="px-3 py-1.5 border border-[#E3E8EF] dark:border-[#30363D] rounded-lg text-xs text-[#1A2332] dark:text-[#E6EDF3] bg-white dark:bg-[#21262D] cursor-pointer"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      <option value="running">Đang chạy</option>
                      <option value="upcoming">Sắp chạy</option>
                      <option value="pending_approval">Chờ duyệt</option>
                      <option value="finished">Đã kết thúc</option>
                      <option value="paused">Tạm dừng</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7A8D]">Vị trí</span>
                    <select
                      className="px-3 py-1.5 border border-[#E3E8EF] dark:border-[#30363D] rounded-lg text-xs text-[#1A2332] dark:text-[#E6EDF3] bg-white dark:bg-[#21262D] cursor-pointer"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                    >
                      <option value="all">Tất cả</option>
                      <option value="cầu rồng">Cầu Rồng</option>
                      <option value="bạch đằng">Bạch Đằng</option>
                      <option value="nguyễn văn linh">Nguyễn Văn Linh</option>
                      <option value="mỹ khê">Mỹ Khê</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#6B7A8D]" />
                  <span className="text-xs text-[#6B7A8D]">{filteredCampaigns.length} chiến dịch</span>
                </div>
              </div>

              {/* Campaign list */}
              <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E3E8EF] dark:border-[#30363D] shadow-sm">
                <div className="p-4 border-b border-[#E3E8EF] dark:border-[#30363D] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm text-[#1A2332] dark:text-[#E6EDF3]" style={{ fontWeight: 600 }}>Danh Sách Chiến Dịch</h2>
                    <p className="text-xs text-[#6B7A8D] mt-0.5">Quản lý tất cả chiến dịch quảng cáo và trạng thái hoạt động.</p>
                  </div>
                </div>
                <div className="p-0">
                  <DataTable columns={columns} data={filteredCampaigns} />
                </div>
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              {/* CTA Card */}
              <div className="bg-gradient-to-br from-[#4F46E5] to-[#1D4ED8] rounded-xl p-5 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold mb-1">Chiến Dịch Mới</h3>
                  <p className="text-xs text-white/70 mb-4 leading-relaxed">Tạo nội dung, chọn bảng LED và gửi duyệt — tất cả trong 4 bước đơn giản.</p>
                  <button
                    onClick={() => setShowWizard(true)}
                    className="w-full bg-white text-[#1D4ED8] text-xs font-bold py-2.5 rounded-lg hover:bg-white/90 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Bắt Đầu Tạo
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E3E8EF] dark:border-[#30363D] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm text-[#1A2332] dark:text-[#E6EDF3]" style={{ fontWeight: 600 }}>Xem Trước Creative</h3>
                    <p className="text-xs text-[#6B7A8D] mt-0.5">Mô phỏng tỷ lệ màn hình LED ngoài trời.</p>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg text-xs bg-[#EEF2FF] dark:bg-[#1D4ED8]/20 text-[#4F46E5] dark:text-[#60A5FA] cursor-pointer flex items-center gap-1">
                    <PlayCircle className="w-3.5 h-3.5" /> Xem demo
                  </button>
                </div>
                <div className="relative bg-gradient-to-r from-[#1D4ED8] via-[#4F46E5] to-[#7C3AED] rounded-xl h-40 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff_0,_transparent_60%)]" />
                  <div className="relative w-4/5 h-[60%] border-4 border-white/80 rounded-lg shadow-lg bg-black/80 flex items-center justify-center">
                    <span className="text-xs text-white/80 tracking-wide">VIDEO / HÌNH 16:9</span>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white dark:bg-[#161B22] rounded-xl border border-[#E3E8EF] dark:border-[#30363D] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm text-[#1A2332] dark:text-[#E6EDF3]" style={{ fontWeight: 600 }}>Vị Trí Màn Hình</h3>
                  <button className="px-2.5 py-1 rounded-lg text-xs border border-[#E3E8EF] dark:border-[#30363D] text-[#1A2332] dark:text-[#E6EDF3] cursor-pointer flex items-center gap-1 hover:bg-[#F8FAFC] dark:hover:bg-[#21262D]">
                    <MapPin className="w-3.5 h-3.5 text-[#EF4444]" /> Xem bản đồ
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { name: "Cầu Rồng", info: "2 đang chạy", variant: "active" as const },
                    { name: "Bạch Đằng", info: "1 sắp chạy", variant: "pending" as const },
                    { name: "Nguyễn Văn Linh", info: "1 đang chạy", variant: "available" as const },
                    { name: "Mỹ Khê", info: "1 kết thúc", variant: "expired" as const },
                  ].map(loc => (
                    <div key={loc.name} className="p-2 rounded-lg bg-[#F9FAFB] dark:bg-[#21262D] border border-[#E3E8EF] dark:border-[#30363D]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#1A2332] dark:text-[#E6EDF3]" style={{ fontWeight: 500 }}>{loc.name}</span>
                        <StatusBadge variant={loc.variant} />
                      </div>
                      <p className="text-[11px] text-[#6B7A8D]">{loc.info}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Wizard Modal */}
      {showWizard && (
        <CampaignWizard
          onClose={() => setShowWizard(false)}
          onSuccess={handleWizardSuccess}
        />
      )}

      {/* Success Toast */}
      {showSuccess && <SuccessToast onDismiss={() => setShowSuccess(false)} />}
    </div>
  );
}
