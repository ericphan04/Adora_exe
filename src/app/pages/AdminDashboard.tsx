import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Users, Monitor, DollarSign, TrendingUp, Check, X, Eye, Trash2, AlertTriangle, Search, Filter, RefreshCw, Sun, Moon, ChevronLeft, ChevronRight, MapPin, Layers, Zap, Clock, Star, Image as ImageIcon, Settings, LogOut } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { DataTable } from "../components/DataTable";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import adminApi from "../../api/adminApi";
import reportApi from "../../api/reportApi";
import { AdminDashboardDto } from "../../types/dashboard";
import { User, Role, UserStatus } from "../../types/user";
import { BillboardDto } from "../../types/billboard";
import { BookingDto } from "../../types/booking";
import { PaymentDto } from "../../types/payment";
import { ReportDto, ReportStatus } from "../../types/report";
import { AdminRevenueView } from "../components/dashboard/AdminRevenueView";
import { AdminDisputesView } from "../components/dashboard/AdminDisputesView";
import { AdminSettingsView } from "../components/dashboard/AdminSettingsView";
import { AdminLandingPageView } from "../components/dashboard/AdminLandingPageView";
import { MessagesView } from "../components/messages/MessagesView";
import { useConfirm } from "../context/ConfirmContext";
import { notify, apiErrorMessage } from "../utils/notify";

type BadgeVariant = "active" | "pending" | "booked" | "expired" | "available" | "unavailable";

const mockAdminDashboard: AdminDashboardDto = {
  totalUsers: 250,
  totalBillboards: 45,
  totalGMV: 4800000000,
  commissionRevenue: 240000000,
  pendingBillboards: 3,
  pendingReports: 2,
  gmvChart: [
    { month: "T9", gmv: 2800000000 },
    { month: "T10", gmv: 3400000000 },
    { month: "T11", gmv: 3900000000 },
    { month: "T12", gmv: 3600000000 },
    { month: "T1", gmv: 4300000000 },
    { month: "T2", gmv: 4800000000 }
  ],
  bookingChart: [
    { month: "T9", bookings: 85 },
    { month: "T10", bookings: 102 },
    { month: "T11", bookings: 118 },
    { month: "T12", bookings: 105 },
    { month: "T1", bookings: 135 },
    { month: "T2", bookings: 148 }
  ]
};

const mockUsers: User[] = [
  { id: 1, fullName: "Nguyễn Thanh Hà", email: "ha@abccorp.vn", phone: "0901234567", role: "RENTER", status: "ACTIVE", joined: "15/01/2026", createdAt: "2026-01-15" } as any,
  { id: 2, fullName: "Trần Minh Đức", email: "duc@digitalads.vn", phone: "0907654321", role: "OWNER", status: "ACTIVE", joined: "02/02/2026", createdAt: "2026-02-02" } as any,
  { id: 3, fullName: "Lê Thị Mai", email: "mai@mediapro.vn", phone: "0912345678", role: "RENTER", status: "PENDING", joined: "28/02/2026", createdAt: "2026-02-28" } as any,
  { id: 4, fullName: "Phạm Văn Hoàng", email: "hoang@adventure.vn", phone: "0987654321", role: "RENTER", status: "ACTIVE", joined: "01/03/2026", createdAt: "2026-03-01" } as any,
  { id: 5, fullName: "Võ Ngọc Lan", email: "lan@billboardco.vn", phone: "0955667788", role: "OWNER", status: "ACTIVE", joined: "10/02/2026", createdAt: "2026-02-10" } as any
];

const mockBillboards: BillboardDto[] = [
  {
    id: 1,
    title: "Trung Tâm Hội An LED",
    description: "LED screen at Hoi An ancient town entry",
    address: "Hội An, Quảng Nam",
    city: "Quảng Nam",
    district: "Hội An",
    width: 12,
    height: 5,
    resolution: "1920x1080",
    brightness: 6500,
    refreshRate: 60,
    screenType: "LED Outdoor",
    operatingHours: "18h",
    pricePerDay: 2500000,
    pricePerMonth: 70000000,
    locationSurcharge: 200000,
    status: "PENDING",
    dailyViews: 120000,
    isFeatured: true,
    images: [],
    features: [],
    availabilities: [],
    owner: { id: 5, fullName: "Võ Ngọc Lan", email: "lan@billboardco.vn" } as any,
    createdAt: "2026-03-01"
  },
  {
    id: 2,
    title: "Cầu Thuận Phước LED",
    description: "High altitude bridge billboard display",
    address: "Sơn Trà, Đà Nẵng",
    city: "Đà Nẵng",
    district: "Sơn Trà",
    width: 10,
    height: 4,
    resolution: "1280x720",
    brightness: 6000,
    refreshRate: 60,
    screenType: "LED Outdoor",
    operatingHours: "16h",
    pricePerDay: 1800000,
    pricePerMonth: 50000000,
    locationSurcharge: 100000,
    status: "PENDING",
    dailyViews: 90000,
    isFeatured: false,
    images: [],
    features: [],
    availabilities: [],
    owner: { id: 22, fullName: "Trần Văn Bình", email: "binh@gmail.com" } as any,
    createdAt: "2026-03-02"
  }
];

const mockPayments: PaymentDto[] = [
  { id: 1, bookingId: 101, amount: 85000000, paymentMethod: "VNPAY", paymentStatus: "SUCCESS", transactionCode: "VNPAY-832103", platformCommission: 4250000, ownerRevenue: 80750000, paidAt: "2026-03-01T10:00:00" },
  { id: 2, bookingId: 102, amount: 55000000, paymentMethod: "VNPAY", paymentStatus: "PENDING", transactionCode: "VNPAY-928103", platformCommission: 2750000, ownerRevenue: 52250000, paidAt: undefined }
];

const mockBookings: BookingDto[] = [
  {
    id: 101,
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    totalPrice: 85000000,
    serviceFee: 4250000,
    locationSurcharge: 0,
    finalAmount: 89250000,
    status: "PAID",
    note: "Chiến dịch Dragon Bridge",
    renter: { id: 1, fullName: "Công ty CP ABC" } as any,
    billboard: { id: 10, title: "Cầu Rồng LED", owner: { id: 2, fullName: "Trần Minh Đức" } } as any
  },
  {
    id: 102,
    startDate: "2026-03-15",
    endDate: "2026-04-15",
    totalPrice: 55000000,
    serviceFee: 2750000,
    locationSurcharge: 0,
    finalAmount: 57750000,
    status: "PENDING",
    note: "Chiến dịch Bach Dang Digital",
    renter: { id: 3, fullName: "QC Số Việt" } as any,
    billboard: { id: 20, title: "Bạch Đằng Digital", owner: { id: 5, fullName: "Võ Ngọc Lan" } } as any
  }
];

const mockReports: ReportDto[] = [
  { id: 1, targetType: "BILLBOARD", targetId: 10, reason: "Nội dung hiển thị không đúng cam kết độ sáng tối", status: "PENDING", reporter: { id: 1, fullName: "Nguyễn Thanh Hà" } as any, createdAt: "2026-03-01" },
  { id: 2, targetType: "USER", targetId: 2, reason: "Chủ sở hữu không phản hồi cuộc gọi xác nhận", status: "PENDING", reporter: { id: 4, fullName: "Phạm Văn Hoàng" } as any, createdAt: "2026-03-02" }
];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const confirm = useConfirm();
  const { theme, resolvedTheme, toggleTheme } = useThemeContext();

  const [dashboardData, setDashboardData] = useState<AdminDashboardDto | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [billboards, setBillboards] = useState<BillboardDto[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Separate loading states for background data lists
  const [usersLoading, setUsersLoading] = useState(false);
  const [billboardsLoading, setBillboardsLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [selectedDetailBillboard, setSelectedDetailBillboard] = useState<BillboardDto | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".profile-dropdown-trigger")) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const initials = (currentUser?.fullName || "AD")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const [activePreviewImageIdx, setActivePreviewImageIdx] = useState(0);

  useEffect(() => {
    setActivePreviewImageIdx(0);
  }, [selectedDetailBillboard]);

  // User filter states
  const [userKeyword, setUserKeyword] = useState("");
  const [userRole, setUserRole] = useState<Role | "">("");
  const [userStatus, setUserStatus] = useState<UserStatus | "">("");

  // Billboard listing mode (All vs Pending vs Deleting)
  const [billboardFilterMode, setBillboardFilterMode] = useState<"ALL" | "PENDING" | "PENDING_DELETION">("ALL");

  // Report status filter
  const [reportFilterStatus, setReportFilterStatus] = useState<ReportStatus | "">("");

  const view = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/admin/users")) return "users";
    if (path.startsWith("/admin/listings")) return "listings";
    if (path.startsWith("/admin/transactions")) return "transactions";
    if (path.startsWith("/admin/revenue")) return "revenue";
    if (path.startsWith("/admin/disputes")) return "disputes";
    if (path.startsWith("/admin/reports")) return "reports";
    if (path.startsWith("/admin/settings")) return "settings";
    if (path.startsWith("/admin/messages")) return "messages";
    if (path.startsWith("/admin/landing-page")) return "landing-page";
    return "dashboard";
  }, [location.pathname]);

  const loadAllData = async () => {
    setLoading(true);
    setUsersLoading(true);
    setBillboardsLoading(true);
    setPaymentsLoading(true);
    setBookingsLoading(true);
    setReportsLoading(true);

    let fallback = false;
    try {
      const dbRes = await adminApi.getDashboardData();
      if (dbRes.success && dbRes.data) {
        setDashboardData(dbRes.data);
        setIsUsingFallback(false);
      } else {
        throw new Error("Admin Dashboard API failed");
      }
    } catch (error) {
      console.warn("Admin Dashboard stats API failed, loading fallback:", error);
      setIsUsingFallback(true);
      setDashboardData(mockAdminDashboard);
      fallback = true;
    } finally {
      // Clear main dashboard loading screen immediately so charts/KPIs show up under 1s
      setLoading(false);
    }

    if (fallback) {
      setUsers(mockUsers);
      setBillboards(mockBillboards);
      setPayments(mockPayments);
      setBookings(mockBookings);
      setReports(mockReports);
      setUsersLoading(false);
      setBillboardsLoading(false);
      setPaymentsLoading(false);
      setBookingsLoading(false);
      setReportsLoading(false);
      return;
    }

    // Load secondary list views asynchronously in the background
    adminApi.getUsers().then(res => {
      setUsers(res.success && res.data ? res.data : []);
    }).catch(err => console.error("Error loading users:", err))
      .finally(() => setUsersLoading(false));

    adminApi.getAllBillboards().then(res => {
      setBillboards(res.success && res.data ? res.data : []);
    }).catch(err => console.error("Error loading billboards:", err))
      .finally(() => setBillboardsLoading(false));

    adminApi.getPayments().then(res => {
      setPayments(res.success && res.data ? res.data : []);
    }).catch(err => console.error("Error loading payments:", err))
      .finally(() => setPaymentsLoading(false));

    adminApi.getBookings().then(res => {
      setBookings(res.success && res.data ? res.data : []);
    }).catch(err => console.error("Error loading bookings:", err))
      .finally(() => setBookingsLoading(false));

    reportApi.getReports().then(res => {
      setReports(res.success && res.data ? res.data : []);
    }).catch(err => console.error("Error loading reports:", err))
      .finally(() => setReportsLoading(false));
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filtered Users computation
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchKeyword = !userKeyword || u.fullName?.toLowerCase().includes(userKeyword.toLowerCase()) || u.email?.toLowerCase().includes(userKeyword.toLowerCase());
      const matchRole = !userRole || u.role === userRole;
      const matchStatus = !userStatus || u.status === userStatus;
      return matchKeyword && matchRole && matchStatus;
    });
  }, [users, userKeyword, userRole, userStatus]);

  // Filtered Billboards based on mode (All / Pending / Deleting)
  const filteredBillboards = useMemo(() => {
    // Sort logic: PENDING or PENDING_DELETION status goes first, then sorted by createdAt descending
    const sorted = [...billboards].sort((a, b) => {
      const aPending = (a.status === "PENDING" || a.status === "PENDING_DELETION") ? 1 : 0;
      const bPending = (b.status === "PENDING" || b.status === "PENDING_DELETION") ? 1 : 0;
      if (aPending !== bPending) {
        return bPending - aPending;
      }
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    if (billboardFilterMode === "PENDING") {
      return sorted.filter(bb => bb.status === "PENDING");
    }
    if (billboardFilterMode === "PENDING_DELETION") {
      return sorted.filter(bb => bb.status === "PENDING_DELETION");
    }
    return sorted;
  }, [billboards, billboardFilterMode]);

  // Filtered Reports computation
  const filteredReports = useMemo(() => {
    if (!reportFilterStatus) return reports;
    return reports.filter(r => r.status === reportFilterStatus);
  }, [reports, reportFilterStatus]);

  // Block/Unblock User toggle
  const handleToggleUserStatus = async (userToUpdate: User) => {
    const targetStatus: UserStatus = userToUpdate.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    const confirmMsg = targetStatus === "BLOCKED"
      ? `Bạn có chắc chắn muốn khóa tài khoản của ${userToUpdate.fullName}?`
      : `Bạn có chắc chắn muốn mở khóa tài khoản của ${userToUpdate.fullName}?`;

    const ok = await confirm({
      title: targetStatus === "BLOCKED" ? "Khóa tài khoản" : "Mở khóa tài khoản",
      description: confirmMsg,
      variant: targetStatus === "BLOCKED" ? "destructive" : "default",
      confirmLabel: "Xác nhận",
    });
    if (!ok) return;

    if (isUsingFallback) {
      setUsers(prev => prev.map(u => u.id === userToUpdate.id ? { ...u, status: targetStatus } : u));
      notify.success("Đã cập nhật trạng thái người dùng", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await adminApi.updateUserStatus(userToUpdate.id, targetStatus);
      if (res.success) {
        notify.success("Cập nhật trạng thái người dùng thành công");
        loadAllData();
      } else {
        notify.error(res.message || "Không thể cập nhật.");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi cập nhật."));
    }
  };

  // Billboard Approvals
  const handleApproveBillboard = async (id: number) => {
    const ok = await confirm({
      title: "Duyệt tin đăng",
      description: "Xác nhận duyệt bảng quảng cáo này và hiển thị trên sàn?",
      variant: "success",
      confirmLabel: "Duyệt",
    });
    if (!ok) return;
    if (isUsingFallback) {
      setBillboards(prev => prev.map(bb => bb.id === id ? { ...bb, status: "APPROVED" } : bb));
      notify.success("Đã duyệt bảng quảng cáo", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await adminApi.approveBillboard(id);
      if (res.success) {
        notify.success("Duyệt tin đăng bảng quảng cáo thành công");
        loadAllData();
      } else {
        notify.error(res.message || "Không thể duyệt bảng.");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi phê duyệt."));
    }
  };

  const handleRejectBillboard = async (id: number) => {
    const ok = await confirm({
      title: "Từ chối tin đăng",
      description: "Xác nhận từ chối bảng quảng cáo này?",
      variant: "destructive",
      confirmLabel: "Từ chối",
    });
    if (!ok) return;
    if (isUsingFallback) {
      setBillboards(prev => prev.map(bb => bb.id === id ? { ...bb, status: "REJECTED" } : bb));
      notify.success("Đã từ chối bảng quảng cáo", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await adminApi.rejectBillboard(id);
      if (res.success) {
        notify.success("Từ chối tin đăng bảng quảng cáo thành công");
        loadAllData();
      } else {
        notify.error(res.message || "Thao tác thất bại.");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi thao tác."));
    }
  };

  const handleHideBillboard = async (id: number) => {
    const ok = await confirm({
      title: "Ẩn tin đăng",
      description: "Xác nhận ẩn bảng quảng cáo này trên sàn?",
      confirmLabel: "Ẩn tin",
    });
    if (!ok) return;
    if (isUsingFallback) {
      setBillboards(prev => prev.map(bb => bb.id === id ? { ...bb, status: "HIDDEN" } : bb));
      notify.success("Đã ẩn bảng quảng cáo", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await adminApi.hideBillboard(id);
      if (res.success) {
        notify.success("Ẩn bảng quảng cáo thành công");
        loadAllData();
      } else {
        notify.error(res.message || "Thao tác ẩn thất bại.");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi thao tác."));
    }
  };

  const handleDeleteBillboard = async (id: number) => {
    const ok = await confirm({
      title: "Xóa vĩnh viễn",
      description: "Bạn có chắc chắn muốn xóa vĩnh viễn bảng quảng cáo này khỏi hệ thống? Hành động không thể hoàn tác.",
      variant: "destructive",
      confirmLabel: "Xóa",
    });
    if (!ok) return;
    if (isUsingFallback) {
      setBillboards(prev => prev.filter(bb => bb.id !== id));
      notify.success("Đã xóa bảng quảng cáo khỏi hệ thống", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await adminApi.deleteBillboard(id);
      if (res.success) {
        notify.success("Xóa bảng quảng cáo thành công");
        loadAllData();
      } else {
        notify.error(res.message || "Xóa thất bại.");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi hệ thống."));
    }
  };

  const handleApproveDeletion = async (id: number) => {
    const ok = await confirm({
      title: "Duyệt yêu cầu gỡ bảng",
      description: "Xác nhận duyệt yêu cầu gỡ bảng này? Bảng quảng cáo và toàn bộ dữ liệu liên quan sẽ bị xóa khỏi hệ thống.",
      variant: "destructive",
      confirmLabel: "Duyệt gỡ",
    });
    if (!ok) return;
    if (isUsingFallback) {
      setBillboards(prev => prev.filter(bb => bb.id !== id));
      notify.success("Đã duyệt gỡ bảng quảng cáo", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await adminApi.approveDeletion(id);
      if (res.success) {
        notify.success("Duyệt yêu cầu gỡ bảng thành công");
        loadAllData();
      } else {
        notify.error(res.message || "Thao tác thất bại.");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi phê duyệt gỡ bảng."));
    }
  };

  const handleRejectDeletion = async (id: number) => {
    const ok = await confirm({
      title: "Từ chối yêu cầu gỡ bảng",
      description: "Xác nhận khôi phục bảng quảng cáo này về trạng thái Đã Duyệt hoạt động bình thường?",
      variant: "default",
      confirmLabel: "Từ chối gỡ",
    });
    if (!ok) return;
    if (isUsingFallback) {
      setBillboards(prev => prev.map(bb => bb.id === id ? { ...bb, status: "APPROVED" } : bb));
      notify.success("Đã khôi phục bảng quảng cáo", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await adminApi.rejectDeletion(id);
      if (res.success) {
        notify.success("Đã từ chối yêu cầu gỡ bảng và khôi phục trạng thái hoạt động");
        loadAllData();
      } else {
        notify.error(res.message || "Thao tác thất bại.");
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi thao tác."));
    }
  };

  // Report Resolutions
  const handleResolveReport = async (id: number) => {
    const ok = await confirm({
      title: "Giải quyết khiếu nại",
      description: "Xác nhận đánh dấu khiếu nại này đã được giải quyết?",
      variant: "success",
      confirmLabel: "Giải quyết",
    });
    if (!ok) return;
    if (isUsingFallback) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: "RESOLVED" } : r));
      notify.success("Đã đánh dấu đã giải quyết", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await reportApi.resolveReport(id);
      if (res.success) {
        notify.success("Đã giải quyết khiếu nại");
        loadAllData();
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi thao tác."));
    }
  };

  const handleRejectReport = async (id: number) => {
    const ok = await confirm({
      title: "Bác bỏ khiếu nại",
      description: "Xác nhận bác bỏ khiếu nại này?",
      variant: "destructive",
      confirmLabel: "Bác bỏ",
    });
    if (!ok) return;
    if (isUsingFallback) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: "REJECTED" } : r));
      notify.success("Đã bác bỏ khiếu nại", "Chế độ mô phỏng");
      return;
    }

    try {
      const res = await reportApi.rejectReport(id);
      if (res.success) {
        notify.success("Bác bỏ khiếu nại thành công");
        loadAllData();
      }
    } catch (err: unknown) {
      notify.error(apiErrorMessage(err, "Lỗi thao tác."));
    }
  };

  // Joined Transactions mapping (Client side join of payments + bookings)
  const transactionTableData = useMemo(() => {
    return payments.map(pay => {
      const b = bookings.find(bk => bk.id === pay.bookingId);
      return {
        id: pay.id,
        bookingId: pay.bookingId,
        txnCode: pay.transactionCode || `GD-${pay.id.toString().padStart(3, "0")}`,
        renter: b?.renter?.fullName || "Nhà quảng cáo",
        owner: b?.billboard?.owner?.fullName || "Chủ bảng QC",
        billboard: b?.billboard?.title || "Màn hình LED",
        amount: pay.amount.toLocaleString("vi-VN") + "₫",
        commission: pay.platformCommission.toLocaleString("vi-VN") + "₫",
        ownerRev: pay.ownerRevenue.toLocaleString("vi-VN") + "₫",
        status: pay.paymentStatus,
        date: pay.paidAt ? formatDate(pay.paidAt) : formatDate(pay.createdAt)
      };
    });
  }, [payments, bookings]);

  // Columns Definitions
  const userColumns = [
    { key: "fullName", label: "Họ Tên", render: (v: string) => <span style={{ fontWeight: 500 }} className="text-[#1D4ED8]">{v}</span> },
    { key: "email", label: "Email" },
    { key: "phone", label: "Số điện thoại" },
    {
      key: "role",
      label: "Vai Trò",
      render: (v: string) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${v === "RENTER" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : v === "OWNER" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
          {v === "RENTER" ? "Nhà Quảng Cáo" : v === "OWNER" ? "Chủ Bảng" : "Quản Trị"}
        </span>
      )
    },
    {
      key: "status",
      label: "Trạng Thái",
      render: (v: string) => {
        let variant: BadgeVariant = "pending";
        if (v === "ACTIVE") variant = "active";
        else if (v === "BLOCKED") variant = "unavailable";
        return <StatusBadge variant={variant} label={v === "ACTIVE" ? "Hoạt động" : v === "BLOCKED" ? "Đã khóa" : "Chờ duyệt"} />;
      }
    },
    {
      key: "actions",
      label: "Thao Tác",
      render: (_: any, row: User) => (
        <button
          onClick={() => handleToggleUserStatus(row)}
          className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
            row.status === "BLOCKED"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
          }`}
        >
          {row.status === "BLOCKED" ? "Mở Khóa" : "Khóa"}
        </button>
      )
    }
  ];

  const listingColumns = [
    { key: "title", label: "Tên Bảng QC", render: (v: string) => <span style={{ fontWeight: 500 }} className="text-[#1D4ED8]">{v}</span> },
    { key: "owner", label: "Chủ Sở Hữu", render: (v: any) => <span>{v?.fullName || "Chủ sở hữu"}</span> },
    { key: "address", label: "Vị Trí", render: (_: any, row: BillboardDto) => <span className="truncate max-w-[150px] block">{row.district}, {row.city}</span> },
    { key: "dimensions", label: "Kích Thước", render: (_: any, row: BillboardDto) => <span>{row.width}m x {row.height}m</span> },
    { key: "pricePerMonth", label: "Giá Thuê Tháng", render: (v: number) => <span className="font-semibold text-foreground">{(v / 1000000).toLocaleString("vi-VN")}Tr₫</span> },
    {
      key: "status",
      label: "Trạng Thái",
      render: (v: string) => {
        let variant: BadgeVariant = "pending";
        let label = "Chờ duyệt";
        if (v === "APPROVED") { variant = "active"; label = "Đã duyệt"; }
        else if (v === "REJECTED") { variant = "unavailable"; label = "Từ chối"; }
        else if (v === "HIDDEN") { variant = "expired"; label = "Đã ẩn"; }
        else if (v === "PENDING_DELETION") { variant = "unavailable"; label = "Yêu cầu gỡ"; }
        return <StatusBadge variant={variant} label={label} />;
      }
    },
    {
      key: "actions",
      label: "Thao Tác",
      render: (_: any, row: BillboardDto) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedDetailBillboard(row)}
            className="w-7 h-7 rounded-md border border-border hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground cursor-pointer"
            title="Xem chi tiết"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          {row.status === "PENDING" && (
            <>
              <button
                onClick={() => handleApproveBillboard(row.id)}
                className="text-xs bg-emerald-500/10 text-emerald-500 px-2.5 py-1.5 rounded-md hover:bg-emerald-500/20 font-semibold border border-emerald-500/20 cursor-pointer"
              >
                Duyệt
              </button>
              <button
                onClick={() => handleRejectBillboard(row.id)}
                className="text-xs bg-red-500/10 text-red-500 px-2.5 py-1.5 rounded-md hover:bg-red-500/20 font-semibold border border-red-500/20 cursor-pointer"
              >
                Từ Chối
              </button>
            </>
          )}
          {row.status === "APPROVED" && (
            <button
              onClick={() => handleHideBillboard(row.id)}
              className="text-xs bg-amber-500/10 text-amber-500 px-2.5 py-1.5 rounded-md hover:bg-amber-500/20 font-semibold border border-amber-500/20 cursor-pointer"
            >
              Ẩn Tin
            </button>
          )}
          {row.status === "PENDING_DELETION" && (
            <>
              <button
                onClick={() => handleApproveDeletion(row.id)}
                className="text-xs bg-rose-500/10 text-rose-600 px-2.5 py-1.5 rounded-md hover:bg-rose-500/20 font-bold border border-rose-500/20 cursor-pointer animate-pulse"
                title="Duyệt yêu cầu gỡ bảng này khỏi hệ thống"
              >
                Duyệt gỡ
              </button>
              <button
                onClick={() => handleRejectDeletion(row.id)}
                className="text-xs bg-slate-500/10 text-slate-600 px-2.5 py-1.5 rounded-md hover:bg-slate-500/20 font-bold border border-slate-500/20 cursor-pointer"
                title="Bác bỏ yêu cầu gỡ, giữ lại bảng"
              >
                Khôi phục
              </button>
            </>
          )}
          <button
            onClick={() => handleDeleteBillboard(row.id)}
            className="w-7 h-7 rounded-md border border-border hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-muted-foreground cursor-pointer"
            title="Xóa vĩnh viễn"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  const transactionColumns = [
    { key: "txnCode", label: "Mã GD", render: (v: string) => <span className="text-[#06B6D4] text-xs font-semibold">{v}</span> },
    { key: "renter", label: "Nhà QC" },
    { key: "owner", label: "Chủ Bảng" },
    { key: "billboard", label: "Màn hình LED" },
    { key: "amount", label: "Tổng Tiền", render: (v: string) => <span style={{ fontWeight: 600 }} className="text-[#1D4ED8]">{v}</span> },
    { key: "commission", label: "Hoa Hồng (5%)", render: (v: string) => <span className="text-emerald-600 font-semibold">{v}</span> },
    { key: "ownerRev", label: "Chủ Nhận (95%)", render: (v: string) => <span className="text-primary font-semibold">{v}</span> },
    {
      key: "status",
      label: "Trạng Thái",
      render: (v: string) => {
        let variant: BadgeVariant = "pending";
        if (v === "SUCCESS") variant = "active";
        else if (v === "FAILED") variant = "unavailable";
        return <StatusBadge variant={variant} label={v === "SUCCESS" ? "Thành công" : v === "FAILED" ? "Thất bại" : "Chờ xử lý"} />;
      }
    },
    { key: "date", label: "Ngày Paid" }
  ];

  const reportColumns = [
    { key: "reporter", label: "Người Khiếu Nại", render: (v: any) => <span className="font-semibold text-foreground">{v?.fullName || "Thành viên"}</span> },
    {
      key: "targetType",
      label: "Đối Tượng",
      render: (v: string) => (
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${v === "BILLBOARD" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
          {v === "BILLBOARD" ? "Bảng QC" : "Thành Viên"}
        </span>
      )
    },
    { key: "targetId", label: "Mã Số" },
    { key: "reason", label: "Lý do khiếu nại" },
    {
      key: "status",
      label: "Trạng Thái",
      render: (v: string) => {
        let variant: BadgeVariant = "pending";
        let label = "Đang xử lý";
        if (v === "RESOLVED") { variant = "active"; label = "Đã xử lý"; }
        else if (v === "REJECTED") { variant = "expired"; label = "Đã bác bỏ"; }
        return <StatusBadge variant={variant} label={label} />;
      }
    },
    {
      key: "actions",
      label: "Xử Lý",
      render: (_: any, row: ReportDto) => (
        <div className="flex items-center gap-2">
          {row.status === "PENDING" ? (
            <>
              <button
                onClick={() => handleResolveReport(row.id)}
                className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-100 font-semibold cursor-pointer border border-emerald-100"
              >
                Giải Quyết
              </button>
              <button
                onClick={() => handleRejectReport(row.id)}
                className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 font-semibold cursor-pointer border border-red-100"
              >
                Bác Bỏ
              </button>
            </>
          ) : (
            <span className="text-slate-400 text-xs italic">Hoàn tất</span>
          )}
        </div>
      )
    }
  ];

  if (loading && !dashboardData) {
    return (
      <div className="flex h-dvh bg-background text-foreground">
        <DashboardSidebar role="admin" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-border border-t-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-dvh bg-background text-foreground">
      <DashboardSidebar role="admin" />
      <main className={`flex-1 flex flex-col h-dvh pb-safe-nav lg:pb-0 ${view === "messages" ? "overflow-hidden" : "overflow-y-auto"}`}>
        {isUsingFallback && (
          <div className="bg-amber-50/15 border-b border-amber-200/20 px-8 py-3 flex items-center gap-2 text-xs text-amber-500 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chế độ ngoại tuyến:</strong> Đang hiển thị dữ liệu mô phỏng do không kết nối được với máy chủ API.
            </span>
          </div>
        )}

        <header className="sticky top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-border/30 px-6 md:px-8 h-16 shadow-[0_0_20px_rgba(6,182,212,0.1)] shrink-0 flex items-center">
          <div className="w-full flex items-center justify-between gap-4">
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              {view === "users"
                ? "Quản Lý Thành Viên"
                : view === "listings"
                ? "Duyệt Tin Đăng Bảng QC"
                : view === "transactions"
                ? "Giám Sát Doanh Thu & Giao Dịch"
                : view === "revenue"
                ? "Doanh Thu & Hoa Hồng"
                : view === "disputes"
                ? "Trung Tâm Khiếu Nại"
                : view === "reports"
                ? "Báo Cáo & Tố Cáo"
                : view === "settings"
                ? "Cài Đặt Hệ Thống"
                : view === "messages"
                ? "Tin Nhắn Nền Tảng"
                : view === "landing-page"
                ? "Cấu Hình Landing Page"
                : "Bảng Điều Khiển Quản Trị"}
            </h1>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 border border-border/50 rounded-lg text-muted-foreground hover:text-accent hover:bg-surface/50 transition-colors cursor-pointer active:scale-95 flex items-center justify-center bg-transparent"
                title="Đổi giao diện"
              >
                {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {currentUser && (
                <div className="relative profile-dropdown-trigger">
                  <button
                    type="button"
                    onClick={() => setShowProfileDropdown((prev) => !prev)}
                    className="flex items-center gap-2 hover:bg-surface/50 p-1.5 rounded-lg border border-border/40 transition-colors cursor-pointer bg-transparent text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-primary/20">
                      {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-foreground max-w-[100px] truncate">
                      {currentUser.fullName}
                    </span>
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">{currentUser.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate("/admin/settings");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors cursor-pointer flex items-center gap-2 border-none bg-transparent"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        Cấu hình hệ thống
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileDropdown(false);
                          logout();
                          navigate("/");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer flex items-center gap-2 border-t border-border mt-1 bg-transparent"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={loadAllData}
                className="p-2 border border-border/50 rounded-lg text-primary hover:bg-surface/50 cursor-pointer flex items-center justify-center transition-colors bg-transparent"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* 1. OVERVIEW DASHBOARD VIEW */}
        {view === "dashboard" && dashboardData && (
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <KpiCard title="Tổng Người Dùng" value={dashboardData.totalUsers.toLocaleString("vi-VN")} change="+3" changeType="up" icon={<Users className="w-5 h-5" />} />
              <KpiCard title="Tổng Tin Đăng" value={dashboardData.totalBillboards.toString()} change="+2" changeType="up" icon={<Monitor className="w-5 h-5" />} />
              <KpiCard title="Tổng Giao Dịch (GMV)" value={`${(dashboardData.totalGMV / 1000000000).toFixed(1)} Tỷ₫`} change="+15%" changeType="up" icon={<DollarSign className="w-5 h-5" />} />
              <KpiCard title="Doanh Thu Hoa Hồng (5%)" value={`${(dashboardData.commissionRevenue / 1000000).toLocaleString("vi-VN")} Tr₫`} change="+12%" changeType="up" icon={<TrendingUp className="w-5 h-5" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border/80 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-primary font-semibold">GMV Nền Tảng Hàng Tháng</h3>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dashboardData.gmvChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000000} Tỷ`} />
                    <Tooltip formatter={(value: number) => [`${(value / 1000000000).toFixed(1)} Tỷ ₫`, "GMV"]} />
                    <Bar dataKey="gmv" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card rounded-xl border border-border/80 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-primary font-semibold">Số Lượng Chiến Dịch / Đặt Chỗ</h3>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={dashboardData.bookingChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ fill: "var(--color-accent)", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick overview of pending items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border/80 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-primary font-semibold">Tin Đăng Chờ Duyệt</h3>
                  <button onClick={() => navigate("/admin/listings")} className="text-xs text-[#06B6D4] hover:underline cursor-pointer">
                    Quản lý tin đăng
                  </button>
                </div>
                {billboardsLoading ? (
                  <div className="text-xs text-center text-muted-foreground py-6 flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 h-4 border-2 border-border border-t-primary" />
                    Đang tải tin đăng...
                  </div>
                ) : billboards.filter(b => b.status === "PENDING").length === 0 ? (
                  <div className="text-xs text-center text-muted-foreground py-6">Không có tin đăng nào đang chờ duyệt.</div>
                ) : (
                  <div className="max-h-[250px] overflow-y-auto space-y-2.5">
                    {billboards.filter(b => b.status === "PENDING").map(b => (
                      <div key={b.id} className="flex justify-between items-center border border-border/80 p-3 rounded-lg text-xs bg-surface/30">
                        <div className="cursor-pointer flex-1 mr-2" onClick={() => setSelectedDetailBillboard(b)}>
                          <p className="font-bold text-foreground hover:text-primary transition-colors">{b.title}</p>
                          <p className="text-muted-foreground">{b.district}, {b.city} • Chủ: {b.owner?.fullName}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleApproveBillboard(b.id)} className="bg-emerald-50 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-emerald-600 cursor-pointer">Duyệt</button>
                          <button onClick={() => handleRejectBillboard(b.id)} className="bg-red-550 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-red-600 cursor-pointer">Từ Chối</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-card rounded-xl border border-border/80 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-primary font-semibold">Khiếu Nại & Tố Cáo Chờ Xử Lý</h3>
                  <button onClick={() => navigate("/admin/reports")} className="text-xs text-[#06B6D4] hover:underline cursor-pointer">
                    Giải quyết khiếu nại
                  </button>
                </div>
                {reportsLoading ? (
                  <div className="text-xs text-center text-muted-foreground py-6 flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 h-4 border-2 border-border border-t-primary" />
                    Đang tải khiếu nại...
                  </div>
                ) : reports.filter(r => r.status === "PENDING").length === 0 ? (
                  <div className="text-xs text-center text-muted-foreground py-6">Hệ thống đang hoạt động an toàn. Không có khiếu nại mới.</div>
                ) : (
                  <div className="max-h-[250px] overflow-y-auto space-y-2.5">
                    {reports.filter(r => r.status === "PENDING").map(r => (
                      <div key={r.id} className="border border-border/80 p-3 rounded-lg text-xs bg-surface/30 space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-foreground">Khiếu nại #{r.id} ({r.targetType})</span>
                          <span className="text-red-500 font-bold uppercase text-[9px] bg-red-50 px-1.5 py-0.5 rounded">Mới</span>
                        </div>
                        <p className="text-muted-foreground">Lý do: {r.reason}</p>
                        <div className="flex justify-end gap-1.5 pt-1.5">
                          <button onClick={() => handleResolveReport(r.id)} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold hover:bg-emerald-100 cursor-pointer">Đã xử lý</button>
                          <button onClick={() => handleRejectReport(r.id)} className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded text-[10px] font-bold hover:bg-red-100 cursor-pointer">Bác bỏ</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. USER MANAGEMENT VIEW */}
        {view === "users" && (
          <div className="p-8 space-y-4">
            {/* Filter card */}
            <div className="bg-card border border-border/80 rounded-xl p-5 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex basis-full sm:basis-auto items-center gap-2 border border-border rounded-lg px-3 py-2 bg-surface/30 min-w-[280px] flex-1 max-w-[560px]">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm thành viên (Họ tên, email)..."
                  value={userKeyword}
                  onChange={(e) => setUserKeyword(e.target.value)}
                  className="bg-transparent border-none outline-none w-full min-w-0 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1 bg-surface/30">
                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as Role | "")}
                  className="bg-transparent border-none outline-none text-primary font-medium"
                >
                  <option className="bg-card text-foreground" value="">Tất Cả Vai Trò</option>
                  <option className="bg-card text-foreground" value="RENTER">Nhà Quảng Cáo (Renter)</option>
                  <option className="bg-card text-foreground" value="OWNER">Chủ Bảng QC (Owner)</option>
                  <option className="bg-card text-foreground" value="ADMIN">Quản Trị Viên (Admin)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1 bg-surface/30">
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value as UserStatus | "")}
                  className="bg-transparent border-none outline-none text-primary font-medium"
                >
                  <option className="bg-card text-foreground" value="">Tất Cả Trạng Thái</option>
                  <option className="bg-card text-foreground" value="ACTIVE">Hoạt Động (Active)</option>
                  <option className="bg-card text-foreground" value="BLOCKED">Đã Khóa (Blocked)</option>
                  <option className="bg-card text-foreground" value="PENDING">Chờ Xác Minh (Pending)</option>
                </select>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border/80 p-6">
              {usersLoading ? (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-border/80 border-t-primary" />
                  <span>Đang tải danh sách thành viên...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Không tìm thấy thành viên phù hợp.</div>
              ) : (
                <DataTable columns={userColumns} data={filteredUsers} />
              )}
            </div>
          </div>
        )}

        {/* 3. BILLBOARD LISTINGS VIEW */}
        {view === "listings" && (
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between bg-card border border-border/80 rounded-xl p-5">
              <div className="flex gap-2">
                <button
                  onClick={() => setBillboardFilterMode("ALL")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    billboardFilterMode === "ALL"
                      ? "bg-primary text-white"
                      : "bg-primary-light text-primary hover:bg-primary-light/80"
                  }`}
                >
                  Tất Cả Tin Đăng ({billboards.length})
                </button>
                <button
                  onClick={() => setBillboardFilterMode("PENDING")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    billboardFilterMode === "PENDING"
                      ? "bg-amber-500 text-white"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  Chờ Duyệt ({billboards.filter(b => b.status === "PENDING").length})
                </button>
                <button
                  onClick={() => setBillboardFilterMode("PENDING_DELETION")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    billboardFilterMode === "PENDING_DELETION"
                      ? "bg-rose-500 text-white"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  Yêu Cầu Gỡ ({billboards.filter(b => b.status === "PENDING_DELETION").length})
                </button>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border/80 p-6">
              {billboardsLoading ? (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-border/80 border-t-primary" />
                  <span>Đang tải danh sách bảng QC...</span>
                </div>
              ) : filteredBillboards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Không có bảng quảng cáo nào trong bộ lọc này.</div>
              ) : (
                <DataTable columns={listingColumns} data={filteredBillboards} />
              )}
            </div>
          </div>
        )}

        {/* 4. TRANSACTION AUDITING VIEW */}
        {view === "transactions" && (
          <div className="p-8 space-y-6">
            <div className="bg-card rounded-xl border border-border/80 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-primary font-bold text-lg">Giám Sát Hóa Đơn & Thanh Toán</h3>
                <span className="text-xs bg-primary-light text-primary px-3 py-1.5 rounded-full font-bold">Thu Phí Sàn 5% (Platform Commission)</span>
              </div>
              {paymentsLoading ? (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-border/80 border-t-primary" />
                  <span>Đang tải lịch sử giao dịch...</span>
                </div>
              ) : transactionTableData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Chưa ghi nhận giao dịch thanh toán nào.</div>
              ) : (
                <DataTable columns={transactionColumns} data={transactionTableData} />
              )}
            </div>

            <div className="bg-card rounded-xl border border-border/80 p-6">
              <h3 className="text-primary font-bold text-base mb-4">Danh Sách Chiến Dịch Hợp Đồng Thuê (Bookings)</h3>
              {bookingsLoading ? (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-border/80 border-t-primary" />
                  <span>Đang tải danh sách đặt chỗ...</span>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Chưa ghi nhận đặt chỗ nào.</div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse text-foreground">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground">
                        <th className="py-2.5">ID</th>
                        <th>Nhà QC</th>
                        <th>Chủ Sở Hữu</th>
                        <th>Bảng QC</th>
                        <th>Thời Gian</th>
                        <th>Tổng Giá Thuê</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-surface/30">
                          <td className="py-3 font-semibold">#{b.id}</td>
                          <td className="text-foreground font-semibold">{b.renter?.fullName || "Khách hàng"}</td>
                          <td className="text-muted-foreground">{b.billboard?.owner?.fullName || "Chủ bảng"}</td>
                          <td className="text-primary font-medium">{b.billboard?.title}</td>
                          <td className="text-muted-foreground">{formatDate(b.startDate)} - {formatDate(b.endDate)}</td>
                          <td className="font-bold text-foreground">{b.finalAmount.toLocaleString("vi-VN")}₫</td>
                          <td>
                            <span
                              className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                                b.status === "PAID"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                  : b.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-red-50 text-red-700 border border-red-100"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. REVENUE ANALYTICS VIEW */}
        {view === "revenue" && dashboardData && (
          <AdminRevenueView
            dashboardData={dashboardData}
            payments={payments}
            bookings={bookings}
          />
        )}

        {/* 6. DISPUTES CENTER VIEW */}
        {view === "disputes" && (
          <AdminDisputesView
            reports={reports}
            onResolve={handleResolveReport}
            onReject={handleRejectReport}
          />
        )}

        {/* 7. SYSTEM SETTINGS VIEW */}
        {view === "messages" && <MessagesView role="ADMIN" />}

        {view === "settings" && <AdminSettingsView />}

        {view === "landing-page" && <AdminLandingPageView />}

        {/* 8. REPORTS MANAGEMENT VIEW */}
        {view === "reports" && (
          <div className="p-8 space-y-4">
            <div className="bg-card border border-border/80 rounded-xl p-5 flex items-center gap-4 text-xs">
              <span className="font-bold text-muted-foreground">Bộ Lọc Khiếu Nại:</span>
              <div className="flex gap-2">
                {["", "PENDING", "RESOLVED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportFilterStatus(st as ReportStatus | "")}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                      reportFilterStatus === st
                        ? "bg-primary text-white border-primary"
                        : "bg-card text-muted-foreground border-border hover:bg-surface/50"
                    }`}
                  >
                    {st === "" ? "Tất Cả" : st === "PENDING" ? "Chờ Xử Lý" : st === "RESOLVED" ? "Đã Giải Quyết" : "Đã Bác Bỏ"}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border/80 p-6">
              {filteredReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Không có báo cáo tố cáo nào.</div>
              ) : (
                <DataTable columns={reportColumns} data={filteredReports} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* ====== BILLBOARD DETAIL PREVIEW MODAL ====== */}
      {selectedDetailBillboard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setSelectedDetailBillboard(null)}
        >
          <div
            className="bg-card border border-border/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 sticky top-0 bg-card z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{selectedDetailBillboard.title}</h2>
                  <p className="text-xs text-muted-foreground">{selectedDetailBillboard.district}, {selectedDetailBillboard.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedDetailBillboard.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => { handleApproveBillboard(selectedDetailBillboard.id); setSelectedDetailBillboard(null); }}
                      className="flex items-center gap-1.5 text-xs bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 font-bold cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Duyệt
                    </button>
                    <button
                      onClick={() => { handleRejectBillboard(selectedDetailBillboard.id); setSelectedDetailBillboard(null); }}
                      className="flex items-center gap-1.5 text-xs bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 font-bold cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" /> Từ Chối
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedDetailBillboard(null)}
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-surface/50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT: Image Preview */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Hình ảnh ({selectedDetailBillboard.images?.length ?? 0})</p>
                {!selectedDetailBillboard.images || selectedDetailBillboard.images.length === 0 ? (
                  <div className="aspect-video bg-surface/50 border border-border/80 rounded-xl flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <ImageIcon className="w-10 h-10 opacity-40" />
                    <span className="text-xs">Chưa có hình ảnh</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Main image viewer */}
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-border/80 group">
                      {selectedDetailBillboard.images[activePreviewImageIdx]?.imageUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video
                          src={selectedDetailBillboard.images[activePreviewImageIdx].imageUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={selectedDetailBillboard.images[activePreviewImageIdx]?.imageUrl}
                          alt={`Preview ${activePreviewImageIdx + 1}`}
                          className="w-full h-full object-contain"
                        />
                      )}
                      {/* Nav arrows */}
                      {selectedDetailBillboard.images.length > 1 && (
                        <>
                          <button
                            onClick={() => setActivePreviewImageIdx(i => (i - 1 + (selectedDetailBillboard.images?.length ?? 1)) % (selectedDetailBillboard.images?.length ?? 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActivePreviewImageIdx(i => (i + 1) % (selectedDetailBillboard.images?.length ?? 1))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          {/* Index badge */}
                          <div className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full">
                            {activePreviewImageIdx + 1} / {selectedDetailBillboard.images.length}
                          </div>
                        </>
                      )}
                      {selectedDetailBillboard.images[activePreviewImageIdx]?.isThumbnail && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3" /> Ảnh đại diện
                        </div>
                      )}
                    </div>
                    {/* Thumbnails strip */}
                    {selectedDetailBillboard.images.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {selectedDetailBillboard.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePreviewImageIdx(idx)}
                            className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                              idx === activePreviewImageIdx ? "border-primary" : "border-border/60 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={img.imageUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Mô tả</p>
                  <p className="text-sm text-foreground leading-relaxed bg-surface/30 border border-border/60 rounded-xl p-3">
                    {selectedDetailBillboard.description || <span className="italic text-muted-foreground">Không có mô tả</span>}
                  </p>
                </div>
              </div>

              {/* RIGHT: Specs & Owner Info */}
              <div className="space-y-4">
                {/* Status badge */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedDetailBillboard.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:border-amber-500/30" :
                    selectedDetailBillboard.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:border-emerald-500/30" :
                    selectedDetailBillboard.status === "REJECTED" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/15 dark:border-red-500/30" :
                    "bg-surface/50 text-muted-foreground border-border"
                  }`}>
                    {selectedDetailBillboard.status === "PENDING" ? "⏳ Chờ duyệt" :
                     selectedDetailBillboard.status === "APPROVED" ? "✅ Đã duyệt" :
                     selectedDetailBillboard.status === "REJECTED" ? "❌ Từ chối" :
                     selectedDetailBillboard.status}
                  </span>
                  {selectedDetailBillboard.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:border-amber-500/30">
                      <Star className="w-3 h-3" /> Nổi bật
                    </span>
                  )}
                </div>

                {/* Location & Size */}
                <div className="bg-surface/30 border border-border/60 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Vị trí & Kích thước</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Địa chỉ</p>
                        <p className="font-medium text-foreground text-xs">{selectedDetailBillboard.address || `${selectedDetailBillboard.district}, ${selectedDetailBillboard.city}`}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Layers className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] text-muted-foreground">Kích thước</p>
                        <p className="font-medium text-foreground text-xs">{selectedDetailBillboard.width}m × {selectedDetailBillboard.height}m</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="bg-surface/30 border border-border/60 rounded-xl p-4">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Thông số kỹ thuật</p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    {[
                      { label: "Loại màn hình", value: selectedDetailBillboard.screenType },
                      { label: "Độ phân giải", value: selectedDetailBillboard.resolution },
                      { label: "Độ sáng", value: selectedDetailBillboard.brightness ? `${selectedDetailBillboard.brightness.toLocaleString("vi-VN")} nits` : undefined },
                      { label: "Tần số quét", value: selectedDetailBillboard.refreshRate ? `${selectedDetailBillboard.refreshRate} Hz` : undefined },
                      { label: "Giờ hoạt động", value: selectedDetailBillboard.operatingHours },
                      { label: "Lượt xem / ngày", value: selectedDetailBillboard.dailyViews?.toLocaleString("vi-VN") },
                    ].map(spec => spec.value ? (
                      <div key={spec.label}>
                        <p className="text-muted-foreground">{spec.label}</p>
                        <p className="font-semibold text-foreground">{spec.value}</p>
                      </div>
                    ) : null)}
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-surface/30 border border-border/60 rounded-xl p-4">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Bảng giá</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Giá theo ngày</span>
                      <span className="font-bold text-foreground">{selectedDetailBillboard.pricePerDay?.toLocaleString("vi-VN")}₫</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3" /> Giá theo tháng</span>
                      <span className="font-bold text-primary text-sm">{(selectedDetailBillboard.pricePerMonth / 1_000_000).toLocaleString("vi-VN")} Tr₫</span>
                    </div>
                    {selectedDetailBillboard.locationSurcharge > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Phụ thu vị trí</span>
                        <span className="font-semibold text-amber-600">{selectedDetailBillboard.locationSurcharge?.toLocaleString("vi-VN")}₫</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Owner Info */}
                <div className="bg-surface/30 border border-border/60 rounded-xl p-4">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Chủ sở hữu</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {selectedDetailBillboard.owner?.fullName?.charAt(0) ?? "?"}
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-foreground">{selectedDetailBillboard.owner?.fullName}</p>
                      <p className="text-muted-foreground">{selectedDetailBillboard.owner?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Creation date */}
                {selectedDetailBillboard.createdAt && (
                  <p className="text-xs text-muted-foreground text-right">Đăng lúc: {formatDate(selectedDetailBillboard.createdAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <MobileBottomNav />
    </div>
  );
}
