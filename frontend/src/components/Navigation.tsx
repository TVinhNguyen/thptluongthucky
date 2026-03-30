import { useMemo, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useCategories } from "@/hooks/useApi";
import { Link } from "react-router-dom";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

interface NavItem {
  label: string;
  href?: string;
  dropdownItems?: { label: string; href: string }[];
}

const Navigation = () => {
  const { data: categories = [], isLoading } = useCategories();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Build navigation items from categories
  const navItems = useMemo<NavItem[]>(() => {
    if (isLoading || !categories.length) {
      // Default static items while loading
      return [
        { label: "Trang chủ", href: "/" },
        { label: "Giới thiệu", href: "/gioi-thieu" },
        {
          label: "Sơ đồ tổ chức",
          dropdownItems: [
            { label: "Cơ cấu tổ chức", href: "/co-cau-to-chuc" },
            { label: "Cán bộ giáo viên", href: "/can-bo-giao-vien" },
          ],
        },
        {
          label: "Văn bản - Công văn",
          dropdownItems: [
            { label: "Thư viện văn bản", href: "/thu-vien-van-ban" },
            { label: "Công văn", href: "/thu-vien-van-ban/cong-van" },
            { label: "Quyết định", href: "/thu-vien-van-ban/quyet-dinh" },
          ],
        },
      ];
    }

    // Build navigation from categories
    const staticItems: NavItem[] = [
      { label: "Trang chủ", href: "/" },
      { label: "Giới thiệu", href: "/gioi-thieu" },
      {
        label: "Sơ đồ tổ chức",
        dropdownItems: [
          { label: "Cơ cấu tổ chức", href: "/co-cau-to-chuc" },
          { label: "Cán bộ giáo viên", href: "/can-bo-giao-vien" },
        ],
      },
      {
        label: "Văn bản - Công văn",
        dropdownItems: [
          { label: "Thư viện văn bản", href: "/thu-vien-van-ban" },
          { label: "Công văn", href: "/thu-vien-van-ban/cong-van" },
          { label: "Quyết định", href: "/thu-vien-van-ban/quyet-dinh" },
        ],
      },
    ];

    // Get only parent categories (parent === null)
    const parentCategories = categories.filter((cat) => cat.parent === null);

    // Convert parent categories to navigation items with their children
    const categoryItems: NavItem[] = parentCategories
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((parent) => {
        // Check if category has children
        if (parent.children && parent.children.length > 0) {
          const dropdownItems = parent.children
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((child) => ({
              label: child.name,
              href: `/chuyen-muc/${child.slug}`,
            }));

          return {
            label: parent.name,
            dropdownItems,
          };
        } else {
          // If no children, create a direct link
          return {
            label: parent.name,
            href: `/chuyen-muc/${parent.slug}`,
          };
        }
      });

    return [...staticItems, ...categoryItems];
  }, [categories, isLoading]);

  return (
    <nav className="bg-primary/95 text-primary-foreground shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center">
          <div className="md:hidden flex w-full items-center justify-end py-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full border border-border/70 bg-card/95 text-foreground shadow-sm hover:bg-accent"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Mo menu dieu huong"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent side="left" className="w-[86%] max-w-sm overflow-y-auto border-r border-border/70 bg-card/95 backdrop-blur">
              <SheetHeader className="border-b border-border/70 pb-3">
                <SheetTitle className="text-left text-base">Danh muc</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-1">
                {navItems.map((item) => {
                  if (item.dropdownItems) {
                    return (
                      <Collapsible key={item.label}>
                        <CollapsibleTrigger className="group flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent/80">
                          <span>{item.label}</span>
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-3 mt-1 border-l border-border/70 pl-3">
                            {item.dropdownItems.map((sub) => (
                              <Link
                                key={sub.href}
                                to={sub.href}
                                onClick={() => setMobileNavOpen(false)}
                                className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                              >
                                <span>{sub.label}</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Link>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  }
                  return (
                    <Link
                      key={item.label}
                      to={item.href || "#"}
                      onClick={() => setMobileNavOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent/80"
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex items-center overflow-x-auto scrollbar-hide hover:text-accent-foreground">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                label={item.label}
                href={item.href}
                dropdownItems={item.dropdownItems}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;



