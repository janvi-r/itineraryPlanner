from django.contrib import admin
from .models import City, Attraction, UserProfile, PastTrips, FinalItinerary

admin.site.register(City)
admin.site.register(Attraction)
admin.site.register(PastTrips)
admin.site.register(UserProfile)
admin.site.register(FinalItinerary)