from fastapi import FastAPI
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import requests
import pandas as pd
import numpy as np
from AQIPython import calculate_aqi
from AQIPython.errorCustom import UnknownPollutantError

VICTORIA_COORDINATES = (48.441942, -123.363165)
API_KEY = os.getenv("OPENAQ_API")
UNITS_MAP = {
    "µg/m³": "ug/m3",
    "mg/m³": "mg/m3",
    "ppm": "ppm"
}

load_dotenv()

app = FastAPI(title="Air Quality API")

OPENAQ_URL = "https://api.openaq.org/v2/latest"

@app.get("/")
def read_root():
    return {"message": f"Hello World, apikey: {API_KEY}"}

@app.get("/aqi/victoria")
def get_aqi_victoria():
    locations = get_locations(VICTORIA_COORDINATES[0], VICTORIA_COORDINATES[1], 10000)
    monitors = locations[locations["isMonitor"]]
    nearest_monitor = monitors[monitors['distance'] == monitors['distance'].min()]
    nearest_monitor_id = nearest_monitor.iloc[0].id
    sensors = get_sensors(nearest_monitor_id)
    aqis = []
    for index, sensor in sensors.iterrows():
        sensor_id = sensor.id
        parameter = sensor.parameter.get('name').upper()
        units = UNITS_MAP.get(sensor.parameter.get("units"))
        print(f'Id: {sensor_id}, Parameter: {parameter}, Units: {units}')

        readings = get_current_readings(sensor_id)

        if len(readings) > 0:
            mean_reading = np.mean(readings.get("value"))
            try:
                aqi = calculate_aqi("IN", parameter, mean_reading, units)
                aqis.append(aqi)
                print(f'Mean reading: {mean_reading}, AQI: {aqi}')
            except UnknownPollutantError:
                print(f"Unknown pollutant '{parameter}'.")

        else:
            print(f'No readings found.')

    return np.max(aqis)

@app.get("/aqi/current")
def get_aqi(lat: float, lon: float):

    # Start with coordinates
    # Find the nearest monitor
    locations = get_locations(VICTORIA_COORDINATES[0], VICTORIA_COORDINATES[1], 10000)
    monitors = locations[locations["isMonitor"]]
    nearest_monitor = monitors[monitors['distance'] == monitors['distance'].min()]
    nearest_monitor_id = nearest_monitor.iloc[0].id

    # Get a sensor from that monitor
    sensors = get_sensors(nearest_monitor_id)

    # Select an arbitrary sensor id
    sensor_id = sensors.loc[0].id
    readings = get_current_readings(sensor_id)


    # results = []
    # for r in readings:
    #     o3_ppm = r["value"]
    #     aqi = calculate_ozone_aqi(o3_ppm)
    #     results.append({
    #         "timestamp": r["period"]["datetimeFrom"]["utc"],
    #         "ozone_ppm": o3_ppm,
    #         "ozone_ppb": o3_ppm * 1000,
    #         "aqi": aqi
    #     })
    #
    # return {"aqi_data": results}
    return {"readings": readings.to_dict(orient="records")}






# OpenAQ functions

def get_locations(latitude, longitude, radius):
    response = requests.get(
        "https://api.openaq.org/v3/locations",
        {
            "coordinates": f"{latitude},{longitude}",
            "radius": radius,
            "limit": 1000
        },
        headers={"x-api-key": API_KEY}
    )
    return pd.DataFrame(response.json().get("results"))

def get_sensors(location_id):
    response = requests.get(
        f"https://api.openaq.org/v3/locations/{location_id}/sensors",
        headers={"x-api-key": API_KEY}
    )
    return pd.DataFrame(response.json().get("results"))

def get_readings(sensor_id, datetime_from, datetime_to):
    response = requests.get(
        f"https://api.openaq.org/v3/sensors/{sensor_id}/measurements/hourly",
        params={"datetime_from": datetime_from, "datetime_to": datetime_to},
        headers={"x-api-key": API_KEY}
    )
    return pd.DataFrame(response.json().get("results"))

def get_current_readings(sensor_id):
    response = requests.get(
        f"https://api.openaq.org/v3/sensors/{sensor_id}/measurements/hourly",
        params={"datetime_from": datetime.now() - timedelta(days=1), "datetime_to": datetime.now()},
        headers={"x-api-key": API_KEY}
    )
    return pd.DataFrame(response.json().get("results"))


