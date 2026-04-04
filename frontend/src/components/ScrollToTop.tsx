import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <Button
            onClick={scrollToTop}
            size="icon"
            aria-label="Lên đầu trang"
            className={`fixed bottom-6 right-6 z-50 rounded-full w-11 h-11 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
        >
            <ChevronUp className="h-5 w-5" />
        </Button>
    );
};

export default ScrollToTop;
