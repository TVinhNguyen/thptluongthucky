import { AlertCircle, Inbox, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: "inbox" | "search" | "file";
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const iconMap = {
  inbox: Inbox,
  search: FileQuestion,
  file: FileQuestion,
};

const EmptyState = ({
  title = "Không có dữ liệu",
  description = "Hiện chưa có nội dung nào.",
  icon = "inbox",
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) => {
  const Icon = iconMap[icon];

  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
