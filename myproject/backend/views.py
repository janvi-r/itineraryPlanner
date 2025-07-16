from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from starlette.concurrency import run_in_threadpool
from backend.serializer import UserSerializer

@api_view(['POST'])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from backend.models import User, City, Attraction, PastTrips
from backend.utils import save_trip_logic

@api_view(['POST'])
def save_past_trip(request):
    try:
        username = request.data.get('username')
        city_name = request.data.get('city')
        attraction_names = request.data.get('attractions', [])

        trip = save_trip_logic(username, city_name, attraction_names)
        return Response({'status': 'success', 'trip_id': trip.id}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'status': 'error', 'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from backend.models import User, City, PastTrips
from fastapi import Request
from backend.models import User, City, PastTrips
from django.core.exceptions import ObjectDoesNotExist


#
# @api_view(['GET'])
# def get_saved_trip_attractions(request, city_name, username):
#     try:
#         user = User.objects.get(username=username)
#         city = City.objects.get(name__iexact=city_name)
#         trip = PastTrips.objects.get(user=user, city=city)
#         attractions = trip.attractions.all()
#
#         data = [
#             {
#                 'name': a.name,
#                 'lat': a.lat,
#                 'lon': a.lon,
#                 'url': a.url
#             } for a in attractions
#         ]
#         return Response({
#             'city': {
#                 'name': city.name,
#                 'lat': city.citylat,
#                 'lon': city.citylon
#             },
#             'attractions': data
#         })
#     except Exception as e:
#         return Response({'error': str(e)}, status=400)





