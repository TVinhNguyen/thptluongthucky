from rest_framework import serializers
from .models import (
    Category, Post, Page, Document, Department, Staff,
    PhotoAlbum, Photo, Video, Banner, ExternalLink, ContactMessage
)


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
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'summary', 'thumbnail', 'category', 
                  'category_name', 'is_featured', 'views', 'status', 'published_at']


class PostDetailSerializer(serializers.ModelSerializer):
    """Serializer cho chi tiết bài viết"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'summary', 'content', 'thumbnail', 
                  'category', 'category_name', 'is_featured', 'views', 
                  'status', 'published_at', 'created_at', 'updated_at']


class PageSerializer(serializers.ModelSerializer):
    """Serializer cho trang tĩnh"""
    
    class Meta:
        model = Page
        fields = ['id', 'title', 'slug', 'content', 'sort_order', 
                  'is_published', 'created_at', 'updated_at']


class DocumentSerializer(serializers.ModelSerializer):
    """Serializer cho văn bản"""
    
    class Meta:
        model = Document
        fields = ['id', 'code', 'title', 'doc_type', 'file', 'file_size', 
                  'published_date', 'signer', 'download_count', 'created_at']


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
    """Serializer cho ảnh"""
    
    class Meta:
        model = Photo
        fields = ['id', 'image', 'caption', 'sort_order', 'uploaded_at']


class PhotoAlbumListSerializer(serializers.ModelSerializer):
    """Serializer cho danh sách album (không bao gồm ảnh)"""
    photo_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PhotoAlbum
        fields = ['id', 'name', 'slug', 'description', 'cover_image', 
                  'created_at', 'photo_count']
    
    def get_photo_count(self, obj):
        """Đếm số ảnh trong album"""
        return obj.photos.count()


class PhotoAlbumDetailSerializer(serializers.ModelSerializer):
    """Serializer cho chi tiết album (bao gồm tất cả ảnh)"""
    photos = PhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = PhotoAlbum
        fields = ['id', 'name', 'slug', 'description', 'cover_image', 
                  'created_at', 'photos']


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
