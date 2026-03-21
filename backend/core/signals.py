# core/signals.py
from django.db.models.signals import post_delete
from django.dispatch import receiver
import cloudinary.uploader
from .models import PhotoAlbum, Photo, Video, Document

@receiver(post_delete, sender=PhotoAlbum)
def delete_album_cover(sender, instance, **kwargs):
    if instance.cover_image:
        cloudinary.uploader.destroy(instance.cover_image.public_id)

@receiver(post_delete, sender=Photo)
def delete_photo_image(sender, instance, **kwargs):
    if instance.image:
        cloudinary.uploader.destroy(instance.image.public_id)

@receiver(post_delete, sender=Video)
def delete_video_assets(sender, instance, **kwargs):
    if instance.thumbnail:
        try:
            if hasattr(instance.thumbnail, "public_id") and instance.thumbnail.public_id:
                cloudinary.uploader.destroy(instance.thumbnail.public_id)
            else:
                # Fallback for local storage ImageField
                instance.thumbnail.delete(save=False)
        except Exception:
            pass

    if hasattr(instance, "video_file") and instance.video_file:
        try:
            if hasattr(instance.video_file, "public_id") and instance.video_file.public_id:
                cloudinary.uploader.destroy(
                    instance.video_file.public_id,
                    resource_type="video"
                )
            else:
                # Fallback for local storage FileField
                instance.video_file.delete(save=False)
        except Exception:
            pass

@receiver(post_delete, sender=Document)
def delete_document_file(sender, instance, **kwargs):
    """Xóa file từ Cloudinary khi document bị delete"""
    if instance.file:
        try:
            cloudinary.uploader.destroy(instance.file.public_id, resource_type='raw')
        except Exception:
            pass
