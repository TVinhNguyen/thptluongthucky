# Generated migration for Document model update
# Changes: FileField -> CloudinaryField, added new fields and validators

from django.db import migrations, models
import cloudinary.models
import core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_alter_document_options_alter_photo_image_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='description',
            field=models.TextField(blank=True, verbose_name='Mô tả'),
        ),
        migrations.AddField(
            model_name='document',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='document',
            name='doc_type',
            field=models.CharField(
                choices=[
                    ('CONG_VAN', 'Công văn'),
                    ('QUYET_DINH', 'Quyết định'),
                    ('TKB', 'Thời khóa biểu'),
                    ('BIEU_MAU', 'Biểu mẫu'),
                    ('OTHER', 'Khác'),
                ],
                default='OTHER',
                max_length=50,
                verbose_name='Loại văn bản',
            ),
        ),
        migrations.AlterField(
            model_name='document',
            name='file',
            field=cloudinary.models.CloudinaryField(
                max_length=255,
                resource_type='raw',
                validators=[core.validators.document_file_validator],
                verbose_name='File đính kèm',
            ),
        ),
        migrations.AlterField(
            model_name='document',
            name='file_size',
            field=models.IntegerField(
                default=0,
                editable=False,
                verbose_name='Kích thước (KB)',
            ),
        ),
        migrations.AlterField(
            model_name='document',
            name='code',
            field=models.CharField(
                blank=True,
                help_text='VD: 2024/CV-CTU',
                max_length=50,
                verbose_name='Số hiệu văn bản',
            ),
        ),
        migrations.AlterField(
            model_name='document',
            name='title',
            field=models.CharField(
                help_text='Tiêu đề document',
                max_length=500,
                verbose_name='Tiêu đề',
            ),
        ),
        migrations.AlterField(
            model_name='document',
            name='signer',
            field=models.CharField(
                blank=True,
                help_text='Người ký hoặc phê duyệt document',
                max_length=100,
                verbose_name='Người ký',
            ),
        ),
        migrations.AddIndex(
            model_name='document',
            index=models.Index(fields=['-published_date'], name='core_docume_publishe_idx'),
        ),
        migrations.AddIndex(
            model_name='document',
            index=models.Index(fields=['doc_type'], name='core_docume_doc_typ_idx'),
        ),
    ]
