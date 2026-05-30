import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { 
  AlertTriangle, Search, Moon, Sun, Bell, Menu,
  BellOff, CheckCircle2, XCircle, Calendar, CreditCard, Star 
} from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { useNotifications } from "../context/NotificationContext";
import { notify, apiErrorMessage } from "../utils/notify";
import { mergeBookings } from "../utils/advertiser";
import renterDashboardApi from "../../api/renterDashboardApi";
import { mergeSavedBillboards, removeSavedBillboard } from "../utils/savedBillboards";
import bookingApi from "../../api/bookingApi";
import paymentApi from "../../api/paymentApi";
import reviewApi from "../../api/reviewApi";
import reportApi from "../../api/reportApi";
import { RenterDashboardDto } from "../../types/dashboard";
import { BookingDto } from "../../types/booking";
import { PaymentDto } from "../../types/payment";
import { mockRenterDashboard } from "../data/advertiserMockData";
import { AdvertiserOverviewView } from "../components/dashboard/advertiser/AdvertiserOverviewView";
import { AdvertiserBookingsView } from "../components/dashboard/advertiser/AdvertiserBookingsView";
import { AdvertiserSavedView } from "../components/dashboard/advertiser/AdvertiserSavedView";
import { AdvertiserCampaignsView } from "../components/dashboard/advertiser/AdvertiserCampaignsView";
import { AdvertiserInvoicesView } from "../components/dashboard/advertiser/AdvertiserInvoicesView";
import { AdvertiserSettingsView } from "../components/dashboard/advertiser/AdvertiserSettingsView";
import { MessagesView } from "../components/messages/MessagesView";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Tổng Quan",
    subtitle: "Tổng quan chiến dịch và hiệu suất quảng cáo của bạn.",
  },
  bookings: {
    title: "Quản Lý Đặt Chỗ",
    subtitle: "Theo dõi, thanh toán và quản lý mọi lượt đặt bảng QC.",
  },
  saved: {
    title: "Bảng QC Đã Lưu",
    subtitle: "Danh sách vị trí bạn đã đánh dấu yêu thích.",
  },
  campaigns: {
    title: "Quản Lý Chiến Dịch",
    subtitle: "Theo dõi và tối ưu các chiến dịch quảng cáo LED.",
  },
  invoices: {
    title: "Hóa Đơn & Thanh Toán",
    subtitle: "Lịch sử hóa đơn và trạng thái thanh toán VNPay.",
  },
  settings: {
    title: "Cài Đặt Tài Khoản",
    subtitle: "Hồ sơ, thông báo và tùy chọn giao diện.",
  },
  messages: {
    title: "Tin Nhắn",
    subtitle: "Trao đổi với chủ bảng QC về đặt chỗ và chiến dịch.",
  },
};

export default function AdvertiserDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const confirm = useConfirm();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const [data, setData] = useState<RenterDashboardDto | null>(null);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [complaintBookingId, setComplaintBookingId] = useState<number | null>(null);
  const [complaintBillboardId, setComplaintBillboardId] = useState<number | null>(null);
  const [complaintReason, setComplaintReason] = useState("");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "PAYMENT_SUCCESS":
        return (
          <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 border border-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        );
      case "BOOKING_PAID":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
            <CreditCard className="w-4.5 h-4.5" />
          </div>
        );
      case "BOOKING_ACCEPTED":
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 border border-blue-100 flex items-center justify-center shrink-0">
            <Calendar className="w-4.5 h-4.5" />
          </div>
        );
      case "PAYMENT_FAILED":
      case "BOOKING_REJECTED":
        return (
          <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center shrink-0">
            <XCircle className="w-4.5 h-4.5" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-500 border border-slate-100 flex items-center justify-center shrink-0">
            <Bell className="w-4.5 h-4.5" />
          </div>
        );
    }
  };

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

  const [submittingReview, setSubmittingReview] = useState(false);

  const view = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/advertiser/bookings")) return "bookings";
    if (path.startsWith("/advertiser/saved")) return "saved";
    if (path.startsWith("/advertiser/campaigns")) return "campaigns";
    if (path.startsWith("/advertiser/invoices")) return "invoices";
    if (path.startsWith("/advertiser/settings")) return "settings";
    if (path.startsWith("/advertiser/messages")) return "messages";
    return "dashboard";
  }, [location.pathname]);

  const pageMeta = PAGE_TITLES[view] ?? PAGE_TITLES.dashboard;

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, bookRes, payRes] = await Promise.all([
        renterDashboardApi.get(),
        bookingApi.getRenterBookings(),
        paymentApi.getAll(),
      ]);
      if (!dashRes.success || !bookRes.success) {
        throw new Error("API failed");
      }
      setData({ ...dashRes.data!, savedBillboards: mergeSavedBillboards(dashRes.data?.savedBillboards ?? []) });
      const merged = mergeBookings(
        bookRes.data ?? [],
        dashRes.data?.recentBookings ?? [],
        dashRes.data?.upcomingBookings ?? [],
      );
      setBookings(merged);
      setPayments(payRes.success && payRes.data ? payRes.data : []);
      setIsUsingFallback(false);
    } catch {
      setData({ ...mockRenterDashboard, savedBillboards: mergeSavedBillboards(mockRenterDashboard.savedBillboards) });
      setBookings(
        mergeBookings(
          mockRenterDashboard.recentBookings,
          mockRenterDashboard.upcomingBookings,
        ),
      );
      setPayments([]);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateBookingInState = (bookingId: number, status: BookingDto["status"]) => {
    const patch = (list: BookingDto[]) =>
      list.map((b) => (b.id === bookingId ? { ...b, status } : b));
    setBookings((prev) => patch(prev));
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recentBookings: patch(prev.recentBookings),
        upcomingBookings: patch(prev.upcomingBookings),
      };
    });
  };

  const handleCancelBooking = async (bookingId: number) => {
    const ok = await confirm({
      title: "Hủy đặt chỗ",
      description: "Bạn có chắc chắn muốn hủy đặt chỗ này?",
      variant: "destructive",
      confirmLabel: "Hủy đặt chỗ",
    });
    if (!ok) return;
    if (isUsingFallback) {
      updateBookingInState(bookingId, "CANCELLED");
      notify.success("Hủy đặt chỗ thành công", "Chế độ mô phỏng");
      return;
    }
    try {
      const response = await bookingApi.cancel(bookingId);
      if (response.success) {
        notify.success("Hủy đặt chỗ thành công");
        fetchAll();
      } else {
        notify.error(response.message || "Không thể hủy đặt chỗ.");
      }
    } catch (error: unknown) {
      notify.error(apiErrorMessage(error, "Lỗi khi hủy đặt chỗ."));
    }
  };

  const handlePayBooking = async (bookingId: number) => {
    if (isUsingFallback) {
      updateBookingInState(bookingId, "PAID");
      notify.success("Thanh toán thành công", "Chế độ mô phỏng");
      return;
    }
    const ok = await confirm({
      title: "Thanh toán VNPay",
      description: "Bạn sẽ được chuyển đến cổng VNPay để hoàn tất thanh toán. Tiếp tục?",
      confirmLabel: "Thanh toán",
    });
    if (!ok) return;
    try {
      const response = await paymentApi.create({
        bookingId,
        paymentMethod: "VNPAY",
      });
      if (response.success && response.data) {
        notify.info("Đang chuyển đến VNPay...");
        window.location.href = response.data;
      } else {
        notify.error(response.message || "Không thể khởi tạo thanh toán.");
      }
    } catch (error: unknown) {
      notify.error(apiErrorMessage(error, "Lỗi khi khởi tạo thanh toán."));
    }
  };

  const handleOpenReview = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setRating(5);
    setComment("");
    setIsReviewModalOpen(true);
  };

  const handleOpenComplaint = (bookingId: number, billboardId: number | null) => {
    setComplaintBookingId(bookingId);
    setComplaintBillboardId(billboardId);
    setComplaintReason("");
    setIsComplaintModalOpen(true);
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintBookingId || !complaintBillboardId) return;
    setSubmittingComplaint(true);
    if (isUsingFallback) {
      notify.success("Khiếu nại đã được gửi", "Chế độ mô phỏng");
      setIsComplaintModalOpen(false);
      setSubmittingComplaint(false);
      return;
    }
    try {
      const response = await reportApi.createReport({
        targetType: "BILLBOARD",
        targetId: complaintBillboardId,
        reason: complaintReason || "Báo cáo sự cố chất lượng bảng QC",
      });
      if (response.success) {
        notify.success("Khiếu nại đã được gửi thành công");
        setIsComplaintModalOpen(false);
        setComplaintReason("");
      } else {
        notify.error(response.message || "Không thể gửi khiếu nại.");
      }
    } catch (error: unknown) {
      notify.error(apiErrorMessage(error, "Lỗi khi gửi khiếu nại."));
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;
    setSubmittingReview(true);
    if (isUsingFallback) {
      notify.success("Gửi đánh giá thành công", "Chế độ mô phỏng");
      setIsReviewModalOpen(false);
      setSubmittingReview(false);
      return;
    }
    try {
      const response = await reviewApi.create({
        bookingId: selectedBookingId,
        rating,
        comment,
      });
      if (response.success) {
        notify.success("Gửi đánh giá thành công");
        setIsReviewModalOpen(false);
        fetchAll();
      } else {
        notify.error(response.message || "Không thể gửi đánh giá.");
      }
    } catch (error: unknown) {
      notify.error(apiErrorMessage(error, "Lỗi khi gửi đánh giá."));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRemoveSaved = (id: number) => {
    removeSavedBillboard(id);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        savedBillboards: prev.savedBillboards.filter((b) => b.id !== id),
      };
    });
  };

  if (loading && !data) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar role="advertiser" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-border border-t-primary" />
        </main>
      </div>
    );
  }

  if (!data) return null;

  const avatarUrl = user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDVTzsXMFUBL6xS6CmJJJch9mV7DFDkQqCHSqxIDDBQzqkTqqGhzLzhUT4hU_XmxjYGu0SDYJXpaBApwGDaEwbHJtSAjjNterm154XUJ6M51e7zXHfsUQ9nopH9haH_hxlj3gPTj_ikOSm6xeb0naB_ncdtyMsbyWyhL4qViWWtjOC8dwml4QfkeTxAN6bdXM5rhUgWsNWf2m2LXQs1zQz8ULaErakKC6ph4ba3IW67FcDW0YSZhjzo1ACJ4S_4vvMeAbE-9npkDfE";

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar role="advertiser" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="relative w-64 bg-card h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <DashboardSidebar role="advertiser" />
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-foreground hover:bg-border/30 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto scroll-smooth">
        {/* Offline Fallback Banner */}
        {isUsingFallback && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-8 py-3 flex items-center gap-2 text-xs text-amber-500 font-semibold shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Chế độ ngoại tuyến:</strong> Đang hiển thị dữ liệu mô phỏng.
            </span>
          </div>
        )}

        {/* Top Header */}
        <header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-border/30 px-8 h-16 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.1)] shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden text-foreground hover:text-accent transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg md:text-xl font-black text-foreground">{pageMeta.title}</h2>
            
            {/* Search Input */}
            <div className="hidden md:flex items-center bg-card rounded-full px-4 py-1.5 gap-2 border border-border/30">
              <Search className="text-muted-foreground w-4 h-4" />
              <input 
                className="bg-transparent border-none outline-none focus:ring-0 text-sm w-64 placeholder:text-muted-foreground" 
                placeholder="Tìm chiến dịch, vị trí LED..." 
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-4 items-center">
              {/* Dark/Light mode toggle */}
              <button 
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-accent transition-colors cursor-pointer active:scale-95"
                title="Đổi giao diện"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-muted-foreground hover:text-accent transition-colors cursor-pointer active:scale-95 flex items-center justify-center border-none bg-transparent"
                  title="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
                    </span>
                  )}
                </button>

                {/* Glassmorphic Dropdown Panel */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-border/50 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Header */}
                      <div className="p-4 border-b border-border/30 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">Thông báo</span>
                          {unreadCount > 0 && (
                            <span className="bg-[#EF4444]/10 text-[#EF4444] text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {unreadCount} mới
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllAsRead}
                            className="text-xs text-[#1D4ED8] dark:text-accent hover:underline font-semibold transition-colors cursor-pointer border-none bg-transparent"
                          >
                            Đọc tất cả
                          </button>
                        )}
                      </div>

                      {/* Scrollable list */}
                      <div className="max-h-80 overflow-y-auto divide-y divide-border/20">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                            <BellOff className="w-8 h-8 mb-2 text-slate-300 dark:text-slate-700" />
                            <p className="text-xs font-semibold">Bạn không có thông báo nào</p>
                            <p className="text-[10px] text-muted-foreground/80 mt-0.5">Mọi cập nhật trạng thái sẽ hiển thị ở đây</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                markAsRead(notif.id);
                                setShowNotifications(false);
                                if (notif.type === "BOOKING_PAID") {
                                  navigate("/owner/revenue");
                                } else {
                                  navigate("/advertiser/bookings");
                                }
                              }}
                              className={`p-4 flex gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative text-left ${
                                !notif.isRead ? "bg-[#1D4ED8]/[0.02]" : ""
                              }`}
                            >
                              {renderNotificationIcon(notif.type)}
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <span className={`text-xs block truncate ${
                                    !notif.isRead ? "font-bold text-foreground" : "font-semibold text-muted-foreground"
                                  }`}>
                                    {notif.title}
                                  </span>
                                  {!notif.isRead && (
                                    <span className="w-1.5 h-1.5 bg-[#1D4ED8] rounded-full shrink-0 mt-1.5" />
                                  )}
                                </div>
                                <span className="text-[11px] text-muted-foreground mt-0.5 block line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </span>
                                <span className="text-[9px] text-muted-foreground/60 mt-1.5 block">
                                  {formatRelativeTime(notif.createdAt)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="h-8 w-px bg-border/30"></div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-foreground">{user?.fullName || "Admin User"}</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-extrabold">
                  {user?.role === "RENTER" ? "Premium Account" : "Enterprise Account"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden group-hover:border-primary transition-colors">
                <img 
                  alt="User Profile" 
                  className="w-full h-full object-cover" 
                  src={avatarUrl}
                />
              </div>
            </div>
          </div>
        </header>

        {/* View Router Render Area */}
        <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
          {view === "dashboard" && (
            <AdvertiserOverviewView
              data={data}
              onCancelBooking={handleCancelBooking}
              onPayBooking={handlePayBooking}
              onReviewBooking={handleOpenReview}
            />
          )}

          {view === "bookings" && (
            <AdvertiserBookingsView
              bookings={bookings}
              onCancelBooking={handleCancelBooking}
              onPayBooking={handlePayBooking}
              onReviewBooking={handleOpenReview}
              onReportBooking={handleOpenComplaint}
            />
          )}

          {view === "saved" && (
            <AdvertiserSavedView
              savedBillboards={data.savedBillboards ?? []}
              onRemoveSaved={handleRemoveSaved}
            />
          )}

          {view === "campaigns" && (
            <AdvertiserCampaignsView bookings={bookings} />
          )}

          {view === "invoices" && (
            <AdvertiserInvoicesView
              bookings={bookings}
              payments={payments}
              onPayBooking={handlePayBooking}
            />
          )}

          {view === "settings" && <AdvertiserSettingsView />}

          {view === "messages" && <MessagesView role="RENTER" />}
        </div>

        {/* Shared Footer */}
        <footer className="w-full py-8 mt-auto border-t border-border/20 bg-card/40">
          <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-foreground">ADORA LED</span>
              <span className="text-xs text-muted-foreground">© 2024 ADORA LED Marketplace. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <a className="text-xs text-muted-foreground hover:text-accent underline transition-opacity" href="#">Privacy Policy</a>
              <a className="text-xs text-muted-foreground hover:text-accent underline transition-opacity" href="#">Terms of Service</a>
              <a className="text-xs text-muted-foreground hover:text-accent underline transition-opacity" href="#">API Docs</a>
              <a className="text-xs text-muted-foreground hover:text-accent underline transition-opacity" href="#">Contact Support</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Review Modal Dialog */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-card text-card-foreground rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Đánh giá đặt chỗ</h3>
              <p className="text-sm text-muted-foreground">Cho chủ bảng QC biết trải nghiệm của bạn để cải thiện chất lượng dịch vụ.</p>
            </div>
          </div>
          <form onSubmit={handleSubmitReview} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Đánh giá sao
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform duration-150 ${
                      star <= rating ? "text-amber-400 scale-110" : "text-slate-300 hover:text-amber-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Nhận xét của bạn
              </label>
              <textarea
                required
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Mô tả ngắn gọn về chất lượng bảng, nội dung hiển thị hoặc hỗ trợ khách hàng..."
                className="w-full min-h-[140px] rounded-2xl border border-border/70 bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="w-full sm:w-auto rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-surface transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submittingReview}
                className="w-full sm:w-auto rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/10 hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* Complaint Modal Dialog */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border/80">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Gửi khiếu nại</h3>
                <p className="text-sm text-muted-foreground">Mô tả vấn đề để bộ phận hỗ trợ xử lý nhanh chóng.</p>
              </div>
            </div>
            <form onSubmit={handleSubmitComplaint} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Nội dung khiếu nại
                </label>
                <textarea
                  required
                  rows={6}
                  value={complaintReason}
                  onChange={(e) => setComplaintReason(e.target.value)}
                  placeholder="Ví dụ: bảng quảng cáo không hiển thị đúng nội dung, chất lượng kém, hoặc chủ bảng không phản hồi..."
                  className="w-full min-h-[160px] rounded-2xl border border-border/70 bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-colors"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  className="w-full sm:w-auto rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-surface transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="w-full sm:w-auto rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-red-500/10"
                >
                  {submittingComplaint ? "Đang gửi..." : "Gửi khiếu nại"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

