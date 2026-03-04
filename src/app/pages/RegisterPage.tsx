import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Megaphone, Monitor, ArrowRight, Mail, Lock, Building2, User, Phone } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"advertiser" | "owner" | null>(null);
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1D4ED8] via-[#3B82F6] to-[#0891B2] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#06B6D4]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center text-white max-w-md">
          <h1 className="text-4xl mb-4" style={{ fontWeight: 800 }}>Tham Gia ADORA</h1>
          <p className="text-lg text-white/70 leading-relaxed mb-10">
            Dù bạn là nhà quảng cáo tìm bảng LED hoàn hảo hay chủ sở hữu muốn tối ưu tài sản.
          </p>
          <div className="space-y-4 text-left">
            {[
              "Truy cập hơn 1.200 vị trí bảng quảng cáo cao cấp",
              "Cập nhật lịch trống & giá minh bạch theo thời gian thực",
              "Hệ thống thanh toán ký quỹ an toàn",
              "Hỗ trợ chuyên viên tài khoản riêng",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#06B6D4]/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#06B6D4]" />
                </div>
                <span className="text-sm text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <button onClick={() => navigate("/")} className="text-xl text-[#1D4ED8] mb-8 block lg:hidden cursor-pointer" style={{ fontWeight: 800 }}>ADORA</button>
          <h2 className="text-2xl text-[#1D4ED8] mb-2" style={{ fontWeight: 700 }}>Tạo tài khoản</h2>
          <p className="text-sm text-[#6B7A8D] mb-8">Bước {step}/2 — {step === 1 ? "Chọn vai trò" : "Thông tin doanh nghiệp"}</p>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedRole("advertiser")}
                  className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    selectedRole === "advertiser" ? "border-[#06B6D4] bg-[#06B6D4]/5" : "border-[#E3E8EF] hover:border-[#06B6D4]/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    selectedRole === "advertiser" ? "bg-[#06B6D4] text-white" : "bg-[#F0F9FF] text-[#6B7A8D]"
                  }`}>
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-[#1D4ED8]" style={{ fontWeight: 600 }}>Nhà Quảng Cáo</p>
                  <p className="text-xs text-[#6B7A8D] mt-1">Đặt bảng QC cho chiến dịch</p>
                </button>
                <button
                  onClick={() => setSelectedRole("owner")}
                  className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    selectedRole === "owner" ? "border-[#06B6D4] bg-[#06B6D4]/5" : "border-[#E3E8EF] hover:border-[#06B6D4]/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    selectedRole === "owner" ? "bg-[#06B6D4] text-white" : "bg-[#F0F9FF] text-[#6B7A8D]"
                  }`}>
                    <Monitor className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-[#1D4ED8]" style={{ fontWeight: 600 }}>Chủ Bảng QC</p>
                  <p className="text-xs text-[#6B7A8D] mt-1">Đăng & quản lý bảng QC</p>
                </button>
              </div>
              <button
                onClick={() => selectedRole && setStep(2)}
                disabled={!selectedRole}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors mt-6 ${
                  selectedRole ? "bg-[#1D4ED8] text-white hover:bg-[#3B82F6] cursor-pointer" : "bg-[#E3E8EF] text-[#6B7A8D] cursor-not-allowed"
                }`}
              >
                Tiếp Tục
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-[#6B7A8D] mb-1.5 block">Họ</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Nguyễn" className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#6B7A8D] mb-1.5 block">Tên</label>
                  <input type="text" placeholder="Văn A" className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] mb-1.5 block">Tên Công Ty</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Công ty ABC" className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] mb-1.5 block">Email Doanh Nghiệp</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" placeholder="ten@congty.com" className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] mb-1.5 block">Số Điện Thoại</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="tel" placeholder="0901 234 567" className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] mb-1.5 block">Mật Khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" placeholder="Tối thiểu 8 ký tự" className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" />
                </div>
              </div>
              <label className="flex items-start gap-2 text-xs text-[#6B7A8D] cursor-pointer">
                <input type="checkbox" className="rounded accent-[#06B6D4] mt-0.5" />
                Tôi đồng ý với Điều Khoản Dịch Vụ và Chính Sách Bảo Mật
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-[#E3E8EF] rounded-lg text-sm text-[#6B7A8D] hover:bg-[#F0F9FF] transition-colors cursor-pointer">
                  Quay Lại
                </button>
                <button
                  onClick={() => navigate(selectedRole === "advertiser" ? "/advertiser" : "/owner")}
                  className="flex-1 bg-[#1D4ED8] text-white py-3 rounded-lg text-sm hover:bg-[#3B82F6] transition-colors cursor-pointer"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-[#6B7A8D] mt-8">
            Đã có tài khoản?{" "}
            <button onClick={() => navigate("/login")} className="text-[#06B6D4] hover:underline cursor-pointer" style={{ fontWeight: 500 }}>
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
