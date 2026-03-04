import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Search, SlidersHorizontal, ChevronRight, Home, ChevronLeft, Grid3X3, List } from "lucide-react";
import { BillboardCard } from "../components/BillboardCard";

const allBillboards = [
  { image: "https://images.unsplash.com/photo-1766324488354-a189b706d3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBjaXR5JTIwbmlnaHR8ZW58MXx8fHwxNzcyNTQ2MTI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Times Square Digital Tower", location: "Manhattan, New York", size: "14m x 6m", trafficIndex: "High", price: "$12,500", availability: "available" as const },
  { image: "https://images.unsplash.com/photo-1762668155498-cadd7d5bf8d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYmlsbGJvYXJkJTIwYWR2ZXJ0aXNpbmclMjB1cmJhbnxlbnwxfHx8fDE3NzI1NDYxMjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Sunset Blvd LED Display", location: "Hollywood, Los Angeles", size: "10m x 4m", trafficIndex: "Medium", price: "$8,200", availability: "available" as const },
  { image: "https://images.unsplash.com/photo-1642873744568-a7c5f7d10aae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aW1lcyUyMHNxdWFyZSUyMGJpbGxib2FyZCUyMG5lb258ZW58MXx8fHwxNzcyNTQ2MTI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Downtown Core Screen", location: "Financial District, Chicago", size: "12m x 5m", trafficIndex: "High", price: "$9,800", availability: "booked" as const },
  { image: "https://images.unsplash.com/photo-1719381502989-f5c050611bc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwTEVEJTIwc2NyZWVuJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcyNTQ2MTI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Harbor View Digital Wall", location: "Waterfront, Miami", size: "8m x 3m", trafficIndex: "Medium", price: "$5,400", availability: "available" as const },
  { image: "https://images.unsplash.com/photo-1644130171866-8236ff6d821a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwZG93bnRvd24lMjBjb21tZXJjaWFsfGVufDF8fHx8MTc3MjU0NjEyOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Tech Park LED Banner", location: "Silicon Valley, San Jose", size: "16m x 8m", trafficIndex: "Low", price: "$6,900", availability: "available" as const },
  { image: "https://images.unsplash.com/photo-1766324488354-a189b706d3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMRUQlMjBiaWxsYm9hcmQlMjBjaXR5JTIwbmlnaHR8ZW58MXx8fHwxNzcyNTQ2MTI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", name: "Highway 101 LED Panel", location: "Route 101, Arizona", size: "20m x 10m", trafficIndex: "High", price: "$4,200", availability: "available" as const },
];

const locations = ["All Locations", "New York", "Los Angeles", "Chicago", "Miami", "San Jose", "Arizona"];
const sizes = ["All Sizes", "Small (< 8m)", "Medium (8-14m)", "Large (> 14m)"];

export function ListingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedSize, setSelectedSize] = useState("All Sizes");
  const [budget, setBudget] = useState(15000);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* Top Nav */}
      <header className="border-b border-[#E3E8EF] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate("/")} className="text-xl text-[#0B3C5D] tracking-tight cursor-pointer" style={{ fontWeight: 700 }}>ADORA</button>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate("/listings")} className="text-sm text-[#0B3C5D] cursor-pointer" style={{ fontWeight: 500 }}>Browse Billboards</button>
              <button className="text-sm text-[#6B7A8D] hover:text-[#0B3C5D] transition-colors cursor-pointer">How It Works</button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="text-sm text-[#0B3C5D] px-4 py-2 cursor-pointer">Log In</button>
            <button onClick={() => navigate("/register")} className="text-sm bg-[#0B3C5D] text-white px-4 py-2 rounded-lg cursor-pointer">Get Started</button>
          </div>
        </div>
      </header>

      {/* Breadcrumb + Search */}
      <div className="bg-white border-b border-[#E3E8EF]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-[#6B7A8D] mb-3">
            <button onClick={() => navigate("/")} className="hover:text-[#0B3C5D] flex items-center gap-1 cursor-pointer"><Home className="w-3.5 h-3.5" />Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0B3C5D]">Browse Billboards</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7A8D]" />
              <input
                type="text"
                placeholder="Search billboards by name, location, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E3E8EF] bg-[#F4F7FA] focus:outline-none focus:ring-2 focus:ring-[#2FA4FF] focus:border-transparent text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm border border-[#E3E8EF] px-4 py-2.5 rounded-lg hover:bg-[#F4F7FA] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Filter Sidebar */}
          {showFilters && (
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-[#E3E8EF] p-5 space-y-6 sticky top-28">
                <div>
                  <label className="text-sm text-[#0B3C5D] mb-2 block" style={{ fontWeight: 600 }}>Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E3E8EF] bg-[#F4F7FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#2FA4FF]"
                  >
                    {locations.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[#0B3C5D] mb-2 block" style={{ fontWeight: 600 }}>Budget (max ${budget.toLocaleString()}/mo)</label>
                  <input
                    type="range"
                    min={1000}
                    max={20000}
                    step={500}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-[#2FA4FF]"
                  />
                  <div className="flex justify-between text-xs text-[#6B7A8D] mt-1">
                    <span>$1,000</span>
                    <span>$20,000</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#0B3C5D] mb-2 block" style={{ fontWeight: 600 }}>Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E3E8EF] bg-[#F4F7FA] text-sm focus:outline-none focus:ring-2 focus:ring-[#2FA4FF]"
                  >
                    {sizes.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[#0B3C5D] mb-2 block" style={{ fontWeight: 600 }}>Availability</label>
                  <div className="space-y-2">
                    {["Available Now", "Next 7 Days", "Next 30 Days"].map((a) => (
                      <label key={a} className="flex items-center gap-2 text-sm text-[#6B7A8D] cursor-pointer">
                        <input type="checkbox" className="rounded accent-[#2FA4FF]" />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#0B3C5D] mb-2 block" style={{ fontWeight: 600 }}>Resolution</label>
                  <div className="space-y-2">
                    {["HD (1920x1080)", "4K (3840x2160)", "Custom"].map((r) => (
                      <label key={r} className="flex items-center gap-2 text-sm text-[#6B7A8D] cursor-pointer">
                        <input type="checkbox" className="rounded accent-[#2FA4FF]" />
                        {r}
                      </label>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-[#0B3C5D] text-white py-2.5 rounded-lg text-sm hover:bg-[#1E5F9E] transition-colors cursor-pointer">
                  Apply Filters
                </button>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[#6B7A8D]">Showing <span className="text-[#0B3C5D]" style={{ fontWeight: 600 }}>6</span> results</p>
              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#E3E8EF] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2FA4FF]"
                >
                  <option value="relevance">Sort by: Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="traffic">Traffic Index</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBillboards.map((b, i) => (
                <BillboardCard key={i} {...b} onViewDetails={() => navigate("/billboard/1")} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-10">
              <button className="w-9 h-9 rounded-lg border border-[#E3E8EF] flex items-center justify-center text-[#6B7A8D] hover:bg-[#F4F7FA] cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm flex items-center justify-center cursor-pointer ${
                    p === currentPage
                      ? "bg-[#0B3C5D] text-white"
                      : "border border-[#E3E8EF] text-[#6B7A8D] hover:bg-[#F4F7FA]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button className="w-9 h-9 rounded-lg border border-[#E3E8EF] flex items-center justify-center text-[#6B7A8D] hover:bg-[#F4F7FA] cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
