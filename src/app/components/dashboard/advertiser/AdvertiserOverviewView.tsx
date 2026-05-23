import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { Megaphone, DollarSign, Calendar, Heart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { KpiCard } from "../../KpiCard";
import { DataTable } from "../../DataTable";
import { StatusBadge } from "../../StatusBadge";
import { RenterDashboardDto } from "../../../../types/dashboard";
import { formatAdvertiserDate, formatVnd, mapBookingStatus } from "../../../utils/advertiser";
import { getTodayParts } from "../../../utils/calendar";
import { getBookingMonthEvents } from "../../../utils/bookingEvents";
import { MiniMonthCalendar } from "../MiniMonthCalendar";
import { mergeBookings } from "../../../utils/advertiser";

interface AdvertiserOverviewViewProps {
  data: RenterDashboardDto;
  onCancelBooking: (id: number) => void;
  onPayBooking: (id: number) => void;
  onReviewBooking: (id: number) => void;
}

export function AdvertiserOverviewView({
  data,
  onCancelBooking,
  onPayBooking,
  onReviewBooking,
}: AdvertiserOverviewViewProps) {
  const navigate = useNavigate();

  const chartData = useMemo(
    () =>
      (data.campaignPerformance || []).map((p) => ({
        month: p.month,
        impressions: p.views ?? p.impressions ?? 0,
        clicks: p.clicks ?? 0,
      })),
    [data],
  );

  const tableData = useMemo(
    () =>
      (data.recentBookings || []).slice(0, 5).map((b) => ({
        id: b.id,
        billboard: b.billboard?.title || "Bảng quảng cáo",
        location: b.billboard
          ? `${b.billboard.district}, ${b.billboard.city}`
          : "Đà Nẵng",
        date: `${formatAdvertiserDate(b.startDate)} - ${formatAdvertiserDate(b.endDate)}`,
        status: b.status,
        rawStatus: b.status,
        payment: b.finalAmount.toLocaleString("vi-VN") + "₫",
      })),
    [data],
  );

  const { year: calYear, month: calMonth } = getTodayParts();
  const parsedCalEvents = useMemo(() => {
    const all = mergeBookings(
      data.recentBookings ?? [],
      data.upcomingBookings ?? [],
    );
    return getBookingMonthEvents(all, calYear, calMonth);
  }, [data, calYear, calMonth]);

  const columns = [
    {
      key: "billboard",
      label: "Bảng QC",
      render: (v: string) => (
        <span className="font-medium text-[#1D4ED8]">{v}</span>
      ),
    },
    { key: "location", label: "Vị Trí" },
    { key: "date", label: "Thời Gian" },
    {
      key: "status",
      label: "Trạng Thái",
      render: (v: string) => {
        const { variant, label } = mapBookingStatus(v);
        return <StatusBadge variant={variant} label={label} />;
      },
    },
    {
      key: "payment",
      label: "Thanh Toán",
      render: (v: string) => (
        <span className="font-semibold text-[#1D4ED8]">{v}</span>
      ),
    },
    {
      key: "actions",
      label: "Thao Tác",
      render: (_: unknown, row: { id: number; rawStatus: string }) => {
        const status = row.rawStatus;
        return (
          <div className="flex items-center gap-2">
            {status === "PENDING" && (
              <button
                type="button"
                onClick={() => onCancelBooking(row.id)}
                className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded cursor-pointer"
              >
                Hủy
              </button>
            )}
            {status === "ACCEPTED" && (
              <button
                type="button"
                onClick={() => onPayBooking(row.id)}
                className="px-2 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded cursor-pointer"
              >
                Thanh toán
              </button>
            )}
            {(status === "PAID" || status === "COMPLETED") && (
              <button
                type="button"
                onClick={() => onReviewBooking(row.id)}
                className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded cursor-pointer"
              >
                Đánh giá
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Chiến dịch đang chạy"
          value={String(data.activeCampaigns)}
          change="+2"
          changeType="up"
          icon={<Megaphone className="w-5 h-5" />}
        />
        <KpiCard
          title="Tổng chi tiêu"
          value={formatVnd(data.totalSpending)}
          change="+12.5%"
          changeType="up"
          icon={<DollarSign className="w-5 h-5" />}
        />
        <KpiCard
          title="Đặt chỗ sắp tới"
          value={String(data.upcomingBookings?.length ?? 0)}
          change="+1"
          changeType="up"
          icon={<Calendar className="w-5 h-5" />}
        />
        <KpiCard
          title="Bảng QC đã lưu"
          value={String(data.savedBillboards?.length ?? 0)}
          change="+3"
          changeType="up"
          icon={<Heart className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E8EF] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[#1D4ED8] font-semibold">Hiệu suất chiến dịch</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]" /> Lượt hiển thị
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> Lượt click
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EF" />
              <XAxis dataKey="month" tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B7A8D", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="impressions" stroke="#1D4ED8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="clicks" stroke="#06B6D4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 shadow-sm">
          <MiniMonthCalendar
            events={parsedCalEvents}
            year={calYear}
            month={calMonth}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#1D4ED8] font-semibold">Đặt chỗ gần đây</h3>
          <button
            type="button"
            onClick={() => navigate("/advertiser/bookings")}
            className="text-sm text-[#06B6D4] hover:underline cursor-pointer"
          >
            Xem tất cả
          </button>
        </div>
        {tableData.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E3E8EF] p-8 text-center text-[#6B7A8D]">
            Bạn chưa có lượt đặt chỗ nào.
          </div>
        ) : (
          <DataTable columns={columns} data={tableData} />
        )}
      </div>
    </div>
  );
}
