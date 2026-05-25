import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { AlertTriangle, Search, Moon, Sun, Bell, Menu } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { notify, apiErrorMessage } from "../utils/notify";
import { mergeBookings } from "../utils/advertiser";
import renterDashboardApi from "../../api/renterDashboardApi";
import bookingApi from "../../api/bookingApi";
import paymentApi from "../../api/paymentApi";
import reviewApi from "../../api/reviewApi";
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

  const [data, setData] = useState<RenterDashboardDto | null>(null);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
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
      setData(dashRes.data!);
      const merged = mergeBookings(
        bookRes.data ?? [],
        dashRes.data?.recentBookings ?? [],
        dashRes.data?.upcomingBookings ?? [],
      );
      setBookings(merged);
      setPayments(payRes.success && payRes.data ? payRes.data : []);
      setIsUsingFallback(false);
    } catch {
      setData(mockRenterDashboard);
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
              <button className="relative text-muted-foreground hover:text-accent transition-colors cursor-pointer active:scale-95">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-ping"></span>
              </button>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border/80">
            <h3 className="text-lg font-bold text-primary mb-4">Đánh giá chiến dịch</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Số sao (1-5)
                </label>
                <div className="flex gap-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-3xl cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
                        star <= rating ? "text-amber-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Nhận xét
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Trải nghiệm về vị trí và chất lượng hiển thị..."
                  className="w-full bg-background border border-border/50 rounded-xl p-3 text-sm focus:outline-none focus:border-accent text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4.5 py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-surface/50 cursor-pointer transition-colors active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4.5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 cursor-pointer disabled:opacity-50 transition-colors active:scale-95 shadow-md shadow-primary/10"
                >
                  {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

