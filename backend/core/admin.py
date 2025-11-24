from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import (
    Category, Post, Page, Document, Department, Staff,
    PhotoAlbum, Photo, Video, Banner, ExternalLink, ContactMessage
)

# Register your models here.

@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ['name', 'parent', 'sort_order', 'created_at']
    list_filter = ['parent']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['sort_order', 'name']


@admin.register(Post)
class PostAdmin(ModelAdmin):
    list_display = ['title', 'category', 'status', 'is_featured', 'views', 'published_at']
    list_filter = ['status', 'is_featured', 'category', 'created_at']
    search_fields = ['title', 'summary', 'content']
    prepopulated_fields = {'slug': ('title',)}
    date_hierarchy = 'published_at'
    ordering = ['-published_at', '-created_at']


@admin.register(Page)
class PageAdmin(ModelAdmin):
    list_display = ['title', 'sort_order', 'is_published', 'created_at']
    list_filter = ['is_published']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['sort_order']


@admin.register(Document)
class DocumentAdmin(ModelAdmin):
    list_display = ['title', 'code', 'doc_type', 'published_date', 'signer', 'download_count']
    list_filter = ['doc_type', 'published_date']
    search_fields = ['title', 'code', 'signer']
    date_hierarchy = 'published_date'
    ordering = ['-published_date', '-created_at']


@admin.register(Department)
class DepartmentAdmin(ModelAdmin):
    list_display = ['name', 'leader_name', 'sort_order']
    search_fields = ['name', 'leader_name']
    ordering = ['sort_order', 'name']


@admin.register(Staff)
class StaffAdmin(ModelAdmin):
    list_display = ['full_name', 'position', 'department', 'email', 'phone', 'is_active']
    list_filter = ['is_active', 'department', 'position']
    search_fields = ['full_name', 'email', 'phone']
    ordering = ['sort_order', 'full_name']


@admin.register(PhotoAlbum)
class PhotoAlbumAdmin(ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['-created_at']


@admin.register(Photo)
class PhotoAdmin(ModelAdmin):
    list_display = ['album', 'caption', 'sort_order', 'uploaded_at']
    list_filter = ['album']
    search_fields = ['caption']
    ordering = ['album', 'sort_order']


@admin.register(Video)
class VideoAdmin(ModelAdmin):
    list_display = ['title', 'is_featured', 'created_at']
    list_filter = ['is_featured', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']


@admin.register(Banner)
class BannerAdmin(ModelAdmin):
    list_display = ['title', 'sort_order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title']
    ordering = ['sort_order']


@admin.register(ExternalLink)
class ExternalLinkAdmin(ModelAdmin):
    list_display = ['title', 'url', 'sort_order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title', 'url']
    ordering = ['sort_order']


@admin.register(ContactMessage)
class ContactMessageAdmin(ModelAdmin):
    list_display = ['full_name', 'subject', 'email', 'phone', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['full_name', 'email', 'phone', 'subject', 'message']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
