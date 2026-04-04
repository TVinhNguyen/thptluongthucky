import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usePhotoAlbum } from "@/hooks/useApi";
import { formatDate, type Photo } from "@/lib/api";
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { SEO, imageGallerySchema, breadcrumbSchema } from "@/components/SEO";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const PhotoAlbumDetailPage = () => {
  const { slug } = useParams();
  const { data, isLoading, error } = usePhotoAlbum(slug);

  // ✅ viewer state
  const photos = useMemo(() => data?.photos || [], [data]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scale, setScale] = useState(1);

  const openViewer = (index: number) => {
    setActiveIndex(index);
    setScale(1);
    setIsViewerOpen(true);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setScale(1);
  };

  const prevPhoto = () => {
    if (!photos.length) return;
    setActiveIndex((i) => (i - 1 + photos.length) % photos.length);
    setScale(1);
  };

  const nextPhoto = () => {
    if (!photos.length) return;
    setActiveIndex((i) => (i + 1) % photos.length);
    setScale(1);
  };

  const zoomIn = () => setScale((s) => clamp(Number((s + 0.25).toFixed(2)), 1, 4));
  const zoomOut = () => setScale((s) => clamp(Number((s - 0.25).toFixed(2)), 1, 4));
  const resetZoom = () => setScale(1);

  // ✅ keyboard shortcuts when viewer open
  useEffect(() => {
    if (!isViewerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-" || e.key === "_") zoomOut();
    };

    window.addEventListener("keydown", onKeyDown);
    // lock scroll background
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewerOpen, photos.length]);

  const activePhoto = photos[activeIndex];

  return (
    <div className="min-h-screen flex flex-col">
      {data && (
        <SEO
          title={`${data.name} - Thư viện ảnh`}
          description={data.description || `Album ảnh ${data.name} - Trường THPT Lương Thúc Kỳ`}
          image={data.cover_image_url || undefined}
          url={`/chuyen-muc/anh/${slug}`}
          canonical={`/chuyen-muc/anh/${slug}`}
          ogImageAlt={data.name}
          keywords={["ảnh", data.name, "album ảnh"]}
          jsonLd={[
            imageGallerySchema(data),
            breadcrumbSchema([
              { label: "Thư viện ảnh", href: "/chuyen-muc/anh" },
              { label: data.name },
            ]),
          ]}
        />
      )}
      <Header />
      <Navigation />

      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: "Chuyên mục", href: "/" },
              { label: "Ảnh", href: "/chuyen-muc/anh" },
              { label: data?.name || "Chi tiết album" },
            ]}
          />

          {isLoading ? (
            <div className="space-y-6 mt-6">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="aspect-square w-full" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không thể tải album</p>
            </div>
          ) : data ? (
            <>
              <h1 className="text-3xl font-bold text-foreground mt-4">{data.name}</h1>

              {data.description && (
                <div className="text-muted-foreground mt-2">{data.description}</div>
              )}

              <div className="text-xs text-muted-foreground mt-2">
                {data.created_at ? formatDate(data.created_at) : ""}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                {(photos || []).map((photo: Photo, idx: number) => (
                  <div
                    key={photo.id}
                    className="rounded-xl border bg-card overflow-hidden"
                  >
                    <div className="aspect-square bg-muted">
                      <img
                        src={photo.image_url}
                        alt={photo.caption || photo.title || "photo"}
                        className="w-full h-full object-cover cursor-zoom-in"
                        loading="lazy"
                        onClick={() => openViewer(idx)}
                      />
                    </div>

                    {(photo.caption || photo.title) && (
                      <div className="p-3 text-sm text-foreground line-clamp-2">
                        {photo.caption || photo.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {(!photos || photos.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Album chưa có ảnh</p>
                </div>
              )}

              {/* ✅ Lightbox / Viewer */}
              {isViewerOpen && activePhoto && (
                <div
                  className="fixed inset-0 z-50 bg-black/80"
                  onClick={closeViewer}
                >
                  {/* top bar */}
                  <div
                    className="absolute top-4 right-4 flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="secondary" size="icon" onClick={zoomOut} disabled={scale <= 1}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="icon" onClick={zoomIn} disabled={scale >= 4}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="icon" onClick={resetZoom} disabled={scale === 1}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="icon" onClick={closeViewer}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* prev/next */}
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevPhoto();
                    }}
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextPhoto();
                    }}
                    aria-label="Next"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* image area */}
                  <div
                    className="w-full h-full flex items-center justify-center px-4"
                    onClick={(e) => e.stopPropagation()}
                    onWheel={(e) => {
                      e.preventDefault();
                      const delta = e.deltaY;
                      setScale((s) =>
                        clamp(Number((s + (delta > 0 ? -0.15 : 0.15)).toFixed(2)), 1, 4)
                      );
                    }}
                  >
                    <div className="max-w-[95vw] max-h-[85vh] overflow-auto">
                      <img
                        src={activePhoto.image_url}
                        alt={activePhoto.caption || "photo"}
                        className="select-none"
                        style={{
                          transform: `scale(${scale})`,
                          transformOrigin: "center",
                          transition: "transform 120ms ease",
                          maxWidth: "95vw",
                          maxHeight: "85vh",
                        }}
                        draggable={false}
                      />
                      <div className="mt-3 text-center text-white/80 text-sm">
                        {activePhoto.caption || ""}
                        <span className="ml-2 text-white/60">
                          ({activeIndex + 1}/{photos.length}) — Zoom: {Math.round(scale * 100)}%
                        </span>
                      </div>
                      <div className="mt-1 text-center text-white/50 text-xs">
                        ESC để đóng • ←/→ để chuyển • Cuộn chuột để zoom
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Không tìm thấy album</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PhotoAlbumDetailPage;
