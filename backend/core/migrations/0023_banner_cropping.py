from django.db import migrations
import image_cropping.fields


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0022_alter_stafffiltertag_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="banner",
            name="cropping",
            field=image_cropping.fields.ImageRatioField(
                "image",
                "1920x540",
                help_text="Keo tha de chon vung hien thi banner (ti le 1920x540).",
                verbose_name="Vung cat anh",
            ),
        ),
    ]
