import React, { useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Wallet,
  Download,
  ArrowUpRight,
  Building2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { KpiCard } from "../KpiCard";
import { AdminDashboardDto } from "../../../types/dashboard";
import { PaymentDto } from "../../../types/payment";
import { BookingDto } from "../../../types/booking";

interface AdminRevenueViewProps {
  dashboardData: AdminDashboardDto;
  payments: PaymentDto[];
  bookings: BookingDto[];
}

const formatVnd = (n: number) =>
  n >= 1_000_000_000
    ? `${(n / 1_000_000_000).toFixed(2)} Tỷ₫`
    : n >= 1_000_000
      ? `${(n / 1_000_000).toLocaleString("vi-VN")} Tr₫`
      : `${n.toLocaleString("vi-VN")}₫`;

export function AdminRevenueView({
  dashboardData,
  payments,
  bookings,
}: AdminRevenueViewProps) {
  const [period, setPeriod] = useState<"6m" | "12m">("6m");

  const successPayments = payments.filter((p) => p.paymentStatus === "SUCCESS");
  const pendingPayments = payments.filter((p) => p.paymentStatus === "PENDING");
  const totalCommission = successPayments.reduce(
    (s, p) => s + p.platformCommission,
    0,
  );
  const totalOwnerPayout = successPayments.reduce(
    (s, p) => s + p.ownerRevenue,
    0,
  );

  const commissionTrend = useMemo(() => {
    return dashboardData.gmvChart.map((row, i) => ({
      month: row.month,
      gmv: row.gmv,
      commission: Math.round(row.gmv * 0.05),
      bookings: dashboardData.bookingChart[i]?.bookings ?? 0,
    }));
  }, [dashboardData]);

  const topOwners = useMemo(() => {
    const map = new Map<string, { name: string; gmv: number; bookings: number }>();
    bookings.forEach((b) => {
      const name = b.billboard?.owner?.fullName ?? "Chủ bảng";
      const cur = map.get(name) ?? { name, gmv: 0, bookings: 0 };
      cur.gmv += b.finalAmount;
      cur.bookings += 1;
      map.set(name, cur);
    });
    return [...map.values()].sort((a, b) => b.gmv - a.gmv).slice(0, 5);
  }, [bookings]);

  const chartData = useMemo(() => {
    return period === "6m" ? commissionTrend.slice(-6) : commissionTrend.slice(-12);
  }, [period, commissionTrend]);

  const bookingChartData = useMemo(() => {
    return period === "6m" ? dashboardData.bookingChart.slice(-6) : dashboardData.bookingChart.slice(-12);
  }, [period, dashboardData.bookingChart]);

  return (
    <div className="p-8 space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D4ED8] via-[#2563EB] to-[#06B6D4] p-6 text-white shadow-lg">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-cyan-400/20 blur-xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-white/80 font-medium">Trung tâm doanh thu nền tảng</p>
            <h2 className="text-2xl mt-1" style={{ fontWeight: 700 }}>
              Hoa hồng & GMV ADORA
            </h2>
            <p className="text-sm text-white/70 mt-2 max-w-lg">
              Theo dõi GMV, phí sàn 5% và dòng tiền thanh toán VNPay theo thời gian thực.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(["6m", "12m"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  period === p
                    ? "bg-white text-[#1D4ED8]"
                    : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                {p === "6m" ? "6 tháng" : "12 tháng"}
              </button>
            ))}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Tổng GMV"
          value={formatVnd(dashboardData.totalGMV)}
          change="+15%"
          changeType="up"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <KpiCard
          title="Hoa hồng sàn (5%)"
          value={formatVnd(dashboardData.commissionRevenue)}
          change="+12%"
          changeType="up"
          icon={<Percent className="w-5 h-5" />}
        />
        <KpiCard
          title="Đã thu (thành công)"
          value={formatVnd(totalCommission)}
          change={`${successPayments.length} giao dịch`}
          changeType="up"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KpiCard
          title="Chờ đối soát"
          value={formatVnd(
            pendingPayments.reduce((s, p) => s + p.platformCommission, 0),
          )}
          change={`${pendingPayments.length} chờ`}
          changeType={pendingPayments.length > 0 ? "up" : "down"}
          icon={<Wallet className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E8EF] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>
                GMV vs Hoa hồng
              </h3>
              <p className="text-xs text-[#6B7A8D] mt-0.5">
                So sánh doanh số và thu phí nền tảng theo tháng
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1D4ED8" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6B7A8D", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B7A8D", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1_000_000_000).toFixed(1)}T`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  formatVnd(value),
                  name === "gmv" ? "GMV" : "Hoa hồng",
                ]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="gmv"
                name="GMV"
                stroke="#1D4ED8"
                fill="url(#gmvGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="commission"
                name="Hoa hồng"
                stroke="#06B6D4"
                fill="url(#commGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 shadow-sm">
          <h3 className="text-[#1D4ED8] mb-1" style={{ fontWeight: 600 }}>
            Phân bổ doanh thu
          </h3>
          <p className="text-xs text-[#6B7A8D] mb-5">Từ các giao dịch thành công</p>
          <div className="space-y-4">
            {[
              {
                label: "Hoa hồng ADORA (5%)",
                value: totalCommission,
                color: "bg-[#1D4ED8]",
                pct:
                  totalCommission + totalOwnerPayout > 0
                    ? Math.round(
                        (totalCommission / (totalCommission + totalOwnerPayout)) *
                          100,
                      )
                    : 0,
              },
              {
                label: "Trả cho chủ bảng",
                value: totalOwnerPayout,
                color: "bg-emerald-500",
                pct:
                  totalCommission + totalOwnerPayout > 0
                    ? Math.round(
                        (totalOwnerPayout / (totalCommission + totalOwnerPayout)) *
                          100,
                      )
                    : 0,
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#6B7A8D]">{row.label}</span>
                  <span className="font-bold text-[#1E293B]">{row.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.color} transition-all`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <p className="text-xs font-semibold text-[#1D4ED8] mt-1">
                  {formatVnd(row.value)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 p-3 rounded-lg bg-[#F0F9FF] border border-[#E0F2FE] text-xs text-[#1E40AF]">
            <strong>Mô hình:</strong> Mỗi booking thành công, ADORA thu 5% phí nền tảng trước khi chuyển cho Owner.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 shadow-sm">
          <h3 className="text-[#1D4ED8] mb-4" style={{ fontWeight: 600 }}>
            Chiến dịch theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bookingChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6B7A8D", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6B7A8D", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar dataKey="bookings" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Đặt chỗ" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>
              Top chủ bảng QC
            </h3>
            <Building2 className="w-4 h-4 text-[#6B7A8D]" />
          </div>
          {topOwners.length === 0 ? (
            <p className="text-sm text-[#6B7A8D] text-center py-8">Chưa có dữ liệu.</p>
          ) : (
            <ul className="space-y-3">
              {topOwners.map((o, i) => (
                <li
                  key={o.name}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#E3E8EF] hover:border-[#1D4ED8]/30 hover:bg-[#F8FAFC] transition-colors"
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1E293B] truncate">
                      {o.name}
                    </p>
                    <p className="text-xs text-[#6B7A8D]">{o.bookings} chiến dịch</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1D4ED8]">
                      {formatVnd(o.gmv)}
                    </p>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E3E8EF] flex justify-between items-center">
          <h3 className="text-[#1D4ED8]" style={{ fontWeight: 600 }}>
            Lịch sử giao dịch & hoa hồng
          </h3>
          <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold border border-emerald-100">
            {successPayments.length} thành công
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-[#6B7A8D] text-xs uppercase tracking-wide">
                <th className="px-6 py-3">Mã GD</th>
                <th className="px-6 py-3">Booking</th>
                <th className="px-6 py-3">Tổng tiền</th>
                <th className="px-6 py-3">Hoa hồng 5%</th>
                <th className="px-6 py-3">Trả Owner</th>
                <th className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EF]">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#6B7A8D]">
                    Chưa có giao dịch.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3 font-mono text-xs text-[#1D4ED8]">
                      {p.transactionCode}
                    </td>
                    <td className="px-6 py-3">#{p.bookingId}</td>
                    <td className="px-6 py-3 font-semibold">
                      {p.amount.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-3 text-emerald-600 font-semibold">
                      +{p.platformCommission.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-3">
                      {p.ownerRevenue.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          p.paymentStatus === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : p.paymentStatus === "PENDING"
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-red-50 text-red-700 border border-red-100"
                        }`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
