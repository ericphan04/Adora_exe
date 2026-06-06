import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useThemeContext } from "../../../context/ThemeContext";
import { notify, apiErrorMessage } from "../../../utils/notify";
import authApi from "../../../../api/authApi";
import axiosClient from "../../../../api/axiosClient";

const sections = [
  { id: "profile", label: "Hồ sơ", icon: <User className="w-4 h-4" /> },
  { id: "billing", label: "Thanh toán", icon: <CreditCard className="w-4 h-4" /> },
  { id: "notifications", label: "Thông báo", icon: <Bell className="w-4 h-4" /> },
  { id: "appearance", label: "Giao diện", icon: <Palette className="w-4 h-4" /> },
  { id: "security", label: "Bảo mật", icon: <Shield className="w-4 h-4" /> },
] as const;

type SectionId = (typeof sections)[number]["id"];

export function AdvertiserSettingsView() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useThemeContext();
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [emailBooking, setEmailBooking] = useState(true);
  const [emailInvoice, setEmailInvoice] = useState(true);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [companyName, setCompanyName] = useState(user?.companyName ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "");
      setPhone(user.phone ?? "");
      setCompanyName(user.companyName ?? "");
    }
  }, [user]);

  const initials = (fullName || user?.fullName || "QC")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authApi.updateProfile({
        fullName,
        phone,
        companyName,
      });
      if (res.success) {
        await refreshUser();
        notify.success("Cập nhật thông tin thành công");
      } else {
        notify.error(res.message || "Không thể cập nhật hồ sơ");
      }
    } catch (err) {
      notify.error(apiErrorMessage(err, "Lỗi cập nhật hồ sơ"));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      notify.error("Vui lòng chọn tệp ảnh hợp lệ");
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = (await axiosClient.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })) as { url: string };

      if (uploadRes && uploadRes.url) {
        const updateRes = await authApi.updateProfile({
          avatarUrl: uploadRes.url,
        });
        if (updateRes.success) {
          await refreshUser();
          notify.success("Cập nhật ảnh đại diện thành công");
        } else {
          notify.error(updateRes.message || "Lỗi cập nhật ảnh đại diện");
        }
      }
    } catch (err) {
      notify.error(apiErrorMessage(err, "Lỗi tải ảnh lên cloud"));
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-background text-foreground w-full">
      <aside className="lg:w-56 shrink-0">
        <div className="bg-card rounded-xl border border-border p-2 sticky top-20">
          <div className="px-3 py-3 flex items-center gap-3 border-b border-border/60 mb-2">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4F46E5] to-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {user?.fullName ?? "Nhà quảng cáo"}
              </p>
              <p className="text-[10px] text-muted-foreground">RENTER</p>
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
                    ? "bg-primary-light text-primary font-semibold"
                    : "text-muted-foreground hover:bg-surface/50"
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
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-primary font-bold mb-4">Thông tin nhà quảng cáo</h3>

            {/* Avatar Upload Container */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/60">
              <div className="relative group w-16 h-16 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">{initials}</span>
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-semibold">
                    Đang tải...
                  </div>
                )}
              </div>
              <div>
                <label className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3.5 py-2.5 rounded-lg cursor-pointer inline-flex items-center transition-colors">
                  Thay đổi ảnh đại diện
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={avatarUploading}
                    onChange={handleAvatarUpload}
                  />
                </label>
                <p className="text-[10px] text-muted-foreground mt-1.5">Định dạng JPG, PNG. Dung lượng tối đa 5MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Họ tên</label>
                <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-surface/30">
                  <User className="w-4 h-4 text-muted-foreground/60" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-foreground"
                    placeholder="Nhập họ tên"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Email</label>
                <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-surface/10 opacity-70">
                  <Mail className="w-4 h-4 text-muted-foreground/60" />
                  <input
                    value={user?.email || ""}
                    disabled
                    className="flex-1 bg-transparent focus:outline-none cursor-not-allowed text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Điện thoại</label>
                <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-surface/30">
                  <Phone className="w-4 h-4 text-muted-foreground/60" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-foreground"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Công ty / thương hiệu</label>
                <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-surface/30">
                  <Building2 className="w-4 h-4 text-muted-foreground/60" />
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none text-foreground"
                    placeholder="Nhập tên công ty / thương hiệu"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "billing" && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="text-primary font-bold">Thanh toán & hóa đơn</h3>
            <p className="text-xs text-muted-foreground">
              ADORA hỗ trợ thanh toán qua VNPay cho các booking đã được chủ bảng chấp nhận.
            </p>
            <div className="p-4 rounded-xl border border-border flex items-center justify-between bg-surface/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center text-primary font-bold text-xs">
                  VN
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">VNPay</p>
                  <p className="text-xs text-success font-medium">Đã kết nối</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Mặc định</span>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Mã số thuế (xuất HĐ)</label>
              <input
                placeholder="0123456789"
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-surface/30 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-3">
            <h3 className="text-primary font-bold mb-2">Thông báo</h3>
            {[
              { label: "Cập nhật đặt chỗ", checked: emailBooking, set: setEmailBooking },
              { label: "Hóa đơn & thanh toán", checked: emailInvoice, set: setEmailInvoice },
            ].map((n) => (
              <label
                key={n.label}
                className="flex justify-between items-center p-4 rounded-xl border border-border cursor-pointer hover:bg-surface/30 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{n.label}</span>
                <input
                  type="checkbox"
                  checked={n.checked}
                  onChange={(e) => n.set(e.target.checked)}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </label>
            ))}
          </div>
        )}

        {activeSection === "appearance" && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-primary font-bold mb-4">Giao diện</h3>
            <div className="flex gap-2 mb-4">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border transition-colors ${
                    theme === t
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border text-muted-foreground hover:bg-surface/50"
                  }`}
                >
                  {t === "light" ? "Sáng" : t === "dark" ? "Tối" : "Hệ thống"}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === "security" && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-3">
            <h3 className="text-primary font-bold">Bảo mật</h3>
            <button
              type="button"
              onClick={() => setShowChangePasswordForm((prev) => !prev)}
              className="w-full text-left px-4 py-3 rounded-xl border border-border text-sm font-semibold text-primary cursor-pointer hover:border-primary/45 transition-colors"
            >
              {showChangePasswordForm ? "Ẩn đổi mật khẩu" : "Đổi mật khẩu"}
            </button>
            {showChangePasswordForm && (
              <div className="space-y-3 p-4 rounded-xl border border-border/60 bg-surface/50">
                <div className="space-y-1 text-sm">
                  <label className="text-muted-foreground text-xs">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1 text-sm">
                  <label className="text-muted-foreground text-xs">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1 text-sm">
                  <label className="text-muted-foreground text-xs">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:border-primary"
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
                      setShowChangePasswordForm(false);
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      notify.success("Đổi mật khẩu thành công");
                    } catch (error) {
                      notify.error(apiErrorMessage(error));
                    } finally {
                      setIsChangingPassword(false);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isChangingPassword ? "Đang cập nhật..." : "Lưu mật khẩu mới"}
                </button>
              </div>
            )}
            <button
              type="button"
              className="w-full text-left px-4 py-3 rounded-xl border border-border text-sm font-semibold cursor-pointer hover:border-primary/45 transition-colors"
            >
              Bật xác thực hai bước (2FA)
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover cursor-pointer transition-colors shadow-md shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? "Đang lưu..." : "Lưu cài đặt"}
          </button>
        </div>
      </div>
    </div>
  );
}
