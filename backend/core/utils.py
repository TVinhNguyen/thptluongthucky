"""
Utility functions for the core app
"""
from slugify import slugify as python_slugify
import pandas as pd
import re
from typing import Tuple, List


def slugify_vietnamese(text: str) -> str:
    """
    Convert Vietnamese text to URL-friendly slug
    
    Args:
        text: Input text to slugify
        
    Returns:
        Slugified text
    """
    return python_slugify(text, lowercase=True)


# ============= TIMETABLE IMPORT FUNCTIONS =============

def import_timetable_from_excel(
    file, 
    school_year_id: int, 
    sheet_name: str = None, 
    import_both_sessions: bool = True
) -> Tuple[bool, str]:
    """
    Import thời khóa biểu từ file Excel
    
    Args:
        file: File Excel được upload (InMemoryUploadedFile hoặc path)
        school_year_id: ID của SchoolYear
        sheet_name: Tên sheet cụ thể cần import (None = auto detect)
        import_both_sessions: True = import cả sáng và chiều, False = chỉ import sheet được chỉ định
    
    Returns:
        Tuple[bool, str]: (success, message)
    """
    from .models import TimetableEntry, SchoolYear
    
    try:
        # Lấy instance SchoolYear
        try:
            school_year = SchoolYear.objects.get(id=school_year_id)
        except SchoolYear.DoesNotExist:
            return False, f"Không tìm thấy năm học với ID {school_year_id}"
        
        # Xóa dữ liệu cũ của năm học này trước
        deleted_count = TimetableEntry.objects.filter(school_year=school_year).delete()[0]
        
        # Đọc file Excel
        xl = pd.ExcelFile(file)
        
        # Xác định các sheet cần import
        sheets_to_import = _determine_sheets_to_import(xl, sheet_name, import_both_sessions)
        
        if not sheets_to_import:
            return False, "Không tìm thấy sheet nào để import"
        
        # Process từng sheet
        all_entries = []
        for target_sheet_name, is_afternoon in sheets_to_import:
            entries = _process_sheet(xl, target_sheet_name, school_year, is_afternoon)
            all_entries.extend(entries)
        
        if not all_entries:
            return False, "Không tìm thấy dữ liệu tiết học nào trong file. Vui lòng kiểm tra format."
        
        # Bulk create entries mới
        TimetableEntry.objects.bulk_create(all_entries, batch_size=100)
        
        return True, f"Import thành công {len(all_entries)} tiết học từ {len(sheets_to_import)} sheet (đã xóa {deleted_count} tiết cũ)."
    
    except Exception as e:
        return False, f"Lỗi khi import: {str(e)}"


def _determine_sheets_to_import(
    xl: pd.ExcelFile, 
    sheet_name: str, 
    import_both_sessions: bool
) -> List[Tuple[str, bool]]:
    """
    Xác định các sheet cần import
    
    Args:
        xl: pandas ExcelFile object
        sheet_name: Tên sheet cụ thể (nếu có)
        import_both_sessions: True = import cả sáng và chiều
        
    Returns:
        List[(sheet_name, is_afternoon)]
    """
    sheets_to_import = []
    
    if import_both_sessions:
        # Tìm sheet sáng và chiều
        morning_sheet = None
        afternoon_sheet = None
        
        for name in xl.sheet_names:
            name_lower = name.lower()
            if 'sang' in name_lower or 'morning' in name_lower:
                morning_sheet = name
            elif 'chieu' in name_lower or 'afternoon' in name_lower:
                afternoon_sheet = name
        
        if morning_sheet:
            sheets_to_import.append((morning_sheet, False))
        if afternoon_sheet:
            sheets_to_import.append((afternoon_sheet, True))
        
        # Fallback: dùng 2 sheet đầu tiên nếu không tìm thấy
        if not sheets_to_import and len(xl.sheet_names) >= 2:
            sheets_to_import = [
                (xl.sheet_names[0], False),
                (xl.sheet_names[1], True)
            ]
    else:
        # Import sheet cụ thể
        target_sheet = sheet_name if sheet_name else xl.sheet_names[0]
        is_afternoon = 'chieu' in target_sheet.lower() or 'afternoon' in target_sheet.lower()
        sheets_to_import.append((target_sheet, is_afternoon))
    
    return sheets_to_import


def _process_sheet(
    xl: pd.ExcelFile, 
    sheet_name: str, 
    school_year, 
    is_afternoon: bool = False
) -> List:
    """
    Xử lý 1 sheet Excel và trả về list TimetableEntry
    
    Args:
        xl: pandas ExcelFile object
        sheet_name: Tên sheet
        school_year: SchoolYear instance
        is_afternoon: True nếu là buổi chiều (cộng +5 vào period)
    
    Returns:
        List[TimetableEntry]
    """
    from .models import SchoolClass, TimetableEntry
    
    # Đọc sheet, không set header trước
    df = pd.read_excel(xl, sheet_name=sheet_name, header=None)
    
    # Tìm dòng header chứa tên các lớp
    header_row_index = _find_header_row(df)
    if header_row_index == -1:
        return []  # Không tìm thấy header
    
    # Reload dataframe với header đúng
    df = pd.read_excel(xl, sheet_name=sheet_name, header=header_row_index)
    
    # Xử lý cột "Thứ" - fill down các ô merged
    first_col_name = df.columns[0]
    df[first_col_name] = df[first_col_name].ffill()
    
    # Parse day mapping
    day_map = _get_day_mapping()
    
    # Duyệt qua các cột (lớp học) - bỏ qua 2 cột đầu (Thứ, Tiết)
    entries_to_create = []
    class_columns = df.columns[2:]
    
    for col_name in class_columns:
        class_name = str(col_name).strip()
        
        # Bỏ qua cột không hợp lệ
        if not class_name or class_name.lower() in ['nan', 'unnamed']:
            continue
        
        # Tạo hoặc lấy lớp học
        school_class = _get_or_create_class(class_name)
        if not school_class:
            continue
        
        # Duyệt qua từng dòng (tiết học)
        for index, row in df.iterrows():
            entry = _parse_timetable_row(
                row, 
                col_name, 
                school_year, 
                school_class, 
                day_map, 
                is_afternoon
            )
            if entry:
                entries_to_create.append(entry)
    
    return entries_to_create


def _find_header_row(df: pd.DataFrame) -> int:
    """
    Tìm dòng chứa tên các lớp (header row)
    
    Args:
        df: DataFrame
        
    Returns:
        Index của header row, hoặc -1 nếu không tìm thấy
    """
    # Bắt đầu từ row 3 trở đi (bỏ qua 3 dòng tiêu đề đầu)
    for idx in range(3, min(len(df), 10)):  # Chỉ scan 10 dòng đầu
        row = df.iloc[idx]
        # Convert tất cả về string và filter NaN
        row_values = [str(val) for val in row.values if pd.notna(val)]
        row_text = ' '.join(row_values)
        
        # Tìm các pattern tên lớp phổ biến
        patterns = ['10A', '11A', '12A', '10/', '11/', '12/', '10a', '11a', '12a']
        if any(pattern in row_text for pattern in patterns):
            return idx
    
    return -1


def _get_day_mapping() -> dict:
    """
    Trả về mapping từ tên ngày sang số thứ
    
    Returns:
        Dict mapping day name to day number
    """
    return {
        'Thứ 2': 2, 'Thứ 3': 3, 'Thứ 4': 4, 'Thứ 5': 5, 
        'Thứ 6': 6, 'Thứ 7': 7, 'CN': 8, 'Chủ nhật': 8,
        'T2': 2, 'T3': 3, 'T4': 4, 'T5': 5, 'T6': 6, 'T7': 7
    }


def _get_or_create_class(class_name: str):
    """
    Tạo hoặc lấy lớp học từ tên lớp
    
    Args:
        class_name: Tên lớp (VD: "12A1", "10/1")
        
    Returns:
        SchoolClass instance hoặc None nếu không xác định được grade
    """
    from .models import SchoolClass
    
    # Normalize tên lớp: "10/1" -> "10-1"
    class_name_normalized = class_name.replace('/', '-').strip()
    
    # Detect grade
    grade = None
    if class_name_normalized.startswith('10'):
        grade = 10
    elif class_name_normalized.startswith('11'):
        grade = 11
    elif class_name_normalized.startswith('12'):
        grade = 12
    
    if not grade:
        return None
    
    # Tạo hoặc lấy lớp học
    school_class, _ = SchoolClass.objects.get_or_create(
        name=class_name,
        defaults={'grade': grade}
    )
    
    return school_class


def _parse_timetable_row(
    row, 
    col_name: str, 
    school_year, 
    school_class, 
    day_map: dict, 
    is_afternoon: bool
):
    """
    Parse 1 dòng trong TKB thành TimetableEntry
    
    Args:
        row: DataFrame row
        col_name: Tên cột (tên lớp)
        school_year: SchoolYear instance
        school_class: SchoolClass instance
        day_map: Dictionary mapping day name to number
        is_afternoon: True nếu là buổi chiều
        
    Returns:
        TimetableEntry instance hoặc None nếu dữ liệu không hợp lệ
    """
    from .models import TimetableEntry
    
    day_str = str(row.iloc[0]).strip()  # Cột Thứ
    period_val = row.iloc[1]  # Cột Tiết
    cell_value = str(row[col_name]).strip()  # Môn học
    
    # Bỏ qua nếu ô trống hoặc không hợp lệ
    if cell_value in ['nan', '', 'None'] or pd.isna(period_val):
        return None
    
    # Parse Thứ
    day_of_week = day_map.get(day_str)
    if not day_of_week:
        # Thử parse số từ chuỗi
        nums = re.findall(r'\d+', day_str)
        if nums:
            day_of_week = int(nums[0])
    
    if not day_of_week or day_of_week < 2 or day_of_week > 8:
        return None
    
    # Parse Tiết
    try:
        period = int(float(period_val))
    except (ValueError, TypeError):
        return None
    
    # Adjust period nếu là buổi chiều
    if is_afternoon:
        period += 5
    
    if period < 1 or period > 10:
        return None
    
    # Parse Môn, Giáo viên, Phòng
    subject, teacher, room = _parse_subject_teacher_room(cell_value)
    
    return TimetableEntry(
        school_year=school_year,
        school_class=school_class,
        day_of_week=day_of_week,
        period=period,
        subject_name=subject,
        teacher_name=teacher,
        room=room
    )


def _parse_subject_teacher_room(cell_value: str) -> Tuple[str, str, str]:
    """
    Parse cell value thành môn học, giáo viên, phòng
    
    Args:
        cell_value: Nội dung ô (VD: "TOÁN - Hiền", "HÓA - Mai - P.101")
        
    Returns:
        Tuple[subject, teacher, room]
    """
    # Convert sang string nếu là số hoặc float từ Excel
    if not isinstance(cell_value, str):
        cell_value = str(cell_value)
    
    subject = cell_value
    teacher = ""
    room = ""
    
    # Format: "MÔN - GV" hoặc "MÔN - GV - PHÒNG"
    if '-' in cell_value:
        parts = [p.strip() for p in cell_value.split('-')]
        if len(parts) >= 2:
            subject = parts[0]
            teacher = parts[1]
            if len(parts) >= 3:
                room = parts[2]
    
    return subject, teacher, room

