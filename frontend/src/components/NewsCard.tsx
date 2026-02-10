import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { getMediaUrl } from "@/lib/api";

interface NewsCardProps {
  id?: string;
  title: string;
  date: string;
  image?: string | null;
  excerpt?: string;
  hasImage?: boolean;
}

const NewsCard = ({ id = "1", title, date, image, excerpt, hasImage }: NewsCardProps) => {
  const showImage = hasImage || !!image;
  const imageUrl = image ? getMediaUrl(image) : '/placeholder.svg';
  
  return (
    <Link to={`/bai-viet/${id}`} className="block h-full">
      <Card className="h-full overflow-hidden hover:shadow-card-hover transition-all hover-scale group animate-fade-in shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col">
        {showImage && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          </div>
        )}
        <CardContent className="p-4 flex flex-col gap-2 flex-1">
          <h3 className="font-semibold text-foreground line-clamp-2 min-h-[3rem] leading-snug group-hover:text-primary transition-colors">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-snug">
              {excerpt}
            </p>
          )}
          <div className="flex items-center text-xs text-muted-foreground mt-auto">
            <Calendar className="h-3 w-3 mr-1" />
            {date}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default NewsCard;
