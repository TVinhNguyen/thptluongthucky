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
    <Link to={`/bai-viet/${id}`}>
      <Card className="overflow-hidden hover:shadow-card-hover transition-all hover-scale group animate-fade-in">
        {showImage && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {excerpt}
            </p>
          )}
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {date}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default NewsCard;
