from django.contrib import admin
from backend.views import register_user
from django.http import HttpResponse
from django.urls import path
from backend import createattractionMap2
from backend.views import save_past_trip
#from backend.api import saved_trip_attractions
from backend.utils import save_daywise_trip
from backend.views import get_past_trips


from django.urls import path
# from backend.views import LoginView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
def home_view(request):
    return HttpResponse("Welcome to the homepage!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view),
    path('api/city/<str:city_name>/', createattractionMap2.city_data, name='city_data'),
    path('api/save_past_trip/', save_past_trip, name='save_past_trip'),
    path('api/register/', register_user),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
# path('api/past_trips/<str:username>/', save_daywise_trip, name='get_past_trips'),
#     path('api/past_trips/<str:username>/', get_past_trips, name='get_past_trips'),

]
