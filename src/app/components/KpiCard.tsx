import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down";
  icon: React.ReactNode;
}

export function KpiCard({ title, value, change, changeType = "up", icon }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E3E8EF] p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#6B7A8D] mb-1">{title}</p>
          <p className="text-2xl text-[#1D4ED8]" style={{ fontWeight: 700 }}>{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${changeType === "up" ? "text-emerald-600" : "text-red-500"}`}>
              {changeType === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{change} so với tháng trước</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6]">
          {icon}
        </div>
      </div>
    </div>
  );
}
