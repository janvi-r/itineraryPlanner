from django.contrib import admin
from backend.views import create_user
from django.http import HttpResponse
from django.urls import path
#from backend import views
from backend import createattractionMap2

def home_view(request):
    return HttpResponse("Welcome to the homepage!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', create_user, name='create_user'),
    path('', home_view),
    path('api/city/<str:city_name>/', createattractionMap2.city_data, name='city_data')

]
