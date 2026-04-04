import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { getMediaUrl } from "@/lib/api";

interface NewsCardProps {
  id?: string;
  title: string;
  date: string;
  image?: string | null;
  excerpt?: string;
  hasImage?: boolean;
  /** compact: thumbnail nhỏ bên trái, text bên phải (dùng trong list) */
  variant?: "card" | "compact";
}

const NewsCard = ({ id = "1", title, date, image, excerpt, hasImage, variant = "card" }: NewsCardProps) => {
  const showImage = hasImage || !!image;
  const imageUrl = image ? getMediaUrl(image) : "/placeholder.svg";

  if (variant === "compact") {
    return (
      <Link to={`/bai-viet/${id}`} className="flex gap-3 group py-2 border-b border-border last:border-0 hover:bg-accent/40 px-2 -mx-2 rounded transition-colors">
        {showImage && (
          <div className="w-20 h-16 shrink-0 rounded overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center text-xs text-muted-foreground mt-1.5">
            <Calendar className="h-3 w-3 mr-1 shrink-0" />
            {date}
          </div>
        </div>
      </Link>
    );
  }

  // card variant (default) - dùng cho grid/featured
  return (
    <Link to={`/bai-viet/${id}`} className="block h-full">
      <div className="h-full overflow-hidden hover:shadow-md transition-shadow duration-200 group animate-fade-in flex flex-col rounded-lg border border-border bg-card">
        {showImage && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
              {excerpt}
            </p>
          )}
          <div className="flex items-center text-xs text-muted-foreground mt-auto">
            <Calendar className="h-3 w-3 mr-1" />
            {date}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
