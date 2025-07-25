# Generated by Django 5.1.4 on 2025-07-15 18:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0006_user_avatar_pasttrips_delete_registration'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pasttrips',
            name='attractions',
            field=models.ManyToManyField(blank=True, related_name='saved_in_trips', to='backend.attraction'),
        ),
        migrations.AlterField(
            model_name='pasttrips',
            name='cities',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_trips', to='backend.city'),
        ),
        migrations.AlterField(
            model_name='pasttrips',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='past_trips', to='backend.user'),
        ),
    ]
