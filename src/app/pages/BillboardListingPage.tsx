import React, { useState } from "react";
import { useNavigate } from "react-router";
import { SlidersHorizontal, ChevronDown, Grid3X3, List } from "lucide-react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { BillboardCard } from "../components/BillboardCard";

const allBillboards = [
  { id: 1, image: "https://images.unsplash.com/photo-1585504303098-9785dc784742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBkaWdpdGFsJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc3MjU0NjU5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Cầu Rồng LED", location: "Đà Nẵng, Hải Châu", size: "14m x 6m", trafficIndex: "High", price: "85.000.000₫", availability: "available" as const },
  { id: 2, image: "https://images.unsplash.com/photo-1745725427643-8994370391e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmlsbGJvYXJkJTIwaGlnaHdheSUyMGFkdmVydGlzaW5nfGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Bạch Đằng Digital", location: "Đà Nẵng, Sơn Trà", size: "10m x 4m", trafficIndex: "Medium", price: "55.000.000₫", availability: "available" as const },
  { id: 3, image: "https://images.unsplash.com/photo-1765908310161-1005cf85586d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1lcyUyMHNxdWFyZSUyMGRpZ2l0YWwlMjBkaXNwbGF5fGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Nguyễn Văn Linh Screen", location: "Đà Nẵng, Thanh Khê", size: "12m x 5m", trafficIndex: "High", price: "68.000.000₫", availability: "booked" as const },
  { id: 4, image: "https://images.unsplash.com/photo-1766324488354-a189b706d3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBzY3JlZW4lMjBidWlsZGluZyUyMGZhY2FkZXxlbnwxfHx8fDE3NzI1NDY1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Mỹ Khê Beach LED", location: "Đà Nẵng, Ngũ Hành Sơn", size: "8m x 3m", trafficIndex: "Medium", price: "42.000.000₫", availability: "available" as const },
  { id: 5, image: "https://images.unsplash.com/photo-1676491405940-9cd5d8cbf954?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWxsYm9hcmQlMjBhZHZlcnRpc2luZyUyMHVyYmFufGVufDF8fHx8MTc3MjU0NjU5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Vincom Đà Nẵng", location: "Đà Nẵng, Hải Châu", size: "16m x 8m", trafficIndex: "High", price: "120.000.000₫", availability: "available" as const },
  { id: 6, image: "https://images.unsplash.com/photo-1768812785179-ab5add1e2e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwc2lnbmFnZSUyMGNvbW1lcmNpYWwlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzI1NDY1OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Trần Phú LED", location: "Đà Nẵng, Hải Châu", size: "10m x 4m", trafficIndex: "Medium", price: "52.000.000₫", availability: "unavailable" as const },
  { id: 7, image: "https://images.unsplash.com/photo-1770259406469-b83c307b2dca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwYWR2ZXJ0aXNpbmclMjBkaXNwbGF5fGVufDF8fHx8MTc3MjU0NjU5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Hàn River Digital", location: "Đà Nẵng, Hải Châu", size: "12m x 6m", trafficIndex: "High", price: "78.000.000₫", availability: "available" as const },
  { id: 8, image: "https://images.unsplash.com/photo-1585504303098-9785dc784742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBkaWdpdGFsJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc3MjU0NjU5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Liên Chiểu Gateway", location: "Đà Nẵng, Liên Chiểu", size: "8m x 4m", trafficIndex: "Medium", price: "38.000.000₫", availability: "booked" as const },
  { id: 9, image: "https://images.unsplash.com/photo-1745725427643-8994370391e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmlsbGJvYXJkJTIwaGlnaHdheSUyMGFkdmVydGlzaW5nfGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Cẩm Lệ Center LED", location: "Đà Nẵng, Cẩm Lệ", size: "10m x 5m", trafficIndex: "Medium", price: "45.000.000₫", availability: "available" as const },
];

const locations = ["Tất Cả Khu Vực", "Hải Châu", "Sơn Trà", "Thanh Khê", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ", "Hòa Vang"];
const sizes = ["Tất Cả Kích Thước", "Nhỏ (< 8m)", "Trung Bình (8-12m)", "Lớn (> 12m)"];

export default function BillboardListingPage() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("Tất Cả Khu Vực");
  const [selectedSize, setSelectedSize] = useState("Tất Cả Kích Thước");
  const [budgetRange, setBudgetRange] = useState(150000000);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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
            <p className="text-sm text-[#6B7A8D] mt-1">{allBillboards.length} bảng quảng cáo tại Đà Nẵng</p>
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
                <button className="text-xs text-[#06B6D4] hover:underline cursor-pointer">Xóa Tất Cả</button>
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
                      <input type="checkbox" className="rounded accent-[#06B6D4]" />
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
                      <input type="checkbox" className="rounded accent-[#06B6D4]" />
                      <span className="text-sm text-[#1A2332]">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button className="w-full bg-[#1D4ED8] text-white py-2.5 rounded-lg text-sm hover:bg-[#3B82F6] transition-colors cursor-pointer">
                Áp Dụng Bộ Lọc
              </button>
            </div>
          </aside>
        )}

        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBillboards.map((b) => (
              <BillboardCard key={b.id} {...b} onViewDetails={() => navigate(`/billboard/${b.id}`)} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-10">
            <button className="w-9 h-9 rounded-lg border border-[#E3E8EF] text-[#6B7A8D] hover:bg-white transition-colors cursor-pointer text-sm">&lt;</button>
            {[1, 2, 3, 4, 5].map((p) => (
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
        </main>
      </div>

      <Footer />
    </div>
  );
}
