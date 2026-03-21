// const Footer = () => {
//   return (
//     <footer className="bg-primary text-primary-foreground mt-12">
//       <div className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           <div>
//             <h3 className="font-bold text-lg mb-4">Sở Giáo dục và Đào tạo Tỉnh</h3>
//             <div className="space-y-2 text-sm text-primary-foreground/90">
//               <p>Địa chỉ: [Địa chỉ chi tiết]</p>
//               <p>Điện thoại: [Số điện thoại]</p>
//               <p>Email: [Email liên hệ]</p>
//               <p>Website: [Tên miền website]</p>
//             </div>
//           </div>
          
//           <div>
//             <h3 className="font-bold text-lg mb-4">Liên kết nhanh</h3>
//             <ul className="space-y-2 text-sm text-primary-foreground/90">
//               <li><a href="#" className="hover:text-primary-foreground transition-colors">Giới thiệu</a></li>
//               <li><a href="#" className="hover:text-primary-foreground transition-colors">Tin tức - Sự kiện</a></li>
//               <li><a href="#" className="hover:text-primary-foreground transition-colors">Văn bản - Công văn</a></li>
//               <li><a href="#" className="hover:text-primary-foreground transition-colors">Liên hệ</a></li>
//             </ul>
//           </div>
          
//           <div>
//             <h3 className="font-bold text-lg mb-4">Giờ làm việc</h3>
//             <div className="space-y-2 text-sm text-primary-foreground/90">
//               <p>Thứ 2 – Thứ 6: <span className="font-semibold">7:00 – 17:00</span></p>
//               <p>Thứ 7: <span className="font-semibold">7:30 – 11:30</span></p>
//               <p>Chủ nhật: <span className="font-semibold">Nghỉ</span></p>
//             </div>
//           </div>
//         </div>
        
//         <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/80">
//           <p>&copy; 2024 Sở Giáo dục và Đào tạo Tỉnh. Bản quyền thuộc về đơn vị.</p>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Thông tin đơn vị */}
          <div>
            <h3 className="font-bold text-lg mb-4">
              THPT Lương Thúc Kỳ
            </h3>
            <div className="space-y-2 text-sm text-primary-foreground/90">
              <p>Địa chỉ: Thôn Nghĩa Hiệp - Xã Đại Lộc - Thành phố Đà Nẵng, Da Nang</p>
              <p>Điện thoại: 0254 123 4567</p>
              <p>Email: nguyentandh@gmail.com</p>
              {/* <p>FanPage: https://www.facebook.com/doanluongthucky</p> */}
              <a
                href="https://www.facebook.com/doanluongthucky"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-blue-400 transition-colors"
              >
                Fanpage: Đoàn Trường THPT Lương Thúc Kỳ
            </a>
            </div>
          </div>

          {/* Giờ làm việc */}
          <div>
            <h3 className="font-bold text-lg mb-4">Giờ làm việc</h3>
            <div className="space-y-2 text-sm text-primary-foreground/90">
              <p>
                Thứ 2 – Thứ 6:{" "}
                <span className="font-semibold">7:00 – 17:00</span>
              </p>
              <p>
                Thứ 7:{" "}
                <span className="font-semibold">7:30 – 11:30</span>
              </p>
              <p>
                Chủ nhật: <span className="font-semibold">Nghỉ</span>
              </p>
            </div>
          </div>

          {/* Bản đồ */}
          <div>
            <h3 className="font-bold text-lg mb-4">Vị trí trên bản đồ</h3>
            <div className="w-full h-48 rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d965.3325191710595!2d108.121433729357!3d15.886681405854894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31420398ba1410ff%3A0x8832d181788e3cc8!2zVHLGsOG7nW5nIFRIUFQgTMawxqFuZyBUaMO6YyBL4buz!5e1!3m2!1svi!2s!4v1770822024155!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ trường"
              />
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/80">
          <p>
            &copy; 2024 Sở Giáo dục và Đào tạo Tỉnh. Bản quyền thuộc về đơn vị.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
