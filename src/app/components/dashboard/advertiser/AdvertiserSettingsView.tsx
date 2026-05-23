import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Save,
  Globe2,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useThemeContext } from "../../../context/ThemeContext";
import { notify } from "../../../utils/notify";

const sections = [
  { id: "profile", label: "Hồ sơ", icon: <User className="w-4 h-4" /> },
  { id: "billing", label: "Thanh toán", icon: <CreditCard className="w-4 h-4" /> },
  { id: "notifications", label: "Thông báo", icon: <Bell className="w-4 h-4" /> },
  { id: "appearance", label: "Giao diện", icon: <Palette className="w-4 h-4" /> },
  { id: "security", label: "Bảo mật", icon: <Shield className="w-4 h-4" /> },
] as const;

type SectionId = (typeof sections)[number]["id"];

export function AdvertiserSettingsView() {
  const { user } = useAuth();
  const { theme, setTheme } = useThemeContext();
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [emailBooking, setEmailBooking] = useState(true);
  const [emailInvoice, setEmailInvoice] = useState(true);

  const initials = (user?.fullName ?? "QC")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = () => notify.success("Đã lưu cài đặt tài khoản");

  return (
    <div className="p-8 flex flex-col lg:flex-row gap-6">
      <aside className="lg:w-56 shrink-0">
        <div className="bg-white rounded-xl border border-[#E3E8EF] p-2 sticky top-4">
          <div className="px-3 py-3 flex items-center gap-3 border-b border-[#E3E8EF] mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#1D4ED8] text-white text-sm font-bold flex items-center justify-center">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1E293B] truncate">
                {user?.fullName ?? "Nhà quảng cáo"}
              </p>
              <p className="text-[10px] text-[#6B7A8D]">RENTER</p>
            </div>
          </div>
          <nav className="space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                  activeSection === s.id
                    ? "bg-[#EFF6FF] text-[#1D4ED8] font-semibold"
                    : "text-[#6B7A8D] hover:bg-slate-50"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex-1 space-y-5 min-w-0">
        {activeSection === "profile" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
            <h3 className="text-[#1D4ED8] font-bold mb-4">Thông tin nhà quảng cáo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { label: "Họ tên", icon: User, value: user?.fullName ?? "" },
                { label: "Email", icon: Mail, value: user?.email ?? "" },
                { label: "Điện thoại", icon: Phone, value: user?.phone ?? "" },
                { label: "Công ty / thương hiệu", icon: Building2, value: user?.companyName ?? "" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs text-[#6B7A8D]">{f.label}</label>
                  <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#E3E8EF]">
                    <f.icon className="w-4 h-4 text-[#9CA3AF]" />
                    <input defaultValue={f.value} className="flex-1 bg-transparent focus:outline-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "billing" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-4">
            <h3 className="text-[#1D4ED8] font-bold">Thanh toán & hóa đơn</h3>
            <p className="text-xs text-[#6B7A8D]">
              ADORA hỗ trợ thanh toán qua VNPay cho các booking đã được chủ bảng chấp nhận.
            </p>
            <div className="p-4 rounded-xl border border-[#E3E8EF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8] font-bold text-xs">
                  VN
                </div>
                <div>
                  <p className="text-sm font-semibold">VNPay</p>
                  <p className="text-xs text-emerald-600">Đã kết nối</p>
                </div>
              </div>
              <span className="text-xs text-[#6B7A8D]">Mặc định</span>
            </div>
            <div>
              <label className="text-xs text-[#6B7A8D]">Mã số thuế (xuất HĐ)</label>
              <input
                placeholder="0123456789"
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[#E3E8EF] text-sm focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-3">
            <h3 className="text-[#1D4ED8] font-bold mb-2">Thông báo</h3>
            {[
              { label: "Cập nhật đặt chỗ", checked: emailBooking, set: setEmailBooking },
              { label: "Hóa đơn & thanh toán", checked: emailInvoice, set: setEmailInvoice },
            ].map((n) => (
              <label
                key={n.label}
                className="flex justify-between items-center p-4 rounded-xl border border-[#E3E8EF] cursor-pointer"
              >
                <span className="text-sm font-medium">{n.label}</span>
                <input
                  type="checkbox"
                  checked={n.checked}
                  onChange={(e) => n.set(e.target.checked)}
                  className="w-5 h-5 accent-[#1D4ED8] cursor-pointer"
                />
              </label>
            ))}
          </div>
        )}

        {activeSection === "appearance" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
            <h3 className="text-[#1D4ED8] font-bold mb-4">Giao diện</h3>
            <div className="flex gap-2 mb-4">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border ${
                    theme === t
                      ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]"
                      : "border-[#E3E8EF] text-[#6B7A8D]"
                  }`}
                >
                  {t === "light" ? "Sáng" : t === "dark" ? "Tối" : "Hệ thống"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B7A8D]">
              <Globe2 className="w-4 h-4" />
              Ngôn ngữ: Tiếng Việt
            </div>
          </div>
        )}

        {activeSection === "security" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-3">
            <h3 className="text-[#1D4ED8] font-bold">Bảo mật</h3>
            <button
              type="button"
              className="w-full text-left px-4 py-3 rounded-xl border border-[#E3E8EF] text-sm font-semibold text-[#1D4ED8] cursor-pointer hover:border-[#1D4ED8]/40"
            >
              Đổi mật khẩu
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-3 rounded-xl border border-[#E3E8EF] text-sm font-semibold cursor-pointer hover:border-[#1D4ED8]/40"
            >
              Bật xác thực hai bước (2FA)
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1D4ED8] text-white text-sm font-bold hover:bg-[#1E40AF] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
