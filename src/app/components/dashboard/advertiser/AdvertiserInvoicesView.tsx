import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  FileText,
  Download,
} from "lucide-react";
import { KpiCard } from "../../KpiCard";
import { DataTable } from "../../DataTable";
import { StatusBadge } from "../../StatusBadge";
import { BookingDto } from "../../../../types/booking";
import { PaymentDto } from "../../../../types/payment";
import { bookingsToInvoices, formatVnd } from "../../../utils/advertiser";
import { paymentsToInvoices } from "../../../utils/payments";
import { notify } from "../../../utils/notify";

export const handleDownloadPdf = (inv: any) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    notify.error("Không thể mở cửa sổ in. Vui lòng cho phép popup trình duyệt.");
    return;
  }

  const isPaid = inv.status === "paid";
  const statusText = isPaid ? "ĐÃ THANH TOÁN" : inv.status === "pending" ? "CHỜ THANH TOÁN" : "QUÁ HẠN / THẤT BẠI";
  const statusColor = isPaid ? "#16A34A" : inv.status === "pending" ? "#D97706" : "#DC2626";
  const totalVal = inv.totalLabel ?? inv.total ?? "";
  const billboardText = inv.billboard ?? "Màn hình LED quảng cáo";
  const customerText = inv.customer ?? "Khách hàng ADORA";

  printWindow.document.write(`
    <html>
      <head>
        <title>Hóa đơn ${inv.id}</title>
        <style>
          body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #334155;
            margin: 0;
            padding: 40px;
            line-height: 1.5;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
            background: #fff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #1d4ed8;
            letter-spacing: 1px;
          }
          .logo span {
            color: #06b6d4;
          }
          .title {
            text-align: right;
          }
          .title h1 {
            margin: 0;
            font-size: 24px;
            color: #1e293b;
          }
          .title p {
            margin: 5px 0 0 0;
            font-family: monospace;
            font-size: 14px;
            color: #64748b;
          }
          .details-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
          }
          .detail-card {
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 8px;
            padding: 20px;
          }
          .detail-card h3 {
            margin: 0 0 10px 0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
          }
          .detail-card p {
            margin: 5px 0;
            font-size: 14px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            color: white;
            background-color: ${statusColor};
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          th {
            background: #f1f5f9;
            color: #475569;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 700;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 16px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
          }
          .text-right {
            text-align: right;
          }
          .total-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
          }
          .total-box {
            width: 300px;
            background: #f8fafc;
            border-radius: 8px;
            padding: 15px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .total-row.grand-total {
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
            margin-top: 8px;
            font-size: 18px;
            font-weight: 800;
            color: #1d4ed8;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-box {
              border: none;
              box-shadow: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="logo">ADORA<span>.</span></div>
            <div class="title">
              <h1>HÓA ĐƠN</h1>
              <p>Mã: ${inv.id}</p>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="detail-card">
              <h3>Đơn vị cung cấp</h3>
              <p><strong>ADORA LED Billboard Marketplace</strong></p>
              <p>Email: support@adora.com</p>
              <p>Website: adora-billboard.vn</p>
            </div>
            <div class="detail-card">
              <h3>Thông tin hóa đơn</h3>
              <p>Khách hàng: <strong>${customerText}</strong></p>
              <p>Ngày tạo: ${inv.createdAt}</p>
              <p>Hạn thanh toán: ${inv.dueAt}</p>
              ${inv.transactionCode ? `<p>Mã giao dịch: <strong>${inv.transactionCode}</strong></p>` : ""}
              <div>Trạng thái: <span class="status-badge">${statusText}</span></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Mô tả dịch vụ</th>
                <th>Vị trí (Bảng QC)</th>
                <th class="text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Thuê màn hình LED quảng cáo</strong><br/>
                  <span style="font-size: 12px; color: #64748b;">Chiến dịch: ${inv.campaign}</span>
                </td>
                <td>${billboardText}</td>
                <td class="text-right font-semibold" style="color: #1e293b;">${totalVal}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-box">
              <div class="total-row">
                <span>Tạm tính:</span>
                <span>${totalVal}</span>
              </div>
              <div class="total-row">
                <span>VAT (10%):</span>
                <span>Đã bao gồm</span>
              </div>
              <div class="total-row grand-total">
                <span>Tổng cộng:</span>
                <span>${totalVal}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ của ADORA LED Billboard Rental Marketplace!</p>
            <p>© 2026 ADORA. All rights reserved.</p>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

interface AdvertiserInvoicesViewProps {
  bookings: BookingDto[];
  payments: PaymentDto[];
  onPayBooking: (id: number) => void;
}

export function AdvertiserInvoicesView({
  bookings,
  payments,
  onPayBooking,
}: AdvertiserInvoicesViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const invoices = useMemo(() => {
    const fromPayments = paymentsToInvoices(payments, bookings);
    const paidBookingIds = new Set(fromPayments.map((p) => p.bookingId));
    const fromBookings = bookingsToInvoices(bookings).filter(
      (inv) => !paidBookingIds.has(inv.bookingId),
    );
    return [...fromPayments, ...fromBookings].sort(
      (a, b) => b.bookingId - a.bookingId,
    );
  }, [bookings, payments]);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      !search ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.campaign.toLowerCase().includes(search.toLowerCase()) ||
      ("transactionCode" in inv &&
        inv.transactionCode?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selected =
    filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  const paidTotal = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);
  const pendingTotal = invoices
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.total, 0);

  const columns = [
    {
      key: "id",
      label: "Mã HĐ",
      className: "whitespace-nowrap min-w-[155px]",
      render: (v: string, row: { campaign: string }) => {
        let displayName = row.campaign;
        try {
          const trimmed = row.campaign.trim();
          if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
            const parsed = JSON.parse(trimmed);
            displayName = parsed.campaignName || displayName;
          }
        } catch (e) {
          // not JSON
        }
        return (
          <div>
            <p className="font-mono text-xs text-primary font-bold">{v}</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[170px]">{displayName}</p>
          </div>
        );
      },
    },
    { 
      key: "billboard", 
      label: "Bảng QC",
      className: "min-w-[180px] font-semibold text-foreground"
    },
    { 
      key: "createdAt", 
      label: "Ngày tạo",
      className: "whitespace-nowrap text-muted-foreground"
    },
    { 
      key: "dueAt", 
      label: "Hạn TT",
      className: "whitespace-nowrap text-muted-foreground"
    },
    {
      key: "totalLabel",
      label: "Số tiền",
      className: "whitespace-nowrap font-bold text-primary",
      render: (v: string) => <span>{v}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      className: "whitespace-nowrap",
      render: (_: unknown, row: { status: string }) => {
        const map = {
          paid: { variant: "active" as const, label: "Đã thanh toán" },
          pending: { variant: "pending" as const, label: "Chờ thanh toán" },
          overdue: { variant: "expired" as const, label: "Thất bại" },
        };
        const conf = map[row.status as keyof typeof map] || map.pending;
        return <StatusBadge variant={conf.variant} label={conf.label} />;
      },
    },
    {
      key: "actions",
      label: "",
      className: "text-right whitespace-nowrap",
      render: (_: unknown, row: { id: string; bookingId: number; status: string }) => (
        <button
          type="button"
          onClick={() => setSelectedId(row.id)}
          className="text-xs text-accent hover:underline cursor-pointer font-bold"
        >
          Chi tiết
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Đã thanh toán" value={formatVnd(paidTotal)} icon={<DollarSign className="w-5 h-5" />} />
        <KpiCard title="Chờ thanh toán" value={formatVnd(pendingTotal)} icon={<CreditCard className="w-5 h-5" />} />
        <KpiCard title="Giao dịch" value={String(invoices.length)} icon={<FileText className="w-5 h-5" />} />
        <KpiCard
          title="VNPay thành công"
          value={String(payments.filter((p) => p.paymentStatus === "SUCCESS").length)}
          icon={<CheckCircle className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`${selected ? "xl:col-span-2" : "xl:col-span-3"} space-y-4`}>
          <div className="bg-card rounded-xl border border-border/80 p-4 flex flex-wrap gap-3 shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm mã hóa đơn, mã giao dịch..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm bg-surface/30 focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1 bg-surface/30">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-primary text-sm cursor-pointer"
              >
                <option className="bg-card text-foreground" value="all">Tất cả</option>
                <option className="bg-card text-foreground" value="paid">Đã thanh toán</option>
                <option className="bg-card text-foreground" value="pending">Chờ thanh toán</option>
              </select>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Chưa có hóa đơn hoặc giao dịch thanh toán.
              </p>
            ) : (
              <DataTable columns={columns} data={filtered} />
            )}
          </div>
        </div>

        {selected && (() => {
          let parsedCampaign = null;
          try {
            const trimmed = selected.campaign.trim();
            if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
              parsedCampaign = JSON.parse(trimmed);
            }
          } catch (e) {
            // not JSON
          }

          const pendingInvoices = invoices.filter((inv) => inv.status === "pending");

          return (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-3">
                  <h3 className="font-semibold text-primary">Chi tiết</h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary-light text-primary font-mono font-bold">
                    {selected.id}
                  </span>
                </div>

                {/* Dropdown for selecting pending contracts/bookings to pay */}
                {pendingInvoices.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-border/40">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-[0.05em]">
                      Chọn hợp đồng thanh toán
                    </label>
                    <select
                      value={selected.status === "pending" ? selected.id : ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedId(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-foreground font-mono outline-none focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="" disabled>-- Chọn hợp đồng --</option>
                      {pendingInvoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.id} (HĐ-{inv.bookingId}) - {inv.totalLabel}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <dl className="space-y-3.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Mã hợp đồng</dt>
                    <dd className="font-mono text-foreground font-semibold">HĐ-{selected.bookingId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Bảng QC</dt>
                    <dd className="font-semibold text-foreground text-right max-w-[60%]">{selected.billboard}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Ngày</dt>
                    <dd className="text-foreground">{selected.createdAt}</dd>
                  </div>
                  {"transactionCode" in selected && selected.transactionCode && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Mã GD</dt>
                      <dd className="font-mono text-xs text-foreground bg-surface/50 px-2 py-0.5 rounded border border-border/30">{selected.transactionCode}</dd>
                    </div>
                  )}

                  {parsedCampaign ? (
                    <>
                      <div className="flex justify-between border-t border-border/20 pt-3">
                        <dt className="text-muted-foreground">Chiến dịch</dt>
                        <dd className="font-semibold text-foreground text-right max-w-[60%]">{parsedCampaign.campaignName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Phân khúc</dt>
                        <dd className="font-medium text-foreground text-right max-w-[60%]">{parsedCampaign.category}</dd>
                      </div>
                      {parsedCampaign.description && (
                        <div className="flex flex-col gap-1 border-t border-border/20 pt-3">
                          <dt className="text-muted-foreground">Mô tả chiến dịch</dt>
                          <dd className="text-xs text-muted-foreground bg-surface/50 p-2.5 rounded-lg border border-border/30 max-h-[80px] overflow-y-auto whitespace-pre-wrap">{parsedCampaign.description}</dd>
                        </div>
                      )}
                      {parsedCampaign.creativeUrl && (
                        <div className="flex flex-col gap-1.5 border-t border-border/20 pt-3">
                          <dt className="text-muted-foreground">Hình ảnh quảng cáo</dt>
                          <div className="relative rounded-lg overflow-hidden border border-border bg-[#0A0A0A] w-full" style={{ aspectRatio: "16/9" }}>
                            <img src={parsedCampaign.creativeUrl} alt={parsedCampaign.campaignName} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Mô tả</dt>
                      <dd className="font-medium text-foreground text-right max-w-[60%]">{selected.campaign}</dd>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-dashed border-border pt-4 mt-2">
                    <dt className="text-muted-foreground font-semibold">Số tiền</dt>
                    <dd className="text-lg font-extrabold text-primary">{selected.totalLabel}</dd>
                  </div>
                </dl>
                <div className="mt-5 flex gap-3 pt-2 border-t border-border/30">
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(selected)}
                    className="flex-grow flex items-center justify-center gap-1.5 py-2.5 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:bg-surface/50 hover:text-foreground cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải PDF
                  </button>
                  {selected.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => onPayBooking(selected.bookingId)}
                      className="flex-grow py-2.5 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-primary-hover shadow-md shadow-primary/10 transition-all active:scale-95"
                    >
                      Thanh toán VNPay
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
