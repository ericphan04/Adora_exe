import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MapPin, Star, Phone, ChevronLeft, ChevronRight, Heart, Share2, Monitor, Zap, Shield, Eye } from "lucide-react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { StatusBadge } from "../components/StatusBadge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const images = [
  "https://images.unsplash.com/photo-1585504303098-9785dc784742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBkaWdpdGFsJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc3MjU0NjU5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1745725427643-8994370391e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmlsbGJvYXJkJTIwaGlnaHdheSUyMGFkdmVydGlzaW5nfGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1765908310161-1005cf85586d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1lcyUyMHNxdWFyZSUyMGRpZ2l0YWwlMjBkaXNwbGF5fGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1766324488354-a189b706d3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBzY3JlZW4lMjBidWlsZGluZyUyMGZhY2FkZXxlbnwxfHx8fDE3NzI1NDY1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

const specs = [
  { label: "Loại Màn Hình", value: "LED Kỹ Thuật Số" },
  { label: "Độ Phân Giải", value: "4K Ultra HD (3840 x 2160)" },
  { label: "Kích Thước", value: "14m x 6m (84 m²)" },
  { label: "Mật Độ Điểm Ảnh", value: "6mm" },
  { label: "Độ Sáng", value: "8.000 nits" },
  { label: "Thời Gian Hoạt Động", value: "24/7" },
  { label: "Tần Số Quét", value: "3840 Hz" },
  { label: "Chống Nước", value: "IP65" },
];

const reviews = [
  { name: "Nguyễn Thanh Hà", company: "Công ty CP Truyền Thông ABC", rating: 5, text: "Vị trí tuyệt vời với lưu lượng giao thông rất cao. Chất lượng màn hình xuất sắc, đúng như cam kết.", date: "Tháng 2, 2026" },
  { name: "Trần Minh Đức", company: "Đại Lý QC Số Việt", rating: 4, text: "ROI rất tốt cho chiến dịch của chúng tôi. Quy trình đặt chỗ thuận tiện và đội ngũ hỗ trợ nhiệt tình.", date: "Tháng 1, 2026" },
  { name: "Lê Thị Mai", company: "Công ty MediaPro", rating: 5, text: "Vị trí cao cấp, kết quả ấn tượng. Chắc chắn sẽ đặt lại cho chiến dịch tiếp theo.", date: "Tháng 12, 2025" },
];

const bookedDays = new Set([3, 4, 5, 8, 9, 10, 15, 16, 22, 23, 24, 25]);
const startDayOffset = 0;

export default function BillboardDetailPage() {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Tổng Quan" },
    { key: "specs", label: "Thông Số Kỹ Thuật" },
    { key: "reviews", label: "Đánh Giá" },
    { key: "map", label: "Bản Đồ" },
  ];

  const totalDays = 31;
  const calendarCells: { day: number | null; isBooked: boolean }[] = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push({ day: null, isBooked: false });
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push({ day: d, isBooked: bookedDays.has(d) });
  }
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push({ day: null, isBooked: false });
  }

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
            <span className="text-[#1D4ED8]" style={{ fontWeight: 500 }}>Cầu Rồng LED</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Gallery */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden">
              <div className="relative h-96">
                <ImageWithFallback src={images[activeImage]} alt="Bảng quảng cáo" className="w-full h-full object-cover" />
                <button
                  onClick={() => setActiveImage(Math.max(0, activeImage - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveImage(Math.min(images.length - 1, activeImage + 1))}
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
              <div className="p-3 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
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
                      Bảng quảng cáo LED kỹ thuật số cao cấp tọa lạc ngay tại đầu Cầu Rồng, trung tâm TP Đà Nẵng. Vị trí biểu tượng này mang lại khả năng hiển thị vượt trội với ước tính hơn 150.000 lượt đi qua mỗi ngày bao gồm cả phương tiện giao thông và người đi bộ. Màn hình 4K Ultra HD đảm bảo quảng cáo của bạn nổi bật cả ngày lẫn đêm.
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      {[
                        { icon: <Eye className="w-5 h-5" />, label: "Lượt Xem/Ngày", value: "150.000+" },
                        { icon: <Monitor className="w-5 h-5" />, label: "Chất Lượng", value: "4K UHD" },
                        { icon: <Zap className="w-5 h-5" />, label: "Thời Gian Chạy", value: "99.9%" },
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
                      {specs.map((s, i) => (
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
                      <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Đánh Giá (24)</h3>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                        ))}
                        <span className="text-sm text-[#6B7A8D] ml-1">4.8/5</span>
                      </div>
                    </div>
                    {reviews.map((r, i) => (
                      <div key={i} className="border border-[#E3E8EF] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm text-[#1D4ED8]" style={{ fontWeight: 600 }}>{r.name}</p>
                            <p className="text-xs text-[#6B7A8D]">{r.company}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array(r.rating).fill(0).map((_, j) => (
                              <Star key={j} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-[#6B7A8D]">{r.text}</p>
                        <p className="text-xs text-[#6B7A8D]/60 mt-2">{r.date}</p>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "map" && (
                  <div>
                    <h3 className="text-[#1D4ED8] mb-4" style={{ fontWeight: 600 }}>Vị Trí</h3>
                    <div className="bg-[#F0F9FF] rounded-lg h-80 flex items-center justify-center text-[#6B7A8D]">
                      <div className="text-center">
                        <MapPin className="w-10 h-10 mx-auto mb-2 text-[#06B6D4]" />
                        <p className="text-sm" style={{ fontWeight: 500 }}>Cầu Rồng, Quận Hải Châu, TP Đà Nẵng</p>
                        <p className="text-xs text-[#6B7A8D] mt-1">16.0611° N, 108.2275° E</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[420px] shrink-0 space-y-6">
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge variant="available" />
                <span className="text-xs text-[#6B7A8D] bg-[#1D4ED8]/5 px-2 py-0.5 rounded">Lưu lượng Cao</span>
              </div>
              <h2 className="text-xl text-[#1D4ED8] mt-3 mb-1" style={{ fontWeight: 700 }}>Cầu Rồng LED</h2>
              <div className="flex items-center gap-1 text-sm text-[#6B7A8D] mb-4">
                <MapPin className="w-3.5 h-3.5" />
                <span>Đầu Cầu Rồng, Hải Châu, Đà Nẵng</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Kích Thước", value: "14m x 6m" },
                  { label: "Độ Phân Giải", value: "4K UHD" },
                  { label: "Lượt Xem/Ngày", value: "150K+" },
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
                <p className="text-xs text-[#6B7A8D] mb-2">Chi Tiết Giá</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#6B7A8D]">Giá Gốc</span><span className="text-[#1D4ED8]">70.000.000₫/tháng</span></div>
                  <div className="flex justify-between"><span className="text-[#6B7A8D]">Phụ phí Vị Trí Cao Cấp</span><span className="text-[#1D4ED8]">+10.000.000₫</span></div>
                  <div className="flex justify-between"><span className="text-[#6B7A8D]">Phí Nền Tảng (5%)</span><span className="text-[#1D4ED8]">5.000.000₫</span></div>
                  <div className="border-t border-[#E3E8EF] pt-2 flex justify-between">
                    <span className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Tổng Cộng</span>
                    <span className="text-xl text-[#1D4ED8]" style={{ fontWeight: 700 }}>85.000.000₫<span className="text-xs text-[#6B7A8D]" style={{ fontWeight: 400 }}>/tháng</span></span>
                  </div>
                </div>
              </div>

              {/* BOOKING CALENDAR */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-[#1D4ED8]" style={{ fontWeight: 600 }}>Lịch Đặt Chỗ — Tháng 3, 2026</p>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
                  {["CN","T2","T3","T4","T5","T6","T7"].map((d) => (
                    <div key={d} className="py-1 text-[#6B7A8D]" style={{ fontWeight: 500 }}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarCells.map((cell, i) => {
                    if (!cell.day) return <div key={i} className="h-14" />;
                    const isBooked = cell.isBooked;
                    return (
                      <div
                        key={i}
                        className={`h-14 rounded-lg flex flex-col items-center justify-center gap-0.5 border transition-all ${
                          isBooked
                            ? "bg-red-50 border-red-200"
                            : "bg-emerald-50 border-emerald-200 cursor-pointer hover:bg-emerald-100 hover:border-emerald-300"
                        }`}
                      >
                        <span className={`text-xs ${isBooked ? "text-red-700" : "text-emerald-800"}`} style={{ fontWeight: 600 }}>
                          {cell.day}
                        </span>
                        <span
                          className={`text-[9px] px-1 py-px rounded ${
                            isBooked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"
                          }`}
                          style={{ fontWeight: 600, letterSpacing: "0.02em" }}
                        >
                          {isBooked ? "BẬN" : "TRỐNG"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-5 mt-3 text-xs text-[#6B7A8D]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                    <span>Trống — Có thể đặt</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-red-100 border border-red-300" />
                    <span>Bận — Đã có người đặt</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-[#06B6D4] text-white py-3 rounded-lg hover:bg-[#0891B2] transition-colors cursor-pointer mb-3">
                Đặt Ngay
              </button>
              <button className="w-full border border-[#E3E8EF] text-[#1D4ED8] py-3 rounded-lg hover:bg-[#F0F9FF] transition-colors cursor-pointer flex items-center justify-center gap-2">
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
