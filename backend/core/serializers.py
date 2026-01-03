from rest_framework import serializers
from .models import (
    Category, Post, Page, Document, Department, Staff,
    PhotoAlbum, Photo, Video, Banner, ExternalLink, ContactMessage
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


class PostDetailSerializer(serializers.ModelSerializer):
    """Serializer cho chi tiết bài viết"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'summary', 'content', 'thumbnail', 
                  'category', 'category_name', 'category_slug', 'is_featured', 'views', 
                  'status', 'published_at', 'created_at', 'updated_at']


class PageSerializer(serializers.ModelSerializer):
    """Serializer cho trang tĩnh"""
    
    class Meta:
        model = Page
        fields = ['id', 'title', 'slug', 'content', 'sort_order', 
                  'is_published', 'created_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    """Document serializer - read only"""
    
    file_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()
    formatted_file_size = serializers.SerializerMethodField()
    doc_type_display = serializers.CharField(source='get_doc_type_display', read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'code', 'title', 'doc_type', 'doc_type_display',
            'file', 'file_url', 'file_name', 'file_size', 'formatted_file_size',
            'published_date', 'signer', 'description', 'download_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'file_size', 'download_count', 'created_at', 'updated_at']
    
    def get_file_url(self, obj):
        try:
            return obj.file.url if (obj.file and hasattr(obj.file, 'url')) else None
        except Exception:
            if obj.file:
                from cloudinary.utils import cloudinary_url
                url, _ = cloudinary_url(str(obj.file), resource_type='raw')
                return url
            return None
    
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
    
    class Meta:
        model = Staff
        fields = ['id', 'full_name', 'avatar', 'position', 'department', 
                  'department_name', 'email', 'phone', 'bio', 'sort_order', 'is_active']


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
    
    class Meta:
        model = Banner
        fields = ['id', 'title', 'image', 'link_url', 'sort_order', 'is_active']


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
