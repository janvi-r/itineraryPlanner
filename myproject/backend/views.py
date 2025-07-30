from backend.utils import save_trip_logic
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializer import UserCreateSerializer

@api_view(['POST'])
def register_user(request):
    print("Incoming data:", request.data)  # <-- Add this

    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        print("User created:", user.username)  # <-- Add this
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        print("Serializer errors:", serializer.errors)  # <-- Add this
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

from django.http import JsonResponse
from django.contrib.auth.models import User
from backend.models import FinalItinerary
#
# def get_past_trips(request, username):
#     try:
#         user = User.objects.get(username=username)
#     except User.DoesNotExist:
#         return JsonResponse({"detail": "User not found"}, status=404)
#
#     trips = FinalItinerary.objects.filter(user=user)
#     if not trips.exists():
#         return JsonResponse({"detail": "No trips found"}, status=404)
#
#     trips_data = []
#     for trip in trips:
#         attractions = trip.attractions.all()
#         trips_data.append({
#             "id": trip.id,
#             "city": trip.city.name,
#             "day": trip.day,
#             "attractions": [
#                 {"name": attr.name, "lat": attr.lat, "lon": attr.lon} for attr in attractions
#             ],
#         })
#
#     return JsonResponse({"trips": trips_data})
#
# from collections import defaultdict
# from django.http import JsonResponse
# from django.contrib.auth.models import User
# from backend.models import FinalItinerary
#
# def get_past_trips(request, username):
#     try:
#         user = User.objects.get(username=username)
#     except User.DoesNotExist:
#         return JsonResponse({"detail": "User not found"}, status=404)
#
#     trips = FinalItinerary.objects.filter(user=user).order_by('city__name', 'day')
#     if not trips.exists():
#         return JsonResponse({"detail": "No trips found"}, status=404)
#
#     grouped_trips = defaultdict(list)
#     for trip in trips:
#         attractions = trip.attractions.all()
#         grouped_trips[trip.city.name].append({
#             "day": trip.day,
#             "attractions": [
#                 {"name": a.name, "lat": a.lat, "lon": a.lon} for a in attractions
#             ]
#         })
#
#     result = []
#     for city_name, days in grouped_trips.items():
#         result.append(days)
#
#     return JsonResponse({"trips": result})









