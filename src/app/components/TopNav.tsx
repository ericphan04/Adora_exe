import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  CreditCard, 
  BellOff,
  Sun,
  Moon,
  HelpCircle,
  X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useThemeContext } from "../context/ThemeContext";
import { NotificationDto } from "../../types/notification";
import { MobileBottomNav } from "./MobileBottomNav";

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { resolvedTheme, toggleTheme } = useThemeContext();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideTab, setGuideTab] = useState<"renter" | "owner" | "payment">("renter");

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".profile-dropdown-trigger")) {
        setShowDropdown(false);
      }
      if (!target.closest(".notification-dropdown-trigger")) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "OWNER") return "/owner";
    return "/advertiser";
  };

  const getRoleLabel = () => {
    if (!user) return "";
    if (user.role === "ADMIN") return "Admin";
    if (user.role === "OWNER") return "Chủ bảng";
    return "Nhà quảng cáo";
  };

  // Helper to format notification time relatively
  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Render proper icon based on notification type
  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "PAYMENT_SUCCESS":
        return (
          <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 border border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        );
      case "BOOKING_PAID":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
            <CreditCard className="w-4.5 h-4.5" />
          </div>
        );
      case "BOOKING_ACCEPTED":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 flex items-center justify-center shrink-0">
            <Calendar className="w-4.5 h-4.5" />
          </div>
        );
      case "PAYMENT_FAILED":
      case "BOOKING_REJECTED":
        return (
          <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 flex items-center justify-center shrink-0">
            <XCircle className="w-4.5 h-4.5" />
          </div>
        );
      case "BOOKING_CREATED":
        return (
          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-500 border border-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20 flex items-center justify-center shrink-0">
            <Calendar className="w-4.5 h-4.5" />
          </div>
        );
      case "BOOKING_CANCELLED":
        return (
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 border border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 flex items-center justify-center shrink-0">
            <XCircle className="w-4.5 h-4.5" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20 flex items-center justify-center shrink-0">
            <Bell className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

  // Handle notification click (mark read & redirect)
  const handleNotificationClick = (notif: NotificationDto) => {
    markAsRead(notif.id);
    setShowNotifications(false);

    // Dynamic routing depending on who needs to see the changes
    if (
      notif.type === "BOOKING_PAID" || 
      notif.type === "BOOKING_CREATED" || 
      notif.type === "BOOKING_CANCELLED"
    ) {
      navigate("/owner");
    } else {
      navigate("/advertiser");
    }
  };

  return (
    <>
      <header className="w-full border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 text-foreground">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-xl text-primary tracking-tight cursor-pointer font-black bg-transparent border-none">
            <img src="/logo.png" className="w-8 h-8 rounded-lg shadow-sm border border-primary/10" alt="ADORA logo" />
            <span>ADORA</span>
          </button>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate("/billboards")} className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none">
              Tìm Bảng Quảng Cáo
            </button>
            <button onClick={() => navigate("/billboards/map")} className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none">
              Bản Đồ
            </button>
            <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none">
              Cách Hoạt Động
            </button>
            <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none">
              Bảng Giá
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg hover:bg-primary-light flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Dynamic Notification Bell Button */}
          {user && (
            <div className="relative notification-dropdown-trigger">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowDropdown(false);
                }}
                className="w-9 h-9 rounded-lg hover:bg-primary-light flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer relative bg-transparent border-none"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                  </span>
                )}
              </button>

              {/* Glassmorphic Dropdown Panel */}
              {showNotifications && (
                <div className="fixed md:absolute top-16 md:top-auto md:mt-2 left-4 right-4 md:left-auto md:right-0 w-auto md:w-96 bg-card border border-border rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">Thông báo</span>
                        {unreadCount > 0 && (
                          <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors cursor-pointer bg-transparent border-none"
                        >
                          Đọc tất cả
                        </button>
                      )}
                    </div>

                    {/* Scrollable list */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-border">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                          <BellOff className="w-8 h-8 mb-2 text-muted-foreground/60" />
                          <p className="text-xs font-semibold">Bạn không có thông báo nào</p>
                          <p className="text-[10px] text-muted-foreground/80 mt-0.5">Mọi cập nhật trạng thái sẽ hiển thị ở đây</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-4 flex gap-3 hover:bg-primary-light transition-colors cursor-pointer relative ${
                              !notif.isRead ? "bg-primary-light/30" : ""
                            }`}
                          >
                            {renderNotificationIcon(notif.type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <span className={`text-xs block truncate ${
                                  !notif.isRead ? "font-bold text-foreground" : "font-semibold text-muted-foreground"
                                }`}>
                                  {notif.title}
                                </span>
                                {!notif.isRead && (
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-1.5" />
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground mt-0.5 block line-clamp-2 leading-relaxed">
                                {notif.message}
                              </span>
                              <span className="text-[9px] text-muted-foreground/75 mt-1.5 block">
                                {formatRelativeTime(notif.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-border bg-muted/50 text-center">
                      <button 
                        onClick={() => {
                          setShowNotifications(false);
                          navigate(getDashboardPath());
                        }}
                        className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors py-1 block w-full text-center bg-transparent border-none"
                      >
                        Xem trong Trang Quản Lý
                      </button>
                    </div>
                  </div>
              )}
            </div>
          )}

          {user ? (
            <div className="relative profile-dropdown-trigger">
              <button
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 hover:bg-primary-light px-3 py-1.5 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-foreground max-w-[150px] truncate">
                  {user.fullName}
                </span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate(getDashboardPath());
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-primary-light transition-colors text-left cursor-pointer border-none bg-transparent"
                    >
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                      <span>Trang Quản Lý</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive-light transition-colors text-left border-t border-border mt-1 cursor-pointer bg-transparent"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng Xuất</span>
                    </button>
                  </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-xs sm:text-sm text-primary border border-border px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-light transition-colors cursor-pointer bg-transparent"
              >
                Đăng Nhập
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-xs sm:text-sm text-white bg-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-hover transition-colors cursor-pointer border-none"
              >
                Bắt Đầu
              </button>
            </>
          )}
        </div>
      </div>
    </header>
    <MobileBottomNav />

    {/* FLOATING HELP BUTTON */}
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={() => setShowGuide(true)}
        className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-2xl hover:bg-primary/90 active:scale-95 transition-all cursor-pointer group border-none"
        aria-label="Hướng dẫn sử dụng"
      >
        <HelpCircle className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent"></span>
        </span>
      </button>
    </div>

    {/* HELP CENTER SIDE DRAWER */}
    {showGuide && (
      <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
        {/* Backdrop Click Dismiss */}
        <div className="absolute inset-0" onClick={() => setShowGuide(false)} />
        
        {/* Drawer Container */}
        <div className="relative w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5.5 h-5.5 text-primary" />
              <span className="font-extrabold text-base text-foreground">Hướng Dẫn Sử Dụng ADORA</span>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-foreground bg-transparent border-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Guide Tabs */}
          <div className="flex border-b border-border bg-muted/10 p-1">
            {(["renter", "owner", "payment"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setGuideTab(tab)}
                className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer border-none ${
                  guideTab === tab
                    ? "bg-card text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground bg-transparent"
                }`}
              >
                {tab === "renter"
                  ? "Nhà Quảng Cáo"
                  : tab === "owner"
                    ? "Chủ Màn Hình"
                    : "Thanh Toán"}
              </button>
            ))}
          </div>

          {/* Scrollable Guide Content */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            
            {/* RENTER GUIDE */}
            {guideTab === "renter" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bạn muốn chạy chiến dịch quảng cáo LED tại vị trí đắc địa ở Đà Nẵng? Hãy làm theo các bước sau:
                </p>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Tìm Bảng Quảng Cáo</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Truy cập trang "Tìm Bảng Quảng Cáo" hoặc "Bản Đồ" để lọc vị trí theo quận, kích thước, lượt view và giá.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Chọn Chế Độ Thuê</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Chọn "Đặt theo giờ" (nếu chạy ngắn hạn) hoặc "Đặt theo ngày" (chạy chiến dịch dài hạn), sau đó click chọn trên Lịch và Lưới Giờ trống.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Ký Quỹ Đảm Bảo</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Thanh toán ký quỹ an toàn qua VNPay. Số tiền được ADORA bảo vệ cho tới khi chiến dịch được chủ bảng chạy thành công.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Gửi File Quảng Cáo</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Vào Trang Quản Lý của bạn, tải file thiết kế (ảnh/video) và chờ chủ bảng duyệt nội dung tối thiểu 3 ngày trước ngày chạy.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OWNER GUIDE */}
            {guideTab === "owner" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bạn sở hữu các vị trí màn hình LED đắc địa và muốn tăng nguồn thu nhập thụ động?
                </p>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Đăng Bảng Quảng Cáo</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Tạo tài khoản "Chủ bảng", truy cập Trang Quản Lý và nhấn "Đăng Bảng". Cung cấp đầy đủ thông số kỹ thuật, giá thuê và tọa độ thực.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Nhận Yêu Cầu Thuê</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Khi có người thuê, bạn sẽ nhận thông báo. Hãy xem lịch biểu, duyệt thiết kế quảng cáo của người thuê gửi lên.</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Xác Nhận Phát Sóng & Nhận Tiền</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">Chạy quảng cáo đúng lịch cam kết. Sau khi chiến dịch hoàn thành, hệ thống ký quỹ giải ngân tiền trực tiếp về tài khoản của bạn.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENT GUIDE */}
            {guideTab === "payment" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    🛡️ Cơ chế Ký quỹ An toàn (Escrow)
                  </h4>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-500 leading-relaxed">
                    ADORA cam kết giữ tiền của Nhà quảng cáo trong suốt thời gian chạy chiến dịch. Chủ bảng chỉ được rút tiền khi chiến dịch được đối chiếu chạy đúng tiến độ và báo cáo hiển thị chuẩn xác.
                  </p>
                </div>

                <div className="space-y-4 text-[11px] text-muted-foreground leading-relaxed">
                  <p>
                    <strong>Quy trình hoàn tiền tự động:</strong>
                    <br />
                    Nếu chủ bảng từ chối duyệt nội dung quảng cáo hoặc không duyệt lịch thuê đúng thời hạn, hệ thống ADORA sẽ tự động hoàn 100% tiền ký quỹ vào tài khoản nguồn của bạn qua cổng VNPay.
                  </p>
                  <p>
                    <strong>Bảo mật thông tin:</strong>
                    <br />
                    Mọi giao dịch đều được mã hóa SSL/TLS 256-bit và xác thực hai lớp (OTP ngân hàng), đảm bảo an toàn tuyệt đối cho dòng tiền và dữ liệu tài chính của bạn.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    )}
    </>
  );
}
