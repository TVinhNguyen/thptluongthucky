import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, Eye } from "lucide-react";
import { usePost } from "@/hooks/useApi";
import { formatDate, getMediaUrl } from "@/lib/api";

const PostDetail = () => {
  const { id } = useParams();
  const { data: post, isLoading, error } = usePost(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <Navigation />
        <div className="flex-1 bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-8 w-64 mb-6" />
              <Card className="overflow-hidden shadow-card p-6 md:p-8">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <div className="flex gap-4 mb-6">
                  <Skeleton className="h-5 w-32" />
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
      <Header />
      <Navigation />
      
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Breadcrumb
              items={[
                { label: post.category_name || "Tin tức", href: `/chuyen-muc/${post.category_name?.toLowerCase().replace(/ /g, '-') || 'tin-moi-nhat'}` },
                { label: post.title },
              ]}
            />
            
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
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {post.title}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  {post.category_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.category_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{post.views.toLocaleString()} lượt xem</span>
                  </div>
                </div>

                {post.summary && (
                  <p className="text-lg text-muted-foreground mb-6 italic border-l-4 border-primary pl-4">
                    {post.summary}
                  </p>
                )}

                <div 
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content || '' }}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PostDetail;
