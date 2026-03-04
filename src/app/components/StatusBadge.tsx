import React from "react";

type BadgeVariant = "active" | "pending" | "booked" | "expired" | "available" | "unavailable";

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  booked: "bg-blue-50 text-blue-700 border-blue-200",
  expired: "bg-gray-100 text-gray-500 border-gray-200",
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  unavailable: "bg-red-50 text-red-600 border-red-200",
};

const variantLabels: Record<BadgeVariant, string> = {
  active: "Đang hoạt động",
  pending: "Chờ xử lý",
  booked: "Đã đặt",
  expired: "Hết hạn",
  available: "Còn trống",
  unavailable: "Không khả dụng",
};

export function StatusBadge({ variant, label }: { variant: BadgeVariant; label?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${variantStyles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        variant === "active" || variant === "available" ? "bg-emerald-500" :
        variant === "pending" ? "bg-amber-500" :
        variant === "booked" ? "bg-blue-500" :
        variant === "expired" ? "bg-gray-400" : "bg-red-500"
      }`} />
      {label || variantLabels[variant]}
    </span>
  );
}
