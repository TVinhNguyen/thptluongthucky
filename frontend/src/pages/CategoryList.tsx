import { useParams, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import NewsCard from "@/components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usePostsByCategory } from "@/hooks/useApi";
import { formatDate } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategoryList = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  const { data, isLoading, error } = usePostsByCategory(category || '', currentPage);
  
  const categoryNames: Record<string, string> = {
    "tin-moi-nhat": "Tin mới nhất",
    "su-kien": "Sự kiện",
    "hoat-dong-doan-the": "Hoạt động Đoàn thể",
    "ke-hoach-giao-duc": "Kế hoạch giáo dục",
    "thi-kiem-tra": "Thi - Kiểm tra",
    "thoi-khoa-bieu": "Thời khóa biểu",
    "van-ban": "Văn bản",
    "chuong-trinh-hoc": "Chương trình học",
    "tai-lieu": "Tài liệu",
    "video": "Video",
  };

  const categoryTitle = categoryNames[category || ""] || category?.replace(/-/g, " ") || "Danh sách";

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data ? Math.ceil(data.count / 10) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />
      
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: "Chuyên mục", href: "/" },
              { label: categoryTitle },
            ]}
          />
          
          <h1 className="text-3xl font-bold text-foreground mb-6 animate-fade-in">
            {categoryTitle}
          </h1>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không thể tải danh sách bài viết</p>
            </div>
          ) : data?.results && data.results.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.results.map((post) => (
                  <NewsCard
                    key={post.id}
                    id={post.slug}
                    title={post.title}
                    date={formatDate(post.published_at)}
                    excerpt={post.summary}
                    image={post.thumbnail}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Trước
                  </Button>
                  
                  <span className="px-4 text-sm text-muted-foreground">
                    Trang {currentPage} / {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!data.next}
                  >
                    Sau
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Chưa có bài viết nào trong chuyên mục này</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CategoryList;
