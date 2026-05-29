import React from "react";
import { MapPin, Eye, Heart } from "lucide-react";
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
  saved?: boolean;
  onViewDetails?: () => void;
  onToggleSave?: () => void;
}

const trafficLabels: Record<string, string> = { High: "Cao", Medium: "TB", Low: "Thấp" };

export function BillboardCard({ image, name, location, size, trafficIndex, price, availability, saved, onViewDetails, onToggleSave }: BillboardCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:border-accent/40 transition-all duration-300 group flex flex-col justify-between h-full">
      <div>
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute top-3 left-3">
            <StatusBadge variant={availability} />
          </div>
          <div className="absolute top-3 right-3 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-md font-semibold">
            Lưu lượng {trafficLabels[trafficIndex] || trafficIndex}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-primary font-bold text-lg mb-1 truncate" title={name}>{name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded font-medium">{size}</span>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <span className="text-lg text-primary font-extrabold">{price}</span>
            <span className="text-xs text-muted-foreground">/tháng</span>
          </div>
          <div className="flex items-center gap-3">
            {onToggleSave && (
              <button
                type="button"
                onClick={onToggleSave}
                className={`w-10 h-10 rounded-full transition-colors duration-200 border border-[#E3E8EF] flex items-center justify-center ${saved ? "bg-red-500 text-white border-red-500" : "bg-white text-[#0B3C5D] hover:bg-[#F8FAFC]"}`}
                title={saved ? "Bỏ lưu bảng quảng cáo" : "Lưu bảng quảng cáo"}
              >
                <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onViewDetails}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-accent font-semibold transition-colors cursor-pointer active:scale-95"
            >
              <Eye className="w-4 h-4" />
              Xem Chi Tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

