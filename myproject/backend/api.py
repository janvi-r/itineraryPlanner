from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from scrape import get_attractions  # Django-dependent function
from cityVerifier import find_closest_city
from pydantic import BaseModel
from typing import List
app = FastAPI()

# CORS setup (same)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Be strict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

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

