import { Card } from "@/components/ui/card";
import NewsCard from "./NewsCard";
import { useFeaturedPosts, usePostsByCategory } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/api";

const MainContent = () => {
  const { data: featuredPosts, isLoading: loadingFeatured } = useFeaturedPosts();
  const { data: planPosts, isLoading: loadingPlan } = usePostsByCategory('ke-hoach-giao-duc');
  const { data: activityPosts, isLoading: loadingActivity } = usePostsByCategory('hoat-dong-doan-the');

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="w-20 h-16 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="space-y-6">
      {/* Tin mới nhất */}
      <section>
        <Card className="bg-card shadow-card overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
            Tin mới nhất
          </div>
          <div className="p-4 space-y-3">
            {loadingFeatured ? (
              <LoadingSkeleton />
            ) : featuredPosts && featuredPosts.length > 0 ? (
              featuredPosts.map((post) => (
                <NewsCard
                  key={post.id}
                  id={post.slug}
                  title={post.title}
                  date={formatDate(post.published_at)}
                  excerpt={post.summary}
                  image={post.thumbnail}
                  hasImage={!!post.thumbnail}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Chưa có tin nổi bật
              </p>
            )}
          </div>
        </Card>
      </section>

      {/* Thi và Tuyển sinh */}
      <section>
        <Card className="bg-card shadow-card overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
            Thi và Tuyển sinh
          </div>
          <div className="p-4">
            <p className="text-muted-foreground text-sm italic">Nội dung đang được cập nhật...</p>
          </div>
        </Card>
      </section>

      {/* Kế hoạch */}
      <section>
        <Card className="bg-card shadow-card overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
            Kế hoạch giáo dục
          </div>
          <div className="p-4 space-y-3">
            {loadingPlan ? (
              <LoadingSkeleton />
            ) : planPosts?.results && planPosts.results.length > 0 ? (
              planPosts.results.slice(0, 5).map((post) => (
                <NewsCard
                  key={post.id}
                  id={post.slug}
                  title={post.title}
                  date={formatDate(post.published_at)}
                  excerpt={post.summary}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Chưa có kế hoạch nào
              </p>
            )}
          </div>
        </Card>
      </section>

      {/* Hoạt động Đoàn thể */}
      <section>
        <Card className="bg-card shadow-card overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-3 font-semibold">
            Hoạt động Đoàn thể
          </div>
          <div className="p-4 space-y-3">
            {loadingActivity ? (
              <LoadingSkeleton />
            ) : activityPosts?.results && activityPosts.results.length > 0 ? (
              activityPosts.results.slice(0, 5).map((post) => (
                <NewsCard
                  key={post.id}
                  id={post.slug}
                  title={post.title}
                  date={formatDate(post.published_at)}
                  excerpt={post.summary}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Chưa có hoạt động nào
              </p>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
};

export default MainContent;
