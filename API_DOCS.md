# API Documentation - Cổng Thông Tin Trường Học

## Base URL
```
http://localhost:8000/api/
```

## Danh sách API Endpoints

### 1. DANH MỤC (Categories)

#### Lấy danh sách danh mục
```
GET /api/categories/
```
Trả về: Danh sách tất cả danh mục cha (parent=None) và danh mục con

#### Chi tiết danh mục
```
GET /api/categories/{slug}/
```
Trả về: Chi tiết một danh mục theo slug

---

### 2. BÀI VIẾT (Posts)

#### Lấy danh sách bài viết
```
GET /api/posts/
```
Query parameters:
- `category`: Lọc theo ID danh mục
- `is_featured`: Lọc bài nổi bật (true/false)
- `search`: Tìm kiếm theo tiêu đề, tóm tắt, nội dung
- `ordering`: Sắp xếp (-published_at, views)

#### Chi tiết bài viết
```
GET /api/posts/{slug}/
```
⚠️ Tự động tăng lượt xem khi truy cập

#### Bài viết nổi bật
```
GET /api/posts/featured/
```
Trả về: 5 bài viết nổi bật nhất

#### Bài viết theo danh mục
```
GET /api/posts/by_category/?slug={category_slug}
```
Trả về: Danh sách bài viết của danh mục

---

### 3. TRANG TĨNH (Pages)

#### Lấy danh sách trang
```
GET /api/pages/
```

#### Chi tiết trang
```
GET /api/pages/{slug}/
```

---

### 4. VĂN BẢN (Documents)

#### Lấy danh sách văn bản
```
GET /api/documents/
```
Query parameters:
- `doc_type`: Lọc theo loại (CONG_VAN, QUYET_DINH, TKB, BIEU_MAU)
- `search`: Tìm kiếm theo tiêu đề, số hiệu, người ký

#### Chi tiết văn bản
```
GET /api/documents/{id}/
```

#### Tăng lượt tải
```
POST /api/documents/{id}/download/
```
⚠️ Tự động tăng download_count

---

### 5. TỔ CHUYÊN MÔN (Departments)

#### Lấy danh sách tổ
```
GET /api/departments/
```

#### Chi tiết tổ
```
GET /api/departments/{id}/
```

#### Nhân sự của tổ
```
GET /api/departments/{id}/staff/
```
Trả về: Danh sách nhân sự đang active trong tổ

---

### 6. NHÂN SỰ (Staff)

#### Lấy danh sách nhân sự
```
GET /api/staff/
```
Query parameters:
- `department`: Lọc theo ID tổ
- `position`: Lọc theo chức vụ
- `search`: Tìm kiếm theo tên, email, SĐT

#### Chi tiết nhân sự
```
GET /api/staff/{id}/
```

---

### 7. ALBUM ẢNH (Photo Albums)

#### Lấy danh sách album
```
GET /api/photo-albums/
```
Trả về: Danh sách album (không bao gồm ảnh chi tiết)

#### Chi tiết album
```
GET /api/photo-albums/{slug}/
```
Trả về: Album với tất cả ảnh bên trong

---

### 8. VIDEO

#### Lấy danh sách video
```
GET /api/videos/
```
Query parameters:
- `search`: Tìm kiếm theo tiêu đề, mô tả

#### Chi tiết video
```
GET /api/videos/{id}/
```

#### Video nổi bật
```
GET /api/videos/featured/
```
Trả về: 5 video nổi bật nhất

---

### 9. BANNER

#### Lấy danh sách banner
```
GET /api/banners/
```
Trả về: Chỉ banner đang active

---

### 10. LIÊN KẾT NGOÀI (External Links)

#### Lấy danh sách liên kết
```
GET /api/external-links/
```
Trả về: Chỉ liên kết đang active

---

### 11. LIÊN HỆ (Contact Messages)

#### Gửi tin nhắn liên hệ
```
POST /api/contact/
```
Body (JSON):
```json
{
  "full_name": "Nguyễn Văn A",
  "email": "email@example.com",
  "phone": "0123456789",
  "subject": "Tiêu đề",
  "message": "Nội dung tin nhắn"
}
```

Response:
```json
{
  "message": "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.",
  "data": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    ...
  }
}
```

---

## Định dạng Response

### Danh sách (List)
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/posts/?page=2",
  "previous": null,
  "results": [...]
}
```

### Chi tiết (Detail)
```json
{
  "id": 1,
  "title": "...",
  ...
}
```

---

## Ví dụ sử dụng

### JavaScript (Fetch API)
```javascript
// Lấy danh sách bài viết
fetch('http://localhost:8000/api/posts/')
  .then(response => response.json())
  .then(data => console.log(data));

// Gửi liên hệ
fetch('http://localhost:8000/api/contact/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    full_name: 'Nguyễn Văn A',
    email: 'test@example.com',
    message: 'Xin chào'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Vue.js (Axios)
```javascript
// Lấy bài viết nổi bật
axios.get('http://localhost:8000/api/posts/featured/')
  .then(response => {
    this.featuredPosts = response.data;
  });

// Chi tiết bài viết
axios.get(`http://localhost:8000/api/posts/${slug}/`)
  .then(response => {
    this.post = response.data;
  });
```

---

## Test API

Bạn có thể test API bằng:
1. **Browser**: Truy cập trực tiếp URL (GET requests)
2. **Postman**: Import collection và test
3. **cURL**: Command line
4. **DRF Browsable API**: http://localhost:8000/api/

---

## Lưu ý

- Tất cả API đều cho phép truy cập công khai (AllowAny)
- Chỉ có Contact API cho phép POST, các API khác chỉ đọc (ReadOnly)
- Pagination mặc định: 10 items/page
- CORS đã được cấu hình cho localhost:3000, localhost:5173
