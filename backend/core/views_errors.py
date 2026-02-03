from django.shortcuts import render

def error_400(request, exception=None):
    return render(request, "common/error.html", {
        "title": "Yêu cầu không hợp lệ (400)",
        "message": "Yêu cầu của bạn không đúng định dạng hoặc thiếu dữ liệu.",
        "status_code": 400,
    }, status=400)

def error_403(request, exception=None):
    return render(request, "common/error.html", {
        "title": "Không có quyền truy cập (403)",
        "message": "Bạn không có quyền thực hiện thao tác này.",
        "status_code": 403,
    }, status=403)

def error_404(request, exception=None):
    return render(request, "common/error.html", {
        "title": "Không tìm thấy trang (404)",
        "message": "Trang bạn truy cập không tồn tại hoặc đã bị đổi đường dẫn.",
        "status_code": 404,
    }, status=404)

def error_500(request):
    # 500 không có exception param theo chuẩn handler
    return render(request, "common/error.html", {
        "title": "Có lỗi hệ thống (500)",
        "message": "Đã có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ quản trị.",
        "status_code": 500,
    }, status=500)
