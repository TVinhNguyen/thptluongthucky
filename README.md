# THPT Lương Thước - School Management System

Hệ thống quản lý trường học được xây dựng với Django và PostgreSQL, chạy trong Docker.

## Yêu cầu

- Docker và Docker Compose
- Git

## Hướng dẫn cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd thptluongthucky
```

### 2. Khởi động các container Docker

Tải code từ git và khởi động ứng dụng:

```bash
# Xây dựng image Docker
docker compose build

# Khởi động các container (database và web server)
docker compose up -d
```

### 3. Tạo database

PostgreSQL sẽ tự động khởi động, nhưng chúng ta cần tạo database:

```bash
docker compose exec -T db createdb -U postgres school_db
```

### 4. Chạy migrations

Tạo các bảng trong database:

```bash
docker compose exec -T web python manage.py makemigrations
docker compose exec -T web python manage.py migrate
```

### 5. Tạo tài khoản Admin

Tạo superuser để đăng nhập vào admin panel:

```bash
docker compose exec -T web python manage.py createsuperuser
```

Nhập thông tin:
- Username: `admin`
- Email: `admin@example.com`
- Password: Nhập mật khẩu của bạn
- Confirm password: Xác nhận mật khẩu

### 6. Truy cập ứng dụng

- **Django App**: http://localhost:8000
- **API Endpoint**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin
  - Đăng nhập bằng superuser vừa tạo

**Xem tài liệu API đầy đủ**: [API_DOCS.md](./API_DOCS.md)

## Lệnh hữu ích

### Xem logs của web container

```bash
docker compose logs web
```

### Xem logs của database container

```bash
docker compose logs db
```

### Xem logs real-time

```bash
docker compose logs -f web
```

### Dừng container

```bash
docker compose down
```

### Dừng container và xóa database (reset hoàn toàn)

```bash
docker compose down -v
```

### Khởi động lại container

```bash
docker compose restart
```

### Chạy lệnh Django management trong container

```bash
docker compose exec -T web python manage.py <command>
```

Ví dụ:
```bash
# Tạo app mới
docker compose exec -T web python manage.py startapp myapp

# Kiểm tra lỗi
docker compose exec -T web python manage.py check

# Tạo migration
docker compose exec -T web python manage.py makemigrations
```

## Cấu trúc dự án

```
thptluongthucky/
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── core/
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── apps.py
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── .env
├── README.md
└── API_DOCS.md
```

## Biến môi trường (.env)

File `.env` chứa các cấu hình cần thiết:

```
DB_NAME=school_db
DB_USER=postgres
DB_PASSWORD=password123
DB_HOST=db
DB_PORT=5432
POSTGRES_PASSWORD=password123
SECRET_KEY=django-insecure-key-demo-123
DEBUG=True
ALLOWED_HOSTS=*
```

**Lưu ý**: Thay đổi `SECRET_KEY` và `POSTGRES_PASSWORD` trong môi trường production.

## Các gói được sử dụng

- **Django 5.2**: Framework web
- **PostgreSQL 15**: Database
- **djangorestframework**: API REST
- **django-cors-headers**: CORS support
- **django-unfold**: Modern admin interface
- **psycopg2-binary**: PostgreSQL driver
- **python-dotenv**: Environment variables management

## Troubleshooting

### Lỗi: "database "school_db" does not exist"

**Giải pháp**: Chạy lệnh tạo database:
```bash
docker compose exec -T db createdb -U postgres school_db
```

### Lỗi: "No module named 'unfold'"

**Giải pháp**: Rebuild Docker image:
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Lỗi khi connect đến database

**Giải pháp**: 
1. Đảm bảo database container đang chạy: `docker compose ps`
2. Xem logs database: `docker compose logs db`
3. Reset toàn bộ: `docker compose down -v && docker compose up -d`

## Liên hệ

Nếu có bất kỳ vấn đề nào, vui lòng liên hệ đội phát triển.
