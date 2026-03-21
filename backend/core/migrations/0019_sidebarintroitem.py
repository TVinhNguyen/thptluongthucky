from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0018_staff_filter_tags_dynamic"),
    ]

    operations = [
        migrations.CreateModel(
            name="SidebarIntroItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("label", models.CharField(max_length=255, verbose_name="Label")),
                (
                    "link_type",
                    models.CharField(
                        choices=[
                            ("STAFF_ALL", "Danh sach nhan su"),
                            ("STAFF_FILTER", "Nhan su theo chuc danh"),
                            ("PAGE", "Trang tinh"),
                            ("CUSTOM", "Duong dan tuy chinh"),
                        ],
                        default="STAFF_FILTER",
                        max_length=20,
                        verbose_name="Link type",
                    ),
                ),
                (
                    "custom_path",
                    models.CharField(
                        blank=True,
                        default="",
                        help_text="Internal path, vd: /co-cau-to-chuc",
                        max_length=255,
                        verbose_name="Custom path",
                    ),
                ),
                (
                    "anchor",
                    models.CharField(
                        blank=True,
                        default="",
                        help_text="Optional, vd: #chi-bo-dang",
                        max_length=100,
                        verbose_name="Anchor",
                    ),
                ),
                ("sort_order", models.IntegerField(default=0, verbose_name="Sort order")),
                ("is_active", models.BooleanField(default=True, verbose_name="Active")),
                (
                    "page",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="sidebar_intro_items",
                        to="core.page",
                        verbose_name="Page",
                    ),
                ),
                (
                    "site_setting",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="intro_items",
                        to="core.sitesetting",
                        verbose_name="Site setting",
                    ),
                ),
                (
                    "staff_filter_tag",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="sidebar_intro_items",
                        to="core.stafffiltertag",
                        verbose_name="Staff filter tag",
                    ),
                ),
            ],
            options={
                "verbose_name": "Sidebar intro item",
                "verbose_name_plural": "Sidebar intro items",
                "ordering": ["sort_order", "id"],
            },
        ),
    ]
