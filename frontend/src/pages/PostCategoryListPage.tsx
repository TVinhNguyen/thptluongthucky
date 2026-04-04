import { useParams, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import NewsCard from "@/components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usePostsByCategory, useCategories } from "@/hooks/useApi";
import { formatDate, type Category } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { POST_CATEGORY_TEXT } from "@/constants/appText";
import { SEO, collectionPageSchema, breadcrumbSchema } from "@/components/SEO";

const CategoryList = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');
  const searchKeywords = searchParams.get('search');
  
  const { data, isLoading, error } = usePostsByCategory(category || '', currentPage, searchKeywords);
  const { data: categoriesData } = useCategories();
  
  // Build categoryNames mapping from database (including children)
  const categoryNames: Record<string, string> = {};
  if (categoriesData) {
    const flattenCategories = (categories: Category[]) => {
      categories.forEach((cat) => {
        categoryNames[cat.slug] = cat.name;
        // Recursively add children categories
        if (cat.children && cat.children.length > 0) {
          flattenCategories(cat.children);
        }
      });
    };
    flattenCategories(categoriesData);
  }

  const categoryTitle = categoryNames[category || ""] || category?.replace(/-/g, " ") || "Danh sách";

  const handlePageChange = (page: number) => {
    const nextParams = new URLSearchParams();
    nextParams.set("page", page.toString());
    if (searchKeywords) {
      nextParams.set("search", searchKeywords);
    }
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = data ? Math.ceil(data.count / 10) : 0;
  const categoryBaseUrl = `/chuyen-muc/${category}`;
  const categoryQueryParams = new URLSearchParams();
  if (searchKeywords) {
    categoryQueryParams.set("search", searchKeywords);
  }
  if (currentPage > 1) {
    categoryQueryParams.set("page", String(currentPage));
  }
  const seoUrl = categoryQueryParams.toString()
    ? `${categoryBaseUrl}?${categoryQueryParams.toString()}`
    : categoryBaseUrl;

  const prevQueryParams = new URLSearchParams();
  if (searchKeywords) {
    prevQueryParams.set("search", searchKeywords);
  }
  if (currentPage > 2) {
    prevQueryParams.set("page", String(currentPage - 1));
  }
  const prevUrl = currentPage > 1
    ? (prevQueryParams.toString()
      ? `${categoryBaseUrl}?${prevQueryParams.toString()}`
      : categoryBaseUrl)
    : undefined;

  const nextQueryParams = new URLSearchParams();
  if (searchKeywords) {
    nextQueryParams.set("search", searchKeywords);
  }
  if (data?.next) {
    nextQueryParams.set("page", String(currentPage + 1));
  }
  const nextUrl = data?.next
    ? `${categoryBaseUrl}?${nextQueryParams.toString()}`
    : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={categoryTitle}
        description={`Danh sách bài viết thuộc chuyên mục ${categoryTitle} - Trường THPT Lương Thúc Kỳ`}
        url={seoUrl}
        canonical={seoUrl}
        prevUrl={prevUrl}
        nextUrl={nextUrl}
        jsonLd={[
          collectionPageSchema(
            categoryTitle,
            `Bài viết thuộc chuyên mục ${categoryTitle}`,
            `/chuyen-muc/${category}`
          ),
          breadcrumbSchema([{ label: categoryTitle, href: `/chuyen-muc/${category}` }]),
        ]}
      />
      <Header />
      <Navigation />
      
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: POST_CATEGORY_TEXT.breadcrumbRoot, href: "/" },
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
              <p className="text-muted-foreground">{POST_CATEGORY_TEXT.loadError}</p>
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
                    {POST_CATEGORY_TEXT.prevPage}
                  </Button>
                  
                  <span className="px-4 text-sm text-muted-foreground">
                    {POST_CATEGORY_TEXT.pageLabel} {currentPage} / {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!data.next}
                  >
                    {POST_CATEGORY_TEXT.nextPage}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{POST_CATEGORY_TEXT.empty}</p>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CategoryList;
