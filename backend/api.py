from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scrape import get_attractions  # import your function here

app = FastAPI()

# Allow React Native app to access API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/attractions/")
async def attractions(city: str):
    data = get_attractions(city)
    return data


