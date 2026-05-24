import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Users, Monitor, DollarSign, TrendingUp, Check, X, Eye, Trash2, AlertTriangle, Search, Filter, RefreshCw } from "lucide-react";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { KpiCard } from "../components/KpiCard";
import { StatusBadge } from "../components/StatusBadge";
import { DataTable } from "../components/DataTable";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";
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
  const { user: currentUser } = useAuth();
  const confirm = useConfirm();

  const [dashboardData, setDashboardData] = useState<AdminDashboardDto | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [billboards, setBillboards] = useState<BillboardDto[]>([]);
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [bookings, setBookings] = useState<BookingDto[]>([]);
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // User filter states
  const [userKeyword, setUserKeyword] = useState("");
  const [userRole, setUserRole] = useState<Role | "">("");
  const [userStatus, setUserStatus] = useState<UserStatus | "">("");

  // Billboard listing mode (All vs Pending)
  const [billboardFilterMode, setBillboardFilterMode] = useState<"ALL" | "PENDING">("ALL");

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
    return "dashboard";
  }, [location.pathname]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Dashboard Stats
      const dbRes = await adminApi.getDashboardData();
      const dbData = dbRes.success ? dbRes.data : mockAdminDashboard;

      // 2. Fetch Users
      const userRes = await adminApi.getUsers();
      const userData = userRes.success ? userRes.data : mockUsers;

      // 3. Fetch Billboards
      const bbRes = await adminApi.getAllBillboards();
      const bbData = bbRes.success ? bbRes.data : mockBillboards;

      // 4. Fetch Payments
      const payRes = await adminApi.getPayments();
      const payData = payRes.success ? payRes.data : mockPayments;

      // 5. Fetch Bookings
      const bkRes = await adminApi.getBookings();
      const bkData = bkRes.success ? bkRes.data : mockBookings;

      // 6. Fetch Dispute Reports
      const rpRes = await reportApi.getReports();
      const rpData = rpRes.success ? rpRes.data : mockReports;

      if (!dbRes.success || !userRes.success || !bbRes.success || !payRes.success || !bkRes.success || !rpRes.success) {
        throw new Error("API response error");
      }

      setDashboardData(dbData);
      setUsers(userData);
      setBillboards(bbData);
      setPayments(payData);
      setBookings(bkData);
      setReports(rpData);
      setIsUsingFallback(false);
    } catch (error) {
      console.warn("Admin APIs failed, fallback loading:", error);
      setIsUsingFallback(true);
      setDashboardData(mockAdminDashboard);
      setUsers(mockUsers);
      setBillboards(mockBillboards);
      setPayments(mockPayments);
      setBookings(mockBookings);
      setReports(mockReports);
    } finally {
      setLoading(false);
    }
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

  // Filtered Billboards based on mode (All / Pending)
  const filteredBillboards = useMemo(() => {
    if (billboardFilterMode === "PENDING") {
      return billboards.filter(bb => bb.status === "PENDING");
    }
    return billboards;
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
        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${v === "RENTER" ? "bg-blue-50 text-blue-700 border border-blue-200" : v === "OWNER" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
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
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
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
    { key: "pricePerMonth", label: "Giá Thuê Tháng", render: (v: number) => <span className="font-semibold text-slate-800">{(v / 1000000).toLocaleString("vi-VN")}Tr₫</span> },
    {
      key: "status",
      label: "Trạng Thái",
      render: (v: string) => {
        let variant: BadgeVariant = "pending";
        let label = "Chờ duyệt";
        if (v === "APPROVED") { variant = "active"; label = "Đã duyệt"; }
        else if (v === "REJECTED") { variant = "unavailable"; label = "Từ chối"; }
        else if (v === "HIDDEN") { variant = "expired"; label = "Đã ẩn"; }
        return <StatusBadge variant={variant} label={label} />;
      }
    },
    {
      key: "actions",
      label: "Thao Tác",
      render: (_: any, row: BillboardDto) => (
        <div className="flex items-center gap-1.5">
          {row.status === "PENDING" && (
            <>
              <button
                onClick={() => handleApproveBillboard(row.id)}
                className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-md hover:bg-emerald-100 font-semibold border border-emerald-100 cursor-pointer"
              >
                Duyệt
              </button>
              <button
                onClick={() => handleRejectBillboard(row.id)}
                className="text-xs bg-red-50 text-red-600 px-2.5 py-1.5 rounded-md hover:bg-red-100 font-semibold border border-red-100 cursor-pointer"
              >
                Từ Chối
              </button>
            </>
          )}
          {row.status === "APPROVED" && (
            <button
              onClick={() => handleHideBillboard(row.id)}
              className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-md hover:bg-amber-100 font-semibold border border-amber-100 cursor-pointer"
            >
              Ẩn Tin
            </button>
          )}
          <button
            onClick={() => handleDeleteBillboard(row.id)}
            className="w-7 h-7 rounded-md border border-slate-200 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-[#6B7A8D] cursor-pointer"
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
    { key: "ownerRev", label: "Chủ Nhận (95%)", render: (v: string) => <span className="text-[#1E40AF] font-semibold">{v}</span> },
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
    { key: "reporter", label: "Người Khiếu Nại", render: (v: any) => <span className="font-semibold text-[#1E293B]">{v?.fullName || "Thành viên"}</span> },
    {
      key: "targetType",
      label: "Đối Tượng",
      render: (v: string) => (
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${v === "BILLBOARD" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
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
      <div className="flex h-screen bg-[#F0F9FF]">
        <DashboardSidebar role="admin" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#E3E8EF] border-t-[#1D4ED8]"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F0F9FF]">
      <DashboardSidebar role="admin" />
      <main className="flex-1 overflow-y-auto">
        {isUsingFallback && (
          <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex items-center gap-2 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chế độ ngoại tuyến:</strong> Đang hiển thị dữ liệu mô phỏng do không kết nối được với máy chủ API.
            </span>
          </div>
        )}

        <div className="bg-white border-b border-[#E3E8EF] px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-[#1D4ED8]" style={{ fontWeight: 700 }}>
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
                  : "Bảng Điều Khiển Quản Trị"}
              </h1>
              <p className="text-sm text-[#6B7A8D] mt-0.5">
                {view === "revenue"
                  ? "Phân tích GMV, hoa hồng 5% và dòng tiền nền tảng."
                  : view === "disputes"
                  ? "Xử lý tranh chấp giữa nhà quảng cáo và chủ bảng QC."
                  : view === "settings"
                  ? "Cấu hình ADORA, thanh toán và chính sách vận hành."
                  : `Chào mừng trở lại, ${currentUser?.fullName || "Admin"}. Quản lý hệ thống LED Billboard.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadAllData}
                className="p-2 border border-[#E3E8EF] rounded-lg text-[#1D4ED8] hover:bg-[#F0F9FF] cursor-pointer"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

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
              <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>GMV Nền Tảng Hàng Tháng</h3>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dashboardData.gmvChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                    <XAxis dataKey="month" tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000000} Tỷ`} />
                    <Tooltip formatter={(value: number) => [`${(value / 1000000000).toFixed(1)} Tỷ ₫`, "GMV"]} />
                    <Bar dataKey="gmv" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Số Lượng Chiến Dịch / Đặt Chỗ</h3>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={dashboardData.bookingChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
                    <XAxis dataKey="month" tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="#06B6D4" strokeWidth={2.5} dot={{ fill: "#06B6D4", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick overview of pending items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Tin Đăng Chờ Duyệt</h3>
                  <button onClick={() => navigate("/admin/listings")} className="text-xs text-[#06B6D4] hover:underline cursor-pointer">
                    Quản lý tin đăng
                  </button>
                </div>
                {billboards.filter(b => b.status === "PENDING").length === 0 ? (
                  <div className="text-xs text-center text-slate-500 py-6">Không có tin đăng nào đang chờ duyệt.</div>
                ) : (
                  <div className="max-h-[250px] overflow-y-auto space-y-2.5">
                    {billboards.filter(b => b.status === "PENDING").map(b => (
                      <div key={b.id} className="flex justify-between items-center border border-[#E3E8EF] p-3 rounded-lg text-xs bg-slate-50">
                        <div>
                          <p className="font-bold text-[#1E293B]">{b.title}</p>
                          <p className="text-[#6B7A8D]">{b.district}, {b.city} • Chủ: {b.owner?.fullName}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleApproveBillboard(b.id)} className="bg-emerald-500 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-emerald-600 cursor-pointer">Duyệt</button>
                          <button onClick={() => handleRejectBillboard(b.id)} className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-red-600 cursor-pointer">Từ Chối</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>Khiếu Nại & Tố Cáo Chờ Xử Lý</h3>
                  <button onClick={() => navigate("/admin/reports")} className="text-xs text-[#06B6D4] hover:underline cursor-pointer">
                    Giải quyết khiếu nại
                  </button>
                </div>
                {reports.filter(r => r.status === "PENDING").length === 0 ? (
                  <div className="text-xs text-center text-slate-500 py-6">Hệ thống đang hoạt động an toàn. Không có khiếu nại mới.</div>
                ) : (
                  <div className="max-h-[250px] overflow-y-auto space-y-2.5">
                    {reports.filter(r => r.status === "PENDING").map(r => (
                      <div key={r.id} className="border border-[#E3E8EF] p-3 rounded-lg text-xs bg-slate-50 space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-[#1E293B]">Khiếu nại #{r.id} ({r.targetType})</span>
                          <span className="text-red-500 font-bold uppercase text-[9px] bg-red-50 px-1.5 py-0.5 rounded">Mới</span>
                        </div>
                        <p className="text-[#6B7A8D]">Lý do: {r.reason}</p>
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
            <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 w-60">
                <Search className="w-3.5 h-3.5 text-[#6B7A8D]" />
                <input
                  type="text"
                  placeholder="Tìm thành viên (Họ tên, email)..."
                  value={userKeyword}
                  onChange={(e) => setUserKeyword(e.target.value)}
                  className="bg-transparent border-none outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1 bg-slate-50">
                <Filter className="w-3.5 h-3.5 text-[#6B7A8D]" />
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as Role | "")}
                  className="bg-transparent border-none outline-none text-[#1D4ED8]"
                >
                  <option value="">Tất Cả Vai Trò</option>
                  <option value="RENTER">Nhà Quảng Cáo (Renter)</option>
                  <option value="OWNER">Chủ Bảng QC (Owner)</option>
                  <option value="ADMIN">Quản Trị Viên (Admin)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1 bg-slate-50">
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value as UserStatus | "")}
                  className="bg-transparent border-none outline-none text-[#1D4ED8]"
                >
                  <option value="">Tất Cả Trạng Thái</option>
                  <option value="ACTIVE">Hoạt Động (Active)</option>
                  <option value="BLOCKED">Đã Khóa (Blocked)</option>
                  <option value="PENDING">Chờ Xác Minh (Pending)</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-[#6B7A8D]">Không tìm thấy thành viên phù hợp.</div>
              ) : (
                <DataTable columns={userColumns} data={filteredUsers} />
              )}
            </div>
          </div>
        )}

        {/* 3. BILLBOARD LISTINGS VIEW */}
        {view === "listings" && (
          <div className="p-8 space-y-4">
            <div className="flex items-center justify-between bg-white border border-[#E3E8EF] rounded-xl p-5">
              <div className="flex gap-2">
                <button
                  onClick={() => setBillboardFilterMode("ALL")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    billboardFilterMode === "ALL"
                      ? "bg-[#1D4ED8] text-white"
                      : "bg-[#F0F9FF] text-[#1D4ED8] hover:bg-[#E0F2FE]"
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
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              {filteredBillboards.length === 0 ? (
                <div className="text-center py-8 text-[#6B7A8D]">Không có bảng quảng cáo nào trong bộ lọc này.</div>
              ) : (
                <DataTable columns={listingColumns} data={filteredBillboards} />
              )}
            </div>
          </div>
        )}

        {/* 4. TRANSACTION AUDITING VIEW */}
        {view === "transactions" && (
          <div className="p-8 space-y-6">
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[#1D4ED8] font-bold text-lg">Giám Sát Hóa Đơn & Thanh Toán</h3>
                <span className="text-xs bg-[#F0F9FF] text-[#1E40AF] px-3 py-1.5 rounded-full font-bold">Thu Phí Sàn 5% (Platform Commission)</span>
              </div>
              {transactionTableData.length === 0 ? (
                <div className="text-center py-8 text-[#6B7A8D]">Chưa ghi nhận giao dịch thanh toán nào.</div>
              ) : (
                <DataTable columns={transactionColumns} data={transactionTableData} />
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <h3 className="text-[#1D4ED8] font-bold text-base mb-4">Danh Sách Chiến Dịch Hợp Đồng Thuê (Bookings)</h3>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-[#6B7A8D]">Chưa ghi nhận đặt chỗ nào.</div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E3E8EF] text-[#6B7A8D]">
                        <th className="py-2.5">ID</th>
                        <th>Nhà QC</th>
                        <th>Chủ Sở Hữu</th>
                        <th>Bảng QC</th>
                        <th>Thời Gian</th>
                        <th>Tổng Giá Thuê</th>
                        <th>Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E8EF]">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="py-3 font-semibold">#{b.id}</td>
                          <td className="text-slate-800 font-semibold">{b.renter?.fullName || "Khách hàng"}</td>
                          <td>{b.billboard?.owner?.fullName || "Chủ bảng"}</td>
                          <td className="text-[#1D4ED8] font-medium">{b.billboard?.title}</td>
                          <td>{formatDate(b.startDate)} - {formatDate(b.endDate)}</td>
                          <td className="font-bold">{b.finalAmount.toLocaleString("vi-VN")}₫</td>
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
        {view === "settings" && <AdminSettingsView />}

        {/* 8. REPORTS MANAGEMENT VIEW */}
        {view === "reports" && (
          <div className="p-8 space-y-4">
            <div className="bg-white border border-[#E3E8EF] rounded-xl p-5 flex items-center gap-4 text-xs">
              <span className="font-bold text-slate-700">Bộ Lọc Khiếu Nại:</span>
              <div className="flex gap-2">
                {["", "PENDING", "RESOLVED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportFilterStatus(st as ReportStatus | "")}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer ${
                      reportFilterStatus === st
                        ? "bg-[#1D4ED8] text-white border-[#1D4ED8]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {st === "" ? "Tất Cả" : st === "PENDING" ? "Chờ Xử Lý" : st === "RESOLVED" ? "Đã Giải Quyết" : "Đã Bác Bỏ"}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              {filteredReports.length === 0 ? (
                <div className="text-center py-8 text-[#6B7A8D]">Không có báo cáo tố cáo nào.</div>
              ) : (
                <DataTable columns={reportColumns} data={filteredReports} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
