import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { SlidersHorizontal, ChevronDown, Grid3X3, List, Map } from "lucide-react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { BillboardCard } from "../components/BillboardCard";
import billboardApi from "../../api/billboardApi";
import { BillboardDto } from "../../types/billboard";
import { getTodayParts, toIsoDate } from "../utils/calendar";
import { getSavedBillboards, addSavedBillboard, removeSavedBillboard } from "../utils/savedBillboards";
import { notify } from "../utils/notify";
import { MAP_BILLBOARD_MOCKS } from "../utils/billboardMap";

const allBillboardsMock = [
  { id: 1, image: "https://images.unsplash.com/photo-1585504303098-9785dc784742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBkaWdpdGFsJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc3MjU0NjU5M3ww&ixlib=rb-4.1.0&q=80&w=1080", name: "Cầu Rồng LED", location: "Đà Nẵng, Hải Châu", size: "14m x 6m", trafficIndex: "High", price: "85.000.000₫", availability: "available" as const },
  { id: 2, image: "https://images.unsplash.com/photo-1745725427643-8994370391e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmlsbGJvYXJkJTIwaGlnaHdheSUyMGFkdmVydGlzaW5nfGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080", name: "Bạch Đằng Digital", location: "Đà Nẵng, Sơn Trà", size: "10m x 4m", trafficIndex: "Medium", price: "55.000.000₫", availability: "available" as const },
  { id: 3, image: "https://images.unsplash.com/photo-1765908310161-1005cf85586d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1lcyUyMHNxdWFyZSUyMGRpZ2l0YWwlMjBkaXNwbGF5fGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080", name: "Nguyễn Văn Linh Screen", location: "Đà Nẵng, Thanh Khê", size: "12m x 5m", trafficIndex: "High", price: "68.000.000₫", availability: "booked" as const },
  { id: 4, image: "https://images.unsplash.com/photo-1766324488354-a189b706d3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBzY3JlZW4lMjBidWlsZGluZyUyMGZhY2FkZXxlbnwxfHx8fDE3NzI1NDY1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080", name: "Mỹ Khê Beach LED", location: "Đà Nẵng, Ngũ Hành Sơn", size: "8m x 3m", trafficIndex: "Medium", price: "42.000.000₫", availability: "available" as const },
  { id: 5, image: "https://images.unsplash.com/photo-1676491405940-9cd5d8cbf954?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWxsYm9hcmQlMjBhZHZlcnRpc2luZyUyMHVyYmFufGVufDF8fHx8MTc3MjU0NjU5NXww&ixlib=rb-4.1.0&q=80&w=1080", name: "Vincom Đà Nẵng", location: "Đà Nẵng, Hải Châu", size: "16m x 8m", trafficIndex: "High", price: "120.000.000₫", availability: "available" as const },
  { id: 6, image: "https://images.unsplash.com/photo-1768812785179-ab5add1e2e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwc2lnbmFnZSUyMGNvbW1lcmNpYWwlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzI1NDY1OTV8MA&ixlib=rb-4.1.0&q=80&w=1080", name: "Trần Phú LED", location: "Đà Nẵng, Hải Châu", size: "10m x 4m", trafficIndex: "Medium", price: "52.000.000₫", availability: "unavailable" as const },
  { id: 7, image: "https://images.unsplash.com/photo-1770259406469-b83c307b2dca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwYWR2ZXJ0aXNpbmclMjBkaXNwbGF5fGVufDF8fHx8MTc3MjU0NjU5Nnww&ixlib=rb-4.1.0&q=80&w=1080", name: "Hàn River Digital", location: "Đà Nẵng, Hải Châu", size: "12m x 6m", trafficIndex: "High", price: "78.000.000₫", availability: "available" as const },
  { id: 8, image: "https://images.unsplash.com/photo-1585504303098-9785dc784742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBkaWdpdGFsJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc3MjU0NjU5M3ww&ixlib=rb-4.1.0&q=80&w=1080", name: "Liên Chiểu Gateway", location: "Đà Nẵng, Liên Chiểu", size: "8m x 4m", trafficIndex: "Medium", price: "38.000.000₫", availability: "booked" as const },
  { id: 9, image: "https://images.unsplash.com/photo-1745725427643-8994370391e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmlsbGJvYXJkJTIwaGlnaHdheSUyMGFkdmVydGlzaW5nfGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080", name: "Cẩm Lệ Center LED", location: "Đà Nẵng, Cẩm Lệ", size: "10m x 5m", trafficIndex: "Medium", price: "45.000.000₫", availability: "available" as const },
  { id: 11, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", name: "Vòng xoay Phạm Văn Đồng LED", location: "Đà Nẵng, Sơn Trà", size: "12m x 6m", trafficIndex: "High", price: "95.000.000₫", availability: "available" as const },
  { id: 12, image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", name: "Võ Văn Kiệt Pedestrian LED", location: "Đà Nẵng, Sơn Trà", size: "8m x 4m", trafficIndex: "Medium", price: "42.000.000₫", availability: "available" as const },
  { id: 13, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", name: "Ngã Tư Điện Biên Phủ LED", location: "Đà Nẵng, Thanh Khê", size: "14m x 7m", trafficIndex: "High", price: "88.000.000₫", availability: "available" as const },
  { id: 14, image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", name: "Nguyễn Tất Thành Street Screen", location: "Đà Nẵng, Thanh Khê", size: "8m x 4m", trafficIndex: "Medium", price: "38.000.000₫", availability: "available" as const },
  { id: 15, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", name: "Võ Nguyên Giáp Beachfront LED", location: "Đà Nẵng, Ngũ Hành Sơn", size: "12m x 6m", trafficIndex: "High", price: "90.000.000₫", availability: "available" as const },
  { id: 16, image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", name: "Lê Văn Hiến Street Screen", location: "Đà Nẵng, Ngũ Hành Sơn", size: "8m x 4m", trafficIndex: "Medium", price: "35.000.000₫", availability: "available" as const },
  { id: 17, image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", name: "Tôn Đức Thắng Junction LED", location: "Đà Nẵng, Liên Chiểu", size: "10m x 5m", trafficIndex: "Medium", price: "65.000.000₫", availability: "available" as const },
  { id: 18, image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", name: "Nguyễn Lương Bằng Campus Screen", location: "Đà Nẵng, Liên Chiểu", size: "8m x 4m", trafficIndex: "Medium", price: "28.000.000₫", availability: "available" as const },
  { id: 19, image: "https://images.unsplash.com/photo-1472214222555-d404758b1c42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", name: "Nguyễn Hữu Thọ Avenue LED", location: "Đà Nẵng, Cẩm Lệ", size: "10m x 5m", trafficIndex: "Medium", price: "60.000.000₫", availability: "available" as const },
  { id: 20, image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", name: "Cách Mạng Tháng Tám Highway Screen", location: "Đà Nẵng, Cẩm Lệ", size: "10m x 5m", trafficIndex: "Medium", price: "30.000.000₫", availability: "available" as const },
];

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

const locations = ["Tất Cả Khu Vực", "Hải Châu", "Sơn Trà", "Thanh Khê", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ", "Hòa Vang"];
const sizes = ["Tất Cả Kích Thước", "Nhỏ (< 8m)", "Trung Bình (8-12m)", "Lớn (> 12m)"];

export default function BillboardListingPage() {
  const navigate = useNavigate();
  
  // Filter States
  const [selectedLocation, setSelectedLocation] = useState("Tất Cả Khu Vực");
  const [selectedSize, setSelectedSize] = useState("Tất Cả Kích Thước");
  const [budgetRange, setBudgetRange] = useState(150000000);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedTechSpecs, setSelectedTechSpecs] = useState<string[]>([]);
  
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // API Data States
  const [billboards, setBillboards] = useState<BillboardDto[]>([]);
  const [savedBillboardIds, setSavedBillboardIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchBillboards = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedLocation !== "Tất Cả Khu Vực") {
        filters.district = selectedLocation;
        filters.city = "Đà Nẵng";
      }
      filters.maxPrice = budgetRange;

      const response = await billboardApi.getAll(filters);
      if (response.success && response.data) {
        let filtered = response.data;
        
        // Filter by size
        if (selectedSize !== "Tất Cả Kích Thước") {
          filtered = filtered.filter(b => {
            if (selectedSize === "Nhỏ (< 8m)") return b.width < 8;
            if (selectedSize === "Trung Bình (8-12m)") return b.width >= 8 && b.width <= 12;
            if (selectedSize === "Lớn (> 12m)") return b.width > 12;
            return true;
          });
        }

        // Filter by features (tech specs)
        if (selectedTechSpecs.length > 0) {
          filtered = filtered.filter(b => 
            selectedTechSpecs.every(spec => 
              b.features?.some(f => f.name.toLowerCase().includes(spec.toLowerCase()))
            )
          );
        }

        // Filter by availability (approximate frontend check)
        if (selectedAvailability.length > 0) {
          filtered = filtered.filter(b => {
            const hasBooking = b.availabilities?.some(av => av.status === "BOOKED");
            if (selectedAvailability.includes("Trống Ngay")) {
              return !hasBooking;
            }
            return true;
          });
        }

        setBillboards(filtered);
      } else {
        throw new Error(response.message || "Failed to load billboards");
      }
    } catch (err) {
      console.warn("Backend API not running or returned error. Using filtered mock fallback:", err);
      // Map mock values to BillboardDto interface
      let mappedMocks: BillboardDto[] = allBillboardsMock.map(b => {
        const parts = b.location.split(", ");
        const dist = parts[1] || "";
        const city = parts[0] || "Đà Nẵng";
        const widthVal = parseInt(b.size.split("m")[0]) || 10;
        const heightVal = parseInt(b.size.split("x ")[1]?.split("m")[0]) || 5;
        const priceVal = parseInt(b.price.replace(/\./g, "").replace("₫", "")) || 50000000;

        const mapMock = MAP_BILLBOARD_MOCKS.find(m => m.id === b.id);

        return {
          id: b.id,
          title: b.name,
          description: "Bảng quảng cáo đèn LED kĩ thuật số",
          address: b.location,
          city: city,
          district: dist,
          latitude: mapMock?.latitude,
          longitude: mapMock?.longitude,
          width: widthVal,
          height: heightVal,
          resolution: "P10",
          brightness: 6500,
          refreshRate: 3840,
          screenType: "Outdoor LED",
          operatingHours: "16h/ngày",
          pricePerDay: Math.round(priceVal / 30),
          pricePerMonth: priceVal,
          locationSurcharge: 1.05,
          status: "APPROVED",
          dailyViews: b.trafficIndex === "High" ? 120000 : b.trafficIndex === "Medium" ? 75000 : 25000,
          isFeatured: false,
          images: [{ id: b.id, imageUrl: b.image, isThumbnail: true }],
          features: [
            { id: 1, name: "Độ phân giải 4K" },
            { id: 2, name: "Hỗ trợ HDR" },
            { id: 3, name: "Chống thời tiết" },
            { id: 4, name: "Có âm thanh" }
          ],
          availabilities:
            b.availability === "booked"
              ? (() => {
                  const { year, month } = getTodayParts();
                  return [
                    {
                      id: 1,
                      availableDate: toIsoDate(year, month, 10),
                      status: "BOOKED" as const,
                    },
                  ];
                })()
              : []
        };
      });

      // Filter Mock
      if (selectedLocation !== "Tất Cả Khu Vực") {
        mappedMocks = mappedMocks.filter(b => b.district === selectedLocation);
      }
      mappedMocks = mappedMocks.filter(b => b.pricePerMonth <= budgetRange);

      if (selectedSize !== "Tất Cả Kích Thước") {
        mappedMocks = mappedMocks.filter(b => {
          if (selectedSize === "Nhỏ (< 8m)") return b.width < 8;
          if (selectedSize === "Trung Bình (8-12m)") return b.width >= 8 && b.width <= 12;
          if (selectedSize === "Lớn (> 12m)") return b.width > 12;
          return true;
        });
      }

      if (selectedTechSpecs.length > 0) {
        mappedMocks = mappedMocks.filter(b => 
          selectedTechSpecs.every(spec => 
            b.features?.some(f => f.name.toLowerCase().includes(spec.toLowerCase()))
          )
        );
      }

      if (selectedAvailability.length > 0) {
        mappedMocks = mappedMocks.filter(b => {
          const hasBooking = b.availabilities?.some(av => av.status === "BOOKED");
          if (selectedAvailability.includes("Trống Ngay")) {
            return !hasBooking;
          }
          return true;
        });
      }

      setBillboards(mappedMocks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillboards();
  }, []);

  useEffect(() => {
    const ids = new Set(getSavedBillboards().map((item) => item.id));
    setSavedBillboardIds(ids);
  }, []);

  const handleToggleSaved = useCallback((billboard: BillboardDto) => {
    if (savedBillboardIds.has(billboard.id)) {
      removeSavedBillboard(billboard.id);
      setSavedBillboardIds((prev) => {
        const next = new Set(prev);
        next.delete(billboard.id);
        return next;
      });
      notify.success("Đã bỏ lưu bảng quảng cáo");
    } else {
      addSavedBillboard(billboard);
      setSavedBillboardIds((prev) => new Set(prev).add(billboard.id));
      notify.success("Đã lưu bảng quảng cáo");
    }
  }, [savedBillboardIds]);

  const handleClearFilters = () => {
    setSelectedLocation("Tất Cả Khu Vực");
    setSelectedSize("Tất Cả Kích Thước");
    setBudgetRange(150000000);
    setSelectedAvailability([]);
    setSelectedTechSpecs([]);
  };

  const toggleAvailability = (item: string) => {
    if (selectedAvailability.includes(item)) {
      setSelectedAvailability(selectedAvailability.filter(i => i !== item));
    } else {
      setSelectedAvailability([...selectedAvailability, item]);
    }
  };

  const toggleTechSpec = (item: string) => {
    if (selectedTechSpecs.includes(item)) {
      setSelectedTechSpecs(selectedTechSpecs.filter(i => i !== item));
    } else {
      setSelectedTechSpecs([...selectedTechSpecs, item]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF]">
      <TopNav />

      <div className="bg-white border-b border-[#E3E8EF]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate("/")} className="text-[#6B7A8D] hover:text-[#1D4ED8] cursor-pointer">Trang Chủ</button>
            <span className="text-[#E3E8EF]">/</span>
            <span className="text-[#1D4ED8]" style={{ fontWeight: 500 }}>Tìm Bảng Quảng Cáo</span>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-[#E3E8EF]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-[#1D4ED8]" style={{ fontWeight: 700 }}>Tìm Bảng Quảng Cáo</h1>
            <p className="text-sm text-[#6B7A8D] mt-1">{billboards.length} bảng quảng cáo tại Đà Nẵng</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-[#6B7A8D] border border-[#E3E8EF] px-3 py-2 rounded-lg hover:bg-[#F0F9FF] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Bộ Lọc
            </button>
            <div className="flex items-center gap-2 text-sm text-[#6B7A8D] border border-[#E3E8EF] px-3 py-2 rounded-lg">
              <span>Sắp xếp:</span>
              <select className="bg-transparent outline-none text-[#1D4ED8] text-sm cursor-pointer" style={{ fontWeight: 500 }}>
                <option>Đề Xuất</option>
                <option>Giá: Thấp → Cao</option>
                <option>Giá: Cao → Thấp</option>
                <option>Lưu Lượng: Cao → Thấp</option>
              </select>
            </div>
            <button
              onClick={() => navigate("/billboards/map")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#1D4ED8] to-[#06B6D4] text-white text-sm font-medium hover:opacity-95 cursor-pointer shadow-sm"
            >
              <Map className="w-4 h-4" />
              Bản đồ
            </button>
            <div className="flex items-center border border-[#E3E8EF] rounded-lg overflow-hidden">
              <button className="w-9 h-9 flex items-center justify-center bg-[#1D4ED8] text-white cursor-pointer">
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 flex items-center justify-center text-[#6B7A8D] hover:bg-[#F0F9FF] cursor-pointer">
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {showFilters && (
          <aside className="w-72 shrink-0">
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Bộ Lọc</h3>
                <button onClick={handleClearFilters} className="text-xs text-[#06B6D4] hover:underline cursor-pointer">Xóa Tất Cả</button>
              </div>

              <div className="mb-6">
                <label className="text-sm text-[#6B7A8D] mb-2 block">Khu Vực</label>
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg px-3 py-2.5 text-sm text-[#1D4ED8] appearance-none cursor-pointer"
                  >
                    {locations.map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#6B7A8D] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-[#6B7A8D] mb-2 block">Ngân sách (mỗi tháng)</label>
                <input
                  type="range"
                  min="10000000"
                  max="200000000"
                  step="5000000"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(Number(e.target.value))}
                  className="w-full accent-[#06B6D4]"
                />
                <div className="flex items-center justify-between mt-1 text-xs text-[#6B7A8D]">
                  <span>10 Triệu</span>
                  <span className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>{(budgetRange / 1000000).toFixed(0)} Triệu ₫</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-[#6B7A8D] mb-2 block">Kích Thước</label>
                <div className="relative">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg px-3 py-2.5 text-sm text-[#1D4ED8] appearance-none cursor-pointer"
                  >
                    {sizes.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#6B7A8D] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-[#6B7A8D] mb-3 block">Thời Gian Trống</label>
                <div className="space-y-2">
                  {["Trống Ngay", "Trống Tuần Sau", "Trống Tháng Sau"].map((a) => (
                    <label key={a} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAvailability.includes(a)}
                        onChange={() => toggleAvailability(a)}
                        className="rounded accent-[#06B6D4]"
                      />
                      <span className="text-sm text-[#1A2332]">{a}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm text-[#6B7A8D] mb-3 block">Thông Số Kỹ Thuật</label>
                <div className="space-y-2">
                  {["Độ phân giải 4K", "Hỗ trợ HDR", "Chống thời tiết", "Có âm thanh"].map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTechSpecs.includes(t)}
                        onChange={() => toggleTechSpec(t)}
                        className="rounded accent-[#06B6D4]"
                      />
                      <span className="text-sm text-[#1A2332]">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={fetchBillboards}
                className="w-full bg-[#1D4ED8] text-white py-2.5 rounded-lg text-sm hover:bg-[#3B82F6] transition-colors cursor-pointer"
              >
                Áp Dụng Bộ Lọc
              </button>
            </div>
          </aside>
        )}

        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl h-80 border border-[#E3E8EF] flex items-center justify-center text-[#6B7A8D] font-semibold text-sm">
                  Đang tải...
                </div>
              ))}
            </div>
          ) : billboards.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-[#E3E8EF]">
              <p className="text-lg text-[#6B7A8D] font-medium">Không tìm thấy bảng quảng cáo nào khớp với bộ lọc.</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 bg-[#F0F9FF] text-[#1D4ED8] border border-[#E3E8EF] px-4 py-2 rounded-lg hover:bg-[#1D4ED8] hover:text-white transition-colors"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {billboards.map((b) => (
                <BillboardCard
                  key={b.id}
                  {...mapBillboardDtoToCardProps(b)}
                  saved={savedBillboardIds.has(b.id)}
                  onViewDetails={() => navigate(`/billboard/${b.id}`)}
                  onToggleSave={() => handleToggleSaved(b)}
                />
              ))}
            </div>
          )}

          {billboards.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button className="w-9 h-9 rounded-lg border border-[#E3E8EF] text-[#6B7A8D] hover:bg-white transition-colors cursor-pointer text-sm">&lt;</button>
              {[1].map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm transition-colors cursor-pointer ${
                    p === currentPage ? "bg-[#1D4ED8] text-white" : "border border-[#E3E8EF] text-[#6B7A8D] hover:bg-white"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button className="w-9 h-9 rounded-lg border border-[#E3E8EF] text-[#6B7A8D] hover:bg-white transition-colors cursor-pointer text-sm">&gt;</button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
