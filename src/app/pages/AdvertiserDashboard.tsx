import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { AlertTriangle } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { NotificationBell } from "../components/NotificationBell";
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
      <div className="flex h-screen bg-[#F0F9FF]">
        <DashboardSidebar role="advertiser" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E3E8EF] border-t-[#1D4ED8]" />
        </main>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex h-screen bg-[#F0F9FF]">
      <DashboardSidebar role="advertiser" />
      <main className="flex-1 overflow-y-auto">
        {isUsingFallback && (
          <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex items-center gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chế độ ngoại tuyến:</strong> Đang hiển thị dữ liệu mô phỏng.
            </span>
          </div>
        )}

        <div className="bg-white border-b border-[#E3E8EF] px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl text-[#1D4ED8]" style={{ fontWeight: 700 }}>
                {pageMeta.title}
              </h1>
              <p className="text-sm text-[#6B7A8D] mt-0.5">
                {view === "dashboard"
                  ? `Chào mừng trở lại, ${user?.fullName || "Thành viên"}. ${pageMeta.subtitle}`
                  : pageMeta.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {view === "dashboard" && (
                <button
                  type="button"
                  onClick={() => navigate("/billboards")}
                  className="bg-[#1D4ED8] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#3B82F6] transition-colors cursor-pointer font-semibold animate-in fade-in"
                >
                  + Chiến dịch mới
                </button>
              )}
              <NotificationBell />
            </div>
          </div>
        </div>

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
      </main>

      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E3E8EF]">
            <h3 className="text-lg font-bold text-[#1D4ED8] mb-4">Đánh giá chiến dịch</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6B7A8D] mb-1">
                  Số sao (1-5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl cursor-pointer ${
                        star <= rating ? "text-amber-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#6B7A8D] mb-1">
                  Nhận xét
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Trải nghiệm về vị trí và chất lượng hiển thị..."
                  className="w-full border border-[#E3E8EF] rounded-lg p-2.5 text-sm focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-[#E3E8EF] rounded-lg text-sm text-[#6B7A8D] hover:bg-gray-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-[#1D4ED8] text-white rounded-lg text-sm hover:bg-[#3B82F6] cursor-pointer disabled:opacity-50"
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
