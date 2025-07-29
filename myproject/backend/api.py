from fastapi.middleware.cors import CORSMiddleware
from scrape import get_attractions  # Django-dependent function
from cityVerifier import find_closest_city
from typing import List
from backend.models import UserProfile  # or wherever your UserProfile is
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from django.contrib.auth.models import User
from fastapi.concurrency import run_in_threadpool
from fastapi import FastAPI
from django.contrib.auth import authenticate
from datetime import date  # ✅ Needed for date parsing
from backend.utils import save_daywise_trip

app = FastAPI()

# CORS setup (same)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Be strict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    first_name: str
    last_name: str
    birthday: date

class LoginData(BaseModel):
    username: str
    password: str

@app.post("/api/login/")
async def login(data: LoginData):
    def auth_user():
        user = authenticate(username=data.username, password=data.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid username or password")
        # 🔧 Return token (mocked for now)
        return {
            "username": user.username,
            "token": f"mock-token-for-{user.username}"
        }

    return await run_in_threadpool(auth_user)


@app.post("/api/register/")
async def register_user(user: UserCreate):
    def create_user():
        user_obj = User.objects.create_user(
            username=user.username,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            password=user.password,
        )
        UserProfile.objects.create(user=user_obj, birthday=user.birthday)
        return user_obj  # make sure this is here

    user_obj = await run_in_threadpool(create_user)  # get user_obj here
    return {"message": f"User {user_obj.username} created successfully"}

@app.get("/attractions/")
async def attractions(city: str):
    try:
        # Run Django ORM call in a thread-safe way
        data = await run_in_threadpool(get_attractions, city)
        if data is None:
            raise HTTPException(status_code=404, detail="No attractions found.")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching attractions: {str(e)}")

@app.get("/cityVerifier/")
async def cityVerifier(city: str):
    try:
        cityMatch = await run_in_threadpool(find_closest_city, city)
        if cityMatch is None:
            raise HTTPException(status_code=404, detail="No city found.")
        return {"match": cityMatch}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching city: {str(e)}")

@app.get("/api/city/{city_name}/")
async def get_city(city_name: str):
    try:
        # Use Django ORM wrapped in threadpool
        attractions_data = await run_in_threadpool(get_attractions, city_name)

        if not attractions_data:
            raise HTTPException(status_code=404, detail="City or attractions not found.")

        # Assuming get_attractions returns list of attractions with city info inside first item
        # You might want to structure it properly here:
        city_info = {
            "name": city_name,
            "lat": attractions_data[0].get('city_lat', None),
            "lon": attractions_data[0].get('city_lon', None),
        }

        return {
            "city": city_info,
            "attractions": attractions_data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching city info: {str(e)}")



class TripSubmission(BaseModel):
    username: str
    city: str
    attractions: List[str]  # List of attraction names

from fastapi import APIRouter, Request
from backend.utils import save_trip_logic

@app.post("/api/save_trip/")
async def save_trip(request: Request):
    data = await request.json()
    trip = await save_trip_logic(data['username'], data['city'], data['attractions'])
    return {"status": "success", "trip_id": trip.id}


from backend.utils import get_saved_trip_data
@app.get("/api/saved_trip_attractions/{city_name}/{username}/")
async def saved_trip_attractions(city_name: str, username: str):
    print(f"Received request for city: {city_name}, user: {username}")
    try:
        data = await get_saved_trip_data(username, city_name)
        print(f"Returning data for user '{username}' and city '{city_name}': {data}")
        return data
    except Exception as e:
        print(f"Error in saved_trip_attractions: {e}")
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/save_daywise_trip/")
async def save_daywise_trip_endpoint(request: Request):
    data = await request.json()
    username = data["username"]
    city = data["city"]
    itinerary = data["itinerary"]

    await save_daywise_trip(username, city, itinerary)
    return {"status": "success"}


from fastapi import HTTPException

@app.get("/api/user_trips/{username}")
async def get_user_trips(username: str):
    from backend.models import PastTrips, User
    from asgiref.sync import sync_to_async

    try:
        user = await sync_to_async(User.objects.get)(username=username)
        trips = await sync_to_async(list)(PastTrips.objects.filter(user=user))

        results = []
        for trip in trips:
            results.append({
                "id": trip.id,
                "city": trip.city.name,
                "itinerary": trip.itinerary,  # assuming JSONField storing the itinerary
            })
        return results

    except User.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



