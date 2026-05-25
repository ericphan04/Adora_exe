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
        if (chipFilter === "Sân bay") {
          const text = `${b.title} ${b.address} ${b.description}`.toLowerCase();
          if (!text.includes("sân bay") && !text.includes("airport")) return false;
        }
        if (chipFilter === "Trung tâm TM") {
          const text = `${b.title} ${b.address} ${b.description} ${b.screenType}`.toLowerCase();
          if (!text.includes("tttm") && !text.includes("mall") && !text.includes("vincom") && !text.includes("lotte")) return false;
        }
        if (chipFilter === "Trung tâm thành phố") {
          // Typically center districts like Hải Châu in Đà Nẵng or Quận 1 in HCM
          if (b.district !== "Hải Châu" && b.district !== "Quận 1") return false;
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
      <main className="flex-1 flex flex-col md:flex-row min-h-0 pt-16 overflow-hidden">
        
        {/* Left Column: Filter & List */}
        <section className="w-full md:w-[400px] lg:w-[450px] bg-card border-r border-border/40 flex flex-col h-full z-10 overflow-hidden flex-shrink-0">
          
          {/* Header & Filters Box */}
          <div className="p-5 space-y-4 border-b border-border/30">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-extrabold text-primary flex items-center gap-1.5">
                <MapPin className="w-5.5 h-5.5 text-accent animate-pulse" />
                Bản đồ LED
              </h1>
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
                {loading ? "Đang tải..." : `${filtered.length} Bảng QC`}
              </span>
            </div>

            {/* Smart Keyword Search */}
            <div className="relative flex items-center bg-background border border-border/50 rounded-xl px-3 py-2 shadow-sm">
              <Search className="w-4 h-4 text-muted-foreground shrink-0 mr-2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, địa chỉ, vị trí..."
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/60"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selector Filters Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Thành Phố</label>
                <select 
                  value={city} 
                  onChange={(e) => {
                    setCity(e.target.value);
                    setDistrict("Tất cả");
                  }}
                  className="w-full bg-background border border-border/50 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-accent outline-none appearance-none cursor-pointer"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c} className="bg-card">{c}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quận / Huyện</label>
                <select 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-background border border-border/50 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-accent outline-none appearance-none cursor-pointer"
                >
                  <option value="Tất cả" className="bg-card">Tất cả quận</option>
                  {DISTRICTS.filter(d => d !== "Tất cả").map((d) => (
                    <option key={d} value={d} className="bg-card">
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Khoảng giá thuê tháng</label>
                <select 
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-background border border-border/50 rounded-xl px-3 py-2.5 text-xs font-semibold focus:ring-1 focus:ring-accent outline-none appearance-none cursor-pointer"
                >
                  <option value="Tất cả giá" className="bg-card">Tất cả giá</option>
                  <option value="Dưới 50tr" className="bg-card">Dưới 50 triệu / tháng</option>
                  <option value="50tr - 150tr" className="bg-card">50 triệu – 150 triệu</option>
                  <option value="Trên 150tr" className="bg-card">Trên 150 triệu / tháng</option>
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
                      ? "bg-accent/15 border-accent text-accent"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
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
                    className={`group bg-surface/40 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? "border-accent shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-primary/5" 
                        : "border-border/60 hover:border-accent/40"
                    }`}
                  >
                    <div className="aspect-video relative overflow-hidden bg-background">
                      <img 
                        src={thumbnail} 
                        alt={b.title} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-accent/20 flex items-center gap-1.5 shadow-sm">
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-accent animate-ping" : "bg-amber-500"}`}></span>
                        <span className={`w-2 h-2 rounded-full absolute ${isAvailable ? "bg-accent" : "bg-amber-500"}`}></span>
                        <span className={`text-[9px] font-extrabold uppercase tracking-wider ${isAvailable ? "text-accent" : "text-amber-500"}`}>
                          {isAvailable ? "Đang trống" : "Đã đặt chỗ"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm md:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {b.title}
                        </h3>
                        <span className="font-bold text-xs text-primary shrink-0 text-right">
                          {b.pricePerMonth.toLocaleString("vi-VN")}₫/th
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{b.address}, {b.district}</p>
                      
                      <div className="flex items-center gap-4 pt-3 border-t border-border/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Maximize className="w-3.5 h-3.5 text-accent" />
                          <span>{b.width}m x {b.height}m</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-accent" />
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
            <div className="absolute bottom-8 left-8 w-80 bg-card/95 backdrop-blur-xl rounded-2xl border border-accent/40 p-5 shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-sm font-bold text-primary truncate max-w-[210px]" title={selected.title}>
                    {selected.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate max-w-[210px] mt-0.5">
                    {selected.address}, {selected.district}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedId(null)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex justify-between items-center pt-3.5 border-t border-border">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Giá thuê tháng</span>
                  <span className="font-extrabold text-sm text-accent">
                    {selected.pricePerMonth.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <button 
                  onClick={() => navigate(`/billboard/${selected.id}`)}
                  className="px-4.5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs tracking-wider transition-all cursor-pointer active:scale-95 shadow-md shadow-primary/20"
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
