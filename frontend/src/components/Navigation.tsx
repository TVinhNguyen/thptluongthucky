import { NavLink } from "@/components/NavLink";

const Navigation = () => {
  const navItems = [
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
      label: "Kế hoạch giáo dục",
      dropdownItems: [
        { label: "Kế hoạch năm học", href: "/chuyen-muc/ke-hoach-giao-duc" },
        { label: "Chương trình học", href: "/chuyen-muc/chuong-trinh-hoc" },
      ],
    },
    {
      label: "Văn bản - Công văn",
      dropdownItems: [
        { label: "Thư viện văn bản", href: "/thu-vien-van-ban" },
        { label: "Văn bản mới", href: "/chuyen-muc/van-ban" },
      ],
    },
    {
      label: "Tin tức - Sự kiện",
      dropdownItems: [
        { label: "Tin mới nhất", href: "/chuyen-muc/tin-moi-nhat" },
        { label: "Sự kiện", href: "/chuyen-muc/su-kien" },
        { label: "Hoạt động Đoàn thể", href: "/chuyen-muc/hoat-dong-doan-the" },
      ],
    },
    {
      label: "Tài nguyên",
      dropdownItems: [
        { label: "Tài liệu", href: "/chuyen-muc/tai-lieu" },
        { label: "Video", href: "/chuyen-muc/video" },
      ],
    },
    {
      label: "Tra cứu",
      dropdownItems: [
        { label: "Tra cứu điểm", href: "/tra-cuu-diem" },
        { label: "Tra cứu lịch học", href: "/tra-cuu-lich-hoc" },
      ],
    },
    { label: "Hỏi đáp", href: "/hoi-dap" },
    { label: "Liên hệ", href: "/lien-he" },
  ];

  return (
    <nav className="bg-primary/95 text-primary-foreground shadow-md sticky top-0 z-40 ">
      <div className="container mx-auto px-4">
        <div className="flex items-center overflow-x-auto scrollbar-hide hover:text-accent-foreground ">
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
