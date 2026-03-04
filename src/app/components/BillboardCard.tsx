import React from "react";
import { MapPin, Eye } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface BillboardCardProps {
  image: string;
  name: string;
  location: string;
  size: string;
  trafficIndex: string;
  price: string;
  availability: "available" | "booked" | "unavailable";
  onViewDetails?: () => void;
}

const trafficLabels: Record<string, string> = { High: "Cao", Medium: "TB", Low: "Thấp" };

export function BillboardCard({ image, name, location, size, trafficIndex, price, availability, onViewDetails }: BillboardCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-3 left-3">
          <StatusBadge variant={availability} />
        </div>
        <div className="absolute top-3 right-3 bg-[#1D4ED8]/80 text-white text-xs px-2 py-1 rounded-md">
          Lưu lượng {trafficLabels[trafficIndex] || trafficIndex}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-[#1D4ED8] mb-1 truncate">{name}</h3>
        <div className="flex items-center gap-1 text-sm text-[#6B7A8D] mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#6B7A8D] mb-3">
          <span className="bg-[#F0F9FF] px-2 py-1 rounded">{size}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[#E3E8EF]">
          <div>
            <span className="text-lg text-[#1D4ED8]" style={{ fontWeight: 700 }}>{price}</span>
            <span className="text-xs text-[#6B7A8D]">/tháng</span>
          </div>
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1.5 text-sm text-[#3B82F6] hover:text-[#06B6D4] transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Xem Chi Tiết
          </button>
        </div>
      </div>
    </div>
  );
}
