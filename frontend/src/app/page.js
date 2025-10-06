'use client';
import { useState, useEffect } from "react";
import AQIDashboard from './components/AQIDashboard';

let aqi_level = {
  level : "Good",
  colour : "lime"
};

function getAQILevel(aqi) {
  if(aqi < 51) {
    aqi_level.level = "Good";
    aqi_level.colour = "lime";
  } else if(aqi < 101) {
    aqi_level.level = "Moderate";
    aqi_level.colour = "yellow";
  } else if(aqi < 151) {
    aqi_level.level = "Unhealthy for sensitive groups";
    aqi_level.colour = "darkorange";
  } else if(aqi < 201) {
    aqi_level.level = "Unhealthy";
    aqi_level.colour = "red";
  } else if(aqi < 301) {
    aqi_level.level = "Very unhealthy";
    aqi_level.colour = "crimson";
  } else {
    aqi_level.level = "Hazardous";
    aqi_level.colour = "maroon";
  }
}

// API component
function API() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/aqi/victoria")
      .then((res) => res.json())
      .then((data) => setData(data.aqi))
      .catch((err) => console.error(err));
  }, []);

  return <div>{data ? "AQI: "+ data : "Loading..."}</div>;
}

function getAQI(){
  data = fetch("http://localhost:8000/aqi/victoria")
      .then((res) => res.json())
      .then((data) => setData(data.aqi))
  return data
}

export default function Home() {

  const [aqi, setAqi] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/aqi/victoria")
      .then((res) => res.json())
      .then((data) => setAqi(data.aqi))
      .catch((err) => console.error(err));
  }, []);

  if (!aqi) return <div>Loading...</div>;

  const aqiInfo = getAQILevel(aqi);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div><AQIDashboard /></div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        Built with open source data at the NASA Space Apps Challenge 2025
      </footer>
    </div>
  );
}
