import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff, Monitor, Key } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import authApi from "../../api/authApi";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // States for password reset
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập địa chỉ email");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authApi.forgotPassword({ email });
      if (response.success) {
        setSuccessMessage(response.message || "Mã xác thực đã được gửi đến email của bạn.");
        setView('reset');
      } else {
        setError(response.message || "Không thể gửi yêu cầu. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Không thể gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otpCode || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ tất cả thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authApi.resetPassword({
        email,
        code: otpCode,
        newPassword
      });

      if (response.success) {
        setSuccessMessage("Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.");
        setView('login');
        setPassword("");
        setOtpCode("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(response.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginCallback = async (response: any) => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(response.credential);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        if (userObj.role === "ADMIN") {
          navigate("/admin");
        } else if (userObj.role === "OWNER") {
          navigate("/owner");
        } else {
          navigate("/advertiser");
        }
      } else {
        navigate("/advertiser");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Đăng nhập bằng Google thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLoginCallback,
      });
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "outline", size: "large", width: 400, text: "continue_with" }
      );
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      // The token was set and user fetched. Now redirect depending on role.
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        if (userObj.role === "ADMIN") {
          navigate("/admin");
        } else if (userObj.role === "OWNER") {
          navigate("/owner");
        } else {
          navigate("/advertiser");
        }
      } else {
        navigate("/advertiser");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="w-full max-w-[400px]">
          <button onClick={() => navigate("/")} className="text-xl text-[#1D4ED8] mb-8 block lg:hidden cursor-pointer" style={{ fontWeight: 800 }}>ADORA</button>
          
          {view === 'login' && (
            <>
              <h2 className="text-2xl text-[#1D4ED8] mb-2" style={{ fontWeight: 700 }}>Chào mừng trở lại</h2>
              <p className="text-sm text-[#6B7A8D] mb-8">Đăng nhập vào tài khoản của bạn để tiếp tục</p>
            </>
          )}

          {view === 'forgot' && (
            <>
              <h2 className="text-2xl text-[#1D4ED8] mb-2" style={{ fontWeight: 700 }}>Quên mật khẩu</h2>
              <p className="text-sm text-[#6B7A8D] mb-8">Nhập email để nhận mã OTP xác thực khôi phục mật khẩu</p>
            </>
          )}

          {view === 'reset' && (
            <>
              <h2 className="text-2xl text-[#1D4ED8] mb-2" style={{ fontWeight: 700 }}>Đặt lại mật khẩu</h2>
              <p className="text-sm text-[#6B7A8D] mb-8">Nhập mã OTP đã nhận được trong email và mật khẩu mới của bạn</p>
            </>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
              {successMessage}
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm text-[#6B7A8D] mb-1.5 block">Địa Chỉ Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="ten@congty.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] mb-1.5 block">Mật Khẩu</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-10 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A8D] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-[#6B7A8D] cursor-pointer">
                  <input type="checkbox" className="rounded accent-[#06B6D4]" />
                  Ghi nhớ đăng nhập
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-sm text-[#06B6D4] hover:underline cursor-pointer bg-none border-none p-0 outline-none"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1D4ED8] text-white py-3 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Đăng Nhập"}
              </button>
            </form>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-sm text-[#6B7A8D] mb-1.5 block">Địa Chỉ Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="ten@congty.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1D4ED8] text-white py-3 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Gửi Mã OTP"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="w-full bg-white border border-[#E3E8EF] text-[#6B7A8D] py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm"
              >
                Quay lại đăng nhập
              </button>
            </form>
          )}

          {view === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-sm text-[#6B7A8D] mb-1.5 block">Địa Chỉ Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="ten@congty.com"
                    value={email}
                    disabled
                    className="w-full bg-slate-100 border border-[#E3E8EF] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none cursor-not-allowed text-[#6B7A8D]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] mb-1.5 block">Mã OTP (6 chữ số)</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nhập mã OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] mb-1.5 block">Mật Khẩu Mới</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-10 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A8D] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-[#6B7A8D] mb-1.5 block">Xác Nhận Mật Khẩu Mới</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B7A8D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg pl-10 pr-10 py-2.5 text-sm outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7A8D] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1D4ED8] text-white py-3 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setView('forgot');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="w-full bg-white border border-[#E3E8EF] text-[#6B7A8D] py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-sm"
              >
                Quay lại gửi mã OTP
              </button>
            </form>
          )}

          {view === 'login' && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E3E8EF]" />
                <span className="text-xs text-[#6B7A8D]">hoặc đăng nhập bằng</span>
                <div className="flex-1 h-px bg-[#E3E8EF]" />
              </div>

              <div className="w-full flex justify-center">
                <div id="google-signin-btn" className="w-full"></div>
              </div>

              <p className="text-center text-sm text-[#6B7A8D] mt-8">
                Chưa có tài khoản?{" "}
                <button onClick={() => navigate("/register")} className="text-[#06B6D4] hover:underline cursor-pointer" style={{ fontWeight: 500 }}>
                  Tạo tài khoản
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
