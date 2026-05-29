import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Search, SlidersHorizontal, List, X, Maximize, Eye, Navigation } from "lucide-react";
import billboardApi from "../../api/billboardApi";
import { BillboardDto } from "../../types/billboard";
import { BillboardGoogleMap } from "../components/map/BillboardGoogleMap";
import { TopNav } from "../components/TopNav";
import {
  getBillboardRentalStatus,
  MAP_BILLBOARD_MOCKS,
} from "../utils/billboardMap";

const DISTRICTS = [
  "Tất cả",
  "Hải Châu",
  "Sơn Trà",
  "Thanh Khê",
  "Ngũ Hành Sơn",
  "Liên Chiểu",
  "Cẩm Lệ",
];

const CITIES = ["Đà Nẵng", "Hồ Chí Minh", "Hà Nội"];

// Helper to compute geographic distance in kilometers (Haversine formula)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function BillboardMapPage() {
  const navigate = useNavigate();
  const [billboards, setBillboards] = useState<BillboardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Filters state
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Đà Nẵng");
  const [district, setDistrict] = useState("Tất cả");
  const [priceRange, setPriceRange] = useState("Tất cả giá");
  const [chipFilter, setChipFilter] = useState("Tất cả");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const response = await billboardApi.getAll({ city });
        const data = response.success && response.data?.length ? response.data : [];
        if (!cancelled) {
          setBillboards(data.length > 0 ? data : MAP_BILLBOARD_MOCKS);
        }
      } catch {
        if (!cancelled) setBillboards(MAP_BILLBOARD_MOCKS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [city]);

  // Combined Filters Logic
  const filtered = useMemo(() => {
    return billboards.filter((b) => {
      // 1. Search Query
      const q = search.trim().toLowerCase();
      if (q) {
        const hay = `${b.title} ${b.address} ${b.district} ${b.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // 2. District Filter
      if (district !== "Tất cả" && b.district !== district) return false;

      // 3. Price Range Filter
      if (priceRange !== "Tất cả giá") {
        const price = b.pricePerMonth;
        if (priceRange === "Dưới 50tr" && price >= 50000000) return false;
        if (priceRange === "50tr - 150tr" && (price < 50000000 || price > 150000000)) return false;
        if (priceRange === "Trên 150tr" && price <= 150000000) return false;
      }

      // 4. Chip category filter
      if (chipFilter !== "Tất cả") {
        const lat = b.latitude;
        const lng = b.longitude;
        const currentCityLower = city.toLowerCase();

        if (chipFilter === "Sân bay") {
          // 1. Text keyword search
          const text = `${b.title} ${b.address} ${b.description}`.toLowerCase();
          const hasKeyword =
            text.includes("sân bay") ||
            text.includes("airport") ||
            text.includes("cảng hàng không") ||
            text.includes("nhà ga");

          if (hasKeyword) {
            // Found via text
          } else if (lat != null && lng != null) {
            // 2. Geographic distance checks
            let isNearAirport = false;
            if (currentCityLower.includes("đà nẵng")) {
              // Da Nang International Airport: 16.0544, 108.1995
              isNearAirport = getDistanceKm(lat, lng, 16.0544, 108.1995) <= 3.0;
            } else if (currentCityLower.includes("hồ chí minh") || currentCityLower.includes("hcm")) {
              // Tan Son Nhat Airport: 10.8185, 106.6601
              isNearAirport = getDistanceKm(lat, lng, 10.8185, 106.6601) <= 3.5;
            } else if (currentCityLower.includes("hà nội")) {
              // Noi Bai Airport: 21.2187, 105.8057
              isNearAirport = getDistanceKm(lat, lng, 21.2187, 105.8057) <= 5.0;
            }
            if (!isNearAirport) return false;
          } else {
            return false;
          }
        }

        if (chipFilter === "Trung tâm TM") {
          const text = `${b.title} ${b.address} ${b.description} ${b.screenType}`.toLowerCase();
          const hasTttm =
            text.includes("tttm") ||
            text.includes("mall") ||
            text.includes("vincom") ||
            text.includes("lotte") ||
            text.includes("coop") ||
            text.includes("aeon") ||
            text.includes("megamall") ||
            text.includes("plaza");
          if (!hasTttm) return false;
        }

        if (chipFilter === "Trung tâm thành phố") {
          const dist = (b.district || "").toLowerCase();
          let isCenter = false;

          // 1. Check central districts depending on current city
          if (currentCityLower.includes("đà nẵng")) {
            isCenter = dist.includes("hải châu") || dist.includes("thanh khê");
          } else if (currentCityLower.includes("hồ chí minh") || currentCityLower.includes("hcm")) {
            isCenter =
              dist.includes("quận 1") ||
              dist.includes("quận 3") ||
              dist.includes("quận 5") ||
              dist.includes("quận 10") ||
              dist.includes("bình thạnh") ||
              dist.includes("phú nhuận");
          } else if (currentCityLower.includes("hà nội")) {
            isCenter =
              dist.includes("hoàn kiếm") ||
              dist.includes("ba đình") ||
              dist.includes("đống đa") ||
              dist.includes("hai bà trưng") ||
              dist.includes("tây hồ");
          }

          // 2. Geographic distance from city center coordinates
          if (!isCenter && lat != null && lng != null) {
            if (currentCityLower.includes("đà nẵng")) {
              // Dragon Bridge area: 16.061, 108.224
              isCenter = getDistanceKm(lat, lng, 16.061, 108.224) <= 4.0;
            } else if (currentCityLower.includes("hồ chí minh") || currentCityLower.includes("hcm")) {
              // Notre Dame Cathedral area: 10.780, 106.700
              isCenter = getDistanceKm(lat, lng, 10.780, 106.700) <= 5.0;
            } else if (currentCityLower.includes("hà nội")) {
              // Hoan Kiem Lake: 21.028, 105.852
              isCenter = getDistanceKm(lat, lng, 21.028, 105.852) <= 5.0;
            }
          }

          if (!isCenter) return false;
        }
      }

      return true;
    });
  }, [billboards, search, district, priceRange, chipFilter]);

  const selected = useMemo(() => {
    return filtered.find((b) => b.id === selectedId) ?? null;
  }, [filtered, selectedId]);

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden font-sans">
      <TopNav />

      {/* Main split-screen panel */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 pt-0 overflow-hidden">
        
        {/* Left Column: Filter & List */}
        <section className="w-full md:w-[400px] lg:w-[450px] bg-white border-r border-slate-200 flex flex-col h-full z-10 overflow-hidden flex-shrink-0">
          
          {/* Header & Filters Box */}
          <div className="p-5 space-y-4 border-b border-slate-100 bg-slate-50/20">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-[#1D4ED8] flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate("/advertiser/dashboard")}
                  className="mr-1 p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer flex items-center justify-center border-none bg-transparent"
                  title="Quay lại Dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-[#6B7A8D]" />
                </button>
                <MapPin className="w-5.5 h-5.5 text-[#1D4ED8] animate-pulse" />
                Bản đồ LED
              </h1>
              <span className="text-xs bg-[#1D4ED8]/10 text-[#1D4ED8] px-2.5 py-1 rounded-full font-bold">
                {loading ? "Đang tải..." : `${filtered.length} Bảng QC`}
              </span>
            </div>

            {/* Smart Keyword Search */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 focus-within:border-[#1D4ED8] focus-within:bg-white rounded-xl px-3 py-2.5 transition-all shadow-sm">
              <Search className="w-4 h-4 text-[#6B7A8D] shrink-0 mr-2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, địa chỉ, vị trí..."
                className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400 font-medium"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")} 
                  className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selector Filters Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thành Phố</label>
                <select 
                  value={city} 
                  onChange={(e) => {
                    setCity(e.target.value);
                    setDistrict("Tất cả");
                  }}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] rounded-xl px-3 py-2.5 text-xs font-semibold outline-none cursor-pointer text-slate-700 transition-colors"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c} className="bg-white text-slate-800">{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quận / Huyện</label>
                <select 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] rounded-xl px-3 py-2.5 text-xs font-semibold outline-none cursor-pointer text-slate-700 transition-colors"
                >
                  <option value="Tất cả" className="bg-white text-slate-800">Tất cả quận</option>
                  {DISTRICTS.filter(d => d !== "Tất cả").map((d) => (
                    <option key={d} value={d} className="bg-white text-slate-800">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khoảng giá thuê tháng</label>
                <select 
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] rounded-xl px-3 py-2.5 text-xs font-semibold outline-none cursor-pointer text-slate-700 transition-colors"
                >
                  <option value="Tất cả giá" className="bg-white text-slate-800">Tất cả giá</option>
                  <option value="Dưới 50tr" className="bg-white text-slate-800">Dưới 50 triệu / tháng</option>
                  <option value="50tr - 150tr" className="bg-white text-slate-800">50 triệu – 150 triệu</option>
                  <option value="Trên 150tr" className="bg-white text-slate-800">Trên 150 triệu / tháng</option>
                </select>
              </div>
            </div>

            {/* Quick Chips Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {["Tất cả", "Trung tâm thành phố", "Sân bay", "Trung tâm TM"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setChipFilter(chip)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                    chipFilter === chip
                      ? "bg-[#1D4ED8]/10 border-[#1D4ED8] text-[#1D4ED8]"
                      : "border-slate-200 text-slate-500 hover:border-slate-400"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* List Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-center py-20 text-sm text-muted-foreground font-semibold animate-pulse">
                Đang tải danh sách bảng hiệu...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-sm text-muted-foreground font-medium">
                Không tìm thấy bảng hiệu nào khớp bộ lọc.
              </div>
            ) : (
              filtered.map((b) => {
                const isSelected = b.id === selectedId;
                const thumbnail = b.images?.find(img => img.isThumbnail)?.imageUrl || b.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1585504303098-9785dc784742?w=500";
                const isAvailable = getBillboardRentalStatus(b) === "available";

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedId(b.id)}
                    className={`group bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? "border-[#1D4ED8] shadow-[0_4px_20px_rgba(29,78,216,0.08)] bg-slate-50/40" 
                        : "border-slate-100 hover:border-slate-300 hover:shadow-md hover:bg-slate-50/20"
                    }`}
                  >
                    <div className="aspect-video relative overflow-hidden bg-slate-50">
                      <img 
                        src={thumbnail} 
                        alt={b.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-200/50 flex items-center gap-1.5 shadow-sm">
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`}></span>
                        <span className={`w-2 h-2 rounded-full absolute ${isAvailable ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isAvailable ? "text-emerald-600" : "text-amber-500"}`}>
                          {isAvailable ? "Đang trống" : "Đã đặt chỗ"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm md:text-base text-slate-800 group-hover:text-[#1D4ED8] transition-colors line-clamp-1">
                          {b.title}
                        </h3>
                        <span className="font-extrabold text-sm text-[#1D4ED8] shrink-0 text-right">
                          {b.pricePerMonth.toLocaleString("vi-VN")}₫/th
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{b.address}, {b.district}</p>
                      
                      <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Maximize className="w-3.5 h-3.5 text-[#1D4ED8]" />
                          <span>{b.width}m x {b.height}m</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#1D4ED8]" />
                          <span>{b.dailyViews ? `${(b.dailyViews / 1000).toFixed(0)}K` : "50K"} views/ngày</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Google Interactive Map */}
        <section className="flex-1 relative bg-background overflow-hidden min-h-[300px] md:min-h-0">
          <BillboardGoogleMap
            billboards={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            fitBounds
            className="absolute inset-0"
          />

          {/* Floating Details Preview Card over Map (Conditional Visibility) */}
          {selected && (
            <div className="absolute bottom-8 left-8 w-80 bg-white/95 backdrop-blur-xl rounded-2xl border border-[#1D4ED8]/20 p-5 shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 truncate max-w-[210px]" title={selected.title}>
                    {selected.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate max-w-[210px] mt-0.5">
                    {selected.address}, {selected.district}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedId(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors p-1 border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-center pt-3.5 border-t border-slate-100">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Giá thuê tháng</span>
                  <span className="font-extrabold text-sm text-[#1D4ED8]">
                    {selected.pricePerMonth.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <button 
                  onClick={() => navigate(`/billboard/${selected.id}`)}
                  className="px-4.5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs tracking-wider transition-all cursor-pointer active:scale-95 shadow-md shadow-primary/20"
                >
                  CHI TIẾT
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
