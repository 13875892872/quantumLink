# Generated by Django 4.1.13 on 2024-04-23 11:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('application', '0002_chat_client_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='application',
            name='icon',
            field=models.CharField(default='/ui/favicon.jpg', max_length=256, verbose_name='应用icon'),
        ),
    ]
