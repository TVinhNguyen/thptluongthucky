import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

const LeftSidebar = () => {
  const sections = [
    {
      title: "Giới thiệu",
      items: [
        { label: "Ban Giám hiệu", href: "/can-bo-giao-vien?filter=ban-giam-hieu" },
        { label: "Chi bộ Đảng", href: "/co-cau-to-chuc#chi-bo-dang" },
        { label: "BCH Công Đoàn", href: "/co-cau-to-chuc#cong-doan" },
        { label: "Đoàn Thanh niên", href: "/co-cau-to-chuc#doan-thanh-nien" },
        { label: "Tổ Văn Phòng", href: "/can-bo-giao-vien?filter=van-phong" },
        { label: "Tổ Chuyên môn", href: "/can-bo-giao-vien?filter=chuyen-mon" },
        { label: "Ban thường trực Hội cha mẹ học sinh", href: "/co-cau-to-chuc#hoi-cha-me" },
      ],
    },
    {
      title: "Tin tức sự kiện",
      items: [
        { label: "Thời khóa biểu", href: "/chuyen-muc/thoi-khoa-bieu" },
        { label: "Thi - Kiểm tra", href: "/chuyen-muc/thi-kiem-tra" },
      ],
    },
    {
      title: "Văn Bản Điều Hành",
      items: [
        { label: "Văn bản Sở GD&ĐT", href: "/thu-vien-van-ban?type=so-gddt" },
        { label: "Văn bản Trường", href: "/thu-vien-van-ban?type=truong" },
        { label: "Văn bản HĐND-UBND huyện", href: "/thu-vien-van-ban?type=hdnd-ubnd" },
        { label: "Thông báo, phổ biến", href: "/thu-vien-van-ban?type=thong-bao" },
      ],
    },
    {
      title: "Danh sách liên kết",
      items: [
        { label: "Bộ Giáo dục và Đào tạo", href: "https://moet.gov.vn" },
        { label: "Cổng thông tin điện tử", href: "#" },
      ],
    },
  ];

  return (
    <aside className="space-y-6 animate-fade-in">
      {sections.map((section) => (
        <Card key={section.title} className="bg-card shadow-card hover:shadow-card-hover transition-all hover-scale overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
            {section.title}
          </div>
          <div className="divide-y divide-border">
            {section.items.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-all text-sm hover:translate-x-1"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </Card>
      ))}
    </aside>
  );
};

export default LeftSidebar;
