import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Search,
  SlidersHorizontal,
  List,
} from "lucide-react";
import billboardApi from "../../api/billboardApi";
import { BillboardDto } from "../../types/billboard";
import { BillboardGoogleMap } from "../components/map/BillboardGoogleMap";
import { BillboardMapPanel } from "../components/map/BillboardMapPanel";
import {
  getBillboardRentalStatus,
  MAP_BILLBOARD_MOCKS,
} from "../utils/billboardMap";

const DISTRICTS = [
  "Tất cả",
  "Hải Châu",
  "Sơn Trà",
  "Thanh Khê",
  "Ngũ Hành Sơn",
  "Liên Chiểu",
  "Cẩm Lệ",
];

export default function BillboardMapPage() {
  const navigate = useNavigate();
  const [billboards, setBillboards] = useState<BillboardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "booked">(
    "all"
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const response = await billboardApi.getAll({ city: "Đà Nẵng" });
        const data =
          response.success && response.data?.length ? response.data : [];
        if (!cancelled) {
          setBillboards(data.length > 0 ? data : MAP_BILLBOARD_MOCKS);
        }
      } catch {
        if (!cancelled) setBillboards(MAP_BILLBOARD_MOCKS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return billboards.filter((b) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const hay = `${b.title} ${b.address} ${b.district} ${b.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (district !== "Tất cả" && b.district !== district) return false;
      if (statusFilter !== "all") {
        const st = getBillboardRentalStatus(b);
        if (st !== statusFilter) return false;
      }
      return true;
    });
  }, [billboards, search, district, statusFilter]);

  const selected = filtered.find((b) => b.id === selectedId) ?? null;

  const counts = useMemo(() => {
    const available = filtered.filter(
      (b) => getBillboardRentalStatus(b) === "available"
    ).length;
    return { total: filtered.length, available, booked: filtered.length - available };
  }, [filtered]);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#0f172a] overflow-hidden">
      {/* Floating header */}
      <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
        <div className="p-3 sm:p-4 flex flex-col gap-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white/95 shadow-lg flex items-center justify-center text-[#1D4ED8] hover:bg-white cursor-pointer"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0 rounded-xl bg-white/95 backdrop-blur-md shadow-lg px-4 py-2.5 border border-white/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#06B6D4] shrink-0" />
                <div className="min-w-0">
                  <h1
                    className="text-sm sm:text-base text-[#1D4ED8] truncate"
                    style={{ fontWeight: 700 }}
                  >
                    Bản đồ Billboard LED — Đà Nẵng
                  </h1>
                  <p className="text-[11px] text-[#6B7A8D] truncate">
                    {loading
                      ? "Đang tải..."
                      : `${counts.total} bảng · ${counts.available} Available · ${counts.booked} Booked`}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/billboards")}
              className="hidden sm:flex w-10 h-10 rounded-xl bg-white/95 shadow-lg items-center justify-center text-[#6B7A8D] hover:text-[#1D4ED8] cursor-pointer"
              title="Danh sách"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pointer-events-auto">
            <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white/95 rounded-xl px-3 py-2 shadow-lg border border-white/60">
              <Search className="w-4 h-4 text-[#6B7A8D] shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, địa chỉ..."
                className="flex-1 bg-transparent text-sm outline-none min-w-0"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/95 rounded-xl px-3 py-2 shadow-lg border border-white/60">
              <SlidersHorizontal className="w-4 h-4 text-[#6B7A8D]" />
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="text-sm bg-transparent outline-none cursor-pointer"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex rounded-xl overflow-hidden shadow-lg border border-white/60 bg-white/95">
              {(
                [
                  ["all", "Tất cả"],
                  ["available", "Available"],
                  ["booked", "Booked"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                    statusFilter === key
                      ? "bg-[#1D4ED8] text-white"
                      : "text-[#6B7A8D] hover:bg-[#F0F9FF]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 text-[11px] pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/90 shadow">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Available
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/90 shadow">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Booked
            </span>
          </div>
        </div>
      </header>

      {/* Map + panel layout */}
      <div className="flex-1 relative min-h-0">
        <BillboardGoogleMap
          billboards={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
          fitBounds
          className="absolute inset-0"
        />

        {/* Desktop side panel */}
        {selected && (
          <aside className="hidden lg:block absolute top-28 right-4 bottom-4 w-[380px] z-10 animate-in slide-in-from-right-4">
            <BillboardMapPanel
              billboard={selected}
              onClose={() => setSelectedId(null)}
            />
          </aside>
        )}

        {/* Mobile bottom sheet */}
        {selected && (
          <div className="lg:hidden absolute inset-x-0 bottom-0 z-10 p-3 pb-5 max-h-[55vh]">
            <BillboardMapPanel
              billboard={selected}
              onClose={() => setSelectedId(null)}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
}
