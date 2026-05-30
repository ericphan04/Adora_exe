import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Filter,
  PlayCircle,
  Eye,
  MonitorPlay,
  Users,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router";
import { KpiCard } from "../../KpiCard";
import { DataTable } from "../../DataTable";
import { StatusBadge } from "../../StatusBadge";
import { BookingDto } from "../../../../types/booking";
import { bookingsToCampaigns, formatVnd } from "../../../utils/advertiser";

interface AdvertiserCampaignsViewProps {
  bookings: BookingDto[];
}

export function AdvertiserCampaignsView({ bookings }: AdvertiserCampaignsViewProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const campaigns = useMemo(() => bookingsToCampaigns(bookings), [bookings]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [previewUrlInput, setPreviewUrlInput] = useState("");
  const [previewUrlError, setPreviewUrlError] = useState("");
  const [customPreviewMap, setCustomPreviewMap] = useState<
    Record<number, { src: string; type: "image" | "video" }>
  >({});
  const objectUrlMap = useRef<Record<number, string>>({});

  useEffect(() => {
    if (selectedCampaignId === null && campaigns.length > 0) {
      setSelectedCampaignId(campaigns[0].id);
    }
  }, [campaigns, selectedCampaignId]);

  const getPreviewTypeFromUrl = (url: string) => {
    const normalized = url.split("?")[0].split("#")[0].toLowerCase();
    if (/\.(mp4|webm|ogg)$/i.test(normalized)) {
      return "video" as const;
    }
    if (/\.(jpe?g|png|gif|bmp|webp|avif|svg)$/i.test(normalized)) {
      return "image" as const;
    }
    return null;
  };

  const handlePreviewUrl = () => {
    if (!previewUrlInput.trim()) {
      setPreviewUrlError("Vui lòng nhập URL ảnh hoặc video.");
      return;
    }

    const type = getPreviewTypeFromUrl(previewUrlInput.trim());
    if (!type) {
      setPreviewUrlError("URL không hợp lệ. Dùng ảnh hoặc video MP4/WebM/OGG.");
      return;
    }

    if (selectedCampaignId !== null) {
      setCustomPreviewMap((prev) => ({
        ...prev,
        [selectedCampaignId]: { src: previewUrlInput.trim(), type },
      }));
      setPreviewUrlError("");
    }
  };

  const handleUploadFile = (file?: File) => {
    if (!file || selectedCampaignId === null) return;

    const type = file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("image/")
      ? "image"
      : undefined;

    if (!type) {
      setPreviewUrlError("Chỉ chấp nhận ảnh hoặc video.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (objectUrlMap.current[selectedCampaignId]) {
      URL.revokeObjectURL(objectUrlMap.current[selectedCampaignId]);
    }
    objectUrlMap.current[selectedCampaignId] = objectUrl;

    setCustomPreviewMap((prev) => ({
      ...prev,
      [selectedCampaignId]: { src: objectUrl, type },
    }));
    setPreviewUrlError("");
  };

  useEffect(() => {
    return () => {
      Object.values(objectUrlMap.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.brand.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((c) => c.id === selectedCampaignId)) {
      setSelectedCampaignId(filtered[0].id);
    }
  }, [filtered, selectedCampaignId]);

  const running = campaigns.filter((c) => c.status === "running").length;
  const totalBudget = bookings
    .filter((b) => b.status === "PAID")
    .reduce((s, b) => s + b.finalAmount, 0);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) ?? campaigns[0];
  const selectedBooking = bookings.find((b) => b.id === selectedCampaign?.id);
  const previewImage = selectedBooking?.billboard?.images?.find((img) => img.isThumbnail)?.imageUrl ??
    selectedBooking?.billboard?.images?.[0]?.imageUrl;
  const previewVideo = selectedBooking?.billboard?.demoVideoUrl;
  const customPreview = selectedCampaignId ? customPreviewMap[selectedCampaignId] : undefined;
  const previewSrc = customPreview?.src ?? previewVideo ?? previewImage;
  const previewType = customPreview?.type ?? (previewVideo ? "video" : previewImage ? "image" : undefined);
  const isCustomPreview = Boolean(customPreview);

  const statusMap: Record<string, { variant: "active" | "pending" | "expired" | "unavailable"; label: string }> = {
    running: { variant: "active", label: "Đang chạy" },
    upcoming: { variant: "pending", label: "Sắp chạy" },
    finished: { variant: "expired", label: "Đã kết thúc" },
    paused: { variant: "unavailable", label: "Tạm dừng" },
  };

  const columns = [
    {
      key: "name",
      label: "Chiến dịch",
      render: (v: string, row: { brand: string; location: string }) => (
        <div>
          <p className="text-sm font-medium text-[#1E293B]">{v}</p>
          <p className="text-xs text-[#6B7A8D] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {row.brand} · {row.location}
          </p>
        </div>
      ),
    },
    {
      key: "time",
      label: "Thời gian",
      render: (_: unknown, row: { startDate: string; endDate: string }) => (
        <span className="text-sm">{row.startDate} – {row.endDate}</span>
      ),
    },
    {
      key: "budget",
      label: "Ngân sách",
      render: (v: string) => <span className="font-semibold text-[#1D4ED8]">{v}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (_: unknown, row: { status: string }) => {
        const conf = statusMap[row.status] || statusMap.upcoming;
        return <StatusBadge variant={conf.variant} label={conf.label} />;
      },
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4F46E5] via-[#1D4ED8] to-[#06B6D4] p-6 text-white">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-sm text-indigo-100">Trung tâm chiến dịch</p>
            <h2 className="text-2xl font-bold mt-1">Quản lý quảng cáo LED</h2>
            <p className="text-sm text-indigo-100/90 mt-2">
              Mỗi booking đã thanh toán được coi là một chiến dịch trên ADORA.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/billboards")}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#1D4ED8] text-sm font-bold hover:bg-blue-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Chiến dịch mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Đang chạy" value={String(running)} icon={<PlayCircle className="w-5 h-5" />} />
        <KpiCard title="Tổng chiến dịch" value={String(campaigns.length)} icon={<MonitorPlay className="w-5 h-5" />} />
        <KpiCard title="Chi phí đã chi" value={formatVnd(totalBudget)} icon={<Users className="w-5 h-5" />} />
        <KpiCard title="Lượt hiển thị (ước tính)" value="2.4M" change="+15%" changeType="up" icon={<Eye className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
              <input
                type="text"
                placeholder="Tìm chiến dịch..."
                className="w-full pl-10 pr-4 py-2 border border-[#E3E8EF] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Filter className="w-4 h-4 text-[#6B7A8D]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value="running">Đang chạy</option>
              <option value="upcoming">Sắp chạy</option>
              <option value="finished">Đã kết thúc</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-[#E3E8EF] shadow-sm">
            <div className="p-4 border-b border-[#E3E8EF]">
              <h3 className="font-semibold text-[#1E293B]">Danh sách chiến dịch</h3>
              <p className="text-xs text-[#6B7A8D]">{filtered.length} chiến dịch</p>
            </div>
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-[#6B7A8D]">Chưa có chiến dịch nào.</p>
            ) : (
              <DataTable columns={columns} data={filtered} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-[#1D4ED8]">Xem trước creative</h3>
                <p className="text-xs text-[#6B7A8D] mt-1">Hiển thị nội dung chiến dịch trên mô phỏng LED.</p>
              </div>
              {campaigns.length > 0 && (
                <select
                  value={selectedCampaign?.id ?? ""}
                  onChange={(e) => setSelectedCampaignId(Number(e.target.value))}
                  className="px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm cursor-pointer"
                >
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="rounded-3xl overflow-hidden border border-[#E3E8EF] bg-slate-950 shadow-sm">
              <div className="relative h-52 overflow-hidden bg-slate-900 sm:h-60">
                {previewType === "video" && previewSrc ? (
                  <video
                    src={previewSrc}
                    autoPlay
                    muted
                    loop
                    controls={false}
                    className="w-full h-full object-cover"
                  />
                ) : previewType === "image" && previewSrc ? (
                  <img
                    src={previewSrc}
                    alt={selectedCampaign?.name ?? "Creative preview"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white/70">
                    <PlayCircle className="w-12 h-12" />
                    <p className="mt-3 text-sm font-medium">Chưa có creative để xem trước</p>
                    <p className="text-xs text-slate-400">Tải lên ảnh/video hoặc dán URL để xem ngay</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <input
                    type="text"
                    placeholder="Dán URL ảnh hoặc video"
                    className="w-full px-3 py-2 border border-[#E3E8EF] rounded-lg text-sm focus:outline-none focus:border-[#1D4ED8]"
                    value={previewUrlInput}
                    onChange={(e) => setPreviewUrlInput(e.target.value)}
                  />
                  <label className="inline-flex items-center justify-center rounded-lg border border-[#E3E8EF] px-4 py-2 text-sm font-semibold text-[#1D4ED8] cursor-pointer hover:bg-slate-50">
                    Ảnh/video
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => handleUploadFile(e.target.files?.[0])}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handlePreviewUrl}
                  className="w-full rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563EB]"
                >
                  Xem trước
                </button>
              </div>
              {previewUrlError && <p className="text-sm text-red-500">{previewUrlError}</p>}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-[#E3E8EF] p-5">
            <h3 className="font-semibold text-[#1D4ED8] mb-3">Vị trí đang chạy</h3>
            <ul className="space-y-2 text-xs">
              {[...new Set(campaigns.map((c) => c.location))].slice(0, 4).map((loc) => (
                <li key={loc} className="flex justify-between p-2 rounded-lg bg-slate-50">
                  <span className="font-medium text-[#1E293B]">{loc}</span>
                  <StatusBadge variant="active" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
