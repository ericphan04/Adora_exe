import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Monitor,
  Save,
  Landmark,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useThemeContext } from "../../context/ThemeContext";
import { notify } from "../../utils/notify";

const sections = [
  { id: "profile", label: "Hồ sơ", icon: <User className="w-4 h-4" /> },
  { id: "payout", label: "Thanh toán", icon: <CreditCard className="w-4 h-4" /> },
  { id: "listings", label: "Tin đăng mặc định", icon: <Monitor className="w-4 h-4" /> },
  { id: "notifications", label: "Thông báo", icon: <Bell className="w-4 h-4" /> },
  { id: "security", label: "Bảo mật", icon: <Shield className="w-4 h-4" /> },
] as const;

type SectionId = (typeof sections)[number]["id"];

export function OwnerSettingsView() {
  const { user } = useAuth();
  const { theme, setTheme } = useThemeContext();
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  const initials = (user?.fullName ?? "OS")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = () => {
    notify.success("Đã lưu cài đặt");
  };

  return (
    <div className="p-8 flex flex-col lg:flex-row gap-6">
      <aside className="lg:w-56 shrink-0">
        <div className="bg-white rounded-xl border border-[#E3E8EF] p-2 sticky top-4">
          <div className="px-3 py-3 flex items-center gap-3 border-b border-[#E3E8EF] mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] text-white text-sm font-bold flex items-center justify-center">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1E293B] truncate">
                {user?.fullName ?? "Chủ bảng"}
              </p>
              <p className="text-[10px] text-[#6B7A8D]">OWNER</p>
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
            <h3 className="text-[#1D4ED8] font-bold mb-4">Thông tin chủ sở hữu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { label: "Họ tên", icon: User, value: user?.fullName ?? "" },
                { label: "Email", icon: Mail, value: user?.email ?? "" },
                { label: "Điện thoại", icon: Phone, value: user?.phone ?? "+84" },
                { label: "Công ty / thương hiệu", icon: Building2, value: "Billboard Co." },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs text-[#6B7A8D] font-medium">{f.label}</label>
                  <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#E3E8EF]">
                    <f.icon className="w-4 h-4 text-[#9CA3AF]" />
                    <input
                      defaultValue={f.value}
                      className="flex-1 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#E3E8EF]">
              <p className="text-xs text-[#6B7A8D] mb-2">Giao diện</p>
              <div className="flex gap-2">
                {(["light", "dark", "system"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                      theme === t
                        ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]"
                        : "border-[#E3E8EF] text-[#6B7A8D]"
                    }`}
                  >
                    {t === "light" ? "Sáng" : t === "dark" ? "Tối" : "Hệ thống"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "payout" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#1D4ED8]" />
              <h3 className="text-[#1D4ED8] font-bold">Tài khoản nhận tiền</h3>
            </div>
            <p className="text-xs text-[#6B7A8D]">
              ADORA chuyển doanh thu ròng (sau 5% phí) vào tài khoản này trong 3 ngày làm việc.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs text-[#6B7A8D]">Ngân hàng</label>
                <select className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[#E3E8EF]">
                  <option>Vietcombank</option>
                  <option>Techcombank</option>
                  <option>MB Bank</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#6B7A8D]">Số tài khoản</label>
                <input
                  defaultValue="0123456789"
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[#E3E8EF] focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-[#6B7A8D]">Chủ tài khoản</label>
                <input
                  defaultValue={user?.fullName ?? ""}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[#E3E8EF] focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-xs text-[#0369A1]">
              Thông tin ngân hàng được mã hóa. Cập nhật có hiệu lực từ kỳ chi trả tiếp theo.
            </div>
          </div>
        )}

        {activeSection === "listings" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
            <h3 className="text-[#1D4ED8] font-bold mb-4">Mặc định khi đăng tin</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs text-[#6B7A8D]">Giờ hoạt động mặc định</label>
                <input
                  defaultValue="06:00 - 23:00"
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[#E3E8EF]"
                />
              </div>
              <div>
                <label className="text-xs text-[#6B7A8D]">Loại màn hình</label>
                <select className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[#E3E8EF]">
                  <option>LED Outdoor</option>
                  <option>LED Indoor</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#6B7A8D]">Tự động chấp nhận đặt chỗ</label>
                <select className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[#E3E8EF]">
                  <option>Không — duyệt thủ công</option>
                  <option>Có — với khách đã xác minh</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#6B7A8D]">Chính sách hủy</label>
                <select className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[#E3E8EF]">
                  <option>Linh hoạt (7 ngày)</option>
                  <option>Vừa phải (14 ngày)</option>
                  <option>Nghiêm (30 ngày)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-3">
            <h3 className="text-[#1D4ED8] font-bold mb-2">Thông báo</h3>
            {[
              {
                label: "Yêu cầu đặt chỗ mới",
                checked: bookingAlerts,
                set: setBookingAlerts,
                desc: "Khi nhà quảng cáo gửi booking",
              },
              {
                label: "Thanh toán & chi trả",
                checked: paymentAlerts,
                set: setPaymentAlerts,
                desc: "Khi khách thanh toán hoặc ADORA chuyển tiền",
              },
            ].map((n) => (
              <label
                key={n.label}
                className="flex items-center justify-between p-4 rounded-xl border border-[#E3E8EF] cursor-pointer hover:border-[#1D4ED8]/30"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">{n.label}</p>
                  <p className="text-xs text-[#6B7A8D]">{n.desc}</p>
                </div>
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

        {activeSection === "security" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-3">
            <h3 className="text-[#1D4ED8] font-bold">Bảo mật</h3>
            <button
              type="button"
              className="w-full text-left px-4 py-3 rounded-xl border border-[#E3E8EF] hover:border-[#1D4ED8]/40 text-sm font-semibold text-[#1D4ED8] cursor-pointer"
            >
              Đổi mật khẩu
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-3 rounded-xl border border-[#E3E8EF] hover:border-[#1D4ED8]/40 text-sm font-semibold cursor-pointer"
            >
              Bật xác thực hai bước (2FA)
            </button>
          </div>
        )}

        <div className="flex justify-end items-center gap-3">
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
