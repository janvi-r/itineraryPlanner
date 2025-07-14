from django.contrib import admin
from backend.views import create_user
from django.http import HttpResponse
from django.urls import path
#from backend import views
from frontend.components import createAttractionMap

def home_view(request):
    return HttpResponse("Welcome to the homepage!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', create_user, name='create_user'),
    path('', home_view),
    path('map/<int:city_id>/', createAttractionMap.map_view, name='map_view'),
    #path('api/city/<int:city_id>/', createAttractionMap.city_data, name='city_data'),
path('api/city/<str:city_name>/', createAttractionMap.city_data, name='city_data_by_name'),

]
