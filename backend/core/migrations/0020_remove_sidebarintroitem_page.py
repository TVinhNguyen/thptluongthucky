from django.db import migrations


def migrate_page_type_to_staff_all(apps, schema_editor):
    SidebarIntroItem = apps.get_model("core", "SidebarIntroItem")
    SidebarIntroItem.objects.filter(link_type="PAGE").update(link_type="STAFF_ALL")


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0019_sidebarintroitem"),
    ]

    operations = [
        migrations.RunPython(migrate_page_type_to_staff_all, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="sidebarintroitem",
            name="page",
        ),
    ]
