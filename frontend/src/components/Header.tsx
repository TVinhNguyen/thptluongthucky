import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Header = () => {
  const topMenuItems = [
    { label: "ĐĂNG NHẬP", href: "https://user.vnedu.vn/sso//?use_cache=1&continue=http://truongthptluongthucky.web.vnedu.vn/security/ssoVnedu" },
    { label: "XEM CÔNG VĂN", href: "/cong-van" },
    { label: "HỌC TRỰC TUYẾN", href: "https://k12online.vn/" },
    { label: "XEM CAMERA", href: "https://web.cloudcam.vn/login" },
    { label: "TRA CỨU ĐIỂM", href: "https://smas.edu.vn/Home/LogOn?ReturnUrl=%2f" },
    { label: "SMAS", href: "https://smas.edu.vn/Home/LogOn?ReturnUrl=%2f" },
  ];

    return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-3 border-b border-primary-foreground/20">
          <div className="flex items-center gap-6">
            <span className="text-sm">→ Đăng nhập</span>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="hidden md:flex items-center gap-2">
              {topMenuItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-primary-foreground hover:bg-accent hover:text-accent-foreground text-xs font-medium"
                >
                  <Link to={item.href}>{item.label}</Link>
                </Button>
              ))}
            </div>

            <div className="relative max-w-xs">
              <Input
                type="search"
                placeholder="Tìm kiếm..."
                className="bg-card text-foreground pr-10 h-9"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;



