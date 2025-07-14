
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')  # replace 'myproject.settings' with your actual settings module path
django.setup()

from django.shortcuts import render
from django.http import JsonResponse
from backend.models import City, Attraction
# Your view functions or script logic here


def map_page(request, city_id):
    return render(request, 'map.html', {'city_id': city_id})

def map_data(request, city_id):
    try:
        city = City.objects.get(id=city_id)
        attractions = Attraction.objects.filter(city=city)
        return JsonResponse({
            'city': {
                'name': city.name,
                'lat': city.citylat,
                'lon': city.citylon,
            },
            'attractions': [
                {
                    'name': a.name,
                    'lat': a.lat,
                    'lon': a.lon,
                    'image': a.image_urls[0] if a.image_urls else None,
                } for a in attractions
            ]
        })
    except City.DoesNotExist:
        return JsonResponse({'error': 'City not found'}, status=404)