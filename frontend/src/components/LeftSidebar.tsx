import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { buildCategoryUrl, SIDEBAR_SEARCH_CONFIG } from "@/constants/sidebar";
import { SIDEBAR_TEXT } from "@/constants/appText";
import { useSiteSettings } from "@/hooks/useApi";

const LeftSidebar = () => {
  const { data: siteSettings } = useSiteSettings();
  const documentsTitle =
    siteSettings?.sidebar_documents_title?.trim() || SIDEBAR_TEXT.sectionTitles.documents;
  const defaultDocumentItems = [
    { label: SIDEBAR_TEXT.items.soGddt, href: "/thu-vien-van-ban?source=SO_GDDT" },
    { label: SIDEBAR_TEXT.items.vanBanTruong, href: "/thu-vien-van-ban?source=TRUONG" },
    { label: SIDEBAR_TEXT.items.vanBanHdndUbnd, href: "/thu-vien-van-ban?source=HDND_UBND" },
    { label: SIDEBAR_TEXT.items.thongBaoPhoBien, href: "/thu-vien-van-ban?source=THONG_BAO" },
  ];
  const documentItems =
    siteSettings?.sidebar_documents_items?.length ? siteSettings.sidebar_documents_items : defaultDocumentItems;

  const sections = [
    {
      id: "intro",
      title: SIDEBAR_TEXT.sectionTitles.intro,
      // items: [
      //   { label: SIDEBAR_TEXT.items.banGiamHieu, href: "/can-bo-giao-vien?filter=ban-giam-hieu" },
      //   { label: SIDEBAR_TEXT.items.chiBoDang, href: "/co-cau-to-chuc#chi-bo-dang" },
      //   // { label: "BCH Công Đoàn", href: "/co-cau-to-chuc#cong-doan" },
      //   { label: SIDEBAR_TEXT.items.doanThanhNien, href: "/co-cau-to-chuc#doan-thanh-nien" },
      //   { label: SIDEBAR_TEXT.items.toVanPhong, href: "/can-bo-giao-vien?filter=van-phong" },
      //   { label: SIDEBAR_TEXT.items.toChuyenMon, href: "/can-bo-giao-vien?filter=chuyen-mon" },
      //   { label: SIDEBAR_TEXT.items.hoiChaMeHocSinh, href: "/can-bo-giao-vien?filter=hoi-cha-me-hoc-sinh" },
      // ],
      items: [
        { label: SIDEBAR_TEXT.items.banGiamHieu, href: "/can-bo-giao-vien" },
        { label: SIDEBAR_TEXT.items.chiBoDang, href: "/co-cau-to-chuc#chi-bo-dang" },
        // { label: "BCH Công Đoàn", href: "/co-cau-to-chuc#cong-doan" },
        { label: SIDEBAR_TEXT.items.doanThanhNien, href: "/co-cau-to-chuc#doan-thanh-nien" },
        { label: SIDEBAR_TEXT.items.toVanPhong, href: "/can-bo-giao-vien" },
        { label: SIDEBAR_TEXT.items.toChuyenMon, href: "/can-bo-giao-vien" },
        { label: SIDEBAR_TEXT.items.hoiChaMeHocSinh, href: "/can-bo-giao-vien?filter=hoi-cha-me-hoc-sinh" },
      ],
    },
    {
      id: "news",
      title: SIDEBAR_TEXT.sectionTitles.news,
      items: [
        { label: SIDEBAR_TEXT.items.thoiKhoaBieu, href: "/chuyen-muc/thoi-khoa-bieu" },
        {
          label: SIDEBAR_TEXT.items.thiKiemTra,
          href: buildCategoryUrl(
            SIDEBAR_SEARCH_CONFIG.THI_KIEM_TRA.category,
            SIDEBAR_SEARCH_CONFIG.THI_KIEM_TRA.keywords,
            SIDEBAR_SEARCH_CONFIG.BASE_PATH
          ),
        },
      ],
    },
    {
      id: "documents",
      title: documentsTitle,
      items: documentItems,
    },
    {
      id: "links",
      title: SIDEBAR_TEXT.sectionTitles.links,
      items: [
        { label: SIDEBAR_TEXT.items.boGddt, href: "https://moet.gov.vn" },
        { label: SIDEBAR_TEXT.items.congThongTin, href: "#" },
      ],
    },
  ];

  return (
    <aside className="space-y-6 animate-fade-in">
      {sections.map((section) => (
        <Card key={section.id} className="bg-card hover:shadow-card-hover transition-all hover-scale overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
            {section.title}
          </div>
          <div className="divide-y divide-border">
            {section.items.map((item) => (
              <Link
                key={`${section.id}-${item.href}-${item.label}`}
                to={item.href}
                className="block px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-all text-sm"
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
