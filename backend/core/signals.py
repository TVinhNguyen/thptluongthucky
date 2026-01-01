# core/signals.py
from django.db.models.signals import post_delete
from django.dispatch import receiver
import cloudinary.uploader
from .models import PhotoAlbum, Photo, Video

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
        cloudinary.uploader.destroy(instance.thumbnail.public_id)

    # nếu bạn upload file video
    if hasattr(instance, "video_file") and instance.video_file:
        cloudinary.uploader.destroy(
            instance.video_file.public_id,
            resource_type="video"
        )
