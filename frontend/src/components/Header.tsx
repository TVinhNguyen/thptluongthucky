import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HEADER_TEXT } from "@/constants/appText";

const Header = () => {
  const topMenuItems = HEADER_TEXT.topMenuItems;
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState("");
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
    navigate(`/tim-kiem?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-3 border-b border-primary-foreground/20">
          <div className="flex items-center gap-6">
            <span className="text-sm">{HEADER_TEXT.loginHint}</span>
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

            <form onSubmit={handleSubmit} className="relative max-w-xs">
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
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;



