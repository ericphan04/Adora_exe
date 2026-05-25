import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  MapPin,
  Ruler,
  DollarSign,
  X,
  ExternalLink,
  Play,
  Monitor,
} from "lucide-react";
import { BillboardDto } from "../../../types/billboard";
import {
  formatBillboardPrice,
  formatBillboardSize,
  getBillboardRentalStatus,
  getBillboardThumbnail,
} from "../../utils/billboardMap";

interface BillboardMapPanelProps {
  billboard: BillboardDto;
  onClose?: () => void;
  compact?: boolean;
}

export function BillboardMapPanel({
  billboard,
  onClose,
  compact = false,
}: BillboardMapPanelProps) {
  const navigate = useNavigate();
  const [showVideo, setShowVideo] = useState(false);
  const status = getBillboardRentalStatus(billboard);
  const thumbnail = getBillboardThumbnail(billboard);
  const isAvailable = status === "available";

  return (
    <div
      className={`bg-white rounded-2xl shadow-2xl border border-[#E3E8EF] overflow-hidden ${
        compact ? "max-h-[70vh] overflow-y-auto" : ""
      }`}
    >
      <div className="relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="relative h-44 sm:h-48 overflow-hidden">
          {!showVideo || !billboard.demoVideoUrl ? (
            <>
              <img
                src={thumbnail}
                alt={billboard.title}
                className="w-full h-full object-cover"
              />
              {billboard.demoVideoUrl && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/35 transition-colors cursor-pointer group"
                >
                  <span className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Play className="w-6 h-6 text-[#1D4ED8] ml-0.5" />
                  </span>
                </button>
              )}
            </>
          ) : (
            <video
              src={billboard.demoVideoUrl}
              controls
              autoPlay
              className="w-full h-full object-cover bg-black"
            />
          )}
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow ${
              isAvailable
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 text-white"
            }`}
          >
            {isAvailable ? "Available" : "Booked"}
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Monitor className="w-4 h-4 text-[#06B6D4]" />
              <span className="text-xs text-[#6B7A8D] uppercase tracking-wide">
                LED Billboard
              </span>
            </div>
            <h3
              className="text-lg text-[#1D4ED8] leading-snug"
              style={{ fontWeight: 700 }}
            >
              {billboard.title}
            </h3>
          </div>

          <p className="flex items-start gap-2 text-sm text-[#6B7A8D]">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#06B6D4]" />
            <span>
              {billboard.address}, {billboard.district}, {billboard.city}
            </span>
          </p>

          {billboard.description && (
            <p className="text-sm text-[#475569] line-clamp-3 leading-relaxed">
              {billboard.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <InfoChip
              icon={<Ruler className="w-3.5 h-3.5" />}
              label="Kích thước"
              value={formatBillboardSize(billboard)}
            />
            <InfoChip
              icon={<DollarSign className="w-3.5 h-3.5" />}
              label="Giá thuê"
              value={formatBillboardPrice(billboard)}
            />
          </div>

          <button
            onClick={() => navigate(`/billboard/${billboard.id}`)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#06B6D4] text-white text-sm font-semibold hover:opacity-95 transition-opacity cursor-pointer shadow-md shadow-[#1D4ED8]/20"
          >
            Xem chi tiết & đặt lịch
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#F0F9FF] rounded-xl p-3 border border-[#E3E8EF]/60">
      <p className="flex items-center gap-1 text-[11px] text-[#6B7A8D] mb-0.5">
        {icon}
        {label}
      </p>
      <p className="text-sm text-[#1D4ED8] font-semibold">{value}</p>
    </div>
  );
}
