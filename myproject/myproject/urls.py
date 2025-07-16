from django.contrib import admin
from backend.views import create_user
from django.http import HttpResponse
from django.urls import path
from backend import createattractionMap2
from backend.views import save_past_trip
#from backend.api import saved_trip_attractions

def home_view(request):
    return HttpResponse("Welcome to the homepage!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', create_user, name='create_user'),
    path('', home_view),
    path('api/city/<str:city_name>/', createattractionMap2.city_data, name='city_data'),
    path('api/save_past_trip/', save_past_trip, name='save_past_trip'),
   # path('api/saved_trip_attractions/<str:city_name>/<str:username>/', saved_trip_attractions)

]
