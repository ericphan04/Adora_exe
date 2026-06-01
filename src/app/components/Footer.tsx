import React from "react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl mb-4 tracking-tight text-primary font-black">ADORA</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sàn giao dịch bảng quảng cáo LED số hàng đầu. Giá minh bạch. Cập nhật theo thời gian thực. Thanh toán an toàn.
            </p>
            <p className="text-muted-foreground text-sm mt-4">
              Liên hệ: <a href="mailto:adora@gmail.com" className="hover:text-primary transition-colors font-medium">adora@gmail.com</a>
            </p>
          </div>
          <div>
            <h4 className="text-sm mb-4 text-foreground" style={{ fontWeight: 600 }}>Sàn Giao Dịch</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Tìm Bảng Quảng Cáo</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Đăng Bảng Quảng Cáo</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Bảng Giá</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cách Hoạt Động</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm mb-4 text-foreground" style={{ fontWeight: 600 }}>Công Ty</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Về Chúng Tôi</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Tuyển Dụng</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Liên Hệ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm mb-4 text-foreground" style={{ fontWeight: 600 }}>Pháp Lý</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Chính Sách Bảo Mật</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Điều Khoản Dịch Vụ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Chính Sách Cookie</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Chính Sách Hoàn Tiền</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground/60">&copy; 2026 ADORA. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground/60">
            <a href="mailto:adora@gmail.com" className="hover:text-primary transition-colors font-medium">Email: adora@gmail.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
