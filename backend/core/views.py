from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from django.db.models import F

from .models import (
    Category, Post, Page, Document, Department, Staff,
    PhotoAlbum, Photo, Video, Banner, ExternalLink, ContactMessage
)
from .serializers import (
    CategorySerializer, PostListSerializer, PostDetailSerializer,
    PageSerializer, DocumentSerializer, DepartmentSerializer, StaffSerializer,
    PhotoAlbumListSerializer, PhotoAlbumDetailSerializer, PhotoSerializer,
    VideoSerializer, BannerSerializer, ExternalLinkSerializer, ContactMessageSerializer
)

class PostPagination(PageNumberPagination):
    page_size = 10  # bao nhiêu bài / 1 page
    page_size_query_param = 'page_size'
    max_page_size = 100

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem danh mục
    - list: Danh sách tất cả danh mục
    - retrieve: Chi tiết một danh mục
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """Chỉ lấy danh mục cha (parent=None)"""
        return Category.objects.filter(parent=None).order_by('sort_order', 'name')


class PostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem bài viết
    - list: Danh sách bài viết
    - retrieve: Chi tiết bài viết
    - featured: Bài viết nổi bật
    - by_category: Bài viết theo danh mục
    """
    queryset = Post.objects.filter(status='PUBLISHED').order_by('-published_at')
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    pagination_class = PostPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['published_at', 'views']
    
    def get_serializer_class(self):
        """Sử dụng serializer khác nhau cho list và detail"""
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Tăng lượt xem khi đọc chi tiết"""
        instance = self.get_object()
        # Tăng view count
        Post.objects.filter(pk=instance.pk).update(views=F('views') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Lấy các bài viết nổi bật"""
        posts = self.get_queryset().filter(is_featured=True)[:5]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
    
    # @action(detail=False, methods=['get'])
    @action(detail=False, methods=['get'], url_path='by_category')
    def by_category(self, request):
        """Lấy bài viết theo slug danh mục"""
        category_slug = request.query_params.get('slug')
        if not category_slug:
            return Response({'error': 'Vui lòng cung cấp slug danh mục'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            category = Category.objects.get(slug=category_slug)
            posts = self.get_queryset().filter(category=category)
            page = self.paginate_queryset(posts)
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        except Category.DoesNotExist:
            return Response({'error': 'Không tìm thấy danh mục'}, 
                          status=status.HTTP_404_NOT_FOUND)


class PageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem trang tĩnh
    - list: Danh sách trang
    - retrieve: Chi tiết trang
    """
    queryset = Page.objects.filter(is_published=True).order_by('sort_order')
    serializer_class = PageSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]


class DocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem văn bản
    - list: Danh sách văn bản
    - retrieve: Chi tiết văn bản
    - download: Tải văn bản (tăng download_count)
    """
    queryset = Document.objects.all().order_by('-published_date', '-created_at')
    serializer_class = DocumentSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['doc_type']
    search_fields = ['title', 'code', 'signer']
    
    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        """Tăng số lượt tải khi người dùng download"""
        document = self.get_object()
        Document.objects.filter(pk=document.pk).update(download_count=F('download_count') + 1)
        document.refresh_from_db()
        serializer = self.get_serializer(document)
        return Response(serializer.data)


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem tổ chuyên môn
    - list: Danh sách tổ
    - retrieve: Chi tiết tổ (bao gồm nhân sự)
    """
    queryset = Department.objects.all().order_by('sort_order', 'name')
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]
    
    @action(detail=True, methods=['get'])
    def staff(self, request, pk=None):
        """Lấy danh sách nhân sự của tổ"""
        department = self.get_object()
        staff_members = Staff.objects.filter(department=department, is_active=True)
        serializer = StaffSerializer(staff_members, many=True)
        return Response(serializer.data)


class StaffViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem nhân sự
    - list: Danh sách nhân sự
    - retrieve: Chi tiết nhân sự
    """
    queryset = Staff.objects.filter(is_active=True).order_by('sort_order', 'full_name')
    serializer_class = StaffSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department', 'position']
    search_fields = ['full_name', 'email', 'phone']


class PhotoAlbumViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem album ảnh
    - list: Danh sách album
    - retrieve: Chi tiết album (bao gồm tất cả ảnh)
    """
    queryset = PhotoAlbum.objects.all().order_by('-created_at')
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Sử dụng serializer khác nhau cho list và detail"""
        if self.action == 'retrieve':
            return PhotoAlbumDetailSerializer
        return PhotoAlbumListSerializer


class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem video
    - list: Danh sách video
    - retrieve: Chi tiết video
    - featured: Video nổi bật
    """
    queryset = Video.objects.all().order_by('-created_at')
    serializer_class = VideoSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Lấy các video nổi bật"""
        videos = self.get_queryset().filter(is_featured=True)[:5]
        serializer = self.get_serializer(videos, many=True)
        return Response(serializer.data)


class BannerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem banner
    - list: Danh sách banner đang active
    """
    queryset = Banner.objects.filter(is_active=True).order_by('sort_order')
    serializer_class = BannerSerializer
    permission_classes = [AllowAny]


class ExternalLinkViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem liên kết ngoài
    - list: Danh sách liên kết đang active
    """
    queryset = ExternalLink.objects.filter(is_active=True).order_by('sort_order', 'title')
    serializer_class = ExternalLinkSerializer
    permission_classes = [AllowAny]


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint để gửi liên hệ
    - create: Gửi tin nhắn liên hệ mới
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    http_method_names = ['post']  # Chỉ cho phép POST
    
    def create(self, request, *args, **kwargs):
        """Tạo tin nhắn liên hệ mới"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            {'message': 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.', 
             'data': serializer.data},
            status=status.HTTP_201_CREATED
        )
