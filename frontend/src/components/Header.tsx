import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HEADER_TEXT } from "@/constants/appText";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

const SchoolIcon = () => (
  <svg className="w-8 h-8 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
  </svg>
);

const Header = () => {
  const topMenuItems = HEADER_TEXT.topMenuItems;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentQuery = useMemo(() => {
    if (location.pathname !== "/tim-kiem") return "";
    const params = new URLSearchParams(location.search);
    return params.get("q") || "";
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (location.pathname === "/tim-kiem") {
      setSearchInput(currentQuery);
    }
  }, [currentQuery, location.pathname]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchInput.trim();
    if (!query) return;
    setMobileMenuOpen(false);
    navigate(`/tim-kiem?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-3 border-b border-primary-foreground/20">
          {/* Logo + Tên trường */}
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center shrink-0 border border-primary-foreground/25">
              <SchoolIcon />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base md:text-xl font-bold leading-tight">
                TRƯỜNG THPT LƯƠNG THÚC KỲ
              </h1>
              <p className="text-[11px] text-primary-foreground/75 font-medium tracking-wide">
                Cổng thông tin điện tử
              </p>
            </div>
            {/* Mobile: chỉ hiện tên ngắn */}
            <h1 className="sm:hidden text-sm font-bold leading-tight">
              THPT LƯƠNG THÚC KỲ
            </h1>
          </Link>

          <div className="flex items-center gap-3 flex-1 justify-end">
            {/* Top menu - desktop */}
            <div className="hidden md:flex items-center gap-1">
              {topMenuItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground text-xs font-medium"
                >
                  <Link to={item.href}>{item.label}</Link>
                </Button>
              ))}
            </div>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary-foreground/10">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="bg-primary text-primary-foreground border-b border-primary-foreground/20">
                <SheetHeader>
                  <SheetTitle className="text-primary-foreground">Menu</SheetTitle>
                  <SheetDescription className="sr-only">
                    Menu dieu huong va tim kiem tren thiet bi di dong.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-4">
                  {topMenuItems.map((item) => (
                    <Button key={item.label} variant="ghost" asChild className="justify-start text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => setMobileMenuOpen(false)}>
                      <Link to={item.href}>{item.label}</Link>
                    </Button>
                  ))}
                </div>
                <form onSubmit={handleSubmit} className="relative mt-4 md:hidden">
                  <Input
                    type="search"
                    placeholder={HEADER_TEXT.searchPlaceholder}
                    className="bg-card text-foreground pr-10 h-9"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </SheetContent>
            </Sheet>

            {/* Search - desktop */}
            <form onSubmit={handleSubmit} className="relative max-w-xs hidden md:block">
              <Input
                type="search"
                placeholder={HEADER_TEXT.searchPlaceholder}
                className="bg-primary-foreground/10 border-primary-foreground/25 text-primary-foreground placeholder:text-primary-foreground/60 pr-10 h-9 focus-visible:ring-primary-foreground/50"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-9 w-9 text-primary-foreground/70 hover:text-primary-foreground hover:bg-transparent"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
