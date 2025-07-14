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


# from django.shortcuts import render
# from django.http import JsonResponse
# #from myproject.backend.models import City, Attraction
#
# def map_view(request, city_name):
#     return render(request, 'map.html', {'city_name': city_name})
#
#
# def city_data(request, city_name):
#     try:
#         city = City.objects.get(name=city_name)
#         attractions = Attraction.objects.filter(city=city)
#         return JsonResponse({
#             'city': {
#                 'name': city.name,
#                 'lat': city.citylat,
#                 'lon': city.citylon
#             },
#             'attractions': [
#                 {
#                     'name': a.name,
#                     'lat': a.lat,
#                     'lon': a.lon
#                 } for a in attractions
#             ]
#         })
#     except City.DoesNotExist:
#         return JsonResponse({'error': 'City not found'}, status=404)
