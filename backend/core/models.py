from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import User
from django_ckeditor_5.fields import CKEditor5Field
from .utils import slugify_vietnamese
from .validators import document_file_validator
from cloudinary.models import CloudinaryField

# Create your models here.

class Category(models.Model):
    """Danh mục đa cấp cho tin tức"""
    name = models.CharField(max_length=255, verbose_name="Tên danh mục")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="Slug", blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                               related_name='children', verbose_name="Danh mục cha")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Danh mục"
        verbose_name_plural = "Danh mục"
        ordering = ['sort_order', 'name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify_vietnamese(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class Post(models.Model):
    """Tin tức & Sự kiện"""
    STATUS_CHOICES = [
        ('DRAFT', 'Bản nháp'),
        ('PUBLISHED', 'Đã xuất bản'),
    ]
    
    title = models.CharField(max_length=500, verbose_name="Tiêu đề")
    slug = models.SlugField(max_length=500, unique=True, verbose_name="Slug", blank=True)
    summary = models.TextField(blank=True, verbose_name="Tóm tắt")
    content = CKEditor5Field('Nội dung', config_name='extends', blank=True)
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
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify_vietnamese(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class Page(models.Model):
    """Trang tĩnh: Giới thiệu, Lịch sử..."""
    title = models.CharField(max_length=500, verbose_name="Tiêu đề")
    slug = models.SlugField(max_length=500, unique=True, verbose_name="Slug", blank=True)
    content = CKEditor5Field('Nội dung', config_name='extends', blank=True)
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    is_published = models.BooleanField(default=True, verbose_name="Hiển thị")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Trang tĩnh"
        verbose_name_plural = "Trang tĩnh"
        ordering = ['sort_order', 'title']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify_vietnamese(self.title)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


class Document(models.Model):
    """Văn bản & Tài liệu"""
    
    DOC_TYPE_CHOICES = [
        ('CONG_VAN', 'Công văn'),
        ('QUYET_DINH', 'Quyết định'),
        ('TKB', 'Thời khóa biểu'),
        ('BIEU_MAU', 'Biểu mẫu'),
        ('OTHER', 'Khác'),
    ]

    DOC_SOURCE_CHOICES = [
        ('SO_GDDT', 'Sở GD&ĐT'),
        ('TRUONG', 'Trường'),
        ('HDND_UBND', 'HĐND-UBND xã'),
        ('THONG_BAO', 'Thông báo'),
    ]
    
    code = models.CharField(max_length=50, blank=True, verbose_name="Số hiệu văn bản")
    title = models.CharField(max_length=500, verbose_name="Tiêu đề")
    doc_type = models.CharField(max_length=50, choices=DOC_TYPE_CHOICES, default='OTHER', verbose_name="Loại văn bản")
    doc_source = models.CharField(max_length=50, choices=DOC_SOURCE_CHOICES, null=True, blank=True, verbose_name="Phát hành")
    file = CloudinaryField("File đính kèm", resource_type="raw", validators=[document_file_validator])
    file_size = models.IntegerField(default=0, editable=False, verbose_name="Kích thước (KB)")
    description = models.TextField(blank=True, verbose_name="Mô tả")
    published_date = models.DateField(null=True, blank=True, verbose_name="Ngày ban hành")
    signer = models.CharField(max_length=100, blank=True, verbose_name="Người ký")
    download_count = models.IntegerField(default=0, editable=False, verbose_name="Lượt tải")
    original_filename = models.CharField(max_length=255, blank=True, verbose_name="Tên file gốc")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Văn bản"
        verbose_name_plural = "Công văn - Văn bản"
        ordering = ['-published_date', '-created_at']
        indexes = [
            models.Index(fields=['-published_date']),
            models.Index(fields=['doc_type']),
        ]
    
    def __str__(self) -> str:
        return f"{self.code} - {self.title}" if self.code else self.title
    
    def save(self, *args, **kwargs) -> None:
        if self.file:
            try:
                self.file_size = max(1, (self.file.size or 0) // 1024)
                # Capture original filename from CloudinaryField
                if hasattr(self.file, 'name') and not self.original_filename:
                    self.original_filename = self.file.name.split('/')[-1]
            except Exception:
                pass
        super().save(*args, **kwargs)
    
    @property
    def file_url(self) -> str:
        return getattr(self.file, 'url', '') if self.file else ''
    
    @property
    def file_name(self) -> str:
        if self.original_filename:
            return self.original_filename
        if not self.file:
            return ''
        # Fallback to public_id if original_filename not set
        if hasattr(self.file, 'public_id'):
            return self.file.public_id.split('/')[-1] + '.docx'  # Default extension
        if hasattr(self.file, 'name'):
            return self.file.name.split('/')[-1]
        return ''


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


class StaffFilterTag(models.Model):
    """Cấu hình chức danh hiển thị linh động cho trang nhân sự/sidebar."""

    name = models.CharField(max_length=200, verbose_name="Tiêu đề")
    slug = models.SlugField(max_length=200, unique=True, blank=True, verbose_name="Slug")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    is_active = models.BooleanField(default=True, verbose_name="Hiển thị")

    class Meta:
        verbose_name = "Chức danh hiển thị"
        verbose_name_plural = "Quản lý chức danh"
        ordering = ["sort_order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify_vietnamese(self.name)
        super().save(*args, **kwargs)

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
    filter_tags = models.ManyToManyField(
        StaffFilterTag,
        blank=True,
        related_name="staff_members",
        verbose_name="Chức danh hiển thị",
    )
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    is_active = models.BooleanField(default=True, verbose_name="Đang làm việc")
    
    class Meta:
        verbose_name = "Nhân sự"
        verbose_name_plural = "Nhân sự"
        ordering = ['sort_order', 'full_name']
    
    def __str__(self):
        return self.full_name


# class PhotoAlbum(models.Model):
#     """Thư viện ảnh - Album"""
#     name = models.CharField(max_length=255, verbose_name="Tên album")
#     slug = models.SlugField(max_length=255, unique=True, verbose_name="Slug", blank=True)
#     description = models.TextField(blank=True, verbose_name="Mô tả")
#     cover_image = models.ImageField(upload_to='albums/', blank=True, null=True, verbose_name="Ảnh bìa")
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         verbose_name = "Album ảnh"
#         verbose_name_plural = "Album ảnh"
#         ordering = ['-created_at']
    
#     def save(self, *args, **kwargs):
#         if not self.slug:
#             self.slug = slugify_vietnamese(self.name)
#         super().save(*args, **kwargs)
    
#     def __str__(self):
#         return self.name

class PhotoAlbum(models.Model):
    """Thư viện ảnh - Album"""
    name = models.CharField(max_length=255, verbose_name="Tên album")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="Slug", blank=True)
    description = models.TextField(blank=True, verbose_name="Mô tả")
    cover_image = CloudinaryField(
        "Ảnh bìa",
        resource_type="image",
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Album ảnh"
        verbose_name_plural = "Album ảnh"
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify_vietnamese(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
        

# class Photo(models.Model):
#     """Ảnh chi tiết trong album"""
#     album = models.ForeignKey(PhotoAlbum, on_delete=models.CASCADE, related_name='photos', verbose_name="Album")
#     image = models.ImageField(upload_to='photos/', verbose_name="Ảnh")
#     caption = models.CharField(max_length=500, blank=True, verbose_name="Chú thích")
#     sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
#     uploaded_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         verbose_name = "Ảnh"
#         verbose_name_plural = "Ảnh"
#         ordering = ['sort_order', '-uploaded_at']
    
#     def __str__(self):
#         return f"{self.album.name} - {self.caption or 'Ảnh'}"

class Photo(models.Model):
    """Ảnh chi tiết trong album"""
    album = models.ForeignKey(PhotoAlbum, on_delete=models.CASCADE, related_name='photos', verbose_name="Album")
    image = CloudinaryField(
        "image",
        resource_type="image",
    )
    caption = models.CharField(max_length=500, blank=True, verbose_name="Chú thích")
    sort_order = models.IntegerField(default=0, verbose_name="Thứ tự")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Ảnh"
        verbose_name_plural = "Ảnh"
        ordering = ['sort_order', '-uploaded_at']
    
    def __str__(self):
        return f"{self.album.name} - {self.caption or 'Ảnh'}"


# class Video(models.Model):
#     """Thư viện Video"""
#     title = models.CharField(max_length=500, verbose_name="Tiêu đề")
#     video_url = models.URLField(max_length=500, verbose_name="Link video")
#     thumbnail = models.ImageField(upload_to='videos/', blank=True, null=True, verbose_name="Ảnh đại diện")
#     description = models.TextField(blank=True, verbose_name="Mô tả")
#     is_featured = models.BooleanField(default=False, verbose_name="Video nổi bật")
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         verbose_name = "Video"
#         verbose_name_plural = "Video"
#         ordering = ['-created_at']
    
#     def __str__(self):
#         return self.title
    
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


class SiteSetting(models.Model):
    """Global UI settings editable in Django admin."""

    sidebar_documents_title = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Sidebar documents title",
        help_text="Override the left sidebar 'Documents' section title (optional).",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site setting"
        verbose_name_plural = "Site settings"

    def __str__(self):
        return "Site settings"


class SidebarDocumentItem(models.Model):
    site_setting = models.ForeignKey(
        SiteSetting,
        on_delete=models.CASCADE,
        related_name="document_items",
        verbose_name="Site setting",
    )
    label = models.CharField(max_length=255, verbose_name="Label")
    document_source = models.CharField(
        max_length=50,
        choices=Document.DOC_SOURCE_CHOICES,
        null=True,
        blank=True,
        verbose_name="Document source",
    )
    sort_order = models.IntegerField(default=0, verbose_name="Sort order")
    is_active = models.BooleanField(default=True, verbose_name="Active")

    class Meta:
        verbose_name = "Sidebar document item"
        verbose_name_plural = "Sidebar document items"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.label

    @property
    def href(self):
        if not self.document_source:
            return "/thu-vien-van-ban"
        return f"/thu-vien-van-ban?source={self.document_source}"


class SidebarNewsItem(models.Model):
    site_setting = models.ForeignKey(
        SiteSetting,
        on_delete=models.CASCADE,
        related_name="news_items",
        verbose_name="Site setting",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sidebar_news_items",
        verbose_name="Category",
    )
    sort_order = models.IntegerField(default=0, verbose_name="Sort order")
    is_active = models.BooleanField(default=True, verbose_name="Active")

    class Meta:
        verbose_name = "Sidebar news item"
        verbose_name_plural = "Sidebar news items"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.label

    @property
    def label(self):
        return self.category.name if self.category else "Unknown category"

    @property
    def href(self):
        if not self.category:
            return "/"
        return f"/chuyen-muc/{self.category.slug}"


class SidebarIntroItem(models.Model):
    LINK_TYPE_STAFF_ALL = "STAFF_ALL"
    LINK_TYPE_STAFF_FILTER = "STAFF_FILTER"
    LINK_TYPE_CUSTOM = "CUSTOM"
    LINK_TYPE_CHOICES = [
        (LINK_TYPE_STAFF_ALL, "Danh sach nhan su"),
        (LINK_TYPE_STAFF_FILTER, "Nhan su theo chuc danh"),
        (LINK_TYPE_CUSTOM, "Duong dan tuy chinh"),
    ]

    site_setting = models.ForeignKey(
        SiteSetting,
        on_delete=models.CASCADE,
        related_name="intro_items",
        verbose_name="Site setting",
    )
    label = models.CharField(max_length=255, verbose_name="Label")
    link_type = models.CharField(
        max_length=20,
        choices=LINK_TYPE_CHOICES,
        default=LINK_TYPE_STAFF_FILTER,
        verbose_name="Link type",
    )
    staff_filter_tag = models.ForeignKey(
        StaffFilterTag,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sidebar_intro_items",
        verbose_name="Staff filter tag",
    )
    custom_path = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Custom path",
        help_text="Internal path, vd: /co-cau-to-chuc",
    )
    anchor = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="Anchor",
        help_text="Optional, vd: #chi-bo-dang",
    )
    sort_order = models.IntegerField(default=0, verbose_name="Sort order")
    is_active = models.BooleanField(default=True, verbose_name="Active")

    class Meta:
        verbose_name = "Sidebar intro item"
        verbose_name_plural = "Sidebar intro items"
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.label

    def clean(self):
        if self.link_type == self.LINK_TYPE_STAFF_FILTER and not self.staff_filter_tag:
            raise ValidationError({"staff_filter_tag": "Chon chuc danh khi dung kieu Nhan su theo chuc danh."})
        if self.link_type == self.LINK_TYPE_CUSTOM and not self.custom_path:
            raise ValidationError({"custom_path": "Nhap duong dan khi dung kieu Duong dan tuy chinh."})

    @property
    def href(self):
        if self.link_type == self.LINK_TYPE_STAFF_ALL:
            return "/can-bo-giao-vien"
        if self.link_type == self.LINK_TYPE_STAFF_FILTER and self.staff_filter_tag:
            return f"/can-bo-giao-vien?filter={self.staff_filter_tag.slug}"
        if self.link_type == self.LINK_TYPE_CUSTOM and self.custom_path:
            return f"{self.custom_path}{self.anchor or ''}"
        return "/"


# ============= TIMETABLE MODELS =============

class SchoolYear(models.Model):
    """Năm học & Học kỳ"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Tên (VD: HK1 2025-2026)")
    start_date = models.DateField(verbose_name="Ngày bắt đầu")
    end_date = models.DateField(null=True, blank=True, verbose_name="Ngày kết thúc")
    is_active = models.BooleanField(default=True, verbose_name="Đang áp dụng")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Năm học"
        verbose_name_plural = "Năm học"
        ordering = ['-start_date']
    
    def save(self, *args, **kwargs):
        # Nếu is_active=True, set các năm khác thành False
        if self.is_active:
            SchoolYear.objects.exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name


class SchoolClass(models.Model):
    """Lớp học (12A1, 10A2...)"""
    name = models.CharField(max_length=50, unique=True, verbose_name="Tên lớp")
    grade = models.IntegerField(
        choices=[(10, 'Khối 10'), (11, 'Khối 11'), (12, 'Khối 12')],
        verbose_name="Khối"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Lớp học"
        verbose_name_plural = "Lớp học"
        ordering = ['grade', 'name']
    
    def __str__(self):
        return self.name


class TimetableEntry(models.Model):
    """Chi tiết thời khóa biểu từng tiết"""
    DAY_CHOICES = [
        (2, 'Thứ 2'),
        (3, 'Thứ 3'),
        (4, 'Thứ 4'),
        (5, 'Thứ 5'),
        (6, 'Thứ 6'),
        (7, 'Thứ 7'),
        (8, 'Chủ nhật'),
    ]
    
    school_year = models.ForeignKey(
        SchoolYear,
        on_delete=models.CASCADE,
        related_name='timetable_entries',
        verbose_name="Học kỳ/Năm học"
    )
    school_class = models.ForeignKey(
        SchoolClass,
        on_delete=models.CASCADE,
        related_name='timetable_entries',
        verbose_name="Lớp"
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES, verbose_name="Thứ")
    period = models.IntegerField(verbose_name="Tiết (1-10)")
    subject_name = models.CharField(max_length=100, verbose_name="Môn học")
    teacher_name = models.CharField(max_length=100, blank=True, verbose_name="Giáo viên")
    room = models.CharField(max_length=50, blank=True, verbose_name="Phòng học")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Chi tiết TKB"
        verbose_name_plural = "Chi tiết TKB"
        ordering = ['school_year', 'school_class', 'day_of_week', 'period']
        unique_together = [('school_year', 'school_class', 'day_of_week', 'period')]
    
    def __str__(self):
        return f"{self.school_class} - T{self.day_of_week} - Tiết {self.period}"
