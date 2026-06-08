import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Megaphone, Monitor, ArrowRight, Mail, Lock, Building2, User, Phone, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import authApi from "../../api/authApi";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"advertiser" | "owner" | null>(null);
  const [step, setStep] = useState(1);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verification states
  const [verificationCode, setVerificationCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError("Vui lòng chọn vai trò");
      return;
    }
    if (!firstName || !lastName || !email || !phone || !password) {
      setError("Vui lòng nhập đầy đủ các thông tin bắt buộc");
      return;
    }
    if (!agree) {
      setError("Bạn phải đồng ý với Điều Khoản Dịch Vụ và Chính Sách Bảo Mật");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const mappedRole = selectedRole === "advertiser" ? "RENTER" : "OWNER";
      const fullName = `${lastName} ${firstName}`.trim();
      await register({
        fullName,
        email,
        phone,
        password,
        role: mappedRole,
        companyName: companyName || undefined,
      });
      // Move to Verification Step
      setStep(3);
      setResendCountdown(60);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Vui lòng nhập đúng mã xác thực 6 chữ số");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authApi.verifyEmail({ email, code: verificationCode });
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Xác thực thất bại. Vui lòng kiểm tra lại mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    setError(null);
    try {
      await authApi.resendCode({ email });
      setResendCountdown(60);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Gửi lại mã xác thực thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0D1117]">
      {/* Left */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1D4ED8] via-[#3B82F6] to-[#0891B2] relative overflow-hidden items-center justify-center p-12">
        <button 
          onClick={() => navigate("/")} 
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </button>
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#06B6D4]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <img src="/logo.png" className="w-12 h-12 object-contain rounded-lg" alt="ADORA logo" />
          </div>
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
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 bg-white dark:bg-[#0D1117] overflow-y-auto relative min-h-screen pt-[calc(5rem+env(safe-area-inset-top))] pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="w-full max-w-md my-auto">
          <button 
            onClick={() => navigate("/")} 
            className="absolute top-[calc(1.5rem+env(safe-area-inset-top))] left-6 lg:hidden flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1D4ED8] dark:text-[#3B82F6] hover:text-white bg-[#F0F9FF] dark:bg-[#161B22] hover:bg-[#1D4ED8] dark:hover:bg-[#2563EB] rounded-xl transition-all duration-200 border border-[#E3E8EF] dark:border-[#30363D] hover:border-[#1D4ED8] dark:hover:border-[#2563EB] shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
          </button>
          <h2 className="text-2xl text-[#1D4ED8] dark:text-[#2563EB] mb-2" style={{ fontWeight: 700 }}>Tạo tài khoản</h2>
          <p className="text-sm text-[#6B7A8D] dark:text-[#8B949E] mb-8">
            {step === 3 
              ? "Bước 3/3 — Xác thực email" 
              : `Bước ${step}/3 — ${step === 1 ? "Chọn vai trò" : "Thông tin doanh nghiệp"}`}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm">
              {step === 3 
                ? "Xác thực email thành công! Đang chuyển hướng sang trang đăng nhập..." 
                : "Đăng ký thành công! Đang chuẩn bị chuyển bước xác thực..."}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedRole("advertiser")}
                  className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    selectedRole === "advertiser" 
                      ? "border-[#06B6D4] bg-[#06B6D4]/5 dark:bg-[#06B6D4]/10" 
                      : "border-[#E3E8EF] dark:border-[#30363D] hover:border-[#06B6D4]/30 dark:hover:border-[#06B6D4]/40"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    selectedRole === "advertiser" ? "bg-[#06B6D4] text-white" : "bg-[#F0F9FF] dark:bg-[#161B22] text-[#6B7A8D] dark:text-[#8B949E]"
                  }`}>
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-[#1D4ED8] dark:text-[#3B82F6]" style={{ fontWeight: 600 }}>Nhà Quảng Cáo</p>
                  <p className="text-xs text-[#6B7A8D] dark:text-[#8B949E] mt-1">Đặt bảng QC cho chiến dịch</p>
                </button>
                <button
                  onClick={() => setSelectedRole("owner")}
                  className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    selectedRole === "owner" 
                      ? "border-[#06B6D4] bg-[#06B6D4]/5 dark:bg-[#06B6D4]/10" 
                      : "border-[#E3E8EF] dark:border-[#30363D] hover:border-[#06B6D4]/30 dark:hover:border-[#06B6D4]/40"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    selectedRole === "owner" ? "bg-[#06B6D4] text-white" : "bg-[#F0F9FF] dark:bg-[#161B22] text-[#6B7A8D] dark:text-[#8B949E]"
                  }`}>
                    <Monitor className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-[#1D4ED8] dark:text-[#3B82F6]" style={{ fontWeight: 600 }}>Chủ Bảng QC</p>
                  <p className="text-xs text-[#6B7A8D] dark:text-[#8B949E] mt-1">Đăng & quản lý bảng QC</p>
                </button>
              </div>
              <button
                onClick={() => selectedRole && setStep(2)}
                disabled={!selectedRole}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-colors mt-6 ${
                  selectedRole ? "bg-[#1D4ED8] text-white hover:bg-[#3B82F6] cursor-pointer" : "bg-[#E3E8EF] dark:bg-[#30363D] text-[#6B7A8D] dark:text-[#8B949E] cursor-not-allowed"
                }`}
              >
                Tiếp Tục
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-[#6B7A8D] dark:text-[#8B949E] mb-1.5 block">Họ</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#6B7A8D] dark:text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Nguyễn"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-[#F0F9FF] dark:bg-[#161B22] border border-[#E3E8EF] dark:border-[#30363D] text-foreground rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#6B7A8D] dark:text-[#8B949E] mb-1.5 block">Tên</label>
                  <input
                    type="text"
                    placeholder="Văn A"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#F0F9FF] dark:bg-[#161B22] border border-[#E3E8EF] dark:border-[#30363D] text-foreground rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] dark:text-[#8B949E] mb-1.5 block">Tên Công Ty</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#6B7A8D] dark:text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Công ty ABC"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#F0F9FF] dark:bg-[#161B22] border border-[#E3E8EF] dark:border-[#30363D] text-foreground rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] dark:text-[#8B949E] mb-1.5 block">Email Doanh Nghiệp</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7A8D] dark:text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="ten@congty.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F0F9FF] dark:bg-[#161B22] border border-[#E3E8EF] dark:border-[#30363D] text-foreground rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] dark:text-[#8B949E] mb-1.5 block">Số Điện Thoại</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#6B7A8D] dark:text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="0901 234 567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#F0F9FF] dark:bg-[#161B22] border border-[#E3E8EF] dark:border-[#30363D] text-foreground rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] dark:text-[#8B949E] mb-1.5 block">Mật Khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7A8D] dark:text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Tối thiểu 8 ký tự"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F0F9FF] dark:bg-[#161B22] border border-[#E3E8EF] dark:border-[#30363D] text-foreground rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                    required
                  />
                </div>
              </div>
              <label className="flex items-start gap-2 text-xs text-[#6B7A8D] dark:text-[#8B949E] cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="rounded accent-[#06B6D4] mt-0.5"
                />
                Tôi đồng ý với Điều Khoản Dịch Vụ và Chính Sách Bảo Mật
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-[#E3E8EF] dark:border-[#30363D] text-[#6B7A8D] dark:text-[#8B949E] rounded-lg text-sm hover:bg-[#F0F9FF] dark:hover:bg-[#161B22] transition-colors cursor-pointer"
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#1D4ED8] text-white py-3 rounded-lg text-sm hover:bg-[#3B82F6] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Tạo Tài Khoản"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-[#06B6D4]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6 text-[#06B6D4]" />
                </div>
                <p className="text-sm text-[#6B7A8D] dark:text-[#8B949E] leading-relaxed">
                  Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến email <strong className="text-[#1D4ED8] dark:text-[#3B82F6]">{email}</strong>. Vui lòng nhập mã để hoàn tất đăng ký.
                </p>
              </div>

              <div>
                <label className="text-sm text-[#6B7A8D] dark:text-[#8B949E] mb-1.5 block">Mã Xác Thực (OTP)</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#6B7A8D] dark:text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-[#F0F9FF] dark:bg-[#161B22] border border-[#E3E8EF] dark:border-[#30363D] text-foreground rounded-lg pl-10 pr-4 py-2.5 text-sm tracking-[0.5em] font-mono text-center outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1D4ED8] text-white py-3 rounded-lg text-sm hover:bg-[#3B82F6] transition-colors cursor-pointer disabled:opacity-50 font-semibold"
                >
                  {loading ? "Đang xác thực..." : "Xác Thực Email"}
                </button>
                
                <div className="text-center text-xs text-[#6B7A8D] dark:text-[#8B949E] mt-2">
                  Chưa nhận được mã?{" "}
                  {resendCountdown > 0 ? (
                    <span className="text-[#6B7A8D] dark:text-[#8B949E]">Gửi lại sau {resendCountdown} giây</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loading}
                      className="text-[#06B6D4] hover:underline font-semibold cursor-pointer disabled:opacity-50"
                    >
                      Gửi lại mã
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3 border border-[#E3E8EF] dark:border-[#30363D] text-[#6B7A8D] dark:text-[#8B949E] rounded-lg text-sm hover:bg-[#F0F9FF] dark:hover:bg-[#161B22] transition-colors cursor-pointer"
                >
                  Quay Lại Thông Tin
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-[#6B7A8D] dark:text-[#8B949E] mt-8">
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
