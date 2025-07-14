# from django.shortcuts import render
# from django.http import JsonResponse
# from myproject.backend.models import City, Attraction
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
#
#
