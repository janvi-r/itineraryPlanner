from backend.models import City, User, Attraction, PastTrips
from asgiref.sync import sync_to_async

async def save_trip_logic(username, city_name, attraction_names):
    user = await sync_to_async(User.objects.get)(username=username)
    city = await sync_to_async(City.objects.get)(name__iexact=city_name)
    trip, _ = await sync_to_async(PastTrips.objects.get_or_create)(user=user, city=city)
    print("Selected attractions:", attraction_names)

    await sync_to_async(trip.attractions.clear)()

    for name in attraction_names:
        try:
            attraction = await sync_to_async(Attraction.objects.get)(name=name, city=city)
            await sync_to_async(trip.attractions.add)(attraction)
        except Attraction.DoesNotExist:
            continue

    await sync_to_async(trip.save)()
    return trip

async def get_saved_trip_data(username, city_name):
    try:
        print(f"Fetching user '{username}' and city '{city_name}' from DB")
        user = await sync_to_async(User.objects.get)(username=username)
        city = await sync_to_async(City.objects.get)(name__iexact=city_name)
        trip = await sync_to_async(PastTrips.objects.get)(user=user, city=city)
        attractions = await sync_to_async(lambda: list(trip.attractions.all()))()
        print(f"Found trip with {len(attractions)} attractions")

        data = [
            {
                'name': a.name,
                'lat': a.lat,
                'lon': a.lon,
                'url': a.url
            } for a in attractions
        ]

        print(f"Attraction data prepared: {data}")

        return {
            'city': {
                'name': city.name,
                'lat': city.citylat,
                'lon': city.citylon
            },
            'attractions': data
        }
    except Exception as e:
        print(f"get_saved_trip_data error: {e}")
        raise Exception(f"get_saved_trip_data error: {e}")
