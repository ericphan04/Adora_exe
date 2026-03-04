import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, Monitor } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1D4ED8] via-[#3B82F6] to-[#0891B2] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#06B6D4]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <Monitor className="w-10 h-10 text-[#06B6D4]" />
          </div>
          <h1 className="text-4xl mb-4" style={{ fontWeight: 800 }}>ADORA</h1>
          <p className="text-lg text-white/70 leading-relaxed">
            Sàn giao dịch bảng quảng cáo LED số đáng tin cậy. Kết nối với các vị trí cao cấp tại Đà Nẵng và toàn quốc.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: "1.200+", label: "Bảng QC" },
              { value: "5K+", label: "Nhà QC" },
              { value: "98%", label: "Hài Lòng" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl text-white" style={{ fontWeight: 700 }}>{s.value}</p>
                <p className="text-sm text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <button onClick={() => navigate("/")} className="text-xl text-[#1D4ED8] mb-8 block lg:hidden cursor-pointer" style={{ fontWeight: 800 }}>ADORA</button>
          <h2 className="text-2xl text-[#1D4ED8] mb-2" style={{ fontWeight: 700 }}>Chào mừng trở lại</h2>
          <p className="text-sm text-[#6B7A8D] mb-8">Đăng nhập vào tài khoản của bạn để tiếp tục</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#6B7A8D] mb-1.5 block">Địa Chỉ Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" placeholder="ten@congty.com" className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-sm text-[#6B7A8D] mb-1.5 block">Mật Khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input type={showPassword ? "text" : "password"} placeholder="Nhập mật khẩu" className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-10 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A8D] cursor-pointer">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#6B7A8D] cursor-pointer">
                <input type="checkbox" className="rounded accent-[#06B6D4]" />
                Ghi nhớ đăng nhập
              </label>
              <a href="#" className="text-sm text-[#06B6D4] hover:underline">Quên mật khẩu?</a>
            </div>
            <button
              onClick={() => navigate("/advertiser")}
              className="w-full bg-[#1D4ED8] text-white py-3 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer"
            >
              Đăng Nhập
            </button>
          </div>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#E3E8EF]" />
            <span className="text-xs text-[#6B7A8D]">hoặc đăng nhập bằng</span>
            <div className="flex-1 h-px bg-[#E3E8EF]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-2.5 border border-[#E3E8EF] rounded-lg text-sm text-[#6B7A8D] hover:bg-[#F0F9FF] transition-colors cursor-pointer">
              Google
            </button>
            <button className="flex items-center justify-center gap-2 py-2.5 border border-[#E3E8EF] rounded-lg text-sm text-[#6B7A8D] hover:bg-[#F0F9FF] transition-colors cursor-pointer">
              Microsoft
            </button>
          </div>

          <p className="text-center text-sm text-[#6B7A8D] mt-8">
            Chưa có tài khoản?{" "}
            <button onClick={() => navigate("/register")} className="text-[#06B6D4] hover:underline cursor-pointer" style={{ fontWeight: 500 }}>
              Tạo tài khoản
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
