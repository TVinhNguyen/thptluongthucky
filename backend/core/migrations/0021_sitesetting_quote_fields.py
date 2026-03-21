from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0020_remove_sidebarintroitem_page"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitesetting",
            name="quote_author",
            field=models.CharField(blank=True, default="Ho Chi Minh", max_length=255, verbose_name="Tac gia trich dan"),
        ),
        migrations.AddField(
            model_name="sitesetting",
            name="quote_content",
            field=models.TextField(
                blank=True,
                default='"Vi loi ich muoi nam phai trong cay, vi loi ich tram nam phai trong nguoi"',
                verbose_name="Noi dung trich dan",
            ),
        ),
        migrations.AddField(
            model_name="sitesetting",
            name="quote_title",
            field=models.CharField(blank=True, default="Loi Chu tich Ho Chi Minh", max_length=255, verbose_name="Tieu de trich dan"),
        ),
    ]
