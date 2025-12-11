import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavLinkProps {
  label: string;
  href?: string;
  dropdownItems?: { label: string; href: string }[];
}

export const NavLink = ({ label, href, dropdownItems }: NavLinkProps) => {
  if (dropdownItems && dropdownItems.length > 0) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-primary-foreground hover:bg-accent hover:text-accent-foreground whitespace-nowrap px-4 py-6 rounded-none border-b-2 border-transparent hover:border-primary-foreground/50 transition-all"
          >
            {label}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card z-50 min-w-[200px]">
          {dropdownItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                to={item.href}
                className="w-full cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      asChild
      variant="ghost"
      className="text-primary-foreground hover:bg-accent hover:text-accent-foreground whitespace-nowrap px-4 py-6 rounded-none border-b-2 border-transparent hover:border-primary-foreground/50 transition-all"
    >
      <Link to={href || "#"}>{label}</Link>
    </Button>
  );
};
