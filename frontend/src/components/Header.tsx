import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const topMenuItems = [
    "ĐĂNG NHẬP",
    "XEM CÔNG VĂN",
    "HỌC TRỰC TUYẾN",
    "XEM CAMERA",
    "TRA CỨU ĐIỂM",
    "SMAS",
    "RSS",
  ];

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Top Navigation Bar */}
        <nav className="flex items-center justify-between py-3 border-b border-primary-foreground/20">
          <div className="flex items-center gap-6">
            <span className="text-sm">→ Đăng nhập</span>
          </div>
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="hidden md:flex items-center gap-2">
              {topMenuItems.map((item) => (
                <Button
                  key={item}
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-hover text-xs font-medium"
                >
                  {item}
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
