import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle, XCircle, ArrowLeft, Calendar, CreditCard, FileText, Loader2, Home } from "lucide-react";
import bookingApi from "../../api/bookingApi";
import { BookingDto } from "../../types/booking";

export default function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const success = searchParams.get("success") === "true";
  const bookingIdStr = searchParams.get("bookingId");
  const callbackError = searchParams.get("error");

  useEffect(() => {
    if (bookingIdStr) {
      const bookingId = parseInt(bookingIdStr, 10);
      if (!isNaN(bookingId)) {
        setLoading(true);
        bookingApi
          .getById(bookingId)
          .then((res) => {
            if (res.success && res.data) {
              setBooking(res.data);
            } else {
              setFetchError(res.message || "Không thể tải thông tin đặt bảng quảng cáo");
            }
          })
          .catch((err) => {
            console.error("Error fetching booking details:", err);
            setFetchError("Có lỗi xảy ra khi kết nối với hệ thống.");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, [bookingIdStr]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="text-2xl text-blue-600 font-extrabold tracking-tight hover:opacity-95 transition-opacity cursor-pointer"
          >
            ADORA
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg w-full mx-auto p-6 flex flex-col justify-center items-center">
        <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center relative overflow-hidden">
          {/* Glassmorphism accents */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#06B6D4]/10 rounded-full blur-3xl opacity-60" />

          {success ? (
            <div className="relative z-10">
              <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-100 shadow-sm animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Thanh Toán Thành Công!</h2>
              <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
                Giao dịch của bạn đã được ghi nhận. Hệ thống đang đồng bộ lịch hiển thị bảng quảng cáo.
              </p>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm animate-pulse">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Thanh Toán Thất Bại</h2>
              <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
                {callbackError || "Giao dịch đã bị từ chối hoặc bị hủy bỏ bởi người dùng."}
              </p>
            </div>
          )}

          {/* Booking detail box */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <p className="text-xs text-slate-400">Đang tải thông tin giao dịch...</p>
            </div>
          ) : (
            booking && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-5 mb-8 text-left space-y-4 relative z-10">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200/50">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mã Đơn Đặt</span>
                  <span className="text-sm font-bold text-slate-700">#ADR-{booking.id}</span>
                </div>

                {booking.billboard && (
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Bảng LED</span>
                    <span className="text-sm font-bold text-slate-700 block">{booking.billboard.title}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {booking.billboard.address}, {booking.billboard.district}, {booking.billboard.city}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">
                      <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> Thời gian thuê
                    </span>
                    <span className="text-xs font-medium text-slate-600 block">
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">
                      <CreditCard className="w-3.5 h-3.5 inline mr-1 text-slate-400" /> Phương thức
                    </span>
                    <span className="text-xs font-medium text-slate-600 block">VNPAY Sandbox</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/50 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Tổng thanh toán</span>
                  <span className="text-lg font-extrabold text-blue-600">
                    {booking.finalAmount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>
            )
          )}

          {fetchError && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs text-left">
              {fetchError}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3 relative z-10">
            <button
              onClick={() => navigate("/advertiser")}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Về Trang Quản Lý
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Xem Thêm Màn Hình LED khác
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-white border-t border-slate-200 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto">
          © {new Date().getFullYear()} ADORA LED Billboard Rental Marketplace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
