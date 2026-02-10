import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { usePages } from "@/hooks/useApi";
import { formatDate } from "@/lib/api";
import { prependMediaBaseUrl } from "@/lib/util";
import { BookOpen, Target, Eye, Star, Calendar, Clock } from "lucide-react";

const defaultHighlights = [
  { title: "Sứ mệnh", content: "Nội dung đang cập nhật.", icon: Target },
  { title: "Tầm nhìn", content: "Nội dung đang cập nhật.", icon: Eye },
  { title: "Giá trị cốt lõi", content: "Nội dung đang cập nhật.", icon: Star },
];

const SECTION_SLUGS = [
  { slug: "su-menh", title: "Sứ mệnh", icon: Target },
  { slug: "tam-nhin", title: "Tầm nhìn", icon: Eye },
  { slug: "gia-tri-cot-loi", title: "Giá trị cốt lõi", icon: Star },
];

const normalizeText = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const extractTextFromHtml = (html: string) => {
  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }
  return html.replace(/<[^>]*>/g, " ");
};

const AboutPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const pageSlug = slug || "gioi-thieu";
  const { data: pages = [], isLoading, error } = usePages();

  const mainPage = useMemo(
    () => pages.find((item) => item.slug === pageSlug),
    [pages, pageSlug]
  );

  const processedContent = useMemo(() => {
    return prependMediaBaseUrl(mainPage?.content);
  }, [mainPage?.content]);

  const highlightSections = useMemo(() => {
    if (!pages.length) return defaultHighlights;

    return SECTION_SLUGS.map((section, index) => {
      const matchedPage = pages.find(
        (item) => normalizeText(item.slug) === normalizeText(section.slug)
      );
      let content = matchedPage?.content
        ? extractTextFromHtml(matchedPage.content).trim()
        : "";

      if (content.length > 400) {
        content = `${content.slice(0, 400)}...`;
      }

      return {
        title: section.title,
        icon: section.icon,
        content: content || defaultHighlights[index].content,
      };
    });
  }, [pages]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Navigation />
        <div className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-48" />
                <Card className="p-6 md:p-8 space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-64 w-full" />
                </Card>
              </div>
              <div className="lg:col-span-1 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="p-4 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !mainPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Navigation />
        <div className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-16">
            <Card className="max-w-3xl mx-auto p-8 text-center space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Không tìm thấy trang</h1>
              <p className="text-muted-foreground">
                Trang giới thiệu hiện chưa có dữ liệu. Vui lòng kiểm tra lại sau.
              </p>
              <Link to="/" className="text-primary hover:text-primary/80 font-medium">
                Quay lại trang chủ
              </Link>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: "Giới thiệu", href: "/gioi-thieu" },
              { label: mainPage.title },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-card-hover transition-shadow animate-fade-in">
                <div className="p-6 md:p-8">
                  <Badge className="mb-4">Giới thiệu</Badge>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                    {mainPage.title}
                  </h1>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Ngày tạo: {formatDate(mainPage.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Cập nhật: {formatDate(mainPage.updated_at)}</span>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  <div
                    className="ck-content prose prose-lg max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                  />
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-4">
              {highlightSections.map((section) => (
                <Card key={section.title} className="p-5 shadow-card animate-fade-in shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <section.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
