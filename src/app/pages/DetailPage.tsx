import React, { useState } from "react";
import { useNavigate } from "react-router";
import { MapPin, ChevronRight, Home, Star, Heart, Share2, Phone, Calendar, Monitor, Wifi, Sun, Clock } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const images = [
  "https://images.unsplash.com/photo-1766324488354-a189b706d3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBjaXR5JTIwbmlnaHR8ZW58MXx8fHwxNzcyNTQ2MTI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1762668155498-cadd7d5bf8d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmlsbGJvYXJkJTIwYWR2ZXJ0aXNpbmclMjB1cmJhbnxlbnwxfHx8fDE3NzI1NDYxMjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1642873744568-a7c5f7d10aae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1lcyUyMHNxdWFyZSUyMGJpbGxib2FyZCUyMG5lb258ZW58MXx8fHwxNzcyNTQ2MTI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

const specs = [
  { label: "Display Type", value: "LED Full Color", icon: <Monitor className="w-4 h-4" /> },
  { label: "Resolution", value: "3840 x 2160 (4K)", icon: <Monitor className="w-4 h-4" /> },
  { label: "Brightness", value: "7,500 nits", icon: <Sun className="w-4 h-4" /> },
  { label: "Connectivity", value: "4G / Wi-Fi / Fiber", icon: <Wifi className="w-4 h-4" /> },
  { label: "Operating Hours", value: "24/7", icon: <Clock className="w-4 h-4" /> },
  { label: "Content Format", value: "MP4, JPG, HTML5", icon: <Monitor className="w-4 h-4" /> },
];

const reviews = [
  { name: "Sarah Johnson", company: "MediaCorp", rating: 5, comment: "Excellent location and the booking process was seamless. Great ROI on our campaign.", date: "Feb 15, 2026" },
  { name: "Michael Chen", company: "BrandWave", rating: 4, comment: "Good billboard with high traffic. The owner was responsive and helpful.", date: "Jan 28, 2026" },
  { name: "Lisa Park", company: "AdVenture Inc.", rating: 5, comment: "Our best performing outdoor campaign. The visibility is exceptional.", date: "Jan 10, 2026" },
];

const calendarDays = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  available: ![3, 4, 5, 12, 13, 14, 15, 25, 26].includes(i + 1),
}));

export function DetailPage() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [saved, setSaved] = useState(false);

  const tabs = ["overview", "technical", "reviews", "map"];

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* Top Nav */}
      <header className="border-b border-[#E3E8EF] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-xl text-[#0B3C5D] tracking-tight cursor-pointer" style={{ fontWeight: 700 }}>ADORA</button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="text-sm text-[#0B3C5D] px-4 py-2 cursor-pointer">Log In</button>
            <button onClick={() => navigate("/register")} className="text-sm bg-[#0B3C5D] text-white px-4 py-2 rounded-lg cursor-pointer">Get Started</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6B7A8D] mb-6">
          <button onClick={() => navigate("/")} className="hover:text-[#0B3C5D] flex items-center gap-1 cursor-pointer"><Home className="w-3.5 h-3.5" />Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate("/listings")} className="hover:text-[#0B3C5D] cursor-pointer">Billboards</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#0B3C5D]">Times Square Digital Tower</span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Gallery + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden border border-[#E3E8EF]">
              <div className="relative h-96">
                <ImageWithFallback src={images[selectedImage]} alt="Billboard" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => setSaved(!saved)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${saved ? "bg-red-500 text-white" : "bg-white/90 text-[#6B7A8D] hover:text-red-500"}`}>
                    <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-[#6B7A8D] hover:text-[#0B3C5D] cursor-pointer">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2 p-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors cursor-pointer ${i === selectedImage ? "border-[#2FA4FF]" : "border-transparent"}`}
                  >
                    <ImageWithFallback src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Billboard Info */}
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl text-[#0B3C5D]" style={{ fontWeight: 700 }}>Times Square Digital Tower</h1>
                    <StatusBadge variant="available" />
                  </div>
                  <div className="flex items-center gap-1 text-[#6B7A8D]">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">1585 Broadway, Manhattan, New York, NY 10036</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm text-[#0B3C5D]" style={{ fontWeight: 600 }}>4.8</span>
                  <span className="text-sm text-[#6B7A8D]">(24 reviews)</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-[#F4F7FA] text-[#0B3C5D] text-xs px-3 py-1 rounded-full">14m x 6m</span>
                <span className="bg-[#F4F7FA] text-[#0B3C5D] text-xs px-3 py-1 rounded-full">LED Full Color</span>
                <span className="bg-[#F4F7FA] text-[#0B3C5D] text-xs px-3 py-1 rounded-full">4K Resolution</span>
                <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full">High Traffic</span>
              </div>

              {/* Tabs */}
              <div className="border-b border-[#E3E8EF] mb-6">
                <div className="flex gap-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-sm capitalize transition-colors cursor-pointer ${
                        activeTab === tab
                          ? "text-[#0B3C5D] border-b-2 border-[#2FA4FF]"
                          : "text-[#6B7A8D] hover:text-[#0B3C5D]"
                      }`}
                      style={activeTab === tab ? { fontWeight: 600 } : {}}
                    >
                      {tab === "technical" ? "Technical Specs" : tab === "map" ? "Full Map" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div>
                  <p className="text-sm text-[#6B7A8D] mb-6 leading-relaxed">
                    Located in the heart of Times Square, this premium LED billboard offers unparalleled visibility to millions of pedestrians and vehicles daily. With 4K resolution and 7,500 nits brightness, your content will shine 24/7 in one of the world&apos;s most iconic advertising locations.
                  </p>
                  <h3 className="text-[#0B3C5D] mb-4" style={{ fontWeight: 600 }}>Key Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {specs.map((s) => (
                      <div key={s.label} className="bg-[#F4F7FA] rounded-lg p-3">
                        <div className="flex items-center gap-2 text-[#1E5F9E] mb-1">{s.icon}<span className="text-xs text-[#6B7A8D]">{s.label}</span></div>
                        <p className="text-sm text-[#0B3C5D]" style={{ fontWeight: 500 }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "technical" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ["Manufacturer", "Samsung Outdoor"],
                        ["Model", "XPR-7500 Series"],
                        ["Pixel Pitch", "6mm"],
                        ["Display Area", "14m x 6m (84 sqm)"],
                        ["Resolution", "3840 x 2160"],
                        ["Brightness", "7,500 nits"],
                        ["Contrast Ratio", "5000:1"],
                        ["Refresh Rate", "3840Hz"],
                        ["Power Consumption", "450W/sqm"],
                        ["IP Rating", "IP65"],
                        ["Operating Temp", "-20°C to 50°C"],
                        ["Connectivity", "4G / Wi-Fi / Fiber Optic"],
                      ].map(([k, v], i) => (
                        <tr key={k} className={i % 2 === 0 ? "bg-[#F4F7FA]" : ""}>
                          <td className="px-4 py-2.5 text-[#6B7A8D]">{k}</td>
                          <td className="px-4 py-2.5 text-[#0B3C5D]" style={{ fontWeight: 500 }}>{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.name} className="bg-[#F4F7FA] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm text-[#0B3C5D]" style={{ fontWeight: 600 }}>{r.name}</span>
                          <span className="text-xs text-[#6B7A8D] ml-2">{r.company}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#6B7A8D]">{r.comment}</p>
                      <p className="text-xs text-[#6B7A8D]/60 mt-2">{r.date}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "map" && (
                <div className="bg-[#F4F7FA] rounded-lg h-64 flex items-center justify-center text-[#6B7A8D]">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-[#2FA4FF]" />
                    <p className="text-sm">1585 Broadway, Manhattan, NY 10036</p>
                    <p className="text-xs mt-1">Interactive map view</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[#E3E8EF] p-6 sticky top-24 space-y-6">
              <div>
                <p className="text-sm text-[#6B7A8D]">Monthly Rate</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl text-[#0B3C5D]" style={{ fontWeight: 700 }}>$12,500</span>
                  <span className="text-sm text-[#6B7A8D]">/month</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm text-[#0B3C5D]" style={{ fontWeight: 600 }}>Pricing Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#6B7A8D]">Base rate</span><span className="text-[#0B3C5D]">$10,000</span></div>
                  <div className="flex justify-between"><span className="text-[#6B7A8D]">Premium location</span><span className="text-[#0B3C5D]">$1,500</span></div>
                  <div className="flex justify-between"><span className="text-[#6B7A8D]">Platform fee (8%)</span><span className="text-[#0B3C5D]">$1,000</span></div>
                  <div className="border-t border-[#E3E8EF] pt-2 flex justify-between" style={{ fontWeight: 600 }}>
                    <span className="text-[#0B3C5D]">Total</span>
                    <span className="text-[#0B3C5D]">$12,500</span>
                  </div>
                </div>
              </div>

              {/* Mini Calendar */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-[#1E5F9E]" />
                  <h4 className="text-sm text-[#0B3C5D]" style={{ fontWeight: 600 }}>March 2026</h4>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <span key={i} className="text-xs text-[#6B7A8D] py-1">{d}</span>
                  ))}
                  {/* Empty cells for offset */}
                  {Array.from({ length: 6 }).map((_, i) => <span key={`e-${i}`} />)}
                  {calendarDays.map((d) => (
                    <span
                      key={d.day}
                      className={`text-xs py-1 rounded ${
                        d.available
                          ? "text-[#0B3C5D] hover:bg-[#2FA4FF] hover:text-white cursor-pointer"
                          : "text-red-300 bg-red-50 line-through"
                      }`}
                    >
                      {d.day}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-[#6B7A8D]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Available</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-300" />Booked</span>
                </div>
              </div>

              <button className="w-full bg-[#2FA4FF] text-white py-3 rounded-lg hover:bg-[#1E8FE5] transition-colors cursor-pointer" style={{ fontWeight: 600 }}>
                Book Now
              </button>
              <button className="w-full border border-[#E3E8EF] text-[#0B3C5D] py-3 rounded-lg hover:bg-[#F4F7FA] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Phone className="w-4 h-4" />
                Contact Owner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
