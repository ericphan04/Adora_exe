import React, { useState } from "react";
import {
  SunMedium,
  MoonStar,
  Palette,
  Type,
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  LogOut,
  Bell,
  Globe2,
  Clock3,
  CalendarClock,
  CreditCard,
  MapPin,
  KeyRound,
  Database,
  Download,
  Building2,
} from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import authApi from "../api/authApi";
import { notify, apiErrorMessage } from "../utils/notify";

const sections = [
  { id: "appearance", label: "Giao diện" },
  { id: "account", label: "Thông tin tài khoản" },
  { id: "security", label: "Bảo mật" },
  { id: "notifications", label: "Thông báo" },
  { id: "system", label: "Cài đặt hệ thống" },
  { id: "integrations", label: "Tích hợp" },
  { id: "data", label: "Quản lý dữ liệu" },
] as const;

type SectionId = (typeof sections)[number]["id"];

export default function AdvertiserSettings() {
  const [activeSection, setActiveSection] = useState<SectionId>("appearance");
  const [isDark, setIsDark] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#1D4ED8");
  const [fontSize, setFontSize] = useState("medium");
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const baseBg = isDark ? "bg-slate-950" : "bg-[#F0F9FF]";
  const pageText = isDark ? "text-slate-100" : "text-slate-900";
  const cardBg = isDark ? "bg-slate-900" : "bg-white";
  const cardBorder = isDark ? "border-slate-700" : "border-[#E3E8EF]";
  const subtleText = isDark ? "text-slate-400" : "text-[#6B7A8D]";

  return (
    <div className={`flex h-screen ${baseBg}`}>
      <DashboardSidebar role="advertiser" />
      <main className={`flex-1 overflow-y-auto ${pageText}`}>
        {/* Header */}
        <div
          className={`${cardBg} border-b ${cardBorder} px-8 py-5 flex items-center justify-between`}
        >
          <div>
            <h1
              className="text-xl"
              style={{ fontWeight: 700, color: primaryColor }}
            >
              Cài Đặt Tài Khoản
            </h1>
            <p className={`text-sm mt-0.5 ${subtleText}`}>
              Tùy chỉnh giao diện, bảo mật và cách hệ thống hoạt động theo nhu
              cầu của bạn.
            </p>
          </div>

          {/* Light / Dark toggle */}
          <div className="flex items-center gap-3">
            <span className={`text-xs ${subtleText}`}>Chế độ giao diện</span>
            <button
              onClick={() => setIsDark((v) => !v)}
              className={`relative flex items-center w-24 h-9 rounded-full border ${cardBorder} cursor-pointer px-1 transition-colors ${
                isDark ? "bg-slate-800" : "bg-[#EEF2FF]"
              }`}
            >
              <div
                className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-white shadow-sm transform transition-transform ${
                  isDark ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <div className="relative flex-1 flex items-center justify-center gap-1 text-[11px]">
                <SunMedium
                  className={`w-3.5 h-3.5 ${
                    !isDark ? "text-[#F59E0B]" : "text-slate-400"
                  }`}
                />
                <span className={!isDark ? "font-medium" : ""}>Light</span>
              </div>
              <div className="relative flex-1 flex items-center justify-center gap-1 text-[11px]">
                <MoonStar
                  className={`w-3.5 h-3.5 ${
                    isDark ? "text-[#6366F1]" : "text-slate-400"
                  }`}
                />
                <span className={isDark ? "font-medium" : ""}>Dark</span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-8 flex gap-6">
          {/* Settings sidebar */}
          <aside
            className={`${cardBg} ${cardBorder} border rounded-xl w-64 py-4`}
          >
            <div className="px-4 pb-2 text-xs uppercase tracking-wide font-medium text-[#6B7A8D]">
              Mục cài đặt
            </div>
            <nav className="mt-1">
              {sections.map((s) => {
                const isActive = s.id === activeSection;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[#EEF2FF] text-[#1D4ED8]"
                        : subtleText + " hover:bg-slate-100/10"
                    }`}
                    style={isActive ? { fontWeight: 600 } : {}}
                  >
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <section className="flex-1 space-y-5">
            {activeSection === "appearance" && (
              <div
                className={`${cardBg} border ${cardBorder} rounded-xl p-5 space-y-4`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Palette className="w-4 h-4 text-[#4F46E5]" />
                  <h2 className="text-sm" style={{ fontWeight: 600 }}>
                    Giao Diện & Màu Sắc
                  </h2>
                </div>
                <p className={`text-xs ${subtleText}`}>
                  Tùy chỉnh giao diện hiển thị và màu chủ đạo để phù hợp với
                  thương hiệu của bạn.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2 text-sm">
                    <label className={subtleText}>Màu chủ đạo</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-slate-300 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className={`flex-1 px-3 py-2 rounded-lg border ${cardBorder} text-xs bg-transparent focus:outline-none focus:border-[#4F46E5]`}
                      />
                    </div>
                    <p className={`text-[11px] mt-1 ${subtleText}`}>
                      * Thay đổi này chỉ là mô phỏng UI. Màu thực tế sẽ được áp
                      dụng khi tích hợp hệ thống theme toàn cục.
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <label className={subtleText}>Kích thước giao diện</label>
                    <div className="flex gap-2">
                      {[
                        { id: "small", label: "Nhỏ" },
                        { id: "medium", label: "Trung bình" },
                        { id: "large", label: "Lớn" },
                      ].map((o) => (
                        <button
                          key={o.id}
                          onClick={() => setFontSize(o.id)}
                          className={`flex-1 px-3 py-2 rounded-lg border text-xs cursor-pointer flex items-center justify-center gap-1 ${
                            fontSize === o.id
                              ? "border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]"
                              : cardBorder + " " + subtleText + " bg-transparent"
                          }`}
                        >
                          <Type className="w-3 h-3" />
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "account" && (
              <div
                className={`${cardBg} border ${cardBorder} rounded-xl p-5 space-y-4`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-[#4F46E5]" />
                  <h2 className="text-sm" style={{ fontWeight: 600 }}>
                    Thông Tin Tài Khoản
                  </h2>
                </div>
                <p className={`text-xs ${subtleText}`}>
                  Cập nhật thông tin cá nhân được hiển thị cho các đối tác và
                  trong hóa đơn.
                </p>

                <div className="flex flex-col md:flex-row gap-5 mt-2">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1D4ED8] to-[#7C3AED] flex items-center justify-center text-white text-xl">
                      TH
                    </div>
                    <button className="text-xs px-3 py-1.5 rounded-lg border border-dashed border-[#4F46E5] text-[#4F46E5] cursor-pointer">
                      Đổi ảnh đại diện
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1.5">
                      <label className={subtleText}>Tên người dùng</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-transparent">
                        <User className="w-4 h-4 text-[#9CA3AF]" />
                        <input
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          defaultValue="Nguyễn Thanh Hà"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={subtleText}>Email</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-transparent">
                        <Mail className="w-4 h-4 text-[#9CA3AF]" />
                        <input
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          defaultValue="thanhha.agency@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={subtleText}>Số điện thoại</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-transparent">
                        <Phone className="w-4 h-4 text-[#9CA3AF]" />
                        <input
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          defaultValue="+84 909 123 456"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className={subtleText}>Công ty / Thương hiệu</label>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-transparent">
                        <Building2 className="w-4 h-4 text-[#9CA3AF]" />
                        <input
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          defaultValue="Adora Media"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <button className="px-4 py-2 rounded-lg bg-[#1D4ED8] text-white text-sm hover:bg-[#1E40AF] cursor-pointer">
                    Cập Nhật Thông Tin
                  </button>
                </div>
              </div>
            )}

            {activeSection === "security" && (
              <div
                className={`${cardBg} border ${cardBorder} rounded-xl p-5 space-y-4`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#4F46E5]" />
                  <h2 className="text-sm" style={{ fontWeight: 600 }}>
                    Bảo Mật Tài Khoản
                  </h2>
                </div>
                <p className={`text-xs ${subtleText}`}>
                  Tăng cường bảo mật cho tài khoản bằng mật khẩu mạnh và xác
                  thực hai bước.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#4F46E5]" />
                        Đổi mật khẩu
                      </p>
                      <p className={`text-[11px] ${subtleText}`}>
                        Mật khẩu nên dài ít nhất 8 ký tự, có chữ hoa, chữ thường,
                        số và ký tự đặc biệt.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowChangePasswordForm((prev) => !prev)}
                      className="w-full px-3 py-2 rounded-lg border border-[#4F46E5] text-xs text-[#4F46E5] cursor-pointer hover:bg-[#EEF2FF]"
                    >
                      {showChangePasswordForm ? "Ẩn form đổi mật khẩu" : "Đổi mật khẩu hiện tại"}
                    </button>
                    {showChangePasswordForm && (
                      <div className="space-y-3 p-4 rounded-xl border border-[#E3E8EF] bg-slate-50">
                        <div className="space-y-1 text-sm">
                          <label className={subtleText}>Mật khẩu hiện tại</label>
                          <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#4F46E5]"
                          />
                        </div>
                        <div className="space-y-1 text-sm">
                          <label className={subtleText}>Mật khẩu mới</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#4F46E5]"
                          />
                        </div>
                        <div className="space-y-1 text-sm">
                          <label className={subtleText}>Xác nhận mật khẩu</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-[#D1D5DB] bg-white text-sm focus:outline-none focus:border-[#4F46E5]"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={isChangingPassword}
                          onClick={async () => {
                            if (!oldPassword || !newPassword || !confirmPassword) {
                              notify.error("Vui lòng điền đầy đủ thông tin");
                              return;
                            }
                            if (newPassword !== confirmPassword) {
                              notify.error("Mật khẩu mới và xác nhận không khớp");
                              return;
                            }
                            if (newPassword.length < 8) {
                              notify.error("Mật khẩu mới phải có ít nhất 8 ký tự");
                              return;
                            }

                            setIsChangingPassword(true);
                            try {
                              await authApi.changePassword({ oldPassword, newPassword });
                              setOldPassword("");
                              setNewPassword("");
                              setConfirmPassword("");
                              setShowChangePasswordForm(false);
                              notify.success("Đổi mật khẩu thành công");
                            } catch (error) {
                              notify.error(apiErrorMessage(error));
                            } finally {
                              setIsChangingPassword(false);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-[#1D4ED8] text-white text-xs font-semibold hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isChangingPassword ? "Đang cập nhật..." : "Lưu mật khẩu mới"}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Xác thực hai bước (2FA)
                    </p>
                    <button className="px-3 py-2 rounded-lg border border-slate-400 text-xs cursor-pointer hover:bg-slate-100/10">
                      Bật 2FA qua ứng dụng Authenticator
                    </button>
                    <p className={`text-[11px] ${subtleText}`}>
                      Khi bật 2FA, bạn sẽ cần mã xác thực mỗi khi đăng nhập từ
                      thiết bị mới.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-[#EF4444]" />
                      Quản lý phiên đăng nhập
                    </p>
                    <button className="px-3 py-2 rounded-lg border border-[#EF4444] text-xs text-[#EF4444] cursor-pointer hover:bg-[#FEF2F2]">
                      Đăng xuất khỏi tất cả thiết bị
                    </button>
                    <p className={`text-[11px] ${subtleText}`}>
                      Hữu ích khi bạn nghi ngờ tài khoản bị truy cập ở nơi
                      khác.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "notifications" && (
              <div
                className={`${cardBg} border ${cardBorder} rounded-xl p-5 space-y-4`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4 text-[#4F46E5]" />
                  <h2 className="text-sm" style={{ fontWeight: 600 }}>
                    Thông Báo
                  </h2>
                </div>
                <p className={`text-xs ${subtleText}`}>
                  Chọn những loại thông báo bạn muốn nhận qua email hoặc trong
                  hệ thống.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-2">
                  {[
                    {
                      label: "Thông báo email",
                      desc: "Gửi tóm tắt hoạt động và báo cáo định kỳ.",
                    },
                    {
                      label: "Chiến dịch mới",
                      desc: "Khi có chiến dịch mới được tạo hoặc duyệt.",
                    },
                    {
                      label: "Hóa đơn & thanh toán",
                      desc: "Khi có hóa đơn mới, sắp đến hạn hoặc đã thanh toán.",
                    },
                    {
                      label: "Tin nhắn từ khách hàng",
                      desc: "Khi có hội thoại mới hoặc tin nhắn chưa đọc.",
                    },
                  ].map((n, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 px-3 py-2 rounded-lg border cursor-pointer ${
                        cardBorder
                      } hover:bg-slate-100/10`}
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mt-1 accent-[#4F46E5]"
                      />
                      <div>
                        <p
                          className="text-xs"
                          style={{ fontWeight: 500 }}
                        >
                          {n.label}
                        </p>
                        <p className={`text-[11px] mt-0.5 ${subtleText}`}>
                          {n.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeSection === "system" && (
              <div
                className={`${cardBg} border ${cardBorder} rounded-xl p-5 space-y-4`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Globe2 className="w-4 h-4 text-[#4F46E5]" />
                  <h2 className="text-sm" style={{ fontWeight: 600 }}>
                    Cài Đặt Hệ Thống
                  </h2>
                </div>
                <p className={`text-xs ${subtleText}`}>
                  Định cấu hình ngôn ngữ, múi giờ và định dạng ngày giờ.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">

                  <div className="space-y-1.5">
                    <label className={subtleText}>Múi giờ</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-transparent">
                      <Clock3 className="w-4 h-4 text-[#9CA3AF]" />
                      <select className="flex-1 bg-transparent text-sm focus:outline-none">
                        <option>(GMT+7) Asia/Ho_Chi_Minh</option>
                        <option>(GMT+9) Asia/Tokyo</option>
                        <option>(GMT+1) Europe/Berlin</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={subtleText}>Định dạng ngày giờ</label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-transparent">
                      <CalendarClock className="w-4 h-4 text-[#9CA3AF]" />
                      <select className="flex-1 bg-transparent text-sm focus:outline-none">
                        <option>dd/MM/yyyy · 24h</option>
                        <option>MM/dd/yyyy · 12h</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "integrations" && (
              <div
                className={`${cardBg} border ${cardBorder} rounded-xl p-5 space-y-4`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-[#4F46E5]" />
                  <h2 className="text-sm" style={{ fontWeight: 600 }}>
                    Tích Hợp Hệ Thống
                  </h2>
                </div>
                <p className={`text-xs ${subtleText}`}>
                  Kết nối với các dịch vụ thanh toán, bản đồ và hệ thống bên
                  ngoài.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Cổng thanh toán</p>
                    {["VNPay", "Stripe", "PayPal"].map((p) => (
                      <div
                        key={p}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border ${cardBorder}`}
                      >
                        <span>{p}</span>
                        <button className="px-2 py-1 rounded-lg text-[11px] border border-[#4F46E5] text-[#4F46E5] cursor-pointer">
                          Kết nối
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Google Maps & API</p>
                    <div className="space-y-2 text-[12px]">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-transparent">
                        <MapPin className="w-4 h-4 text-[#9CA3AF]" />
                        <input
                          className="flex-1 bg-transparent focus:outline-none"
                          placeholder="Google Maps API key..."
                        />
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-transparent">
                        <KeyRound className="w-4 h-4 text-[#9CA3AF]" />
                        <input
                          className="flex-1 bg-transparent focus:outline-none"
                          placeholder="External system API key..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "data" && (
              <div
                className={`${cardBg} border ${cardBorder} rounded-xl p-5 space-y-4`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-[#4F46E5]" />
                  <h2 className="text-sm" style={{ fontWeight: 600 }}>
                    Quản Lý Dữ Liệu
                  </h2>
                </div>
                <p className={`text-xs ${subtleText}`}>
                  Xuất dữ liệu chiến dịch, hóa đơn và sao lưu dữ liệu hệ thống.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Xuất dữ liệu</p>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer hover:bg-slate-100/10">
                      <span>Xuất dữ liệu chiến dịch</span>
                      <Download className="w-4 h-4 text-[#4F46E5]" />
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer hover:bg-slate-100/10">
                      <span>Xuất danh sách hóa đơn</span>
                      <Download className="w-4 h-4 text-[#4F46E5]" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Sao lưu & khôi phục</p>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer hover:bg-slate-100/10">
                      <span>Tạo bản sao lưu mới</span>
                      <Database className="w-4 h-4 text-[#4F46E5]" />
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer hover:bg-slate-100/10">
                      <span>Khôi phục từ bản sao lưu</span>
                      <Database className="w-4 h-4 text-[#4F46E5]" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

