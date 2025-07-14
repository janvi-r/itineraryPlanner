from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializer import UserSerializer

@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.shortcuts import render
from django.http import JsonResponse
from backend.models import City, Attraction

def map_view(request, city_id):
    try:
        city = City.objects.get(id=city_id)
        return render(request, 'frontend/components/map.html', {
            #'city_id': city.id,
            'city_name': city.name
        })
    except City.DoesNotExist:
        return JsonResponse({'error': 'City not found'}, status=404)

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
                    'image': a.image_urls[0] if a.image_urls else None
                }
                for a in attractions
            ]
        })
    except City.DoesNotExist:
        return JsonResponse({'error': 'City not found'}, status=404)
