from django.contrib import admin
from django import forms
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import path
from django.urls import reverse
from unfold.admin import ModelAdmin
from .models import (
    Category, Post, Page, Document, Department, Staff, StaffFilterTag,
    PhotoAlbum, Photo, Video, Banner, ExternalLink, ContactMessage,
    SiteSetting, SidebarDocumentItem, SidebarNewsItem, SidebarIntroItem, SchoolYear, SchoolClass, TimetableEntry
)
from .utils import import_timetable_from_excel


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
    """Admin interface - Document CRUD"""
    
    list_display = ['title', 'code', 'doc_type', 'doc_source', 'published_date', 'signer', 'download_count']
    list_filter = ['doc_type', 'doc_source', 'published_date', 'created_at']
    search_fields = ['title', 'code', 'signer', 'description']
    date_hierarchy = 'published_date'
    ordering = ['-published_date', '-created_at']
    readonly_fields = ['file_size', 'download_count', 'created_at', 'updated_at', 'file_url_display']
    
    fieldsets = (
        ('Thông tin', {
            'fields': ('code', 'title', 'doc_type', 'doc_source')
        }),
        ('File', {
            'fields': ('file', 'file_size', 'file_url_display'),
        }),
        ('Metadata', {
            'fields': ('published_date', 'signer', 'description')
        }),
        ('Thống kê', {
            'fields': ('download_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['reset_download_count']
    
    def file_url_display(self, obj):
        if obj.file_url:
            from django.utils.html import format_html
            return format_html('<a href="{}" target="_blank">View file</a>', obj.file_url)
        return 'No file'
    
    file_url_display.short_description = 'Link'
    
    @admin.action(description='Reset download count')
    def reset_download_count(self, request, queryset):
        updated = queryset.update(download_count=0)
        self.message_user(request, f'{updated} document(s) reset.')


@admin.register(Department)
class DepartmentAdmin(ModelAdmin):
    list_display = ['name', 'leader_name', 'sort_order']
    search_fields = ['name', 'leader_name']
    ordering = ['sort_order', 'name']


@admin.register(StaffFilterTag)
class StaffFilterTagAdmin(ModelAdmin):
    list_display = ['name', 'slug', 'sort_order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'slug']
    ordering = ['sort_order', 'name']
    list_editable = ['sort_order', 'is_active']


@admin.register(Staff)
class StaffAdmin(ModelAdmin):
    list_display = ['full_name', 'position', 'department', 'email', 'phone', 'is_active']
    list_filter = ['is_active', 'department', 'position', 'filter_tags']
    search_fields = ['full_name', 'email', 'phone']
    ordering = ['sort_order', 'full_name']
    filter_horizontal = ['filter_tags']


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


class SidebarDocumentItemInline(admin.TabularInline):
    model = SidebarDocumentItem
    extra = 1
    fields = ['label', 'document_source', 'sort_order', 'is_active']
    ordering = ['sort_order', 'id']


class SidebarNewsItemInline(admin.TabularInline):
    model = SidebarNewsItem
    extra = 1
    fields = ['category', 'sort_order', 'is_active']
    ordering = ['sort_order', 'id']

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        formfield = super().formfield_for_foreignkey(db_field, request, **kwargs)
        if db_field.name == 'category':
            formfield.widget.can_add_related = False
            formfield.widget.can_change_related = False
            formfield.widget.can_delete_related = False
            formfield.widget.can_view_related = True
        return formfield

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        category_field = formset.form.base_fields.get('category')
        if category_field and hasattr(category_field.widget, 'can_add_related'):
            category_field.widget.can_add_related = False
            category_field.widget.can_change_related = False
            category_field.widget.can_delete_related = False
            category_field.widget.can_view_related = True
        return formset


class SidebarIntroItemInline(admin.TabularInline):
    model = SidebarIntroItem
    extra = 1
    fields = ['label', 'link_type', 'staff_filter_tag', 'custom_path', 'anchor', 'sort_order', 'is_active']
    ordering = ['sort_order', 'id']

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        for field_name in ('staff_filter_tag',):
            field = formset.form.base_fields.get(field_name)
            if field and hasattr(field.widget, 'can_add_related'):
                field.widget.can_add_related = False
                field.widget.can_change_related = False
                field.widget.can_delete_related = False
                field.widget.can_view_related = True
        return formset


@admin.register(SiteSetting)
class SiteSettingAdmin(ModelAdmin):
    list_display = ['updated_at']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-updated_at']
    inlines = [SidebarDocumentItemInline, SidebarNewsItemInline, SidebarIntroItemInline]

    fieldsets = (
        ('Noi dung right sidebar', {
            'fields': ('quote_title', 'quote_content', 'quote_author'),
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        setting, _ = SiteSetting.objects.get_or_create()
        url = reverse('admin:core_sitesetting_change', args=[setting.pk])
        return redirect(url)


# ============= TIMETABLE ADMIN =============

@admin.register(SchoolYear)
class SchoolYearAdmin(ModelAdmin):
    """Admin interface cho năm học"""
    list_display = ['name', 'start_date', 'end_date', 'is_active', 'created_at']
    list_filter = ['is_active', 'start_date']
    search_fields = ['name']
    ordering = ['-start_date']
    list_editable = ['is_active']
    readonly_fields = ['created_at', 'updated_at']
    change_form_template = 'admin/schoolyear_change_form.html'
    
    fieldsets = (
        ('Thông tin năm học', {
            'fields': ('name', 'start_date', 'end_date', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_year', 'deactivate_year']
    
    def response_change(self, request, obj):
        """Override để xử lý import TKB từ form change"""
        excel_file = request.FILES.get('excel_file')
        
        if excel_file:
            success, message = import_timetable_from_excel(
                file=excel_file,
                school_year_id=obj.id,
                import_both_sessions=True
            )
            
            if success:
                messages.success(request, message)
            else:
                messages.error(request, message)
            
            return HttpResponseRedirect(request.path)
        
        return super().response_change(request, obj)
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:object_id>/import-timetable/', 
                 self.admin_site.admin_view(self.import_timetable_view), 
                 name='core_schoolyear_import'),
        ]
        return custom_urls + urls
    
    def import_timetable_view(self, request, object_id):
        """View xử lý import TKB cho năm học cụ thể"""
        school_year = self.get_object(request, object_id)
        
        if request.method == 'POST':
            excel_file = request.FILES.get('excel_file')
            
            if not excel_file:
                messages.error(request, 'Vui lòng chọn file Excel!')
            else:
                success, message = import_timetable_from_excel(
                    file=excel_file,
                    school_year_id=object_id,
                    import_both_sessions=True  # Mặc định luôn import cả 2 buổi
                )
                
                if success:
                    messages.success(request, message)
                else:
                    messages.error(request, message)
        
        return redirect('admin:core_schoolyear_change', object_id)
    
    @admin.action(description='Kích hoạt năm học')
    def activate_year(self, request, queryset):
        # Chỉ cho phép 1 năm active
        if queryset.count() > 1:
            self.message_user(request, 'Chỉ có thể kích hoạt 1 năm học tại 1 thời điểm!', level='error')
            return
        SchoolYear.objects.all().update(is_active=False)
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} năm học đã được kích hoạt.')
    
    @admin.action(description='Vô hiệu hóa năm học')
    def deactivate_year(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} năm học đã được vô hiệu hóa.')


@admin.register(SchoolClass)
class SchoolClassAdmin(ModelAdmin):
    """Admin interface cho lớp học"""
    list_display = ['name', 'grade', 'created_at']
    list_filter = ['grade']
    search_fields = ['name']
    ordering = ['grade', 'name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Thông tin lớp', {
            'fields': ('name', 'grade')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TimetableEntry)
class TimetableEntryAdmin(ModelAdmin):
    """Admin interface cho thời khóa biểu"""
    list_display = ['school_class', 'school_year', 'day_of_week', 'period', 
                   'subject_name', 'teacher_name', 'room']
    list_filter = ['school_year', 'school_class', 'day_of_week', 'period']
    search_fields = ['subject_name', 'teacher_name', 'room']
    ordering = ['school_year', 'school_class', 'day_of_week', 'period']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Thông tin cơ bản', {
            'fields': ('school_year', 'school_class', 'day_of_week', 'period')
        }),
        ('Nội dung tiết học', {
            'fields': ('subject_name', 'teacher_name', 'room')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['delete_entries']
    
    @admin.action(description='Xóa các tiết học đã chọn')
    def delete_entries(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(request, f'Đã xóa {count} tiết học.')

