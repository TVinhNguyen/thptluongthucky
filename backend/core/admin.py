from django.contrib import admin
from django import forms
from unfold.admin import ModelAdmin
from .models import (
    Category, Post, Page, Document, Department, Staff,
    PhotoAlbum, Photo, Video, Banner, ExternalLink, ContactMessage
)

# Register your models here.
# CKEditor 5 works automatically with CKEditor5Field in models

@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ['name', 'parent', 'sort_order', 'created_at']
    list_filter = ['parent']
    search_fields = ['name']
    list_editable = ['sort_order']
    ordering = ['sort_order', 'name']


@admin.register(Post)
class PostAdmin(ModelAdmin):
    list_display = ['title', 'category', 'status', 'is_featured', 'views', 'published_at']
    list_filter = ['status', 'is_featured', 'category', 'created_at']
    search_fields = ['title', 'summary', 'content']
    date_hierarchy = 'published_at'
    ordering = ['-published_at', '-created_at']
    readonly_fields = ['views', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('title', 'slug', 'category', 'thumbnail')
        }),
        ('Nội dung', {
            'fields': ('summary', 'content')
        }),
        ('Cài đặt', {
            'fields': ('status', 'is_featured', 'published_at')
        }),
        ('Thống kê', {
            'fields': ('views', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['publish_posts', 'unpublish_posts', 'make_featured', 'remove_featured']
    
    @admin.action(description='Xuất bản bài viết đã chọn')
    def publish_posts(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(status='PUBLISHED', published_at=timezone.now())
        self.message_user(request, f'{updated} bài viết đã được xuất bản.')
    
    @admin.action(description='Chuyển về bản nháp')
    def unpublish_posts(self, request, queryset):
        updated = queryset.update(status='DRAFT')
        self.message_user(request, f'{updated} bài viết đã chuyển về bản nháp.')
    
    @admin.action(description='Đánh dấu là tin nổi bật')
    def make_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} bài viết đã được đánh dấu nổi bật.')
    
    @admin.action(description='Bỏ đánh dấu tin nổi bật')
    def remove_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} bài viết đã bỏ đánh dấu nổi bật.')


@admin.register(Page)
class PageAdmin(ModelAdmin):
    list_display = ['title', 'sort_order', 'is_published', 'created_at']
    list_filter = ['is_published']
    search_fields = ['title', 'content']
    ordering = ['sort_order']
    
    fieldsets = (
        ('Thông tin', {
            'fields': ('title', 'slug', 'sort_order', 'is_published')
        }),
        ('Nội dung', {
            'fields': ('content',)
        }),
    )


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


class PhotoInline(admin.TabularInline):
    model = Photo
    extra = 1
    fields = ['image', 'caption', 'sort_order']


@admin.register(PhotoAlbum)
class PhotoAlbumAdmin(ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    inlines = [PhotoInline]


@admin.register(Photo)
class PhotoAdmin(ModelAdmin):
    list_display = ['album', 'caption', 'sort_order', 'uploaded_at']
    list_filter = ['album']
    search_fields = ['caption']
    list_editable = ['sort_order']
    ordering = ['album', 'sort_order']


@admin.register(Video)
class VideoAdmin(ModelAdmin):
    list_display = ['title', 'is_featured', 'created_at']
    list_filter = ['is_featured', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']

    actions = ['hard_delete']

    def hard_delete(self, request, queryset):
        queryset.delete()
        self.message_user(request, "Delete banner compelete!")

    hard_delete.short_description = "Xóa hoàn toàn (hard delete)"


@admin.register(Banner)
class BannerAdmin(ModelAdmin):
    list_display = ['title', 'sort_order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title']
    list_editable = ['sort_order', 'is_active']
    ordering = ['sort_order']
    
    actions = ['activate_banners', 'deactivate_banners']
    
    @admin.action(description='Kích hoạt banners đã chọn')
    def activate_banners(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} banner(s) đã được kích hoạt.')
    
    @admin.action(description='Vô hiệu hóa banners đã chọn')
    def deactivate_banners(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} banner(s) đã được vô hiệu hóa.')


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
    list_editable = ['status']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    actions = ['mark_as_read', 'mark_as_replied']
    
    @admin.action(description='Đánh dấu là đã đọc')
    def mark_as_read(self, request, queryset):
        updated = queryset.update(status='READ')
        self.message_user(request, f'{updated} tin nhắn đã được đánh dấu đã đọc.')
    
    @admin.action(description='Đánh dấu là đã trả lời')
    def mark_as_replied(self, request, queryset):
        updated = queryset.update(status='REPLIED')
        self.message_user(request, f'{updated} tin nhắn đã được đánh dấu đã trả lời.')
