import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import NewsCard from "./NewsCard";
import { useFeaturedPosts, usePostsByCategory } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/api";
import { ArrowRight } from "lucide-react";

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-3 py-2">
        <Skeleton className="w-20 h-16 rounded shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    ))}
  </div>
);

interface SectionProps {
  title: string;
  categoryHref: string;
  loading: boolean;
  posts: { id: number; slug: string; title: string; published_at: string; summary?: string; thumbnail?: string | null }[];
  /** featured: tin đầu dùng card lớn, còn lại compact */
  featured?: boolean;
}

const ContentSection = ({ title, categoryHref, loading, posts, featured = false }: SectionProps) => {
  const featuredPost = featured && posts.length > 0 ? posts[0] : null;
  const restPosts = featured && posts.length > 0 ? posts.slice(1) : posts;

  return (
    <section>
      <Card className="bg-card overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold flex items-center justify-between">
          <span>{title}</span>
          <Link
            to={categoryHref}
            className="flex items-center gap-1 text-xs font-normal text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            Xem thêm <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="p-4">
          {loading ? (
            <LoadingSkeleton />
          ) : posts.length > 0 ? (
            <>
              {/* Tin nổi bật đầu tiên dùng card variant */}
              {featuredPost && (
                <div className="mb-4">
                  <NewsCard
                    id={featuredPost.slug}
                    title={featuredPost.title}
                    date={formatDate(featuredPost.published_at)}
                    excerpt={featuredPost.summary}
                    image={featuredPost.thumbnail}
                    hasImage={!!featuredPost.thumbnail}
                    variant="card"
                  />
                </div>
              )}
              {/* Các tin còn lại dùng compact */}
              <div className="space-y-0">
                {restPosts.map((post) => (
                  <NewsCard
                    key={post.id}
                    id={post.slug}
                    title={post.title}
                    date={formatDate(post.published_at)}
                    excerpt={post.summary}
                    image={post.thumbnail}
                    hasImage={!!post.thumbnail}
                    variant="compact"
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm italic">Chưa có bài viết nào</p>
          )}
        </div>
      </Card>
    </section>
  );
};

const MainContent = () => {
  const { data: featuredPosts, isLoading: loadingFeatured } = useFeaturedPosts();
  const { data: planPosts, isLoading: loadingPlanParent } = usePostsByCategory('ke-hoach-giao-duc');
  const { data: planExamPosts, isLoading: loadingPlanExam } = usePostsByCategory('thi-kiem-tra');
  const { data: examPosts, isLoading: loadingExam } = usePostsByCategory('thi-tuyen-sinh');
  const { data: activityPosts, isLoading: loadingActivity } = usePostsByCategory('hoat-dong-su-kien');

  const hasParentPlanPosts = (planPosts?.results?.length ?? 0) > 0;

  const planSectionPosts = useMemo(() => {
    if (hasParentPlanPosts) return planPosts?.results ?? [];
    return [...(planExamPosts?.results ?? [])].sort((a, b) => {
      const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
      const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [hasParentPlanPosts, planPosts?.results, planExamPosts?.results]);

  const loadingPlan = loadingPlanParent || (!hasParentPlanPosts && loadingPlanExam);

  return (
    <main className="space-y-6">
      <ContentSection
        title="Tin mới nhất"
        categoryHref="/chuyen-muc/tin-tuc-su-kien"
        loading={loadingFeatured}
        posts={(featuredPosts ?? []).slice(0, 3)}
        featured
      />
      <ContentSection
        title="Thi & Tuyển sinh"
        categoryHref="/chuyen-muc/thi-tuyen-sinh"
        loading={loadingExam}
        posts={(examPosts?.results ?? []).slice(0, 3)}
      />
      <ContentSection
        title="Kế hoạch giáo dục"
        categoryHref="/chuyen-muc/ke-hoach-giao-duc"
        loading={loadingPlan}
        posts={planSectionPosts.slice(0, 3)}
      />
      <ContentSection
        title="Hoạt động Đoàn thể"
        categoryHref="/chuyen-muc/hoat-dong-su-kien"
        loading={loadingActivity}
        posts={(activityPosts?.results ?? []).slice(0, 3)}
      />
    </main>
  );
};

export default MainContent;
