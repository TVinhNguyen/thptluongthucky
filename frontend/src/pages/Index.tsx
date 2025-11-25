import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import LeftSidebar from "@/components/LeftSidebar";
import MainContent from "@/components/MainContent";
import RightSidebar from "@/components/RightSidebar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Navigation />
      
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-3">
              <LeftSidebar />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-6">
              <MainContent />
            </div>
            
            {/* Right Sidebar */}
            <div className="lg:col-span-3">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
