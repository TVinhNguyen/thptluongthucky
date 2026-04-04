import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExternalLinks, useSiteSettings } from "@/hooks/useApi";

const RightSidebar = () => {
  const { data: externalLinks, isLoading } = useExternalLinks();
  const { data: siteSettings } = useSiteSettings();

  const defaultLinks = [
    { title: "Chính quyền điện tử thành phố", url: "https://egov.danang.gov.vn/", icon: "/DNG_icon.png" },
    { title: "Cổng thông tin Chính phủ", url: "https://chinhphu.vn", icon: "https://datafiles.chinhphu.vn/cpp/1/Logo/quoc-huy.png" },
    { title: "Bộ Giáo dục và Đào tạo", url: "https://moet.gov.vn", icon: "https://datafiles.chinhphu.vn/cpp/1/Logo/quoc-huy.png" },
    { title: "Sở GD&ĐT Đà Nẵng", url: "https://danang.edu.vn/", icon: "/sogdlogo.png" },
    { title: "Cổng dịch vụ công", url: "#", icon: "/hop-tructuyen.png" },
  ];

  const links = externalLinks && externalLinks.length > 0 ? externalLinks : defaultLinks;
  const quoteTitle = siteSettings?.quote_title || "Lời Chủ tịch Hồ Chí Minh";
  const quoteContent =
    siteSettings?.quote_content || '"Vì lợi ích mười năm phải trồng cây, vì lợi ích trăm năm phải trồng người"';
  const quoteAuthor = siteSettings?.quote_author || "Hồ Chí Minh";

  return (
    <aside className="space-y-6">
      <Card className="bg-card overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] animate-fade-in">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">Chính phủ điện tử</div>
        <div className="divide-y divide-border">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="w-12 h-8 rounded" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))
          ) : (
            links.map((link, index) => (
              <a
                key={"id" in link ? String(link.id) : `${link.url}-${link.title}-${index}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-all group"
              >
                <div className="w-12 h-8 rounded flex items-center justify-center text-xs font-bold group-hover:text-primary-foreground transition-colors overflow-hidden">
                  {"icon" in link && link.icon ? (
                    <img src={link.icon} alt={link.title} className="w-full h-full object-contain" loading="lazy" />
                  ) : (
                    "LOGO"
                  )}
                </div>
                <span className="text-sm">{link.title}</span>
              </a>
            ))
          )}
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden animate-fade-in shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">{quoteTitle}</div>
        <div className="p-6">
          <blockquote className="italic text-foreground border-l-4 border-primary pl-4 text-base leading-relaxed">{quoteContent}</blockquote>
          <p className="text-right text-sm text-muted-foreground mt-4 font-semibold">- {quoteAuthor}</p>
        </div>
      </Card>
    </aside>
  );
};

export default RightSidebar;
