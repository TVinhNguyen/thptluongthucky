import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExternalLinks } from "@/hooks/useApi";
import { getMediaUrl } from "@/lib/api";

const RightSidebar = () => {
  const { data: externalLinks, isLoading } = useExternalLinks();

  const defaultLinks = [
    { title: "Cổng thông tin Chính phủ", url: "https://chinhphu.vn", icon: null },
    { title: "Bộ Giáo dục và Đào tạo", url: "https://moet.gov.vn", icon: null },
    { title: "Sở GD&ĐT", url: "#", icon: null },
    { title: "Cổng dịch vụ công", url: "#", icon: null },
  ];

  const links = externalLinks && externalLinks.length > 0 ? externalLinks : defaultLinks;

  return (
    <aside className="space-y-6">
      <Card className="bg-card shadow-card hover:shadow-card-hover transition-all hover-scale overflow-hidden animate-fade-in">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
          Chính phủ điện tử
        </div>
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
                key={'id' in link ? link.id : index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-all hover:translate-x-1 group"
              >
                <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors overflow-hidden">
                  {'icon' in link && link.icon ? (
                    <img 
                      src={getMediaUrl(link.icon)} 
                      alt={link.title}
                      className="w-full h-full object-contain"
                    />
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

      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 shadow-card hover:shadow-card-hover transition-all hover-scale overflow-hidden animate-fade-in">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
          Lời Chủ tịch Hồ Chí Minh
        </div>
        <div className="p-6">
          <blockquote className="italic text-foreground border-l-4 border-primary pl-4 text-base leading-relaxed">
            "Vì lợi ích mười năm phải trồng cây, vì lợi ích trăm năm phải trồng người"
          </blockquote>
          <p className="text-right text-sm text-muted-foreground mt-4 font-semibold">
            - Hồ Chí Minh
          </p>
        </div>
      </Card>
    </aside>
  );
};

export default RightSidebar;
