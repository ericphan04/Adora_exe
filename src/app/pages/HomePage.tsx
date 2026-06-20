import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, Shield, Zap, Clock, ArrowRight, CheckCircle, Users, Building2, DollarSign, Calendar, Tv } from "lucide-react";
import { BillboardCard } from "../components/BillboardCard";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

import billboardApi from "../../api/billboardApi";
import { BillboardDto } from "../../types/billboard";
import { getTodayParts, toIsoDate } from "../utils/calendar";

const mapBillboardDtoToCardProps = (b: BillboardDto) => {
  const thumbnail = b.images?.find(img => img.isThumbnail)?.imageUrl || b.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1585504303098-9785dc784742?w=500";
  
  let trafficIndex = "Medium";
  if (b.dailyViews > 100000) trafficIndex = "High";
  else if (b.dailyViews < 20000) trafficIndex = "Low";

  let availability: "available" | "booked" | "unavailable" = "available";
  if (b.availabilities && b.availabilities.length > 0) {
    const isBooked = b.availabilities.some(av => av.status === "BOOKED");
    const isBlocked = b.availabilities.some(av => av.status === "BLOCKED");
    if (isBooked) availability = "booked";
    else if (isBlocked) availability = "unavailable";
  }

  return {
    image: thumbnail,
    name: b.title,
    location: `${b.district}, ${b.city}`,
    size: `${b.width}m x ${b.height}m`,
    trafficIndex,
    price: `${b.pricePerMonth.toLocaleString("vi-VN")}₫`,
    availability,
  };
};

const fallbackBillboards: BillboardDto[] = [
  {
    id: 1,
    title: "Cầu Rồng LED",
    description: "Bảng quảng cáo vị trí đắc địa tại Cầu Rồng Đà Nẵng",
    address: "Đường 2/9",
    city: "Đà Nẵng",
    district: "Hải Châu",
    latitude: 16.0614,
    longitude: 108.2275,
    width: 14,
    height: 6,
    resolution: "P10",
    brightness: 6500,
    refreshRate: 3840,
    screenType: "Outdoor LED",
    operatingHours: "16h/ngày",
    pricePerDay: 3000000,
    pricePerMonth: 85000000,
    locationSurcharge: 500000,
    status: "APPROVED",
    dailyViews: 120000,
    isFeatured: true,
    images: [{ id: 1, imageUrl: "https://images.unsplash.com/photo-1585504303098-9785dc784742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBkaWdpdGFsJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc3MjU0NjU5M3ww&ixlib=rb-4.1.0&q=80&w=1080", isThumbnail: true }],
    features: [{ id: 1, name: "Độ sáng cao" }],
    availabilities: []
  },
  {
    id: 2,
    title: "Bạch Đằng Digital",
    description: "Bảng quảng cáo ven sông Bạch Đằng",
    address: "Đường Bạch Đằng",
    city: "Đà Nẵng",
    district: "Sơn Trà",
    latitude: 16.0708,
    longitude: 108.2483,
    width: 10,
    height: 4,
    resolution: "P8",
    brightness: 6000,
    refreshRate: 3840,
    screenType: "Outdoor LED",
    operatingHours: "16h/ngày",
    pricePerDay: 2000000,
    pricePerMonth: 55000000,
    locationSurcharge: 200000,
    status: "APPROVED",
    dailyViews: 80000,
    isFeatured: true,
    images: [{ id: 2, imageUrl: "https://images.unsplash.com/photo-1745725427643-8994370391e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmlsbGJvYXJkJTIwaGlnaHWheSUyMGFkdmVydGlzaW5nfGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080", isThumbnail: true }],
    features: [{ id: 1, name: "Góc nhìn rộng" }],
    availabilities: []
  },
  {
    id: 3,
    title: "Nguyễn Văn Linh Screen",
    description: "Ngã ba Nguyễn Văn Linh và Nguyễn Tri Phương",
    address: "Nguyễn Văn Linh",
    city: "Đà Nẵng",
    district: "Thanh Khê",
    latitude: 16.0545,
    longitude: 108.202,
    width: 12,
    height: 5,
    resolution: "P10",
    brightness: 6500,
    refreshRate: 3840,
    screenType: "Outdoor LED",
    operatingHours: "16h/ngày",
    pricePerDay: 2500000,
    pricePerMonth: 68000000,
    locationSurcharge: 0,
    status: "APPROVED",
    dailyViews: 110000,
    isFeatured: true,
    images: [{ id: 3, imageUrl: "https://images.unsplash.com/photo-1765908310161-1005cf85586d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1lcyUyMHNxdWFyZSUyMGRpZ2l0YWwlMjBkaXNwbGF5fGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080", isThumbnail: true }],
    features: [{ id: 1, name: "Camera đo traffic" }],
    availabilities: (() => {
      const { year, month } = getTodayParts();
      return [{ id: 1, availableDate: toIsoDate(year, month, 10), status: "BOOKED" as const }];
    })()
  },
  {
    id: 11,
    title: "Vòng xoay Phạm Văn Đồng LED",
    description: "Màn hình LED lớn tại vòng xoay Phạm Văn Đồng - Ngô Quyền",
    address: "Vòng xoay Phạm Văn Đồng - Ngô Quyền",
    city: "Đà Nẵng",
    district: "Sơn Trà",
    latitude: 16.0740,
    longitude: 108.2445,
    width: 12,
    height: 6,
    resolution: "P10",
    brightness: 6000,
    refreshRate: 3840,
    screenType: "Outdoor LED",
    operatingHours: "16h/ngày",
    pricePerDay: 3200000,
    pricePerMonth: 95000000,
    locationSurcharge: 500000,
    status: "APPROVED",
    dailyViews: 110000,
    isFeatured: true,
    images: [{ id: 11, imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", isThumbnail: true }],
    features: [{ id: 1, name: "Độ sáng cao" }],
    availabilities: []
  },
  {
    id: 15,
    title: "Võ Nguyên Giáp Beachfront LED",
    description: "Mặt tiền biển Võ Nguyên Giáp, tiếp cận khách du lịch",
    address: "Đường Võ Nguyên Giáp",
    city: "Đà Nẵng",
    district: "Ngũ Hành Sơn",
    latitude: 16.0544,
    longitude: 108.2477,
    width: 12,
    height: 6,
    resolution: "P10",
    brightness: 6000,
    refreshRate: 3840,
    screenType: "Outdoor LED",
    operatingHours: "16h/ngày",
    pricePerDay: 3100000,
    pricePerMonth: 90000000,
    locationSurcharge: 500000,
    status: "APPROVED",
    dailyViews: 95000,
    isFeatured: true,
    images: [{ id: 15, imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", isThumbnail: true }],
    features: [{ id: 1, name: "View biển cực đẹp" }],
    availabilities: []
  },
  {
    id: 19,
    title: "Nguyễn Hữu Thọ Avenue LED",
    description: "Đại lộ Nguyễn Hữu Thọ tiếp cận luồng giao thông phía Nam",
    address: "Đường Nguyễn Hữu Thọ",
    city: "Đà Nẵng",
    district: "Cẩm Lệ",
    latitude: 16.0270,
    longitude: 108.2095,
    width: 10,
    height: 5,
    resolution: "P8",
    brightness: 5500,
    refreshRate: 3840,
    screenType: "Building LED",
    operatingHours: "18h/ngày",
    pricePerDay: 2000000,
    pricePerMonth: 60000000,
    locationSurcharge: 200000,
    status: "APPROVED",
    dailyViews: 70000,
    isFeatured: true,
    images: [{ id: 19, imageUrl: "https://images.unsplash.com/photo-1472214222555-d404758b1c42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", isThumbnail: true }],
    features: [{ id: 1, name: "Góc nhìn rộng" }],
    availabilities: []
  }
];

function useCountUp(target: number, duration: number = 2000, trigger: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration, trigger]);

  return count;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [billboards, setBillboards] = useState<BillboardDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Landing page configurations
  const [config, setConfig] = useState({
    heroTitle: "Thống trị bầu trời với\nQuảng cáo LED Kỹ thuật số",
    heroSubtitle: "Nền tảng DOOH hàng đầu giúp doanh nghiệp tiếp cận hàng triệu khách hàng mục tiêu thông qua mạng lưới màn hình LED cao cấp trên toàn quốc.",
    statReach: "12.500.000+",
    statPanels: "450+",
    statCampaigns: "128+",
    promoText: "Được tin tưởng bởi hơn 5.000 nhà quảng cáo trên cả nước",
    visualProofTitle: "Vị trí đắc địa, Tầm nhìn vô hạn",
    visualProofDesc: "Chúng tôi không chỉ cung cấp không gian quảng cáo; chúng tôi kiến tạo những điểm chạm thị giác đẳng cấp giúp thương hiệu của bạn tỏa sáng giữa không gian đô thị nhộn nhịp.",
    visualProofImage: "https://images.unsplash.com/photo-1585504303098-9785dc784742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBkaWdpdGFsJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc3MjU0NjU5M3ww&ixlib=rb-4.1.0&q=80&w=1080"
  });

  // Fetch configuration on load
  useEffect(() => {
    billboardApi.getLandingPageConfig()
      .then(res => {
        if (res.success && res.data) {
          setConfig(res.data);
        }
      })
      .catch(err => {
        console.warn("Failed to fetch landing page config, using defaults:", err);
      });
  }, []);

  // Smart search bar states
  const [searchCity, setSearchCity] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchType, setSearchType] = useState("Tất cả màn hình");

  // Parallax background blobs state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / 60,
        y: (e.clientY - window.innerHeight / 2) / 60,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Counters animators
  const targetReach = parseInt(config.statReach.replace(/[^0-9]/g, ""), 10) || 12500000;
  const targetPanels = parseInt(config.statPanels.replace(/[^0-9]/g, ""), 10) || 450;
  const targetCampaigns = parseInt(config.statCampaigns.replace(/[^0-9]/g, ""), 10) || 128;

  const trafficCount = useCountUp(targetReach, 1800);
  const panelsCount = useCountUp(targetPanels, 1800);
  const campaignsCount = useCountUp(targetCampaigns, 1800);

  const suffixReach = config.statReach.includes("+") ? "+" : "";
  const suffixPanels = config.statPanels.includes("+") ? "+" : "";
  const suffixCampaigns = config.statCampaigns.includes("+") ? "+" : "";

  useEffect(() => {
    let active = true;
    const fetchFeatured = async () => {
      try {
        const response = await billboardApi.getFeatured();
        if (active) {
          if (response.success && response.data && response.data.length > 0) {
            setBillboards(response.data);
          } else {
            // Fallback to load any approved billboards
            const allResponse = await billboardApi.getAll();
            if (allResponse.success && allResponse.data && allResponse.data.length > 0) {
              const approvedOnly = allResponse.data.filter(b => b.status === "APPROVED");
              if (approvedOnly.length > 0) {
                setBillboards(approvedOnly.slice(0, 6));
              } else {
                throw new Error("No approved billboards");
              }
            } else {
              throw new Error("No billboards at all");
            }
          }
        }
      } catch (err) {
        console.warn("Backend API returned no billboards or error, using fallback mock data:", err);
        if (active) {
          setBillboards(fallbackBillboards.map(b => ({
            ...b,
            formattedAddress: (b as any).formattedAddress || `${b.address}, ${b.city}`,
            addressDetail: (b as any).addressDetail || "",
            ward: (b as any).ward || ""
          })));
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchFeatured();
    return () => {
      active = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.append("city", searchCity);
    if (searchDate) params.append("date", searchDate);
    if (searchType !== "Tất cả màn hình") params.append("type", searchType);
    navigate(`/billboards?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <TopNav />

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[700px] flex flex-col items-center justify-center px-4 md:px-10 scanline-effect py-20 overflow-hidden">
          {/* Atmospheric background elements (Mouse Parallax) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div 
              className="absolute top-1/4 left-1/4 w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-primary/10 rounded-full blur-[100px] md:blur-[120px] transition-transform duration-300 ease-out"
              style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
            />
            <div 
              className="absolute bottom-1/4 right-1/4 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent/5 rounded-full blur-[120px] md:blur-[150px] transition-transform duration-300 ease-out"
              style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
            />
          </div>

          <div className="z-10 text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4.5 py-1.5 text-xs text-primary font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>{config.promoText}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold led-gradient-text animate-pulse leading-tight whitespace-pre-line">
              {config.heroTitle}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto pt-2 leading-relaxed">
              {config.heroSubtitle}
            </p>
            
            {/* Smart Search Bar */}
            <form 
              onSubmit={handleSearchSubmit} 
              className="mt-12 glass-card rounded-2xl p-2 md:p-3 flex flex-col lg:flex-row items-center gap-3 max-w-5xl mx-auto shadow-2xl"
            >
              <div className="flex items-center gap-3 px-4 py-2.5 flex-1 w-full lg:border-r border-border/30">
                <MapPin className="text-accent w-5 h-5 flex-shrink-0" />
                <div className="flex flex-col items-start w-full">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Địa điểm</span>
                  <input 
                    type="text" 
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Đà Nẵng, TP. Hồ Chí Minh..." 
                    className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-foreground font-semibold text-base w-full placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2.5 flex-1 w-full lg:border-r border-border/30">
                <Calendar className="text-accent w-5 h-5 flex-shrink-0" />
                <div className="flex flex-col items-start w-full">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Thời gian</span>
                  <input 
                    type="text" 
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    placeholder="Tháng 12, 2026" 
                    className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-foreground font-semibold text-base w-full placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2.5 flex-1 w-full">
                <Tv className="text-accent w-5 h-5 flex-shrink-0" />
                <div className="flex flex-col items-start w-full">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Loại màn hình</span>
                  <select 
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-foreground font-semibold text-base w-full appearance-none cursor-pointer"
                  >
                    <option value="Tất cả màn hình" className="bg-card">Tất cả màn hình</option>
                    <option value="Outdoor LED" className="bg-card">LED Ngoài trời</option>
                    <option value="Indoor LED" className="bg-card">LED Trong nhà</option>
                    <option value="TTTM" className="bg-card">Màn hình TTTM</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full lg:w-auto bg-primary text-white hover:bg-primary/95 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(29,78,216,0.3)] cursor-pointer"
              >
                <Search className="w-5 h-5" />
                Tìm kiếm
              </button>
            </form>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 md:px-10 max-w-7xl mx-auto border-t border-border/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stat Card 1 */}
            <div className="glass-card p-8 flex flex-col items-center text-center space-y-2 rounded-2xl glow-border transition-all group shadow-lg">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Users className="text-accent text-3xl w-7 h-7" />
              </div>
              <div className="text-4xl font-extrabold text-accent">
                {trafficCount.toLocaleString()}{suffixReach}
              </div>
              <div className="text-lg text-foreground font-bold uppercase tracking-wider">Lưu lượng tiếp cận</div>
              <p className="text-sm text-muted-foreground pt-2">Lượt hiển thị trung bình hàng tháng trên toàn hệ thống.</p>
            </div>

            {/* Stat Card 2 */}
            <div className="glass-card p-8 flex flex-col items-center text-center space-y-2 rounded-2xl glow-border transition-all group shadow-lg">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Building2 className="text-accent text-3xl w-7 h-7" />
              </div>
              <div className="text-4xl font-extrabold text-accent">
                {panelsCount}{suffixPanels}
              </div>
              <div className="text-lg text-foreground font-bold uppercase tracking-wider">Số lượng bảng</div>
              <p className="text-sm text-muted-foreground pt-2">Vị trí màn hình LED đắc địa tại các nút giao thông trọng yếu.</p>
            </div>

            {/* Stat Card 3 */}
            <div className="glass-card p-8 flex flex-col items-center text-center space-y-2 rounded-2xl glow-border transition-all group shadow-lg">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <Zap className="text-accent text-3xl w-7 h-7" />
              </div>
              <div className="text-4xl font-extrabold text-accent">
                {campaignsCount}{suffixCampaigns}
              </div>
              <div className="text-lg text-foreground font-bold uppercase tracking-wider">Chiến dịch đang chạy</div>
              <p className="text-sm text-muted-foreground pt-2">Thương hiệu đang tin tưởng sử dụng giải pháp của ADORA.</p>
            </div>
          </div>
        </section>

        {/* Visual Proof Section */}
        <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground whitespace-pre-line">
                {config.visualProofTitle}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {config.visualProofDesc}
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-accent w-5 h-5 flex-shrink-0" />
                  <span className="text-base text-foreground/90 font-medium">Màn hình độ phân giải 4K siêu nét</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-accent w-5 h-5 flex-shrink-0" />
                  <span className="text-base text-foreground/90 font-medium">Báo cáo real-time chuẩn xác</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="text-accent w-5 h-5 flex-shrink-0" />
                  <span className="text-base text-foreground/90 font-medium">Quản lý nội dung từ xa thông minh</span>
                </li>
              </ul>
              <button 
                onClick={() => navigate("/billboards/map")}
                className="border border-accent text-accent px-8 py-3.5 rounded-xl font-semibold hover:bg-accent/10 transition-all cursor-pointer active:scale-95"
              >
                Khám phá bản đồ màn hình
              </button>
            </div>
            
            <div className="w-full lg:w-1/2 relative">
              <div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
                <ImageWithFallback 
                  alt="Urban LED Display" 
                  className="w-full h-auto object-cover" 
                  src={config.visualProofImage} 
                />
              </div>
              <div className="absolute -bottom-6 -left-6 glass-card p-6 rounded-2xl border border-accent/30 hidden md:block shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full animate-ping"></div>
                  <div className="w-3 h-3 bg-accent rounded-full absolute"></div>
                  <span className="text-sm font-semibold text-accent">LIVE NOW: Campaign tại Ngã 6 Phù Đổng</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Billboards Section */}
        <section className="bg-surface py-20 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-10">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Vị trí Bảng QC Nổi Bật</h2>
                <p className="text-muted-foreground">Vị trí cao cấp được tuyển chọn tại Đà Nẵng và toàn quốc</p>
              </div>
              <button
                onClick={() => navigate("/billboards")}
                className="flex items-center gap-2 text-sm font-bold text-primary hover:text-accent transition-colors cursor-pointer"
              >
                Xem Tất Cả
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-card rounded-xl h-80 border border-border flex items-center justify-center text-muted-foreground font-semibold text-sm">
                    Đang tải bảng quảng cáo nổi bật...
                  </div>
                ))
              ) : billboards.length === 0 ? (
                <div className="col-span-full text-center py-10 text-muted-foreground font-medium">
                  Không tìm thấy bảng quảng cáo nổi bật nào.
                </div>
              ) : (
                billboards.map((b) => (
                  <BillboardCard
                    key={b.id}
                    {...mapBillboardDtoToCardProps(b)}
                    onViewDetails={() => navigate(`/billboard/${b.id}`)}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 md:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-primary via-primary-hover to-accent rounded-3xl p-12 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl md:text-4xl font-extrabold">Sẵn Sàng Bắt Đầu Chiến Dịch?</h2>
                <p className="text-white/80 mb-8 max-w-lg mx-auto text-base leading-relaxed">
                  Tham gia cùng hàng ngàn nhà quảng cáo và chủ sở hữu bảng quảng cáo trên sàn giao dịch kỹ thuật số đáng tin cậy nhất.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-accent hover:bg-accent/95 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-accent/20 cursor-pointer active:scale-95 w-full sm:w-auto"
                  >
                    Tạo Tài Khoản Miễn Phí
                  </button>
                  <button
                    onClick={() => navigate("/billboards")}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all backdrop-blur-sm cursor-pointer active:scale-95 w-full sm:w-auto"
                  >
                    Tìm Bảng Quảng Cáo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
