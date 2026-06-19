import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, FileText, Cookie, RotateCcw, ArrowLeft, Heart } from "lucide-react";
import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";

type TabType = "privacy" | "terms" | "cookie" | "refund";

interface PolicyPageProps {
  defaultTab?: TabType;
}

export default function PolicyPage({ defaultTab = "privacy" }: PolicyPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [defaultTab]);

  const tabs = [
    { id: "privacy", label: "Chính Sách Bảo Mật", icon: ShieldCheck },
    { id: "terms", label: "Điều Khoản Dịch Vụ", icon: FileText },
    { id: "cookie", label: "Chính Sách Cookie", icon: Cookie },
    { id: "refund", label: "Chính Sách Hoàn Tiền", icon: RotateCcw },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <TopNav />

      {/* Main content container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-12 pt-24">
        
        {/* Back navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer bg-transparent border-none font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang trước
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: TAB SELECTION */}
          <aside className="lg:col-span-4 space-y-3 sticky top-24">
            <div className="glass-card p-4.5 rounded-2xl border border-border shadow-md">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-4">
                Trung tâm Pháp lý ADORA
              </h2>
              <div className="flex flex-col gap-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-sm font-bold transition-all cursor-pointer border-none ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]"
                          : "bg-transparent text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl border border-primary/10 shadow-sm text-center">
              <p className="text-xs text-muted-foreground font-semibold">Cần giải đáp thắc mắc pháp lý?</p>
              <a 
                href="mailto:legal@adora.io.vn" 
                className="mt-2 text-xs text-primary hover:text-primary-hover font-bold inline-block"
              >
                legal@adora.io.vn
              </a>
            </div>
          </aside>

          {/* RIGHT CONTENT AREA: ARTICLE TEXT */}
          <article className="lg:col-span-8 glass-card p-8 md:p-10 rounded-3xl border border-border shadow-lg">
            
            {/* ── PRIVACY POLICY ──────────────────────────────────────────────── */}
            {activeTab === "privacy" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Chính Sách Bảo Mật</h1>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Cập nhật mới nhất: Ngày 20 tháng 06 năm 2026</p>
                <div className="h-px bg-border my-4" />
                
                <section className="space-y-3.5">
                  <h2 className="text-lg font-bold text-primary">1. Thu Thập Thông Tin Cá Nhân</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Chào mừng bạn đến với sàn giao dịch ADORA. Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ thông tin cá nhân. ADORA chỉ thu thập các thông tin cần thiết để vận hành và tối ưu hóa hệ thống dịch vụ, bao gồm:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Thông tin tài khoản:</strong> Họ tên, địa chỉ email, số điện thoại, tên công ty và ảnh đại diện khi đăng ký tài khoản.</li>
                    <li><strong>Dữ liệu vị trí:</strong> Dữ liệu GPS/tọa độ của các bảng quảng cáo nhằm hiển thị trực quan lên hệ thống Bản đồ tương tác.</li>
                    <li><strong>Dữ liệu thanh toán:</strong> Lịch sử giao dịch, mã giao dịch ký quỹ của cổng thanh toán trực tuyến (ví dụ: VNPay) nhằm xử lý thanh toán minh bạch.</li>
                  </ul>
                </section>

                <section className="space-y-3.5">
                  <h2 className="text-lg font-bold text-primary">2. Sử Dụng Thông Tin Cá Nhân</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Chúng tôi sử dụng thông tin của bạn vào các mục đích hợp pháp sau:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li>Xử lý và quản lý các yêu cầu đặt chỗ quảng cáo (Bookings) giữa Nhà quảng cáo và Chủ sở hữu.</li>
                    <li>Gửi thông báo thời gian thực về tiến độ phê duyệt chiến dịch, xác thực thanh toán, và cập nhật bảo mật tài khoản.</li>
                    <li>Tối ưu hóa các thuật toán gợi ý vị trí bảng quảng cáo phù hợp với nhu cầu và ngân sách của doanh nghiệp.</li>
                  </ul>
                </section>

                <section className="space-y-3.5">
                  <h2 className="text-lg font-bold text-primary">3. Bảo Mật Thông Tin</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    ADORA áp dụng các phương thức mã hóa SSL tiêu chuẩn quốc tế cho mọi kết nối dữ liệu. Mọi thông tin nhạy cảm như mật khẩu đều được băm (hashing) bảo mật trong cơ sở dữ liệu. Chúng tôi tuyệt đối không bán, chia sẻ hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba vì bất kỳ mục đích thương mại nào.
                  </p>
                </section>
              </div>
            )}

            {/* ── TERMS OF SERVICE ────────────────────────────────────────────── */}
            {activeTab === "terms" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Điều Khoản Dịch Vụ</h1>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Cập nhật mới nhất: Ngày 20 tháng 06 năm 2026</p>
                <div className="h-px bg-border my-4" />
                
                <section className="space-y-3.5">
                  <h2 className="text-lg font-bold text-primary">1. Chấp Thuận Điều Khoản</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Bằng việc tạo tài khoản, đăng tải hoặc đặt thuê bảng quảng cáo trên hệ thống ADORA, bạn đã đồng ý tuân thủ toàn bộ các quy định nêu trong Điều Khoản Dịch Vụ này. Nếu không đồng ý, bạn vui lòng ngừng truy cập và sử dụng dịch vụ của chúng tôi.
                  </p>
                </section>

                <section className="space-y-3.5">
                  <h2 className="text-lg font-bold text-primary">2. Quy Định Đối Với Nhà Quảng Cáo (Renter)</h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Nội dung quảng cáo:</strong> Phải tuân thủ các quy định về Luật Quảng cáo của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Tuyệt đối không đăng tải nội dung phản cảm, vi phạm thuần phong mỹ tục hoặc thông tin sai sự thật.</li>
                    <li><strong>Duyệt thiết kế:</strong> Thiết kế quảng cáo (file ảnh/video) phải được gửi cho Chủ bảng duyệt tối thiểu 3 ngày làm việc trước thời điểm chiến dịch bắt đầu.</li>
                    <li><strong>Thanh toán:</strong> Thực hiện thanh toán ký quỹ đúng hạn thông qua hệ thống của ADORA sau khi yêu cầu đặt lịch được chấp nhận.</li>
                  </ul>
                </section>

                <section className="space-y-3.5">
                  <h2 className="text-lg font-bold text-primary">3. Quy Định Đối Với Chủ Bảng (Owner)</h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Tính chính xác:</strong> Cung cấp thông tin, kích thước, độ phân giải, tọa độ địa lý và hình ảnh thực tế của bảng quảng cáo một cách trung thực nhất.</li>
                    <li><strong>Vận hành:</strong> Đảm bảo bảng hoạt động đúng thời gian hoạt động cam kết (ví dụ: 16h/ngày). Trong trường hợp xảy ra sự cố kỹ thuật dẫn đến mất hiển thị, phải báo cáo ngay và thực hiện bồi thường/phát bù theo thỏa thuận.</li>
                  </ul>
                </section>
              </div>
            )}

            {/* ── COOKIE POLICY ───────────────────────────────────────────────── */}
            {activeTab === "cookie" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Chính Sách Cookie</h1>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Cập nhật mới nhất: Ngày 20 tháng 06 năm 2026</p>
                <div className="h-px bg-border my-4" />
                
                <section className="space-y-3.5">
                  <h2 className="text-lg font-bold text-primary">1. Cookie Là Gì?</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Cookie là các file văn bản nhỏ được lưu trữ trên thiết bị của bạn khi bạn truy cập website. Chúng tôi sử dụng cookie để mang lại trải nghiệm duyệt web mượt mà, ghi nhớ tùy chọn cá nhân và phân tích lưu lượng truy cập hệ thống.
                  </p>
                </section>

                <section className="space-y-3.5">
                  <h2 className="text-lg font-bold text-primary">2. Các Loại Cookie Sử Dụng Trên ADORA</h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Cookie thiết yếu:</strong> Giúp xác thực phiên đăng nhập của người dùng. Nếu tắt cookie này, hệ thống sẽ không thể duy trì trạng thái đăng nhập của bạn khi chuyển trang.</li>
                    <li><strong>Cookie cấu hình giao diện:</strong> Ghi nhớ lựa chọn tùy chỉnh của bạn như chế độ Dark/Light mode (`adora-theme`) để tự động áp dụng trong các phiên truy cập sau.</li>
                    <li><strong>Cookie thống kê (Analytics):</strong> Thu thập ẩn danh cách người dùng tương tác với website nhằm hỗ trợ tối ưu hóa hiệu năng tải trang.</li>
                  </ul>
                </section>
              </div>
            )}

            {/* ── REFUND POLICY ────────────────────────────────────────────────── */}
            {activeTab === "refund" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Chính Sách Hoàn Tiền</h1>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Cập nhật mới nhất: Ngày 20 tháng 06 năm 2026</p>
                <div className="h-px bg-border my-4" />
                
                <section className="space-y-3.5">
                  <h2 className="text-lg font-bold text-primary">1. Cơ Chế Ký Quỹ Đảm Bảo (Escrow)</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Để bảo vệ lợi ích của Nhà quảng cáo, số tiền thanh toán khi đặt chỗ sẽ được hệ thống ADORA giữ dưới dạng **ký quỹ đảm bảo**. Chủ bảng sẽ chỉ nhận được thanh toán sau khi chiến dịch quảng cáo hoàn thành và hiển thị thành công.
                  </p>
                </section>

                <section className="space-y-3.5">
                  <h2 className="text-lg font-bold text-primary">2. Các Trường Hợp Hoàn Tiền 100%</h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li>Chủ bảng từ chối yêu cầu đặt lịch của bạn (ở trạng thái PENDING).</li>
                    <li>Thiết kế quảng cáo gửi lên bị từ chối duyệt vì không phù hợp với tiêu chuẩn kỹ thuật/pháp lý của bảng và hai bên không đạt được thỏa thuận chỉnh sửa.</li>
                    <li>Chủ bảng không thực hiện phát sóng quảng cáo đúng ngày cam kết mà không báo trước và không có lý do bất khả kháng hợp lệ.</li>
                  </ul>
                </section>

                <section className="space-y-3.5">
                  <h2 className="text-lg font-bold text-primary">3. Chính Sách Hủy Đơn Hàng</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Trong trường hợp Nhà quảng cáo chủ động hủy yêu cầu đặt lịch đã được chấp nhận:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                    <li><strong>Trước 7 ngày làm việc:</strong> Hoàn lại 100% số tiền thuê (trừ đi phí dịch vụ sàn 5% không hoàn lại).</li>
                    <li><strong>Từ 3 đến 7 ngày làm việc:</strong> Hoàn lại 50% số tiền thuê.</li>
                    <li><strong>Dưới 3 ngày làm việc:</strong> Không hoàn lại tiền thuê do chủ bảng đã khóa lịch và từ chối các khách hàng khác.</li>
                  </ul>
                </section>
              </div>
            )}

          </article>

        </div>
      </main>

      <Footer />
    </div>
  );
}
