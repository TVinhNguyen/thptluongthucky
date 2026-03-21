#!/usr/bin/env python
"""
Script test import TKB từ Excel
Chạy: python test_import.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import SchoolYear, TimetableEntry
from core.utils import import_timetable_from_excel

def main():
    # Đường dẫn file Excel
    excel_path = 'TKB ÁP DỤNG TỪ 06.10.2025 - TUẦN 5.xlsx'
    
    # Thử tìm ở nhiều vị trí
    possible_paths = [
        excel_path,
        f'../{excel_path}',
        f'd:/VS/Project/thptluongthucky/{excel_path}'
    ]
    
    excel_file = None
    for path in possible_paths:
        if os.path.exists(path):
            excel_file = path
            break
    
    if not excel_file:
        print(f"❌ Không tìm thấy file Excel ở các vị trí:")
        for p in possible_paths:
            print(f"   - {p}")
        print(f"\nCurrent dir: {os.getcwd()}")
        print(f"Files in current dir:")
        for f in os.listdir('.')[:10]:
            print(f"   - {f}")
        return
    
    print(f"✅ Tìm thấy file: {excel_file}")
    
    # Tạo hoặc lấy năm học test
    school_year, created = SchoolYear.objects.get_or_create(
        name='2025-2026',
        defaults={
            'start_date': '2025-09-01',
            'is_active': True
        }
    )
    
    if created:
        print(f"✅ Đã tạo năm học: {school_year.name}")
    else:
        print(f"✅ Sử dụng năm học: {school_year.name}")
    
    # Đếm số TKB cũ
    old_count = TimetableEntry.objects.filter(school_year=school_year).count()
    print(f"📊 Số TKB hiện tại: {old_count}")
    
    # Import
    print(f"\n🚀 Bắt đầu import từ file: {excel_file}")
    print("=" * 60)
    
    with open(excel_file, 'rb') as f:
        success, message = import_timetable_from_excel(
            file=f,
            school_year_id=school_year.id,
            import_both_sessions=True
        )
    
    print("=" * 60)
    
    if success:
        print(f"✅ {message}")
        
        # Thống kê kết quả
        new_count = TimetableEntry.objects.filter(school_year=school_year).count()
        print(f"\n📊 Thống kê:")
        print(f"   - Số TKB trước: {old_count}")
        print(f"   - Số TKB sau: {new_count}")
        print(f"   - Số lớp: {TimetableEntry.objects.filter(school_year=school_year).values('school_class').distinct().count()}")
        
        # Hiển thị vài mẫu
        print(f"\n📝 Mẫu TKB (5 entry đầu):")
        for entry in TimetableEntry.objects.filter(school_year=school_year)[:5]:
            print(f"   {entry.school_class.name} - Thứ {entry.day_of_week} - Tiết {entry.period}: {entry.subject_name} - {entry.teacher_name}")
    else:
        print(f"❌ {message}")

if __name__ == '__main__':
    main()
