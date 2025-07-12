# models.py
from django.db import models

class City(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        app_label = 'backend'

class Attraction(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='attractions')
    name = models.CharField(max_length=200)
    url = models.URLField()
    image_urls = models.JSONField()  # stores list of image URLs
    lat = models.CharField(max_length=200, null=True, blank=True)  # ✅ properly declared
    lon = models.CharField(max_length=200, null=True, blank=True)

    class Meta:
        app_label = 'backend'
