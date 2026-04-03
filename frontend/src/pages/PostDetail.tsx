import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Eye, Clock, ArrowRight } from "lucide-react";
import { usePost, usePostsByCategory } from "@/hooks/useApi";
import { formatDate, getMediaUrl } from "@/lib/api";
import { prependMediaBaseUrl } from "@/lib/util";
import { SEO, articleSchema } from "@/components/SEO";

const PostDetail = () => {
  const { id } = useParams();
  const { data: post, isLoading, error } = usePost(id || '');
  
  // Fetch related posts from the same category (only when post is loaded)
  const categorySlug = post?.category_slug || '';
  const { data: relatedPostsData } = usePostsByCategory(categorySlug, 1);
  
  // Filter out current post and limit to 5 related posts
  const relatedPosts = useMemo(() => {
    if (!relatedPostsData?.results || !post) return [];
    return relatedPostsData.results
      .filter(p => p.id !== post.id)
      .slice(0, 5);
  }, [relatedPostsData, post]);

  // Process content to add backend URL to image sources
  const processedContent = useMemo(() => {
    return prependMediaBaseUrl(post?.content);
  }, [post?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Navigation />
        <div className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content skeleton */}
              <div className="lg:col-span-2">
                <Skeleton className="h-8 w-64 mb-6" />
                <Card className="overflow-hidden shadow-card p-6 md:p-8">
                  <Skeleton className="h-10 w-3/4 mb-4" />
                  <div className="flex gap-4 mb-6">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-64 w-full mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </Card>
              </div>
              
              {/* Sidebar skeleton */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-4">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Navigation />
        <div className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Không tìm thấy bài viết
              </h1>
              <p className="text-muted-foreground">
                Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={post.title}
        description={post.summary || `${post.title} - ${post.category_name || "Tin tức"}`}
        image={post.thumbnail ? getMediaUrl(post.thumbnail) : undefined}
        url={`/bai-viet/${post.slug}`}
        ogImageAlt={post.title}
        type="article"
        publishedTime={post.published_at}
        modifiedTime={post.updated_at}
        author="Trường THPT Lương Thúc Kỳ"
        keywords={[
          post.category_name || "tin tức",
          ...post.title
            .split(" ")
            .map((part) => part.trim())
            .filter((part) => part.length > 2)
            .slice(0, 4),
        ]}
        jsonLd={articleSchema(post)}
      />
      <Header />
      <Navigation />

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: post.category_name || "Tin tức", href: `/chuyen-muc/${categorySlug}` },
              { label: post.title },
            ]}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
                {post.thumbnail && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img 
                      src={getMediaUrl(post.thumbnail)} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6 md:p-8">
                  {/* Category Badge */}
                  {post.category_name && (
                    <Link to={`/chuyen-muc/${categorySlug}`}>
                      <Badge className="mb-3 hover:bg-primary/90 transition-colors">
                        {post.category_name}
                      </Badge>
                    </Link>
                  )}
                  
                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                    {post.title}
                  </h1>
                  
                  {/* Meta Information */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.published_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{post.views.toLocaleString()} lượt xem</span>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  {/* Summary */}
                  {post.summary && (
                    <div className="mb-6 p-4 bg-accent/50 border-l-4 border-primary rounded-r-lg">
                      <p className="text-base text-foreground leading-relaxed italic">
                        {post.summary}
                      </p>
                    </div>
                  )}

                  {/* Content */}
                  <div 
                    className="ck-content prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                  />
                </div>
              </Card>
            </div>
            
            {/* Sidebar - Related Posts */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4 shadow-card animate-fade-in">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  <h2 className="text-xl font-bold text-foreground">
                    Bài viết liên quan
                  </h2>
                </div>
                
                {relatedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost, index) => (
                      <Link 
                        key={relatedPost.id}
                        to={`/bai-viet/${relatedPost.slug}`}
                        className="group block"
                      >
                        <div className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                          {/* Thumbnail */}
                          {relatedPost.thumbnail && (
                            <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted">
                              <img 
                                src={getMediaUrl(relatedPost.thumbnail)}
                                alt={relatedPost.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                              {relatedPost.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(relatedPost.published_at)}</span>
                            </div>
                          </div>
                        </div>
                        
                        {index < relatedPosts.length - 1 && (
                          <Separator className="my-3" />
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Không có bài viết liên quan</p>
                  </div>
                )}
                
                {/* View All Link */}
                {relatedPosts.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <Link 
                      to={`/chuyen-muc/${categorySlug}`}
                      className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PostDetail;
