from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Tạo router cho các ViewSet
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'pages', views.PageViewSet, basename='page')
router.register(r'documents', views.DocumentViewSet, basename='document')
router.register(r'departments', views.DepartmentViewSet, basename='department')
router.register(r'staff', views.StaffViewSet, basename='staff')
router.register(r'photo-albums', views.PhotoAlbumViewSet, basename='photoalbum')
router.register(r'videos', views.VideoViewSet, basename='video')
router.register(r'banners', views.BannerViewSet, basename='banner')
router.register(r'external-links', views.ExternalLinkViewSet, basename='externallink')
router.register(r'contact', views.ContactMessageViewSet, basename='contact')

# Timetable routes
router.register(r'school-years', views.SchoolYearViewSet, basename='schoolyear')
router.register(r'school-classes', views.SchoolClassViewSet, basename='schoolclass')
router.register(r'timetable', views.TimetableEntryViewSet, basename='timetable')

app_name = 'core'

urlpatterns = [
    path('', include(router.urls)),
    path('site-settings/', views.SiteSettingView.as_view(), name='site-settings'),
    # Custom endpoint cho import TKB
    path('timetable/import/', views.TimetableImportView.as_view(), name='timetable-import'),
]
