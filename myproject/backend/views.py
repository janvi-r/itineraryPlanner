from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
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

@api_view(['POST'])
def save_past_trip(request):
    try:
        username = request.data.get('username')
        city_name = request.data.get('city')
        attraction_names = request.data.get('attractions', [])

        user = User.objects.get(username=username)
        city = City.objects.get(name__iexact=city_name)
        trip, created = PastTrips.objects.get_or_create(user=user, city=city)

        for name in attraction_names:
            try:
                attraction = Attraction.objects.get(name=name, city=city)
                trip.attractions.add(attraction)
            except Attraction.DoesNotExist:
                continue

        trip.save()
        return Response({'status': 'success', 'trip_id': trip.id}, status=status.HTTP_201_CREATED)

    except User.DoesNotExist:
        return Response({'status': 'error', 'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except City.DoesNotExist:
        return Response({'status': 'error', 'detail': 'City not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'status': 'error', 'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

