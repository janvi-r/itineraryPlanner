from django.db import models
from django.contrib.auth.models import User


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


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    birthday = models.DateField(null=True, blank=True)
    avatar = models.ImageField(default='default.jpg', upload_to='profile_images')

    def __str__(self):
        return self.user.username

class PastTrips(models.Model):  #aka Saved Trips
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='past_trips')
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='saved_trips')
    attractions = models.ManyToManyField(Attraction, blank=True, related_name='saved_in_trips')

class FinalItinerary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='day_wise_trips')
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='day_wise_trips')
    day = models.IntegerField()
    attractions = models.ManyToManyField(Attraction, blank=True, related_name='in_daywise_trips')

    class Meta:
        app_label = 'backend'
        unique_together = ('user', 'city', 'day')  # so you don’t duplicate a day





