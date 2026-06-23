from django.core.exceptions import ValidationError
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _


@deconstructible
class DocumentFileValidator:
    """File validator - MIME type & size"""
    
    ALLOWED_MIME_TYPES = {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'text/plain': ['.txt'],
        'application/vnd.ms-powerpoint': ['.ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    }
    
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    
    def __init__(self, max_size=None):
        self.max_size = max_size or self.MAX_FILE_SIZE
    
    def __call__(self, file):
        # Skip validation for CloudinaryResource objects (already uploaded)
        if hasattr(file, 'public_id'):
            return
        
        # Validate size only if attribute exists
        if hasattr(file, 'size') and file.size and file.size > self.max_size:
            raise ValidationError(
                _('File exceeds %(max)s MB'),
                params={'max': self.max_size / (1024 * 1024)}
            )
        
        # Validate file type
        content_type = getattr(file, 'content_type', '')
        filename = getattr(file, 'name', '')
        
        if content_type and filename and not self._is_allowed(content_type, filename):
            exts = ', '.join(self._get_all_extensions())
            raise ValidationError(
                _('File type not allowed. Allowed: %(types)s'),
                params={'types': exts}
            )
    
    def _is_allowed(self, mime_type: str, filename: str) -> bool:
        file_ext = ('.' + filename.rsplit('.', 1)[-1].lower()) if '.' in filename else ''
        return mime_type in self.ALLOWED_MIME_TYPES and file_ext in self.ALLOWED_MIME_TYPES[mime_type]
    
    @staticmethod
    def _get_all_extensions():
        exts = set()
        for mimes in DocumentFileValidator.ALLOWED_MIME_TYPES.values():
            exts.update(mimes)
        return sorted(exts)


document_file_validator = DocumentFileValidator()
