from django.contrib import admin
from .models import City, Attraction, UserProfile, PastTrips

#initialize all model classes
admin.site.register(City)
admin.site.register(Attraction)
# admin.site.register(User)
admin.site.register(PastTrips)
admin.site.register(UserProfile)
