import { useMemo } from "react";
import { NavLink } from "@/components/NavLink";
import { useCategories } from "@/hooks/useApi";
import type { Category } from "@/lib/api";

interface NavItem {
  label: string;
  href?: string;
  dropdownItems?: { label: string; href: string }[];
}

const Navigation = () => {
  const { data: categories = [], isLoading } = useCategories();

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
        <div className="flex items-center overflow-x-auto scrollbar-hide hover:text-accent-foreground">
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
    </nav>
  );
};

export default Navigation;
