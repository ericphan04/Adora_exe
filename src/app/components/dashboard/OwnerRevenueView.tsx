import React, { useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Percent,
  Download,
  Monitor,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { KpiCard } from "../KpiCard";
import { OwnerDashboardDto } from "../../../types/dashboard";
import { BillboardDto } from "../../../types/billboard";
import { BookingDto } from "../../../types/booking";

interface OwnerRevenueViewProps {
  dashboardData: OwnerDashboardDto;
  billboards: BillboardDto[];
  bookings: BookingDto[];
}

const formatVnd = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toLocaleString("vi-VN")} Tr₫`
    : `${n.toLocaleString("vi-VN")}₫`;

export function OwnerRevenueView({
  dashboardData,
  billboards,
  bookings,
}: OwnerRevenueViewProps) {
  const [range, setRange] = useState<"month" | "quarter">("month");

  const paidBookings = bookings.filter(
    (b) => b.status === "PAID" || b.status === "COMPLETED",
  );
  const pendingBookings = bookings.filter((b) => b.status === "PENDING" || b.status === "ACCEPTED");

  const grossFromBookings = paidBookings.reduce((s, b) => s + b.totalPrice, 0);
  const platformFee = Math.round(grossFromBookings * 0.05);
  const netEarnings = grossFromBookings - platformFee;
  const pendingRevenue = pendingBookings.reduce((s, b) => s + b.totalPrice, 0);

  const revenueByBillboard = useMemo(() => {
    const map = new Map<string, number>();
    paidBookings.forEach((b) => {
      const title = b.billboard?.title ?? "Khác";
      map.set(title, (map.get(title) ?? 0) + b.totalPrice);
    });
    return [...map.entries()]
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [paidBookings]);

  const payoutHistory = useMemo(() => {
    return paidBookings.map((b, i) => ({
      id: b.id,
      campaign: b.billboard?.title ?? `Booking #${b.id}`,
      gross: b.totalPrice,
      fee: Math.round(b.totalPrice * 0.05),
      net: Math.round(b.totalPrice * 0.95),
      date: b.endDate,
      status: "Đã chuyển" as const,
      ref: `PAY-OWN-${1000 + i}`,
    }));
  }, [paidBookings]);

  return (
    <div className="p-8 space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] p-6 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-40" />
        <div className="relative flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-sm text-blue-200 font-medium">Trung tâm doanh thu</p>
            <h2 className="text-2xl mt-1 font-bold">Thu nhập từ bảng QC</h2>
            <p className="text-sm text-blue-100/80 mt-2 max-w-md">
              Theo dõi doanh thu ròng sau phí sàn 5%, lịch chi trả và hiệu suất từng bảng.
            </p>
          </div>
          <div className="flex gap-2 items-start">
            {(["month", "quarter"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  range === r
                    ? "bg-white text-[#1D4ED8]"
                    : "bg-white/15 hover:bg-white/25"
                }`}
              >
                {r === "month" ? "Tháng này" : "Quý này"}
              </button>
            ))}
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất CSV
            </button>
          </div>
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-4 max-w-lg">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-blue-200 uppercase">Doanh thu ròng</p>
            <p className="text-lg font-bold mt-0.5">{formatVnd(netEarnings || dashboardData.monthlyRevenue * 0.95)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-blue-200 uppercase">Chờ thanh toán</p>
            <p className="text-lg font-bold mt-0.5">{formatVnd(pendingRevenue)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/10">
            <p className="text-[10px] text-blue-200 uppercase">Tỷ lệ lấp đầy</p>
            <p className="text-lg font-bold mt-0.5">{dashboardData.fillRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Doanh thu tháng (gross)"
          value={formatVnd(dashboardData.monthlyRevenue)}
          change="+15%"
          changeType="up"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <KpiCard
          title="Thu nhập ròng (95%)"
          value={formatVnd(netEarnings || dashboardData.monthlyRevenue * 0.95)}
          change="Sau phí sàn"
          changeType="up"
          icon={<Wallet className="w-5 h-5" />}
        />
        <KpiCard
          title="Phí nền tảng (5%)"
          value={formatVnd(platformFee || dashboardData.monthlyRevenue * 0.05)}
          change="ADORA"
          changeType="down"
          icon={<Percent className="w-5 h-5" />}
        />
        <KpiCard
          title="Chiến dịch đã thanh toán"
          value={String(paidBookings.length)}
          change={`${pendingBookings.length} chờ`}
          changeType="up"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#E3E8EF] p-6 shadow-sm">
          <h3 className="text-[#1D4ED8] font-semibold mb-1">Xu hướng doanh thu</h3>
          <p className="text-xs text-[#6B7A8D] mb-5">6 tháng gần nhất</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dashboardData.revenueTrend}>
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
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}Tr`}
              />
              <Tooltip
                formatter={(value: number) => [
                  formatVnd(value),
                  "Doanh thu",
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1D4ED8"
                strokeWidth={3}
                dot={{ fill: "#1D4ED8", r: 5, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E8EF] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-[#1D4ED8]" />
            <h3 className="text-[#1D4ED8] font-semibold">Theo bảng QC</h3>
          </div>
          {revenueByBillboard.length === 0 ? (
            <p className="text-sm text-[#6B7A8D] text-center py-10">
              Chưa có doanh thu từ booking đã thanh toán.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByBillboard} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fill: "#6B7A8D", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v: number) => formatVnd(v)} />
                <Bar dataKey="revenue" fill="#06B6D4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-[10px] text-[#6B7A8D] mt-2">
            {billboards.length} bảng đang quản lý
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E3E8EF] flex justify-between items-center">
          <div>
            <h3 className="text-[#1D4ED8] font-semibold">Lịch sử chi trả</h3>
            <p className="text-xs text-[#6B7A8D]">Sau khi trừ phí sàn 5%</p>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-100">
            VNPay · T+3
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[#6B7A8D] text-xs uppercase">
                <th className="px-6 py-3 text-left">Mã chi trả</th>
                <th className="px-6 py-3 text-left">Chiến dịch</th>
                <th className="px-6 py-3 text-right">Gross</th>
                <th className="px-6 py-3 text-right">Phí 5%</th>
                <th className="px-6 py-3 text-right">Ròng</th>
                <th className="px-6 py-3 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E8EF]">
              {payoutHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6B7A8D]">
                    Chưa có khoản chi trả nào.
                  </td>
                </tr>
              ) : (
                payoutHistory.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3 font-mono text-xs text-[#1D4ED8]">
                      {p.ref}
                    </td>
                    <td className="px-6 py-3 font-medium text-[#1E293B] max-w-[200px] truncate">
                      {p.campaign}
                    </td>
                    <td className="px-6 py-3 text-right">
                      {p.gross.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-3 text-right text-red-500">
                      <span className="inline-flex items-center gap-0.5">
                        <ArrowDownRight className="w-3 h-3" />
                        {p.fee.toLocaleString("vi-VN")}₫
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-emerald-600">
                      {p.net.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {p.status}
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
