from rest_framework.decorators import api_view
from backend.utils import save_trip_logic
from backend.serializer import UserCreateSerializer

# test
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status



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


# sign in attempt


# class LoginView(APIView):
#     def post(self, request):
#         username = request.data.get("username")
#         password = request.data.get("password")
#
#         if not username or not password:
#             return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)
#
#         user = authenticate(username=username, password=password)
#
#         if user is not None:
#             return Response({"message": "Login successful", "username": user.username}, status=status.HTTP_200_OK)
#         else:
#             return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


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





