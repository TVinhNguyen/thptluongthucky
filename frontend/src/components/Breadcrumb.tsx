import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Home } from "lucide-react";
import { breadcrumbSchema } from "@/components/SEO";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema(items))}
        </script>
      </Helmet>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 animate-fade-in"
      >
        <Link
          to="/"
          className="flex items-center hover:text-primary transition-colors hover-scale"
        >
          <Home className="h-4 w-4" />
        </Link>

        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4" />
            {item.href && index < items.length - 1 ? (
              <Link
                to={item.href}
                className="hover:text-primary transition-colors hover-scale"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
};

export default Breadcrumb;
