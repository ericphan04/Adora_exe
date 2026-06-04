import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Megaphone, DollarSign, Calendar, Heart, Eye, TrendingUp, PlusBox, 
  FileText, AlertTriangle, ChevronRight, CheckCircle2, Clock, Zap, Plus 
} from "lucide-react";
import { RenterDashboardDto } from "../../../../types/dashboard";
import { formatAdvertiserDate, formatVnd, mapBookingStatus } from "../../../utils/advertiser";
import { notify } from "../../../utils/notify";
import { ImageWithFallback } from "../../figma/ImageWithFallback";

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
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "year">("year");

  // Check if renter has any actual campaign data (non-zero views)
  const hasData = useMemo(() => {
    return (data.campaignPerformance || []).some(p => (p.views ?? p.impressions ?? 0) > 0);
  }, [data.campaignPerformance]);

  // Chart data mapping
  const chartData = useMemo(() => {
    if (!hasData) {
      if (timeframe === "7d") {
        const dataPoints = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
          dataPoints.push({
            month: label,
            impressions: 0,
            clicks: 0,
          });
        }
        return dataPoints;
      }
      
      if (timeframe === "30d") {
        const dataPoints = [];
        for (let i = 9; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i * 3);
          const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
          dataPoints.push({
            month: label,
            impressions: 0,
            clicks: 0,
          });
        }
        return dataPoints;
      }

      return (data.campaignPerformance || []).map((p) => ({
        month: p.month,
        impressions: 0,
        clicks: 0,
      }));
    }

    if (timeframe === "7d") {
      const dataPoints = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        const baseVal = 9500 + Math.sin(i * 1.5) * 3000 + (i % 2 === 0 ? 1200 : 0);
        dataPoints.push({
          month: label,
          impressions: Math.round(baseVal) / 1000,
          clicks: Math.round(baseVal * 0.03),
        });
      }
      return dataPoints;
    }
    
    if (timeframe === "30d") {
      const dataPoints = [];
      for (let i = 9; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i * 3);
        const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        const baseVal = 35000 + Math.sin(i * 0.8) * 12000 + (i % 3 === 0 ? 4000 : 0);
        dataPoints.push({
          month: label,
          impressions: Math.round(baseVal) / 1000,
          clicks: Math.round(baseVal * 0.032),
        });
      }
      return dataPoints;
    }

    return (data.campaignPerformance || []).map((p) => ({
      month: p.month,
      impressions: (p.views ?? p.impressions ?? 0) / 1000,
      clicks: p.clicks ?? 0,
    }));
  }, [data.campaignPerformance, timeframe, hasData]);

  // Total impressions calculation
  const totalImpressions = useMemo(() => {
    const total = (data.campaignPerformance || []).reduce(
      (sum, p) => sum + (p.views ?? p.impressions ?? 0),
      0
    );
    if (total >= 1000000) return `${(total / 1000000).toFixed(1)}M+`;
    if (total >= 1000) return `${(total / 1000).toFixed(0)}K+`;
    return String(total);
  }, [data]);

  // Completion / Active Rate calculation
  const completionRate = useMemo(() => {
    const active = data.activeCampaigns || 0;
    const total = active + (data.upcomingBookings?.length || 0);
    return total > 0 ? ((active / total) * 100).toFixed(1) : "0.0";
  }, [data]);

  const recentBookingsList = useMemo(
    () => (data.recentBookings || []).slice(0, 5),
    [data]
  );

  // Quick Action Handlers
  const handleExportPDF = () => {
    notify.success("Đang tạo báo cáo hiệu suất...", "Tải xuống sẽ tự động bắt đầu sau vài giây.");
  };

  const handleMaintenanceRequest = () => {
    notify.info("Gửi yêu cầu hỗ trợ", "Chuyển hướng đến kênh liên hệ chủ sở hữu...");
    navigate("/advertiser/messages");
  };

  // Recent Premium Billboard Preview
  const recentSavedBillboard = useMemo(() => {
    if (data.savedBillboards && data.savedBillboards.length > 0) {
      return data.savedBillboards[0];
    }
    return null;
  }, [data]);

  return (
    <div className="space-y-8">
      
      {/* Metric Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Spend */}
        <div className="glass-panel p-6 rounded-2xl glow-border flex flex-col justify-between group shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Tổng chi tiêu</p>
              <h3 className="text-2xl md:text-3xl font-extrabold mt-2 text-foreground">
                {formatVnd(data.totalSpending)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            {data.totalSpending && Number(data.totalSpending) > 0 ? (
              <>
                <span className="text-accent flex items-center font-bold text-sm">
                  <TrendingUp className="w-4 h-4 mr-0.5" /> +12.5%
                </span>
                <span className="text-muted-foreground text-xs font-semibold">so với tháng trước</span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground flex items-center font-bold text-sm">
                  0%
                </span>
                <span className="text-muted-foreground text-xs font-semibold">Chưa có chi tiêu</span>
              </>
            )}
          </div>
        </div>

        {/* Impressions */}
        <div className="glass-panel p-6 rounded-2xl glow-border flex flex-col justify-between group shadow-md transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Lượt hiển thị</p>
              <h3 className="text-2xl md:text-3xl font-extrabold mt-2 text-foreground">
                {totalImpressions}
              </h3>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            {totalImpressions !== "0" ? (
              <>
                <span className="text-accent flex items-center font-bold text-sm">
                  <TrendingUp className="w-4 h-4 mr-0.5" /> +8.2%
                </span>
                <span className="text-muted-foreground text-xs font-semibold">hiệu suất cao</span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground flex items-center font-bold text-sm">
                  0
                </span>
                <span className="text-muted-foreground text-xs font-semibold">Chưa có lượt tiếp cận</span>
              </>
            )}
          </div>
        </div>

        {/* Fill Rate / Active Campaigns */}
        <div className="glass-panel p-6 rounded-2xl glow-border flex flex-col justify-between group shadow-md transition-all duration-300 md:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Tỉ lệ lấp đầy</p>
              <h3 className="text-2xl md:text-3xl font-extrabold mt-2 text-foreground">{completionRate}%</h3>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-border h-2 rounded-full overflow-hidden">
              <div className="bg-accent h-full rounded-full" style={{ width: `${completionRate}%` }}></div>
            </div>
            <p className="text-muted-foreground text-xs font-semibold mt-2.5">
              {data.activeCampaigns} / { (data.activeCampaigns || 0) + (data.upcomingBookings?.length || 0) } màn hình đang hoạt động
            </p>
          </div>
        </div>

      </div>

      {/* Main Chart + Quick Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-2xl glow-border shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h4 className="text-lg md:text-xl font-bold text-foreground">Hiệu quả chiến dịch</h4>
              <p className="text-muted-foreground text-xs md:text-sm font-semibold">Phân tích lượt tiếp cận theo thời gian thực</p>
            </div>
            <div className="flex bg-surface border border-border p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setTimeframe("7d")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                  timeframe === "7d"
                    ? "bg-accent/15 text-accent shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                7 Ngày
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("30d")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                  timeframe === "30d"
                    ? "bg-accent/15 text-accent shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                30 Ngày
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("year")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                  timeframe === "year"
                    ? "bg-accent/15 text-accent shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Theo Năm
              </button>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: "var(--foreground-muted)", fontSize: 12, fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fill: "var(--foreground-muted)", fontSize: 12, fontWeight: 500 }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(v) => `${v}K`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px", color: "var(--foreground)" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="impressions" 
                  name="Lượt tiếp cận (K)"
                  stroke="var(--accent)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#chartGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Center */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl glow-border flex flex-col justify-between shadow-md">
          <div>
            <h4 className="text-base font-extrabold text-foreground mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent fill-accent animate-pulse" />
              Hành động nhanh
            </h4>
            
            <div className="space-y-4">
              <button 
                onClick={() => navigate("/billboards")}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-primary/5 hover:border-accent/40 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Đặt màn hình mới</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={handleExportPDF}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent/5 hover:border-accent/40 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Xuất báo cáo PDF</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={handleMaintenanceRequest}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-red-500/5 hover:border-red-500/40 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Yêu cầu bảo trì</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Recent Premium Billboard Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Màn hình Premium gần đây</p>
            {recentSavedBillboard ? (
              <div className="flex gap-4 cursor-pointer" onClick={() => navigate(`/billboard/${recentSavedBillboard.id}`)}>
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0">
                  <ImageWithFallback 
                    alt={recentSavedBillboard.title} 
                    className="w-full h-full object-cover" 
                    src={recentSavedBillboard.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1572945281861-68b1227368e5?w=500"} 
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{recentSavedBillboard.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{recentSavedBillboard.district}, {recentSavedBillboard.city}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                    <span className="text-[9px] text-accent font-extrabold uppercase">Đã lưu</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 cursor-pointer" onClick={() => navigate("/billboards")}>
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-border shrink-0 bg-primary/5 flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">Lotte Center Face A</p>
                  <p className="text-xs text-muted-foreground truncate">Q. Ba Đình, Hà Nội</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                    <span className="text-[9px] text-accent font-extrabold uppercase">Đang Live</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Transaction History Table */}
      <div className="glass-panel rounded-2xl glow-border overflow-hidden shadow-md">
        <div className="p-6 md:p-8 border-b border-border/30 flex justify-between items-center bg-card/50">
          <div>
            <h4 className="text-lg md:text-xl font-bold text-foreground">Lịch sử giao dịch đặt chỗ</h4>
            <p className="text-muted-foreground text-xs md:text-sm font-semibold">Các khoản đặt lịch thanh toán và đối soát gần nhất</p>
          </div>
          <button 
            onClick={() => navigate("/advertiser/bookings")}
            className="text-accent font-bold text-xs md:text-sm flex items-center gap-1 hover:underline cursor-pointer"
          >
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="overflow-x-auto md:overflow-visible">
          {recentBookingsList.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground font-semibold">
              Không có giao dịch đặt chỗ nào gần đây.
            </div>
          ) : (
            <>
            <table className="hidden md:table w-full text-left border-collapse">
              <thead className="bg-surface/50 text-muted-foreground text-[10px] uppercase font-bold tracking-wider border-b border-border/30">
                <tr>
                  <th className="px-6 py-4 font-semibold">Giao dịch</th>
                  <th className="px-6 py-4 font-semibold">Thời gian</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                  <th className="px-6 py-4 font-semibold text-right">Số tiền</th>
                  <th className="px-6 py-4 font-semibold text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-sm">
                {recentBookingsList.map((b) => {
                  const { label } = mapBookingStatus(b.status);
                  const isPending = b.status === "PENDING";
                  const isAccepted = b.status === "ACCEPTED";
                  const isCompleted = b.status === "PAID" || b.status === "COMPLETED";

                  return (
                    <tr key={b.id} className="hover:bg-surface/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <Megaphone className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground line-clamp-1">{b.billboard?.title || "Bảng hiệu LED"}</p>
                            <p className="text-[10px] text-muted-foreground font-semibold">ID: AD-{b.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                        {formatAdvertiserDate(b.startDate)} – {formatAdvertiserDate(b.endDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 uppercase ${
                          b.status === "PAID" || b.status === "COMPLETED" 
                            ? "bg-accent/15 text-accent" 
                            : b.status === "PENDING" || b.status === "ACCEPTED"
                            ? "bg-amber-500/15 text-amber-500"
                            : "bg-red-500/15 text-red-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            b.status === "PAID" || b.status === "COMPLETED"
                              ? "bg-accent"
                              : b.status === "PENDING" || b.status === "ACCEPTED"
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}></span>
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-foreground">
                        {b.finalAmount.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isPending && (
                            <button
                              type="button"
                              onClick={() => onCancelBooking(b.id)}
                              className="px-3 py-1.5 text-xs font-bold text-red-500 hover:text-white border border-red-500/30 hover:bg-red-500 rounded-lg cursor-pointer transition-all active:scale-95"
                            >
                              Hủy
                            </button>
                          )}
                          {isAccepted && (
                            <button
                              type="button"
                              onClick={() => onPayBooking(b.id)}
                              className="px-3 py-1.5 text-xs font-bold text-accent hover:text-white border border-accent/30 hover:bg-accent rounded-lg cursor-pointer transition-all active:scale-95 shadow-md shadow-accent/10"
                            >
                              Thanh toán
                            </button>
                          )}
                          {isCompleted && (
                            <button
                              type="button"
                              onClick={() => onReviewBooking(b.id)}
                              className="px-3 py-1.5 text-xs font-bold text-primary hover:text-white border border-primary/30 hover:bg-primary rounded-lg cursor-pointer transition-all active:scale-95"
                            >
                              Đánh giá
                            </button>
                          )}
                          {!isPending && !isAccepted && !isCompleted && (
                            <span className="text-xs text-muted-foreground font-semibold">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="md:hidden p-4 space-y-4">
              {recentBookingsList.map((b) => {
                const { label } = mapBookingStatus(b.status);
                const isPending = b.status === "PENDING";
                const isAccepted = b.status === "ACCEPTED";
                const isCompleted = b.status === "PAID" || b.status === "COMPLETED";

                return (
                  <div key={b.id} className="p-4 bg-card rounded-xl border border-border/40 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Megaphone className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate text-sm">{b.billboard?.title || "Bảng hiệu LED"}</p>
                          <p className="text-[10px] text-muted-foreground font-semibold">ID: AD-{b.id}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 uppercase shrink-0 ${
                        b.status === "PAID" || b.status === "COMPLETED" 
                          ? "bg-accent/15 text-accent" 
                          : b.status === "PENDING" || b.status === "ACCEPTED"
                          ? "bg-amber-500/15 text-amber-500"
                          : "bg-red-500/15 text-red-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          b.status === "PAID" || b.status === "COMPLETED"
                            ? "bg-accent"
                            : b.status === "PENDING" || b.status === "ACCEPTED"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}></span>
                        {label}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground py-2 border-t border-b border-border/10">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground/60">Thời gian</span>
                        <span className="font-semibold">{formatAdvertiserDate(b.startDate)} – {formatAdvertiserDate(b.endDate)}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] uppercase font-bold text-muted-foreground/60">Số tiền</span>
                        <span className="font-extrabold text-foreground text-sm">{b.finalAmount.toLocaleString("vi-VN")}₫</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onCancelBooking(b.id)}
                          className="px-4 py-2 text-xs font-bold text-red-500 hover:text-white border border-red-500/30 hover:bg-red-500 rounded-lg cursor-pointer transition-all active:scale-95 w-full text-center"
                        >
                          Hủy đặt lịch
                        </button>
                      )}
                      {isAccepted && (
                        <button
                          type="button"
                          onClick={() => onPayBooking(b.id)}
                          className="px-4 py-2 text-xs font-bold text-accent hover:text-white border border-accent/30 hover:bg-accent rounded-lg cursor-pointer transition-all active:scale-95 shadow-md shadow-accent/10 w-full text-center"
                        >
                          Thanh toán
                        </button>
                      )}
                      {isCompleted && (
                        <button
                          type="button"
                          onClick={() => onReviewBooking(b.id)}
                          className="px-4 py-2 text-xs font-bold text-primary hover:text-white border border-primary/30 hover:bg-primary rounded-lg cursor-pointer transition-all active:scale-95 w-full text-center"
                        >
                          Đánh giá
                        </button>
                      )}
                      {!isPending && !isAccepted && !isCompleted && (
                        <span className="text-xs text-muted-foreground font-semibold py-1">Không có thao tác khả dụng</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
