import React, { useState, useEffect } from "react";
import { 
  Tv, Users, Building2, Sparkles, Save, Upload, 
  Image as ImageIcon, RefreshCw, Layout, Eye 
} from "lucide-react";
import billboardApi from "../../../api/billboardApi";
import adminApi from "../../../api/adminApi";
import axiosClient from "../../../api/axiosClient";
import { notify } from "../../utils/notify";

export function AdminLandingPageView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [form, setForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    statReach: "",
    statPanels: "",
    statCampaigns: "",
    promoText: "",
    visualProofTitle: "",
    visualProofDesc: "",
    visualProofImage: ""
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await billboardApi.getLandingPageConfig();
      if (res.success && res.data) {
        setForm(res.data);
      } else {
        notify.error("Không thể tải cấu hình Landing Page");
      }
    } catch (err) {
      console.error(err);
      notify.error("Lỗi khi tải cấu hình Landing Page");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminApi.updateLandingPageConfig(form);
      if (res.success) {
        notify.success("Cập nhật cấu hình Landing Page thành công!");
      } else {
        notify.error(res.message || "Cập nhật thất bại");
      }
    } catch (err: any) {
      console.error(err);
      notify.error(err?.response?.data?.message || "Lỗi hệ thống khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("Vui lòng chọn tệp hình ảnh hợp lệ");
      return;
    }

    setImageUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = (await axiosClient.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })) as { url: string };

      if (response && response.url) {
        setForm(prev => ({ ...prev, visualProofImage: response.url }));
        notify.success("Tải ảnh lên thành công!");
      } else {
        notify.error("Tải ảnh lên thất bại");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      notify.error(err?.message || "Tải ảnh lên thất bại");
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-border border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Left Side: Editor Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Hero Section settings */}
          <div className="bg-card rounded-xl border border-border/80 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <Layout className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">1. Banner Chính (Hero Section)</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-xs text-muted-foreground font-semibold">Khuyến Mãi (Promo Badge)</label>
                <input
                  type="text"
                  value={form.promoText}
                  onChange={e => setForm({ ...form, promoText: e.target.value })}
                  placeholder="Ví dụ: Được tin tưởng bởi hơn 5.000 nhà quảng cáo..."
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface/30 focus:outline-none focus:border-primary text-foreground"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-semibold">Tiêu Đề Lớn (Hero Title - dùng \n để xuống dòng)</label>
                <textarea
                  value={form.heroTitle}
                  onChange={e => setForm({ ...form, heroTitle: e.target.value })}
                  placeholder="Ví dụ: Thống trị bầu trời với\nQuảng cáo LED"
                  rows={2}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface/30 focus:outline-none focus:border-primary text-foreground font-semibold text-sm leading-snug"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-semibold">Tiêu Đề Phụ (Hero Subtitle)</label>
                <textarea
                  value={form.heroSubtitle}
                  onChange={e => setForm({ ...form, heroSubtitle: e.target.value })}
                  placeholder="Mô tả ngắn..."
                  rows={3}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface/30 focus:outline-none focus:border-primary text-foreground leading-relaxed"
                  required
                />
              </div>
            </div>
          </div>

          {/* Stats settings */}
          <div className="bg-card rounded-xl border border-border/80 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">2. Chỉ Số Thống Kê</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="text-xs text-muted-foreground font-semibold">Lượt Tiếp Cận (Reach)</label>
                <input
                  type="text"
                  value={form.statReach}
                  onChange={e => setForm({ ...form, statReach: e.target.value })}
                  placeholder="Ví dụ: 12.500.000+"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface/30 focus:outline-none focus:border-primary text-foreground font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-semibold">Số Màn Hình (Panels)</label>
                <input
                  type="text"
                  value={form.statPanels}
                  onChange={e => setForm({ ...form, statPanels: e.target.value })}
                  placeholder="Ví dụ: 450+"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface/30 focus:outline-none focus:border-primary text-foreground font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-semibold">Chiến Dịch (Campaigns)</label>
                <input
                  type="text"
                  value={form.statCampaigns}
                  onChange={e => setForm({ ...form, statCampaigns: e.target.value })}
                  placeholder="Ví dụ: 128+"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface/30 focus:outline-none focus:border-primary text-foreground font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Visual Proof settings */}
          <div className="bg-card rounded-xl border border-border/80 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">3. Hình Ảnh & Minh Họa (Visual Proof)</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs text-muted-foreground font-semibold">Tiêu Đề Phần Minh Họa</label>
                <input
                  type="text"
                  value={form.visualProofTitle}
                  onChange={e => setForm({ ...form, visualProofTitle: e.target.value })}
                  placeholder="Ví dụ: Vị trí đắc địa, Tầm nhìn vô hạn"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface/30 focus:outline-none focus:border-primary text-foreground"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-semibold">Mô Tả Phần Minh Họa</label>
                <textarea
                  value={form.visualProofDesc}
                  onChange={e => setForm({ ...form, visualProofDesc: e.target.value })}
                  placeholder="Mô tả chi tiết..."
                  rows={3}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface/30 focus:outline-none focus:border-primary text-foreground leading-relaxed"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-semibold">Hình Ảnh Minh Họa</label>
                
                {/* Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col justify-center border-2 border-dashed border-border rounded-xl p-4 bg-surface/20 text-center relative hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                    <span className="text-xs text-foreground font-semibold">
                      {imageUploading ? "Đang tải..." : "Tải ảnh từ thiết bị"}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">Hỗ trợ JPG, PNG, WEBP</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-muted-foreground font-medium">Hoặc dán URL ảnh trực tiếp</label>
                    <input
                      type="text"
                      value={form.visualProofImage}
                      onChange={e => setForm({ ...form, visualProofImage: e.target.value })}
                      placeholder="https://..."
                      className="mt-1 w-full px-3 py-2.5 rounded-lg border border-border bg-surface/30 focus:outline-none focus:border-primary text-foreground text-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={fetchConfig}
              className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-surface/50 text-foreground cursor-pointer flex items-center gap-1.5 transition-colors bg-transparent"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Khôi Phục
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-75 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Đang Lưu..." : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>

        {/* Right Side: High fidelity Mockup / Live Preview */}
        <div className="sticky top-20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-primary" /> Xem Trước Trực Quan (Real-time Preview)
            </span>
          </div>

          {/* Mini Browser Mockup Container */}
          <div className="border border-border/80 rounded-2xl overflow-hidden shadow-2xl bg-slate-900 text-slate-100 flex flex-col aspect-[4/3] max-w-full">
            {/* Browser Header */}
            <div className="bg-slate-950 px-4 py-2.5 flex items-center gap-2 border-b border-slate-800 shrink-0">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 block"></span>
              </div>
              <div className="bg-slate-900 rounded-md text-[10px] px-3 py-1 flex-1 text-slate-400 text-center select-none font-mono truncate max-w-[280px] mx-auto border border-slate-800">
                https://adora.io.vn
              </div>
            </div>

            {/* Browser Body / Mini Landing Page */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden text-left relative bg-[#090D16]">
              {/* Radial gradient background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-10 left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
              </div>

              {/* Hero Preview */}
              <div className="p-6 text-center space-y-4 relative z-10">
                {form.promoText && (
                  <div className="inline-flex items-center gap-1.5 bg-primary/15 border border-primary/20 rounded-full px-3 py-1 text-[9px] text-primary font-bold">
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span>{form.promoText}</span>
                  </div>
                )}
                
                <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-accent leading-tight whitespace-pre-line">
                  {form.heroTitle || "Tiêu đề Hero chưa cấu hình"}
                </h1>

                <p className="text-slate-400 text-[10px] leading-relaxed max-w-md mx-auto">
                  {form.heroSubtitle || "Mô tả phụ chưa cấu hình"}
                </p>

                {/* Mock Search Bar */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-1.5 flex gap-2 max-w-sm mx-auto shadow-lg items-center">
                  <div className="flex items-center gap-1 px-2 py-1 flex-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
                    <span className="text-[8px] text-slate-500 font-medium">Tìm vị trí màn hình LED...</span>
                  </div>
                  <button type="button" className="bg-primary hover:bg-primary-hover text-white text-[8px] font-bold px-3 py-1.5 rounded-lg border-none cursor-default shadow-md shadow-primary/20">Tìm Kiếm</button>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="grid grid-cols-3 gap-2 px-6 py-4 bg-slate-950/40 border-y border-slate-900 text-center relative z-10">
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-primary font-mono">{form.statReach || "0"}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Tiếp Cận</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-primary font-mono">{form.statPanels || "0"}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Màn Hình</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-primary font-mono">{form.statCampaigns || "0"}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Chiến Dịch</p>
                </div>
              </div>

              {/* Visual Proof Section */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center relative z-10">
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-slate-200 uppercase tracking-wide">
                    {form.visualProofTitle || "Tiêu đề visual"}
                  </h3>
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    {form.visualProofDesc || "Mô tả phần visual"}
                  </p>
                </div>

                <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center">
                  {form.visualProofImage ? (
                    <img
                      src={form.visualProofImage}
                      alt="Visual proof mockup"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-500 space-y-1.5">
                      <ImageIcon className="w-5 h-5 mx-auto opacity-40" />
                      <span className="text-[8px] block">Chưa tải ảnh minh họa</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
