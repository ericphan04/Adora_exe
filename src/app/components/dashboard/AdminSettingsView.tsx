import React, { useState } from "react";
import {
  Cog,
  Percent,
  CreditCard,
  Bell,
  Shield,
  Globe2,
  Database,
  Mail,
  KeyRound,
  ToggleLeft,
  Save,
  Server,
} from "lucide-react";
import { useThemeContext } from "../../context/ThemeContext";
import { notify } from "../../utils/notify";

const sections = [
  { id: "platform", label: "Nền tảng", icon: <Cog className="w-4 h-4" /> },
  { id: "commission", label: "Hoa hồng & phí", icon: <Percent className="w-4 h-4" /> },
  { id: "payments", label: "Thanh toán", icon: <CreditCard className="w-4 h-4" /> },
  { id: "notifications", label: "Thông báo", icon: <Bell className="w-4 h-4" /> },
  { id: "security", label: "Bảo mật", icon: <Shield className="w-4 h-4" /> },
  { id: "system", label: "Hệ thống", icon: <Server className="w-4 h-4" /> },
] as const;

type SectionId = (typeof sections)[number]["id"];

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <label className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[#E3E8EF] hover:border-[#1D4ED8]/30 cursor-pointer transition-colors">
      <div>
        <p className="text-sm font-semibold text-[#1E293B]">{label}</p>
        {desc && <p className="text-xs text-[#6B7A8D] mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors cursor-pointer ${
          checked ? "bg-[#1D4ED8]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </label>
  );
}

export function AdminSettingsView() {
  const { theme, setTheme, resolvedTheme } = useThemeContext();
  const [activeSection, setActiveSection] = useState<SectionId>("platform");
  const [commissionRate, setCommissionRate] = useState(5);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [disputeAlerts, setDisputeAlerts] = useState(true);
  const handleSave = () => {
    notify.success("Đã lưu cài đặt hệ thống");
  };

  return (
    <div className="p-8 flex flex-col lg:flex-row gap-6">
      <aside className="lg:w-56 shrink-0">
        <div className="bg-white rounded-xl border border-[#E3E8EF] p-2 sticky top-4">
          <p className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-[#6B7A8D]">
            Cài đặt hệ thống
          </p>
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
        {activeSection === "platform" && (
          <>
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <h3 className="text-[#1D4ED8] font-bold mb-1">Cấu hình nền tảng</h3>
              <p className="text-xs text-[#6B7A8D] mb-5">
                Thiết lập chung cho marketplace ADORA
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs text-[#6B7A8D] font-medium">
                    Tên hiển thị
                  </label>
                  <input
                    defaultValue="ADORA Marketplace"
                    className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[#E3E8EF] focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#6B7A8D] font-medium">
                    Email hỗ trợ
                  </label>
                  <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#E3E8EF]">
                    <Mail className="w-4 h-4 text-[#9CA3AF]" />
                    <input
                      defaultValue="support@adora.vn"
                      className="flex-1 bg-transparent focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Toggle
                  checked={maintenanceMode}
                  onChange={setMaintenanceMode}
                  label="Chế độ bảo trì"
                  desc="Tạm khóa đặt chỗ mới, chỉ Admin truy cập"
                />
                <Toggle
                  checked={autoApprove}
                  onChange={setAutoApprove}
                  label="Tự động duyệt tin (thử nghiệm)"
                  desc="Tin đăng đạt tiêu chí sẽ được duyệt tự động"
                />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <h3 className="text-sm font-bold text-[#1E293B] mb-3">Giao diện admin</h3>
              <div className="flex gap-2">
                {(["light", "dark", "system"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border ${
                      theme === t
                        ? "border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]"
                        : "border-[#E3E8EF] text-[#6B7A8D] hover:bg-slate-50"
                    }`}
                  >
                    {t === "light" ? "Sáng" : t === "dark" ? "Tối" : "Hệ thống"}
                    {theme === t && resolvedTheme && (
                      <span className="ml-1 opacity-60">({resolvedTheme})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeSection === "commission" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-5 h-5 text-[#1D4ED8]" />
              <h3 className="text-[#1D4ED8] font-bold">Hoa hồng & phí sàn</h3>
            </div>
            <p className="text-xs text-[#6B7A8D] mb-6">
              Theo quy tắc ADORA: phí nền tảng mặc định 5% trên booking thành công
            </p>
            <div className="max-w-md">
              <label className="text-xs text-[#6B7A8D] font-medium">
                Tỷ lệ hoa hồng (%)
              </label>
              <div className="flex items-center gap-4 mt-2">
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="flex-1 accent-[#1D4ED8]"
                />
                <span className="text-2xl font-bold text-[#1D4ED8] w-14 text-center">
                  {commissionRate}%
                </span>
              </div>
              <p className="text-[11px] text-amber-700 mt-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                Thay đổi tỷ lệ chỉ áp dụng cho booking mới. Cần xác nhận pháp lý trước khi lưu.
              </p>
            </div>
          </div>
        )}

        {activeSection === "payments" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-4">
            <h3 className="text-[#1D4ED8] font-bold">Cổng thanh toán VNPay</h3>
            {[
              { label: "TMN Code", placeholder: "ADORA00XX" },
              { label: "Hash Secret", placeholder: "••••••••••••", secret: true },
              { label: "Return URL", placeholder: "https://adora.vn/payment/status" },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs text-[#6B7A8D] font-medium">{f.label}</label>
                <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#E3E8EF]">
                  <KeyRound className="w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type={f.secret ? "password" : "text"}
                    placeholder={f.placeholder}
                    className="flex-1 bg-transparent focus:outline-none text-sm"
                  />
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-800">
              <ToggleLeft className="w-4 h-4" />
              VNPay đang ở chế độ sandbox — chuyển production khi go-live
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-2">
            <h3 className="text-[#1D4ED8] font-bold mb-4">Thông báo quản trị</h3>
            <Toggle
              checked={emailAlerts}
              onChange={setEmailAlerts}
              label="Email tổng hợp hàng ngày"
              desc="GMV, booking mới, khiếu nại chờ xử lý"
            />
            <Toggle
              checked={disputeAlerts}
              onChange={setDisputeAlerts}
              label="Cảnh báo khiếu nại khẩn"
              desc="Gửi ngay khi có báo cáo ưu tiên cao"
            />
          </div>
        )}

        {activeSection === "security" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-4">
            <h3 className="text-[#1D4ED8] font-bold">Bảo mật & tuân thủ</h3>
            <Toggle
              checked={true}
              onChange={() => {}}
              label="Bắt buộc JWT cho mọi API"
              desc="Đã bật — không thể tắt trên production"
            />
            <button
              type="button"
              className="w-full text-left px-4 py-3 rounded-xl border border-[#E3E8EF] hover:border-[#1D4ED8]/40 text-sm font-semibold text-[#1D4ED8] cursor-pointer"
            >
              Xoay khóa JWT & API secrets
            </button>
            <button
              type="button"
              className="w-full text-left px-4 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold cursor-pointer"
            >
              Buộc đăng xuất tất cả phiên Admin
            </button>
          </div>
        )}

        {activeSection === "system" && (
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 space-y-4">
            <h3 className="text-[#1D4ED8] font-bold">Hệ thống & dữ liệu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

              <div>
                <label className="text-xs text-[#6B7A8D]">Múi giờ</label>
                <select className="mt-1 w-full px-3 py-2.5 rounded-lg border border-[#E3E8EF]">
                  <option>Asia/Ho_Chi_Minh (GMT+7)</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-[#E3E8EF] hover:bg-slate-50 text-sm cursor-pointer"
            >
              <span className="flex items-center gap-2 font-medium">
                <Database className="w-4 h-4 text-[#1D4ED8]" />
                Sao lưu cơ sở dữ liệu
              </span>
              <span className="text-xs text-[#6B7A8D]">Lần cuối: hôm nay 02:00</span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1D4ED8] text-white text-sm font-bold hover:bg-[#1E40AF] cursor-pointer shadow-sm"
          >
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
