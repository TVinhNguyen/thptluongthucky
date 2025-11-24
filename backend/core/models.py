from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

# Create your models here.

class Category(models.Model):
    """Danh mục đa cấp cho tin tức"""
    name = models.CharField(max_length=255, verbose_name="Tên danh mục")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="Slug")
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                               related_name='children', verbose_name="Danh mục cha")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Danh mục"
        verbose_name_plural = "Danh mục"
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name


class Post(models.Model):
    """Tin tức & Sự kiện"""
    STATUS_CHOICES = [
        ('DRAFT', 'Bản nháp'),
        ('PUBLISHED', 'Đã xuất bản'),
    ]
    
    title = models.CharField(max_length=500, verbose_name="Tiêu đề")
    slug = models.SlugField(max_length=500, unique=True, verbose_name="Slug")
    summary = models.TextField(blank=True, verbose_name="Tóm tắt")
    content = models.TextField(blank=True, verbose_name="Nội dung")
    thumbnail = models.ImageField(upload_to='posts/', blank=True, null=True, verbose_name="Ảnh đại diện")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, 
                                 related_name='posts', verbose_name="Danh mục")
    is_featured = models.BooleanField(default=False, verbose_name="Tin nổi bật")
    views = models.IntegerField(default=0, verbose_name="Lượt xem")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT', verbose_name="Trạng thái")
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="Ngày xuất bản")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Bài viết"
        verbose_name_plural = "Bài viết"
        ordering = ['-published_at', '-created_at']
    
    def __str__(self):
        return self.title


class Page(models.Model):
    """Trang tĩnh: Giới thiệu, Lịch sử..."""
    title = models.CharField(max_length=500, verbose_name="Tiêu đề")
    slug = models.SlugField(max_length=500, unique=True, verbose_name="Slug")
    content = models.TextField(blank=True, verbose_name="Nội dung")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    is_published = models.BooleanField(default=True, verbose_name="Hiển thị")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Trang tĩnh"
        verbose_name_plural = "Trang tĩnh"
        ordering = ['sort_order', 'title']
    
    def __str__(self):
        return self.title


class Document(models.Model):
    """Văn bản & Tài liệu"""
    DOC_TYPE_CHOICES = [
        ('CONG_VAN', 'Công văn'),
        ('QUYET_DINH', 'Quyết định'),
        ('TKB', 'Thời khóa biểu'),
        ('BIEU_MAU', 'Biểu mẫu'),
    ]
    
    code = models.CharField(max_length=50, blank=True, verbose_name="Số hiệu văn bản")
    title = models.CharField(max_length=500, verbose_name="Tiêu đề")
    doc_type = models.CharField(max_length=50, choices=DOC_TYPE_CHOICES, verbose_name="Loại văn bản")
    file = models.FileField(upload_to='documents/', verbose_name="File đính kèm")
    file_size = models.IntegerField(default=0, verbose_name="Kích thước (KB)")
    published_date = models.DateField(null=True, blank=True, verbose_name="Ngày ban hành")
    signer = models.CharField(max_length=100, blank=True, verbose_name="Người ký")
    download_count = models.IntegerField(default=0, verbose_name="Lượt tải")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Văn bản"
        verbose_name_plural = "Văn bản"
        ordering = ['-published_date', '-created_at']
    
    def __str__(self):
        return self.title


class Department(models.Model):
    """Tổ chuyên môn"""
    name = models.CharField(max_length=200, verbose_name="Tên tổ")
    leader_name = models.CharField(max_length=100, blank=True, verbose_name="Tổ trưởng")
    description = models.TextField(blank=True, verbose_name="Mô tả")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    
    class Meta:
        verbose_name = "Tổ chuyên môn"
        verbose_name_plural = "Tổ chuyên môn"
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return self.name


class Staff(models.Model):
    """Giáo viên & Nhân sự"""
    full_name = models.CharField(max_length=200, verbose_name="Họ tên")
    avatar = models.ImageField(upload_to='staff/', blank=True, null=True, verbose_name="Ảnh đại diện")
    position = models.CharField(max_length=100, blank=True, verbose_name="Chức vụ")
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='staff_members', verbose_name="Tổ chuyên môn")
    email = models.EmailField(blank=True, verbose_name="Email")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Điện thoại")
    bio = models.TextField(blank=True, verbose_name="Tiểu sử")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    is_active = models.BooleanField(default=True, verbose_name="Đang làm việc")
    
    class Meta:
        verbose_name = "Nhân sự"
        verbose_name_plural = "Nhân sự"
        ordering = ['sort_order', 'full_name']
    
    def __str__(self):
        return self.full_name


class PhotoAlbum(models.Model):
    """Thư viện ảnh - Album"""
    name = models.CharField(max_length=255, verbose_name="Tên album")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="Slug")
    description = models.TextField(blank=True, verbose_name="Mô tả")
    cover_image = models.ImageField(upload_to='albums/', blank=True, null=True, verbose_name="Ảnh bìa")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Album ảnh"
        verbose_name_plural = "Album ảnh"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class Photo(models.Model):
    """Ảnh chi tiết trong album"""
    album = models.ForeignKey(PhotoAlbum, on_delete=models.CASCADE, related_name='photos', verbose_name="Album")
    image = models.ImageField(upload_to='photos/', verbose_name="Ảnh")
    caption = models.CharField(max_length=500, blank=True, verbose_name="Chú thích")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Ảnh"
        verbose_name_plural = "Ảnh"
        ordering = ['sort_order', '-uploaded_at']
    
    def __str__(self):
        return f"{self.album.name} - {self.caption or 'Ảnh'}"


class Video(models.Model):
    """Thư viện Video"""
    title = models.CharField(max_length=500, verbose_name="Tiêu đề")
    video_url = models.URLField(max_length=500, verbose_name="Link video")
    thumbnail = models.ImageField(upload_to='videos/', blank=True, null=True, verbose_name="Ảnh đại diện")
    description = models.TextField(blank=True, verbose_name="Mô tả")
    is_featured = models.BooleanField(default=False, verbose_name="Video nổi bật")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Video"
        verbose_name_plural = "Video"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class Banner(models.Model):
    """Slide & Quảng cáo"""
    title = models.CharField(max_length=200, blank=True, verbose_name="Tiêu đề")
    image = models.ImageField(upload_to='banners/', verbose_name="Ảnh banner")
    link_url = models.URLField(max_length=500, blank=True, verbose_name="Link đến")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    is_active = models.BooleanField(default=True, verbose_name="Hiển thị")
    
    class Meta:
        verbose_name = "Banner"
        verbose_name_plural = "Banner"
        ordering = ['sort_order']
    
    def __str__(self):
        return self.title or f"Banner #{self.id}"


class ExternalLink(models.Model):
    """Liên kết web ngoài"""
    title = models.CharField(max_length=200, verbose_name="Tiêu đề")
    url = models.URLField(max_length=500, verbose_name="Đường dẫn")
    icon = models.ImageField(upload_to='icons/', blank=True, null=True, verbose_name="Icon")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    is_active = models.BooleanField(default=True, verbose_name="Hiển thị")
    
    class Meta:
        verbose_name = "Liên kết ngoài"
        verbose_name_plural = "Liên kết ngoài"
        ordering = ['sort_order', 'title']
    
    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    """Liên hệ/Góp ý từ người dùng"""
    STATUS_CHOICES = [
        ('NEW', 'Mới'),
        ('READ', 'Đã đọc'),
        ('REPLIED', 'Đã trả lời'),
    ]
    
    full_name = models.CharField(max_length=200, verbose_name="Họ tên")
    email = models.EmailField(blank=True, verbose_name="Email")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Điện thoại")
    subject = models.CharField(max_length=500, blank=True, verbose_name="Tiêu đề")
    message = models.TextField(verbose_name="Nội dung")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW', verbose_name="Trạng thái")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Liên hệ"
        verbose_name_plural = "Liên hệ"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.full_name} - {self.subject or 'Liên hệ'}"
