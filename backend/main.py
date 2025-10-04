from fastapi import FastAPI
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Access the API key using os.getenv()
api_key = os.getenv("OPENAQ_API")

app = FastAPI(title="Air Quality API")

OPENAQ_URL = "https://api.openaq.org/v2/latest"

@app.get("/")
def read_root():
    return {"message": f"Hello World, apikey: {api_key}"}

@app.get("/aqi/current")
def get_aqi(lat: float, lon: float):
    params = {"coordinates": f"{lat},{lon}", "radius": 5000, "limit": 1}
    r = requests.get(OPENAQ_URL, params=params)
    data = r.json()





