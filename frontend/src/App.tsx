import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PostDetail from "./pages/PostDetail";
import CategoryList from "./pages/CategoryList";
import DocumentLibrary from "./pages/DocumentLibrary";
import OrgChart from "./pages/OrgChart";
import Staff from "./pages/Staff";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/bai-viet/:id" element={<PostDetail />} />
          <Route path="/chuyen-muc/:category" element={<CategoryList />} />
          <Route path="/thu-vien-van-ban" element={<DocumentLibrary />} />
          <Route path="/co-cau-to-chuc" element={<OrgChart />} />
          <Route path="/can-bo-giao-vien" element={<Staff />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
