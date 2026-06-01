import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  MessageSquare,
  User,
  Monitor,
  ChevronRight,
  Scale,
} from "lucide-react";
import { ReportDto, ReportStatus } from "../../../types/report";

interface AdminDisputesViewProps {
  reports: ReportDto[];
  onResolve: (id: number) => void;
  onReject: (id: number) => void;
}

type Priority = "high" | "medium" | "low";

interface DisputeCase extends ReportDto {
  priority: Priority;
  assignee: string;
  messages: number;
  lastUpdate: string;
}

const priorityFromId = (id: number): Priority => {
  if (id % 3 === 0) return "high";
  if (id % 2 === 0) return "medium";
  return "low";
};

const priorityStyle: Record<
  Priority,
  { label: string; className: string; dot: string }
> = {
  high: {
    label: "Khẩn cấp",
    className: "bg-red-500/10 text-red-500 border-red-500/20",
    dot: "bg-red-500",
  },
  medium: {
    label: "Trung bình",
    className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    dot: "bg-amber-500",
  },
  low: {
    label: "Thấp",
    className: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    dot: "bg-slate-400",
  },
};

const statusColumns: { status: ReportStatus; title: string; icon: React.ReactNode; color: string }[] = [
  {
    status: "PENDING",
    title: "Chờ xử lý",
    icon: <Clock className="w-4 h-4" />,
    color: "border-amber-500/20 bg-amber-500/[0.04]",
  },
  {
    status: "RESOLVED",
    title: "Đã giải quyết",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "border-emerald-500/20 bg-emerald-500/[0.04]",
  },
  {
    status: "REJECTED",
    title: "Đã bác bỏ",
    icon: <XCircle className="w-4 h-4" />,
    color: "border-slate-500/20 bg-slate-500/[0.04]",
  },
];

export function AdminDisputesView({
  reports,
  onResolve,
  onReject,
}: AdminDisputesViewProps) {
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "BILLBOARD" | "USER">("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  const disputes: DisputeCase[] = useMemo(
    () =>
      reports.map((r) => ({
        ...r,
        priority: priorityFromId(r.id),
        assignee: r.status === "PENDING" ? "Chưa phân công" : "Admin ADORA",
        messages: 2 + (r.id % 4),
        lastUpdate: r.createdAt,
      })),
    [reports],
  );

  const filtered = useMemo(() => {
    return disputes.filter((d) => {
      const matchKw =
        !keyword ||
        d.reason.toLowerCase().includes(keyword.toLowerCase()) ||
        d.reporter?.fullName?.toLowerCase().includes(keyword.toLowerCase()) ||
        String(d.id).includes(keyword);
      const matchType = !typeFilter || d.targetType === typeFilter;
      return matchKw && matchType;
    });
  }, [disputes, keyword, typeFilter]);

  const selected = filtered.find((d) => d.id === selectedId) ?? filtered[0] ?? null;

  const stats = {
    pending: disputes.filter((d) => d.status === "PENDING").length,
    resolved: disputes.filter((d) => d.status === "RESOLVED").length,
    rejected: disputes.filter((d) => d.status === "REJECTED").length,
    high: disputes.filter((d) => d.priority === "high" && d.status === "PENDING")
      .length,
  };

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Chờ xử lý",
            value: stats.pending,
            icon: <Clock className="w-5 h-5 text-amber-500" />,
            bg: "bg-card border-border",
            iconBg: "bg-amber-500/10",
          },
          {
            label: "Khẩn cấp",
            value: stats.high,
            icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
            bg: "bg-card border-border",
            iconBg: "bg-red-500/10",
          },
          {
            label: "Đã giải quyết",
            value: stats.resolved,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
            bg: "bg-card border-border",
            iconBg: "bg-emerald-500/10",
          },
          {
            label: "Đã bác bỏ",
            value: stats.rejected,
            icon: <XCircle className="w-5 h-5 text-slate-500" />,
            bg: "bg-card border-border",
            iconBg: "bg-slate-500/10",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border ${s.bg} p-4 flex items-center gap-4`}
          >
            <div className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none mb-1">{s.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border/80 p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-surface/30 flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm theo ID, lý do, người gửi..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 bg-surface/30">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="bg-transparent border-none outline-none text-sm text-primary font-medium cursor-pointer"
          >
            <option className="bg-card text-foreground" value="">Tất cả loại</option>
            <option className="bg-card text-foreground" value="BILLBOARD">Bảng QC</option>
            <option className="bg-card text-foreground" value="USER">Người dùng</option>
          </select>
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden ml-auto">
          {(["board", "list"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setViewMode(m)}
              className={`px-3 py-2 text-xs font-semibold cursor-pointer ${
                viewMode === m
                  ? "bg-primary text-white"
                  : "bg-card text-muted-foreground hover:bg-surface/50"
              }`}
            >
              {m === "board" ? "Kanban" : "Danh sách"}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "board" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {statusColumns.map((col) => {
            const items = filtered.filter((d) => d.status === col.status);
            return (
              <div
                key={col.status}
                className={`rounded-xl border-2 ${col.color} p-4 min-h-[320px]`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    {col.icon}
                    {col.title}
                  </div>
                  <span className="text-xs font-bold bg-card px-2 py-0.5 rounded-full border border-border/80">
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      Không có khiếu nại
                    </p>
                  ) : (
                    items.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSelectedId(d.id)}
                        className={`w-full text-left bg-card rounded-lg border p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer ${
                          selected?.id === d.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border/80"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs font-bold text-primary">
                            #{d.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityStyle[d.priority].className}`}
                          >
                            {priorityStyle[d.priority].label}
                          </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2 mb-2">
                          {d.reason}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          {d.targetType === "BILLBOARD" ? (
                            <Monitor className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          <span>{d.targetType} · ID {d.targetId}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                          <span className="text-[10px] text-muted-foreground truncate">
                            {d.reporter?.fullName ?? "Ẩn danh"}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MessageSquare className="w-3 h-3" />
                            {d.messages}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/80 divide-y divide-border">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground text-sm">
              Không tìm thấy khiếu nại phù hợp.
            </p>
          ) : (
            filtered.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedId(d.id)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-surface/30 text-left cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-primary">#{d.id}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityStyle[d.priority].className}`}
                    >
                      {priorityStyle[d.priority].label}
                    </span>
                  </div>
                  <p className="text-sm text-foreground truncate">{d.reason}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))
          )}
        </div>
      )}

      {selected && (
        <div className="bg-card rounded-xl border border-border/80 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/80 bg-gradient-to-r from-primary-light/50 to-card flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  Chi tiết khiếu nại #{selected.id}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Gửi bởi {selected.reporter?.fullName ?? "—"} ·{" "}
                  {selected.createdAt}
                </p>
              </div>
            </div>
            {selected.status === "PENDING" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onResolve(selected.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Giải quyết
                </button>
                <button
                  type="button"
                  onClick={() => onReject(selected.id)}
                  className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 cursor-pointer"
                >
                  Bác bỏ
                </button>
              </div>
            )}
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
                  Nội dung khiếu nại
                </p>
                <p className="text-sm text-foreground leading-relaxed bg-surface/30 rounded-lg p-4 border border-border/80">
                  {selected.reason}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">
                  Dòng thời gian
                </p>
                <ul className="space-y-3">
                  {[
                    {
                      time: selected.createdAt,
                      text: "Khiếu nại được gửi lên hệ thống",
                    },
                    {
                      time: "—",
                      text: `Phân loại: ${selected.targetType} (ID ${selected.targetId})`,
                    },
                    {
                      time: "—",
                      text: `Mức ưu tiên: ${priorityStyle[selected.priority].label}`,
                    },
                  ].map((ev, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${priorityStyle[selected.priority].dot}`}
                      />
                      <div>
                        <p className="text-foreground">{ev.text}</p>
                        <p className="text-[10px] text-muted-foreground">{ev.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-border/80 p-4 bg-surface/30">
                <p className="text-xs text-muted-foreground mb-1">Người xử lý</p>
                <p className="font-semibold text-foreground">{selected.assignee}</p>
              </div>
              <div className="rounded-lg border border-border/80 p-4 bg-surface/30">
                <p className="text-xs text-muted-foreground mb-1">Đối tượng</p>
                <p className="font-semibold text-foreground">
                  {selected.targetType} #{selected.targetId}
                </p>
              </div>
              <div className="rounded-lg border border-border/80 p-4 bg-surface/30">
                <p className="text-xs text-muted-foreground mb-1">Trạng thái</p>
                <span
                  className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    selected.status === "PENDING"
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : selected.status === "RESOLVED"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  }`}
                >
                  {selected.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
