import React from "react";
import { Link } from "react-router";
import { Mail, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl mb-4 tracking-tight text-primary font-black">ADORA</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Sàn giao dịch bảng quảng cáo LED số hàng đầu. Giá minh bạch. Cập nhật theo thời gian thực. Thanh toán an toàn.
            </p>
            <div className="space-y-2">
              <a href="mailto:contact.adoravn@gmail.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                <span>contact.adoravn@gmail.com</span>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61590208394601&sk=about" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-4 h-4 shrink-0 text-[#1877F2]" />
                <span>Facebook: ADORA LED</span>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm mb-4 text-foreground" style={{ fontWeight: 600 }}>Sàn Giao Dịch</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/billboards" className="hover:text-primary transition-colors">Tìm Bảng Quảng Cáo</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Đăng Bảng Quảng Cáo</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Bảng Giá</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Cách Hoạt Động</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm mb-4 text-foreground" style={{ fontWeight: 600 }}>Công Ty</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Về Chúng Tôi</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Tuyển Dụng</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Liên Hệ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm mb-4 text-foreground" style={{ fontWeight: 600 }}>Pháp Lý</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Chính Sách Bảo Mật</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">Điều Khoản Dịch Vụ</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-primary transition-colors">Chính Sách Cookie</Link></li>
              <li><Link to="/refund-policy" className="hover:text-primary transition-colors">Chính Sách Hoàn Tiền</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground/60">&copy; 2026 ADORA. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground/60">
            <a href="mailto:contact.adoravn@gmail.com" className="hover:text-primary transition-colors font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> contact.adoravn@gmail.com
            </a>
            <a href="https://www.facebook.com/profile.php?id=61590208394601&sk=about" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium flex items-center gap-1.5">
              <Facebook className="w-3.5 h-3.5" /> Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
