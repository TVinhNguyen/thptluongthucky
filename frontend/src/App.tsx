import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import RouteScrollTop from "./components/RouteScrollTop";

// Eager load: homepage (first paint)
import Index from "./pages/Index";

// Lazy load: all other routes (code splitting)
const PostDetail = lazy(() => import("./pages/PostDetail"));
const DocumentLibrary = lazy(() => import("./pages/DocumentLibrary"));
const SearchAll = lazy(() => import("./pages/SearchAll"));
const OrgChart = lazy(() => import("./pages/OrgChart"));
const Staff = lazy(() => import("./pages/Staff"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CategoryRoute = lazy(() => import("./pages/CategoryRoute"));
const AboutPage = lazy(() => import("./pages/About"));
const TimetablePage = lazy(() => import("./pages/TimetablePage"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true }}>
        <RouteScrollTop />
        <ScrollToTop />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tim-kiem" element={<SearchAll />} />
            <Route path="/bai-viet/:id" element={<PostDetail />} />
            <Route path="/chuyen-muc/thoi-khoa-bieu" element={<TimetablePage />} />
            <Route path="/chuyen-muc/:category" element={<CategoryRoute />} />
            <Route path="/chuyen-muc/:category/:slug" element={<CategoryRoute />} />
            <Route path="/thu-vien-van-ban" element={<DocumentLibrary />} />
            <Route
              path="/thu-vien-van-ban/:type"
              element={<DocumentLibrary />}
            />
            <Route path="/gioi-thieu" element={<AboutPage />} />
            <Route path="/co-cau-to-chuc" element={<OrgChart />} />
            <Route path="/can-bo-giao-vien" element={<Staff />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
