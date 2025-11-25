const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Sở Giáo dục và Đào tạo Tỉnh</h3>
            <div className="space-y-2 text-sm text-primary-foreground/90">
              <p>Địa chỉ: [Địa chỉ chi tiết]</p>
              <p>Điện thoại: [Số điện thoại]</p>
              <p>Email: [Email liên hệ]</p>
              <p>Website: [Tên miền website]</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/90">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Tin tức - Sự kiện</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Văn bản - Công văn</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Liên hệ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Thống kê truy cập</h3>
            <div className="space-y-2 text-sm text-primary-foreground/90">
              <p>Đang online: <span className="font-semibold">123</span></p>
              <p>Hôm nay: <span className="font-semibold">1,234</span></p>
              <p>Tổng lượt truy cập: <span className="font-semibold">1,234,567</span></p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/80">
          <p>&copy; 2024 Sở Giáo dục và Đào tạo Tỉnh. Bản quyền thuộc về đơn vị.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
