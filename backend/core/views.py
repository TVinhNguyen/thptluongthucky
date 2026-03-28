from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from django.db.models import F
from django.conf import settings
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.utils.translation import gettext_lazy as _
from django.views.decorators.cache import cache_page
from django.views.decorators.clickjacking import xframe_options_exempt
import logging
import requests

from .models import (
    Category, Post, Page, Document, Department, Staff,
    PhotoAlbum, Photo, Video, Banner, ExternalLink, ContactMessage,
    SiteSetting, SchoolYear, SchoolClass, TimetableEntry
)
from .serializers import (
    CategorySerializer, PostListSerializer, PostDetailSerializer,
    PageSerializer, DocumentSerializer, DocumentCreateUpdateSerializer,
    DepartmentSerializer, StaffSerializer,
    PhotoAlbumListSerializer, PhotoAlbumDetailSerializer, PhotoSerializer,
    VideoSerializer, BannerSerializer, ExternalLinkSerializer, ContactMessageSerializer,
    SchoolYearSerializer, SchoolClassSerializer, TimetableEntrySerializer,
    TimetableEntryListSerializer, TimetableImportSerializer
)
from .utils import import_timetable_from_excel

logger = logging.getLogger(__name__)


class DocumentPreviewThrottle(AnonRateThrottle):
    """Rate limit preview endpoint: 30 requests/minute per IP."""
    rate = '30/min'


class PostPagination(PageNumberPagination):
    page_size = 10  # bao nhiêu bài / 1 page
    page_size_query_param = 'page_size'
    max_page_size = 100

@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='list')
@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='retrieve')
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

@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='list')
class PostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem bài viết
    - list: Danh sách bài viết
    - retrieve: Chi tiết bài viết
    - featured: Bài viết nổi bật
    - by_category: Bài viết theo danh mục / tin mới nhất
    """
    queryset = Post.objects.filter(status='PUBLISHED').order_by('-published_at')
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    pagination_class = PostPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_featured']
    search_fields = ['title', 'summary', 'content']
    ordering_fields = ['published_at', 'views']

    # Ít nhất phải có cái này để tránh AssertionError
    serializer_class = PostListSerializer

    def get_serializer_class(self):
        """Sử dụng serializer khác nhau cho list và detail"""
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer

    def retrieve(self, request, *args, **kwargs):
        """Tăng lượt xem khi đọc chi tiết"""
        instance = self.get_object()
        Post.objects.filter(pk=instance.pk).update(views=F('views') + 1)
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @method_decorator(cache_page(settings.CACHE_TTL_SECONDS))
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Lấy các bài viết nổi bật"""
        posts = self.get_queryset().filter(is_featured=True)[:5]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @method_decorator(cache_page(settings.CACHE_TTL_SECONDS))
    @action(detail=False, methods=['get'], url_path='by_category')
    def by_category(self, request):
        """
        Lấy bài viết theo slug danh mục (hỗ trợ cả category cha và con).
        Support search query param để filter theo keyword.
        Nếu slug = 'tin-moi-nhat' thì trả về tin mới nhất (không theo danh mục).
        """
        category_slug = request.query_params.get('slug')
        search_query = request.query_params.get('search')
        
        if not category_slug:
            return Response(
                {'error': 'Vui lòng cung cấp slug danh mục'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Trường hợp đặc biệt: tin mới nhất
        if category_slug == 'tin-moi-nhat':
            queryset = (
                self.get_queryset()
                .filter(published_at__isnull=False)
                .order_by('-published_at')
            )
        else:
            # Các danh mục bình thường (hỗ trợ cả parent và children)
            try:
                category = Category.objects.get(slug=category_slug)
            except Category.DoesNotExist:
                return Response(
                    {'error': 'Không tìm thấy danh mục'},
                    status=status.HTTP_404_NOT_FOUND
                )
            queryset = self.get_queryset().filter(category=category)
        
        # Apply search filter if provided
        if search_query:
            from django.db.models import Q
            keywords = search_query.split('|')
            q_objects = Q()
            for keyword in keywords:
                keyword = keyword.strip()
                if keyword:
                    q_objects |= (
                        Q(title__icontains=keyword) |
                        Q(summary__icontains=keyword) |
                        Q(content__icontains=keyword)
                    )
            queryset = queryset.filter(q_objects)
        
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='list')
@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='retrieve')
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


@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='list')
class DocumentViewSet(viewsets.ModelViewSet):
    """Document API - Full CRUD with file upload"""
    
    queryset = Document.objects.all().order_by('-published_date', '-created_at')
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['doc_type', 'doc_source']
    search_fields = ['title', 'code', 'signer', 'description']
    ordering_fields = ['published_date', 'created_at', 'download_count']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return DocumentCreateUpdateSerializer
        return DocumentSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'download', 'preview']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({"count": queryset.count(), "results": serializer.data})
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        read_serializer = DocumentSerializer(serializer.instance)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        read_serializer = DocumentSerializer(serializer.instance)
        return Response(read_serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def download(self, request, pk=None):
        """Download + increment counter"""
        document = self.get_object()
        Document.objects.filter(pk=document.pk).update(download_count=F('download_count') + 1)
        document.refresh_from_db()
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
    @xframe_options_exempt
    @method_decorator(cache_page(60 * 10))  # Cache 10 minutes — avoids repeated Cloudinary fetches
    @action(detail=True, methods=['get'], permission_classes=[AllowAny],
            throttle_classes=[DocumentPreviewThrottle])
    def preview(self, request, pk=None):
        """Proxy file content from Cloudinary for inline viewing.

        Cloudinary blocks direct PDF delivery on free plans (returns 401).
        Workaround: download via Cloudinary's archive API then extract.
        """
        import zipfile
        import io
        from cloudinary.utils import download_archive_url

        document = self.get_object()
        if not document.file:
            return Response({'detail': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        filename = document.file_name or ''

        # First try direct URL (works for non-PDF files like docx, xlsx)
        try:
            direct_url = document.file.url
            resp = requests.get(direct_url, timeout=30)
            if resp.status_code == 200 and len(resp.content) > 0:
                content_type = resp.headers.get('Content-Type', 'application/octet-stream')
                if filename.lower().endswith('.pdf'):
                    content_type = 'application/pdf'
                response = HttpResponse(resp.content, content_type=content_type)
                response['Content-Disposition'] = f'inline; filename="{filename}"'
                return response
        except Exception:
            pass

        # Fallback: use Cloudinary archive API (works for PDFs blocked by 401)
        try:
            # Extract full public_id from file.url (includes extension like .pdf)
            try:
                full_public_id = document.file.url.split('/')[-1].split('?')[0]
            except Exception:
                full_public_id = str(document.file)

            archive_url = download_archive_url(
                public_ids=[full_public_id],
                resource_type='raw',
                target_format='zip'
            )
            resp = requests.get(archive_url, timeout=30)
            resp.raise_for_status()

            z = zipfile.ZipFile(io.BytesIO(resp.content))
            file_content = z.read(z.namelist()[0])

            content_type = 'application/octet-stream'
            if filename.lower().endswith('.pdf'):
                content_type = 'application/pdf'

            response = HttpResponse(file_content, content_type=content_type)
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            return response
        except Exception:
            return Response({'detail': 'Cannot fetch file'}, status=status.HTTP_502_BAD_GATEWAY)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({'detail': _('Document deleted')}, status=status.HTTP_204_NO_CONTENT)


@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='list')
@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='retrieve')
class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem tổ chuyên môn
    - list: Danh sách tổ
    - retrieve: Chi tiết tổ (bao gồm nhân sự)
    """
    queryset = Department.objects.all().order_by('sort_order', 'name')
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]
    
    @method_decorator(cache_page(settings.CACHE_TTL_SECONDS))
    @action(detail=True, methods=['get'])
    def staff(self, request, pk=None):
        """Lấy danh sách nhân sự của tổ"""
        department = self.get_object()
        staff_members = Staff.objects.filter(department=department, is_active=True)
        serializer = StaffSerializer(staff_members, many=True)
        return Response(serializer.data)


@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='list')
@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='retrieve')
class StaffViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem nhân sự
    - list: Danh sách nhân sự
    - retrieve: Chi tiết nhân sự
    """
    queryset = Staff.objects.filter(is_active=True).prefetch_related('filter_tags').order_by('sort_order', 'full_name')
    serializer_class = StaffSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department']
    search_fields = ['full_name', 'email', 'phone']

    def get_queryset(self):
        """Support filtering by position and dynamic sidebar filter slug."""
        queryset = super().get_queryset()
        position = self.request.query_params.get('position')
        filter_slug = self.request.query_params.get('filter') or self.request.query_params.get('group')
        if position:
            queryset = queryset.filter(position__iexact=position)
        if filter_slug:
            queryset = queryset.filter(
                filter_tags__slug=filter_slug,
                filter_tags__is_active=True
            ).distinct()
        return queryset


@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='list')
@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='retrieve')
class PhotoAlbumViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem album ảnh
    - list: Danh sách album
    - retrieve: Chi tiết album (bao gồm tất cả ảnh)
    """
    queryset = PhotoAlbum.objects.all().order_by('-created_at')
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    pagination_class = PostPagination
    
    def get_serializer_class(self):
        """Sử dụng serializer khác nhau cho list và detail"""
        if self.action == 'retrieve':
            return PhotoAlbumDetailSerializer
        return PhotoAlbumListSerializer


@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='list')
@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='retrieve')
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
    pagination_class = PostPagination
    
    @method_decorator(cache_page(settings.CACHE_TTL_SECONDS))
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Lấy các video nổi bật"""
        videos = self.get_queryset().filter(is_featured=True)[:5]
        serializer = self.get_serializer(videos, many=True)
        return Response(serializer.data)


@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='list')
class BannerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint để xem banner
    - list: Danh sách banner đang active
    """
    queryset = Banner.objects.filter(is_active=True).order_by('sort_order')
    serializer_class = BannerSerializer
    permission_classes = [AllowAny]


@method_decorator(cache_page(settings.CACHE_TTL_SECONDS), name='list')
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


class SiteSettingView(APIView):
    """Public endpoint for frontend UI settings."""

    permission_classes = [AllowAny]

    @method_decorator(cache_page(settings.CACHE_TTL_SECONDS))
    def get(self, request):
        setting = SiteSetting.objects.order_by('-updated_at').first()
        document_items = []
        news_items = []
        intro_items = []

        if setting:
            document_items = [
                {
                    "label": item.label,
                    "href": item.href,
                }
                for item in setting.document_items.filter(is_active=True).order_by('sort_order', 'id')
            ]
            news_items = [
                {
                    "label": item.label,
                    "href": item.href,
                }
                for item in setting.news_items.filter(is_active=True).order_by('sort_order', 'id')
            ]
            intro_items = [
                {
                    "label": item.label,
                    "href": item.href,
                }
                for item in setting.intro_items.filter(is_active=True).order_by('sort_order', 'id')
            ]

        return Response(
            {
                "sidebar_documents_items": document_items,
                "sidebar_news_items": news_items,
                "sidebar_intro_items": intro_items,
                "quote_title": setting.quote_title if setting else "",
                "quote_content": setting.quote_content if setting else "",
                "quote_author": setting.quote_author if setting else "",
            }
        )


# ============= TIMETABLE VIEWS =============

class SchoolYearViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho năm học
    - list: Danh sách năm học
    - retrieve: Chi tiết năm học
    - create/update/delete: Quản lý năm học (cần quyền admin)
    """
    queryset = SchoolYear.objects.all()
    serializer_class = SchoolYearSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Lấy năm học đang active"""
        try:
            active_year = SchoolYear.objects.get(is_active=True)
            serializer = self.get_serializer(active_year)
            return Response(serializer.data)
        except SchoolYear.DoesNotExist:
            return Response(
                {'error': 'Không có năm học nào đang active'},
                status=status.HTTP_404_NOT_FOUND
            )


class SchoolClassViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho lớp học
    - list: Danh sách lớp học
    - retrieve: Chi tiết lớp học
    - filter by grade: ?grade=10
    """
    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['grade']
    ordering_fields = ['grade', 'name']
    ordering = ['grade', 'name']


class TimetableEntryViewSet(viewsets.ModelViewSet):
    """
    API endpoint cho thời khóa biểu
    - list: Danh sách tiết học
    - retrieve: Chi tiết tiết học
    - filter: ?school_year=1&school_class=2&day_of_week=2
    """
    queryset = TimetableEntry.objects.select_related(
        'school_year', 'school_class'
    ).all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['school_year', 'school_class', 'day_of_week', 'period']
    ordering_fields = ['day_of_week', 'period']
    ordering = ['day_of_week', 'period']
    
    def get_serializer_class(self):
        """Dùng serializer khác cho list và detail"""
        if self.action == 'list':
            return TimetableEntryListSerializer
        return TimetableEntrySerializer
    
    @action(detail=False, methods=['get'])
    def by_class(self, request):
        """
        Lấy TKB theo lớp
        Query params: ?class_id=1&school_year_id=1
        """
        class_id = request.query_params.get('class_id')
        school_year_id = request.query_params.get('school_year_id')
        
        if not class_id:
            return Response(
                {'error': 'Thiếu tham số class_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(school_class_id=class_id)
        
        if school_year_id:
            queryset = queryset.filter(school_year_id=school_year_id)
        else:
            # Lấy năm học active
            try:
                active_year = SchoolYear.objects.get(is_active=True)
                queryset = queryset.filter(school_year=active_year)
            except SchoolYear.DoesNotExist:
                pass
        
        serializer = TimetableEntryListSerializer(queryset, many=True)
        return Response(serializer.data)


class TimetableImportView(APIView):
    """
    API endpoint để import TKB từ file Excel
    POST: Upload file Excel + school_year_id
    Hỗ trợ:
    - import_both_sessions=true: Import cả sáng và chiều (mặc định)
    - import_both_sessions=false + sheet_name: Import 1 sheet cụ thể
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Import TKB từ file Excel"""
        serializer = TimetableImportSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = serializer.validated_data['file']
        school_year = serializer.validated_data['school_year']
        import_both_sessions = serializer.validated_data.get('import_both_sessions', True)
        sheet_name = serializer.validated_data.get('sheet_name', None)
        
        # Gọi hàm import
        success, message = import_timetable_from_excel(
            file=file,
            school_year_id=school_year.id,
            sheet_name=sheet_name,
            import_both_sessions=import_both_sessions
        )
        
        if success:
            return Response(
                {
                    'success': True,
                    'message': message,
                    'school_year': SchoolYearSerializer(school_year).data
                },
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {
                    'success': False,
                    'error': message
                },
                status=status.HTTP_400_BAD_REQUEST
            )


# ============= SITEMAP =============

SITE_URL = "https://thptluongthucky.edu.vn"


@cache_page(60 * 60)  # Cache 1 hour
def sitemap_xml(request):
    """Generate dynamic XML sitemap from database content."""
    urls = []

    # Static pages
    static_pages = [
        ("/", "daily", "1.0"),
        ("/gioi-thieu", "weekly", "0.8"),
        ("/co-cau-to-chuc", "weekly", "0.7"),
        ("/can-bo-giao-vien", "weekly", "0.7"),
        ("/thu-vien-van-ban", "daily", "0.8"),
        ("/chuyen-muc/anh", "weekly", "0.6"),
        ("/chuyen-muc/video", "weekly", "0.6"),
        ("/chuyen-muc/thoi-khoa-bieu", "weekly", "0.7"),
    ]
    for path, freq, priority in static_pages:
        urls.append(f"""  <url>
    <loc>{SITE_URL}{path}</loc>
    <changefreq>{freq}</changefreq>
    <priority>{priority}</priority>
  </url>""")

    # Published posts
    posts = Post.objects.filter(status='published').order_by('-published_at')[:500]
    for post in posts:
        lastmod = (post.updated_at or post.published_at).strftime("%Y-%m-%d")
        urls.append(f"""  <url>
    <loc>{SITE_URL}/bai-viet/{post.slug}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>""")

    # Categories
    categories = Category.objects.all()
    for cat in categories:
        urls.append(f"""  <url>
    <loc>{SITE_URL}/chuyen-muc/{cat.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>""")

    # Photo albums
    albums = PhotoAlbum.objects.all().order_by('-created_at')[:100]
    for album in albums:
        urls.append(f"""  <url>
    <loc>{SITE_URL}/chuyen-muc/anh/{album.slug}</loc>
    <lastmod>{album.created_at.strftime("%Y-%m-%d")}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>""")

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

    return HttpResponse(xml, content_type="application/xml")


# ============= PRERENDER FOR BOTS =============

DEFAULT_OG_TITLE = "Trường THPT Lương Thúc Kỳ"
DEFAULT_OG_DESC = (
    "Trang thông tin điện tử Trường THPT Lương Thúc Kỳ. "
    "Cập nhật tin tức, văn bản, thời khóa biểu, hoạt động giáo dục."
)
DEFAULT_OG_IMAGE = f"{SITE_URL}/logo_LTK.png"

STATIC_PAGE_META = {
    "/": (DEFAULT_OG_TITLE, DEFAULT_OG_DESC),
    "/gioi-thieu": ("Giới thiệu | " + DEFAULT_OG_TITLE, "Giới thiệu về Trường THPT Lương Thúc Kỳ."),
    "/co-cau-to-chuc": ("Cơ cấu tổ chức | " + DEFAULT_OG_TITLE, "Cơ cấu tổ chức Trường THPT Lương Thúc Kỳ."),
    "/can-bo-giao-vien": ("Cán bộ - Giáo viên | " + DEFAULT_OG_TITLE, "Danh sách cán bộ, giáo viên Trường THPT Lương Thúc Kỳ."),
    "/thu-vien-van-ban": ("Thư viện văn bản | " + DEFAULT_OG_TITLE, "Thư viện văn bản, công văn, quyết định."),
    "/chuyen-muc/anh": ("Thư viện ảnh | " + DEFAULT_OG_TITLE, "Thư viện ảnh hoạt động."),
    "/chuyen-muc/video": ("Thư viện video | " + DEFAULT_OG_TITLE, "Thư viện video hoạt động."),
    "/chuyen-muc/thoi-khoa-bieu": ("Thời khóa biểu | " + DEFAULT_OG_TITLE, "Thời khóa biểu các lớp học."),
}


def _build_meta_html(title, description, image, url, og_type="website",
                     published_time=None, json_ld=None):
    """Build a minimal HTML page with correct meta tags for bot crawlers."""
    import json as json_mod
    meta = f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8"/>
<title>{title}</title>
<meta name="description" content="{description}"/>
<link rel="canonical" href="{url}"/>
<meta property="og:site_name" content="{DEFAULT_OG_TITLE}"/>
<meta property="og:title" content="{title}"/>
<meta property="og:description" content="{description}"/>
<meta property="og:type" content="{og_type}"/>
<meta property="og:url" content="{url}"/>
<meta property="og:image" content="{image}"/>
<meta property="og:locale" content="vi_VN"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="{title}"/>
<meta name="twitter:description" content="{description}"/>
<meta name="twitter:image" content="{image}"/>"""

    if published_time:
        meta += f'\n<meta property="article:published_time" content="{published_time}"/>'

    if json_ld:
        meta += f'\n<script type="application/ld+json">{json_mod.dumps(json_ld, ensure_ascii=False)}</script>'

    meta += """
</head>
<body></body>
</html>"""
    return meta


import re as _re


@cache_page(60 * 30)  # Cache 30 minutes
def prerender_bot(request, url_path=""):
    """Serve minimal HTML with OG tags for social media / search bots."""
    import json as json_mod
    path = "/" + url_path.lstrip("/")

    # 1. Post detail: /bai-viet/<slug>
    post_match = _re.match(r'^/bai-viet/([^/]+)/?$', path)
    if post_match:
        slug = post_match.group(1)
        try:
            post = Post.objects.select_related('category').get(slug=slug, status='published')
            title = f"{post.title} | {DEFAULT_OG_TITLE}"
            desc = post.summary or post.title
            image = request.build_absolute_uri(post.thumbnail.url) if post.thumbnail else DEFAULT_OG_IMAGE
            url = f"{SITE_URL}/bai-viet/{post.slug}"
            json_ld = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": post.title,
                "description": desc,
                "image": image,
                "datePublished": post.published_at.isoformat() if post.published_at else "",
                "publisher": {"@type": "Organization", "name": DEFAULT_OG_TITLE},
                "url": url,
            }
            html = _build_meta_html(
                title, desc, image, url,
                og_type="article",
                published_time=post.published_at.isoformat() if post.published_at else None,
                json_ld=json_ld,
            )
            return HttpResponse(html, content_type="text/html")
        except Post.DoesNotExist:
            pass

    # 2. Category: /chuyen-muc/<slug>
    cat_match = _re.match(r'^/chuyen-muc/([^/]+)/?$', path)
    if cat_match and cat_match.group(1) not in ('anh', 'video', 'thoi-khoa-bieu'):
        slug = cat_match.group(1)
        try:
            cat = Category.objects.get(slug=slug)
            title = f"{cat.name} | {DEFAULT_OG_TITLE}"
            desc = f"Bài viết thuộc chuyên mục {cat.name} - {DEFAULT_OG_TITLE}"
            html = _build_meta_html(title, desc, DEFAULT_OG_IMAGE, f"{SITE_URL}/chuyen-muc/{slug}")
            return HttpResponse(html, content_type="text/html")
        except Category.DoesNotExist:
            pass

    # 3. Photo album detail: /chuyen-muc/anh/<slug>
    album_match = _re.match(r'^/chuyen-muc/anh/([^/]+)/?$', path)
    if album_match:
        slug = album_match.group(1)
        try:
            album = PhotoAlbum.objects.get(slug=slug)
            title = f"{album.name} - Thư viện ảnh | {DEFAULT_OG_TITLE}"
            desc = album.description or f"Album ảnh {album.name}"
            image = album.cover_image.url if album.cover_image else DEFAULT_OG_IMAGE
            if not image.startswith("http"):
                image = request.build_absolute_uri(image)
            html = _build_meta_html(title, desc, image, f"{SITE_URL}/chuyen-muc/anh/{slug}")
            return HttpResponse(html, content_type="text/html")
        except PhotoAlbum.DoesNotExist:
            pass

    # 4. Static pages
    if path in STATIC_PAGE_META:
        title, desc = STATIC_PAGE_META[path]
        html = _build_meta_html(title, desc, DEFAULT_OG_IMAGE, f"{SITE_URL}{path}")
        return HttpResponse(html, content_type="text/html")

    # Fallback: default meta
    html = _build_meta_html(DEFAULT_OG_TITLE, DEFAULT_OG_DESC, DEFAULT_OG_IMAGE, f"{SITE_URL}{path}")
    return HttpResponse(html, content_type="text/html")

