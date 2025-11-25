import { useState, useEffect } from "react";
import { useBanners } from "@/hooks/useApi";
import { getMediaUrl } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const { data: banners } = useBanners();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeBanners = banners && banners.length > 0 ? banners : null;

  useEffect(() => {
    if (!activeBanners || activeBanners.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners]);

  const nextSlide = () => {
    if (!activeBanners) return;
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  };

  const prevSlide = () => {
    if (!activeBanners) return;
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  // If we have banners, show the slider
  if (activeBanners && activeBanners.length > 0) {
    return (
      <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden bg-primary">
        {activeBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {banner.link_url ? (
              <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={getMediaUrl(banner.image)}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover"
                />
              </a>
            ) : (
              <img
                src={getMediaUrl(banner.image)}
                alt={banner.title || "Banner"}
                className="w-full h-full object-cover"
              />
            )}
            {banner.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h2 className="text-white text-xl md:text-2xl font-bold text-center">
                  {banner.title}
                </h2>
              </div>
            )}
          </div>
        ))}

        {activeBanners.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
              onClick={nextSlide}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {activeBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default hero if no banners
  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-primary-foreground">
            <div className="mb-2">
              <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                </svg>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              TRƯỜNG THPT LƯƠNG THÚC KỲ
            </h1>
            <p className="text-xl text-primary-foreground/90 font-medium">
              Cổng thông tin điện tử
            </p>
          </div>
          <div className="flex-1 hidden md:block">
            <div className="relative h-48 bg-primary-foreground/10 rounded-lg backdrop-blur-sm border border-primary-foreground/20 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-primary-foreground/60">
                <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
