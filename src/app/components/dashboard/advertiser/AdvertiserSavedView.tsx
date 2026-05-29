import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Heart, MapPin, Monitor, Trash2, Calendar } from "lucide-react";
import { BillboardDto } from "../../../../types/billboard";
import { StatusBadge } from "../../StatusBadge";
import { billboardAvailability, formatVnd } from "../../../utils/advertiser";
import { notify } from "../../../utils/notify";

interface AdvertiserSavedViewProps {
  savedBillboards: BillboardDto[];
  onRemoveSaved?: (id: number) => void;
}

export function AdvertiserSavedView({
  savedBillboards,
  onRemoveSaved,
}: AdvertiserSavedViewProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [localSaved, setLocalSaved] = useState<BillboardDto[]>(savedBillboards);

  useEffect(() => {
    setLocalSaved(savedBillboards);
  }, [savedBillboards]);

  const filtered = useMemo(() => {
    const kw = searchTerm.toLowerCase();
    return localSaved.filter(
      (b) =>
        !kw ||
        b.title.toLowerCase().includes(kw) ||
        b.city.toLowerCase().includes(kw) ||
        b.district.toLowerCase().includes(kw),
    );
  }, [localSaved, searchTerm]);

  const handleRemove = (id: number) => {
    setLocalSaved((prev) => prev.filter((b) => b.id !== id));
    onRemoveSaved?.(id);
    notify.success("Đã bỏ lưu bảng quảng cáo");
  };

  const defaultImg =
    "https://images.unsplash.com/photo-1572945281861-68b1227368e5?w=600";

  return (
    <div className="p-8 space-y-6">
      <p className="text-xs text-[#6B7A8D] bg-[#F0F9FF] border border-[#E3E8EF] rounded-lg px-4 py-2">
        Danh sách dữ liệu đã lưu được đồng bộ cục bộ trong trình duyệt. Việc lưu/bỏ lưu sẽ được giữ lại qua các lần truy cập nếu dùng cùng trình duyệt.
      </p>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D4ED8] to-[#06B6D4] p-6 text-white">
        <p className="text-sm text-blue-100">Danh sách yêu thích</p>
        <h2 className="text-xl font-bold mt-1">{localSaved.length} bảng QC đã lưu</h2>
        <p className="text-sm text-blue-100/90 mt-2 max-w-lg">
          So sánh vị trí, giá và đặt chỗ nhanh từ các bảng bạn quan tâm.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
          <input
            type="text"
            placeholder="Tìm bảng đã lưu..."
            className="w-full pl-10 pr-4 py-2.5 border border-[#E3E8EF] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1D4ED8]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => navigate("/billboards")}
          className="px-4 py-2.5 rounded-lg bg-[#1D4ED8] text-white text-sm font-semibold hover:bg-[#1E40AF] cursor-pointer"
        >
          Khám phá thêm bảng QC
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E3E8EF] p-16 text-center">
          <Heart className="w-12 h-12 text-[#94A3B8] mx-auto mb-4" />
          <h3 className="font-bold text-[#1E293B]">Chưa lưu bảng nào</h3>
          <p className="text-sm text-[#6B7A8D] mt-2 max-w-sm mx-auto">
            Lưu bảng QC từ trang marketplace để theo dõi và đặt chỗ sau.
          </p>
          <button
            type="button"
            onClick={() => navigate("/billboards")}
            className="mt-6 px-5 py-2.5 bg-[#1D4ED8] text-white rounded-lg text-sm font-semibold cursor-pointer"
          >
            Xem marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((bb) => {
            const thumb =
              bb.images?.find((i) => i.isThumbnail)?.imageUrl ||
              bb.images?.[0]?.imageUrl ||
              defaultImg;
            const avail = billboardAvailability(bb);
            return (
              <article
                key={bb.id}
                className="bg-white rounded-xl border border-[#E3E8EF] overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative h-44">
                  <img src={thumb} alt={bb.title} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemove(bb.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-red-500 flex items-center justify-center shadow cursor-pointer hover:bg-red-50"
                    title="Bỏ lưu"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                  <div className="absolute top-3 left-3">
                    <StatusBadge variant={avail} />
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h4 className="font-bold text-[#1E293B] line-clamp-1">{bb.title}</h4>
                  <p className="text-xs text-[#6B7A8D] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {bb.district}, {bb.city}
                  </p>
                  <p className="text-xs text-[#6B7A8D] flex items-center gap-1">
                    <Monitor className="w-3.5 h-3.5" />
                    {bb.width}m × {bb.height}m · {bb.screenType}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#6B7A8D]">Giá / tháng</p>
                      <p className="text-sm font-extrabold text-[#1D4ED8]">
                        {formatVnd(bb.pricePerMonth)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/billboard/${bb.id}`)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] text-xs font-bold hover:bg-[#DBEAFE] cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Đặt chỗ
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
