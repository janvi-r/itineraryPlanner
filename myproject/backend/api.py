from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from scrape import get_attractions  # Django-dependent function
from cityVerifier import find_closest_city


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
