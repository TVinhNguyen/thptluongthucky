import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center animate-fade-in">
        <div className="mb-8 animate-scale-in">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <div className="h-1 w-32 bg-primary mx-auto rounded-full mb-8"></div>
        </div>
        
        <h2 className="text-3xl font-semibold text-foreground mb-4">
          Không tìm thấy trang
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="hover-scale"
          >
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Về Trang Chủ
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hover-scale"
            onClick={() => window.history.back()}
          >
            <span className="cursor-pointer">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Quay Lại
            </span>
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link to="/" className="group p-6 bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all hover-scale">
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              Trang chủ
            </h3>
            <p className="text-sm text-muted-foreground">
              Quay về trang chủ
            </p>
          </Link>
          
          <Link to="/thu-vien-van-ban" className="group p-6 bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all hover-scale">
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              Thư viện
            </h3>
            <p className="text-sm text-muted-foreground">
              Văn bản & tài liệu
            </p>
          </Link>
          
          <Link to="/can-bo-giao-vien" className="group p-6 bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all hover-scale">
            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              Cán bộ
            </h3>
            <p className="text-sm text-muted-foreground">
              Giáo viên & nhân sự
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
