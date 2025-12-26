import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useVideos } from "@/hooks/useApi";
import { formatDate } from "@/lib/api";

const VideoListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");

  const { data, isLoading, error } = useVideos(currentPage);
  const totalPages = data ? Math.ceil(data.count / 10) : 0;

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navigation />

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Chuyên mục", href: "/" }, { label: "Video" }]} />

          <h1 className="text-3xl font-bold text-foreground mb-6 animate-fade-in">
            Video
          </h1>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không thể tải thư viện video</p>
            </div>
          ) : data?.results?.length ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.results.map((v: any) => {
                  const videoLink = v.video_url || v.video_file?.url || v.video_file;
                  const thumb = v.thumbnail?.url || v.thumbnail;

                  return (
                    <div key={v.id} className="rounded-xl border bg-card overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={v.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No thumbnail
                          </div>
                        )}

                        {videoLink && (
                          <a
                            href={videoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 flex items-center justify-center"
                            title="Mở video"
                          >
                            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-background/80 border">
                              <Play className="w-4 h-4" />
                              Xem video
                            </span>
                          </a>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="font-semibold text-foreground line-clamp-2">
                          {v.title}
                        </div>
                        {v.description && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {v.description}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          {v.created_at ? formatDate(v.created_at) : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

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
              <p className="text-muted-foreground">Chưa có video</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VideoListPage;
