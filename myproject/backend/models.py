from django.db import models

class City(models.Model):
    name = models.CharField(max_length=200)
    citylat = models.CharField(max_length=200, null=True, blank=True)  # ✅ move here
    citylon = models.CharField(max_length=200, null=True, blank=True)  # ✅ move here
    class Meta:
       app_label = 'backend'


class Attraction(models.Model):
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='attractions')
    name = models.CharField(max_length=200)
    url = models.URLField()
    image_urls = models.JSONField()
    lat = models.CharField(max_length=200, null=True, blank=True)
    lon = models.CharField(max_length=200, null=True, blank=True)

    class Meta:
     app_label = 'backend'


#class User(models.Model):
class User(models.Model):
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    email = models.EmailField()
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    birthday = models.DateField()

class Registration(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(default='default.jpg', upload_to='profile_images')
    favorite_cities = models.ManyToManyField(City, related_name='favorited_by')
    past_trips = models.TextField(blank=True, null=True)
    userName = models.CharField(max_length=200, null=True, blank=True)
    userEmail = models.CharField(max_length=200, null=True, blank=True)