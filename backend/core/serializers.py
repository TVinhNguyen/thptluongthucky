from rest_framework import serializers
from .models import (
    Category, Post, PostAttachment, Page, Document, Department, Staff,
    PhotoAlbum, Photo, Video, Banner, ExternalLink, ContactMessage,
    SchoolYear, SchoolClass, TimetableEntry
)
from .validators import document_file_validator
from cloudinary.utils import cloudinary_url
from typing import Optional

class CategorySerializer(serializers.ModelSerializer):
    """Serializer cho danh mục"""
    children = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'sort_order', 'created_at', 'children']
    
    def get_children(self, obj):
        """Lấy danh mục con"""
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []


class PostListSerializer(serializers.ModelSerializer):
    """Serializer cho danh sách bài viết (tóm tắt)"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'summary', 'thumbnail', 'category', 
                  'category_name', 'category_slug', 'is_featured', 'views', 'status', 'published_at']


class PostAttachmentSerializer(serializers.ModelSerializer):
    """Read-only serializer for post attachments."""

    title = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    file_view_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    formatted_file_size = serializers.SerializerMethodField()

    class Meta:
        model = PostAttachment
        fields = [
            'id', 'title', 'file', 'file_url', 'file_view_url', 'file_name',
            'file_size', 'formatted_file_size', 'download_count', 'sort_order',
            'created_at',
        ]

    def _get_raw_url(self, obj):
        try:
            return obj.file.url if (obj.file and hasattr(obj.file, 'url')) else None
        except Exception:
            if obj.file:
                url, _ = cloudinary_url(str(obj.file), resource_type='raw')
                return url
            return None

    def get_title(self, obj):
        return obj.file_name

    def get_file_url(self, obj):
        return self._get_raw_url(obj)

    def get_file_view_url(self, obj):
        filename = obj.file_name or ''
        if filename.lower().endswith('.pdf'):
            return f'/api/posts/{obj.post.slug}/attachments/{obj.pk}/preview/'
        return self._get_raw_url(obj)

    def get_file_name(self, obj):
        return obj.file_name

    def get_formatted_file_size(self, obj):
        size = obj.file_size
        if size < 1024:
            return f"{size} KB"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} MB"
        return f"{size / (1024 * 1024):.1f} GB"


class PostDetailSerializer(serializers.ModelSerializer):
    """Serializer cho chi tiết bài viết"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    
    attachments = PostAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'summary', 'content', 'thumbnail', 
                  'category', 'category_name', 'category_slug', 'is_featured', 'views', 
                  'status', 'published_at', 'created_at', 'updated_at', 'attachments']


class PageSerializer(serializers.ModelSerializer):
    """Serializer cho trang tĩnh"""
    
    class Meta:
        model = Page
        fields = ['id', 'title', 'slug', 'content', 'sort_order', 
                  'is_published', 'created_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    """Document serializer - read only"""

    file_url = serializers.SerializerMethodField()
    file_view_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    formatted_file_size = serializers.SerializerMethodField()
    doc_type_display = serializers.CharField(source='get_doc_type_display', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'code', 'title', 'doc_type', 'doc_type_display',
            'file', 'file_url', 'file_view_url', 'file_name', 'file_size', 'formatted_file_size',
            'published_date', 'signer', 'description', 'download_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'file_size', 'download_count', 'created_at', 'updated_at']

    def _get_raw_url(self, obj):
        try:
            return obj.file.url if (obj.file and hasattr(obj.file, 'url')) else None
        except Exception:
            if obj.file:
                from cloudinary.utils import cloudinary_url
                url, _ = cloudinary_url(str(obj.file), resource_type='raw')
                return url
            return None

    def get_file_url(self, obj):
        return self._get_raw_url(obj)

    def get_file_view_url(self, obj):
        """URL for inline viewing — uses backend proxy to avoid Cloudinary Content-Disposition: attachment."""
        filename = obj.file_name or ''
        if filename.lower().endswith('.pdf'):
            return f'/api/documents/{obj.pk}/preview/'
        return self._get_raw_url(obj)
    
    def get_file_name(self, obj):
        return obj.file_name
    
    def get_formatted_file_size(self, obj):
        size = obj.file_size
        if size < 1024:
            return f"{size} KB"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} MB"
        return f"{size / (1024 * 1024):.1f} GB"


class DocumentCreateUpdateSerializer(serializers.ModelSerializer):
    """Document serializer - write/create/update"""
    
    file = serializers.FileField(required=True, validators=[document_file_validator])
    
    class Meta:
        model = Document
        fields = ['code', 'title', 'doc_type', 'file', 'published_date', 'signer', 'description']
    
    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Tiêu đề là bắt buộc.")
        return value.strip()
    
    def create(self, validated_data):
        # Capture original filename from the uploaded file
        file_obj = validated_data.get('file')
        if file_obj:
            validated_data['original_filename'] = file_obj.name
        return super().create(validated_data)


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer cho tổ chuyên môn"""
    staff_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'leader_name', 'description', 'sort_order', 'staff_count']
    
    def get_staff_count(self, obj):
        """Đếm số nhân sự trong tổ"""
        return obj.staff_members.filter(is_active=True).count()


class StaffSerializer(serializers.ModelSerializer):
    """Serializer cho nhân sự"""
    department_name = serializers.CharField(source='department.name', read_only=True)
    filter_tags = serializers.SerializerMethodField()
    
    class Meta:
        model = Staff
        fields = ['id', 'full_name', 'avatar', 'position', 'department', 
                  'department_name', 'email', 'phone', 'bio', 'filter_tags', 'sort_order', 'is_active']

    def get_filter_tags(self, obj):
        return [
            {
                "id": tag.id,
                "name": tag.name,
                "slug": tag.slug,
            }
            for tag in obj.filter_tags.filter(is_active=True).order_by('sort_order', 'name')
        ]


class PhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = ["id", "image", "image_url", "caption", "sort_order", "uploaded_at"]

    def get_image_url(self, obj):
        # CloudinaryField (đầy đủ https://res.cloudinary.com/...)
        try:
            if obj.image and getattr(obj.image, "url", None):
                return obj.image.url
        except Exception:
            pass

        public_id = str(obj.image) if obj.image else ""
        if not public_id:
            return None

        url, _ = cloudinary_url(public_id)
        return url


class PhotoAlbumListSerializer(serializers.ModelSerializer):
    """Serializer cho danh sách album (không bao gồm ảnh)"""
    photo_count = serializers.SerializerMethodField()
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = PhotoAlbum
        fields = ['id', 'name', 'slug', 'description', 'cover_image', "cover_image_url", 
                  'created_at', 'photo_count']
    
    def get_photo_count(self, obj):
        """Đếm số ảnh trong album"""
        return obj.photos.count()
    
    def get_cover_image_url(self, obj):
        return getattr(obj.cover_image, "url", None) if obj.cover_image else None


class PhotoAlbumDetailSerializer(serializers.ModelSerializer):
    photos = PhotoSerializer(many=True, read_only=True)
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = PhotoAlbum
        fields = [
            "id", "name", "slug", "description",
            "cover_image", "cover_image_url",
            "created_at", "photos"
        ]

    def get_cover_image_url(self, obj):
        return getattr(obj.cover_image, "url", None) if obj.cover_image else None

class VideoSerializer(serializers.ModelSerializer):
    """Serializer cho video"""
    
    class Meta:
        model = Video
        fields = ['id', 'title', 'video_url', 'thumbnail', 'description', 
                  'is_featured', 'created_at']


class BannerSerializer(serializers.ModelSerializer):
    """Serializer cho banner"""
    image_cropped_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Banner
        fields = ['id', 'title', 'image', 'image_cropped_url', 'link_url', 'sort_order', 'is_active']

    def get_image_cropped_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        relative_url = f"/api/banners/{obj.pk}/cropped-image/"
        return request.build_absolute_uri(relative_url) if request else relative_url


class ExternalLinkSerializer(serializers.ModelSerializer):
    """Serializer cho liên kết ngoài"""
    
    class Meta:
        model = ExternalLink
        fields = ['id', 'title', 'url', 'icon', 'sort_order', 'is_active']


class ContactMessageSerializer(serializers.ModelSerializer):
    """Serializer cho liên hệ"""
    
    class Meta:
        model = ContactMessage
        fields = ['id', 'full_name', 'email', 'phone', 'subject', 
                  'message', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']


# ============= TIMETABLE SERIALIZERS =============

class SchoolYearSerializer(serializers.ModelSerializer):
    """Serializer cho năm học"""
    entry_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SchoolYear
        fields = ['id', 'name', 'start_date', 'end_date', 'is_active', 
                  'created_at', 'updated_at', 'entry_count']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_entry_count(self, obj):
        """Đếm số tiết học trong năm học này"""
        return obj.timetable_entries.count()


class SchoolClassSerializer(serializers.ModelSerializer):
    """Serializer cho lớp học"""
    grade_display = serializers.CharField(source='get_grade_display', read_only=True)
    
    class Meta:
        model = SchoolClass
        fields = ['id', 'name', 'grade', 'grade_display', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class TimetableEntrySerializer(serializers.ModelSerializer):
    """Serializer cho chi tiết thời khóa biểu"""
    school_year_name = serializers.CharField(source='school_year.name', read_only=True)
    school_class_name = serializers.CharField(source='school_class.name', read_only=True)
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = TimetableEntry
        fields = [
            'id', 'school_year', 'school_year_name', 'school_class', 'school_class_name',
            'day_of_week', 'day_of_week_display', 'period', 'subject_name', 
            'teacher_name', 'room', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TimetableEntryListSerializer(serializers.ModelSerializer):
    """Serializer tóm tắt cho danh sách TKB"""
    school_class_name = serializers.CharField(source='school_class.name', read_only=True)
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = TimetableEntry
        fields = [
            'id', 'school_class_name', 'day_of_week', 'day_of_week_display',
            'period', 'subject_name', 'teacher_name', 'room'
        ]


class TimetableImportSerializer(serializers.Serializer):
    """Serializer cho upload file Excel TKB"""
    file = serializers.FileField(required=True)
    school_year = serializers.PrimaryKeyRelatedField(
        queryset=SchoolYear.objects.all(),
        required=True
    )
    import_both_sessions = serializers.BooleanField(
        default=True,
        required=False,
        help_text="True = import cả sáng và chiều, False = chỉ import sheet được chỉ định"
    )
    sheet_name = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Tên sheet cụ thể cần import (nếu import_both_sessions=False)"
    )
    
    def validate_file(self, value):
        """Validate file extension"""
        if not value.name.lower().endswith(('.xlsx', '.xls')):
            raise serializers.ValidationError(
                "File không đúng định dạng. Chỉ chấp nhận file Excel (.xlsx, .xls)"
            )
        return value

