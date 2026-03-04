import React from "react";
import { useNavigate } from "react-router";
import { Search, MapPin, Shield, Zap, Clock, ArrowRight, CheckCircle, Users, Building2, DollarSign } from "lucide-react";
import { BillboardCard } from "../components/BillboardCard";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const billboards = [
  { image: "https://images.unsplash.com/photo-1585504303098-9785dc784742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBkaWdpdGFsJTIwY2l0eSUyMG5pZ2h0fGVufDF8fHx8MTc3MjU0NjU5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Cầu Rồng LED", location: "Đà Nẵng, Hải Châu", size: "14m x 6m", trafficIndex: "High", price: "85.000.000₫", availability: "available" as const },
  { image: "https://images.unsplash.com/photo-1745725427643-8994370391e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmlsbGJvYXJkJTIwaGlnaHdheSUyMGFkdmVydGlzaW5nfGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Bạch Đằng Digital", location: "Đà Nẵng, Sơn Trà", size: "10m x 4m", trafficIndex: "Medium", price: "55.000.000₫", availability: "available" as const },
  { image: "https://images.unsplash.com/photo-1765908310161-1005cf85586d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1lcyUyMHNxdWFyZSUyMGRpZ2l0YWwlMjBkaXNwbGF5fGVufDF8fHx8MTc3MjU0NjU5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Nguyễn Văn Linh Screen", location: "Đà Nẵng, Thanh Khê", size: "12m x 5m", trafficIndex: "High", price: "68.000.000₫", availability: "booked" as const },
  { image: "https://images.unsplash.com/photo-1766324488354-a189b706d3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBzY3JlZW4lMjBidWlsZGluZyUyMGZhY2FkZXxlbnwxfHx8fDE3NzI1NDY1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Mỹ Khê Beach LED", location: "Đà Nẵng, Ngũ Hành Sơn", size: "8m x 3m", trafficIndex: "Medium", price: "42.000.000₫", availability: "available" as const },
  { image: "https://images.unsplash.com/photo-1676491405940-9cd5d8cbf954?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWxsYm9hcmQlMjBhZHZlcnRpc2luZyUyMHVyYmFufGVufDF8fHx8MTc3MjU0NjU5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Vincom Đà Nẵng", location: "Đà Nẵng, Hải Châu", size: "16m x 8m", trafficIndex: "High", price: "120.000.000₫", availability: "available" as const },
  { image: "https://images.unsplash.com/photo-1768812785179-ab5add1e2e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwc2lnbmFnZSUyMGNvbW1lcmNpYWwlMjBidWlsZGluZ3xlbnwxfHx8fDE3NzI1NDY1OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Trần Phú LED", location: "Đà Nẵng, Hải Châu", size: "10m x 4m", trafficIndex: "Medium", price: "52.000.000₫", availability: "unavailable" as const },
];

const steps = [
  { icon: <Search className="w-6 h-6" />, title: "Tìm Kiếm", desc: "Tìm bảng quảng cáo phù hợp theo vị trí, kích thước, lưu lượng và ngân sách." },
  { icon: <CheckCircle className="w-6 h-6" />, title: "So Sánh", desc: "So sánh thông số, giá cả, đánh giá và lịch trống theo thời gian thực." },
  { icon: <Shield className="w-6 h-6" />, title: "Đặt & Thanh Toán", desc: "Đặt chỗ an toàn với hệ thống thanh toán ký quỹ và hợp đồng bảo vệ." },
];

const stats = [
  { value: "1.200+", label: "Bảng QC Đang Hoạt Động", icon: <Building2 className="w-5 h-5" /> },
  { value: "5.000+", label: "Nhà Quảng Cáo", icon: <Users className="w-5 h-5" /> },
  { value: "25 Tỷ+", label: "Giá Trị Giao Dịch", icon: <DollarSign className="w-5 h-5" /> },
  { value: "98%", label: "Tỷ Lệ Hài Lòng", icon: <CheckCircle className="w-5 h-5" /> },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <TopNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1D4ED8] via-[#3B82F6] to-[#0891B2]">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#06B6D4] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#06B6D4] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 flex items-center gap-12 relative z-10">
          <div className="flex-1 text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs mb-6">
              <Zap className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Được tin tưởng bởi hơn 5.000 nhà quảng cáo trên cả nước</span>
            </div>
            <h1 className="text-5xl leading-tight mb-6" style={{ fontWeight: 800 }}>
              Sàn Giao Dịch<br />
              <span className="text-[#06B6D4]">Bảng Quảng Cáo LED</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
              Giá minh bạch. Cập nhật theo thời gian thực. Thanh toán an toàn. Kết nối với các vị trí bảng quảng cáo cao cấp tại Đà Nẵng và toàn quốc.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/billboards")}
                className="flex items-center gap-2 bg-[#06B6D4] hover:bg-[#0891B2] text-white px-6 py-3 rounded-lg transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                Tìm Bảng QC
              </button>
              <button
                onClick={() => navigate("/register")}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg transition-colors cursor-pointer"
              >
                Đăng Bảng QC
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 hidden lg:block">
            <div className="relative">
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1757843298369-6e5503c14bfd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwc2t5bGluZSUyMG5pZ2h0fGVufDF8fHx8MTc3MjQ4MTQ1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Thành phố hiện đại với bảng quảng cáo LED"
                  className="w-full h-80 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-[#1D4ED8]" style={{ fontWeight: 600 }}>Đặt Chỗ Thành Công</p>
                  <p className="text-xs text-[#6B7A8D]">Cầu Rồng LED • 85.000.000₫</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-[#E3E8EF]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-[#06B6D4]">{stat.icon}</span>
                  <span className="text-2xl text-[#1D4ED8]" style={{ fontWeight: 800 }}>{stat.value}</span>
                </div>
                <p className="text-sm text-[#6B7A8D]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#F0F9FF] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl text-[#1D4ED8] mb-3" style={{ fontWeight: 700 }}>Cách Hoạt Động</h2>
            <p className="text-[#6B7A8D] max-w-md mx-auto">Chỉ cần 3 bước đơn giản để chiến dịch quảng cáo của bạn lên sóng</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-xl p-8 text-center hover:shadow-lg transition-shadow relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10">
                    <ArrowRight className="w-6 h-6 text-[#E3E8EF]" />
                  </div>
                )}
                <div className="w-14 h-14 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6] mx-auto mb-5">
                  {step.icon}
                </div>
                <div className="text-xs text-[#06B6D4] mb-2" style={{ fontWeight: 600 }}>BƯỚC {i + 1}</div>
                <h3 className="text-[#1D4ED8] mb-2" style={{ fontWeight: 700 }}>{step.title}</h3>
                <p className="text-sm text-[#6B7A8D] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl text-[#1D4ED8] mb-3" style={{ fontWeight: 700 }}>Tại Sao Chọn ADORA</h2>
            <p className="text-[#6B7A8D] max-w-md mx-auto">Tính năng đẳng cấp doanh nghiệp dành cho nhà quảng cáo hiện đại</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <DollarSign className="w-5 h-5" />, title: "Giá Minh Bạch", desc: "Không phí ẩn. Giá thị trường cập nhật theo thời gian thực cho mọi bảng quảng cáo." },
              { icon: <MapPin className="w-5 h-5" />, title: "Tìm Trên Bản Đồ", desc: "Tìm kiếm trực quan với bản đồ tương tác hiển thị vị trí chính xác và lưu lượng." },
              { icon: <Clock className="w-5 h-5" />, title: "Cập Nhật Thời Gian Thực", desc: "Lịch cập nhật trực tiếp. Biết chính xác khi nào bảng quảng cáo còn trống." },
              { icon: <Shield className="w-5 h-5" />, title: "Thanh Toán An Toàn", desc: "Thanh toán ký quỹ với hợp đồng bảo vệ cho tất cả các bên tham gia." },
            ].map((item, i) => (
              <div key={i} className="border border-[#E3E8EF] rounded-xl p-6 hover:border-[#06B6D4]/40 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center text-[#06B6D4] mb-4 group-hover:bg-[#06B6D4] group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-[#1D4ED8] mb-2" style={{ fontWeight: 600 }}>{item.title}</h3>
                <p className="text-sm text-[#6B7A8D] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Billboards */}
      <section className="bg-[#F0F9FF] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl text-[#1D4ED8] mb-2" style={{ fontWeight: 700 }}>Bảng QC Nổi Bật</h2>
              <p className="text-[#6B7A8D]">Vị trí cao cấp được tuyển chọn tại Đà Nẵng</p>
            </div>
            <button
              onClick={() => navigate("/billboards")}
              className="flex items-center gap-2 text-sm text-[#3B82F6] hover:text-[#06B6D4] transition-colors cursor-pointer"
            >
              Xem Tất Cả
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {billboards.map((b, i) => (
              <BillboardCard key={i} {...b} onViewDetails={() => navigate("/billboard/1")} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#0891B2] rounded-2xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#06B6D4]/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl mb-3" style={{ fontWeight: 700 }}>Sẵn Sàng Bắt Đầu?</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Tham gia cùng hàng ngàn nhà quảng cáo và chủ sở hữu bảng quảng cáo trên sàn giao dịch đáng tin cậy nhất.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-[#06B6D4] hover:bg-[#0891B2] text-white px-6 py-3 rounded-lg transition-colors cursor-pointer"
                >
                  Tạo Tài Khoản Miễn Phí
                </button>
                <button
                  onClick={() => navigate("/billboards")}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg transition-colors cursor-pointer"
                >
                  Tìm Bảng QC
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
