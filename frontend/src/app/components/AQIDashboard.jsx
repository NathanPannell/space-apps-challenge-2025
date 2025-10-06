import { useState, useEffect, useRef } from 'react';

function getAQILevel(aqi) {
  if(aqi < 51) {
    return { level: "Good", colour: "#00ff00" };
  } else if(aqi < 101) {
    return { level: "Moderate", colour: "#ffff00" };
  } else if(aqi < 151) {
    return { level: "Unhealthy for sensitive groups", colour: "#ff8c00" };
  } else if(aqi < 201) {
    return { level: "Unhealthy", colour: "#ff0000" };
  } else if(aqi < 301) {
    return { level: "Very unhealthy", colour: "#dc143c" };
  } else {
    return { level: "Hazardous", colour: "#800000" };
  }
}

export default function Home() {
  const [aqi, setAqi] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8000/aqi/victoria")
      .then((res) => res.json())
      .then((data) => {
        setAqi(data.aqi);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Only initialize map once
    if (!mapRef.current || mapInstanceRef.current) return;

    // Load Leaflet CSS and JS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    
    script.onload = () => {
      const L = window.L;
      
      // Victoria coordinates
      const victoria = [48.4284, -123.3656];
      
      // Initialize map
      const map = L.map(mapRef.current).setView(victoria, 12);
      mapInstanceRef.current = map;
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      
      // Create custom marker
      if (aqi !== null) {
        const aqiInfo = getAQILevel(aqi);
        
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              background-color: ${aqiInfo.colour};
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 12px;
              color: ${aqi > 150 ? 'white' : 'black'};
            ">
              ${Math.round(aqi)}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        
        markerRef.current = L.marker(victoria, { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center;">
              <strong>Victoria, BC</strong><br/>
              <span style="color: ${aqiInfo.colour}; font-size: 24px; font-weight: bold;">
                ${Math.round(aqi)}
              </span><br/>
              <span style="color: ${aqiInfo.colour}; font-weight: bold;">
                ${aqiInfo.level}
              </span>
            </div>
          `)
          .openPopup();
      }
    };
    
    document.body.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [aqi]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AQI data...</p>
        </div>
      </div>
    );
  }

  if (!aqi) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Failed to load AQI data</p>
      </div>
    );
  }

  const aqiInfo = getAQILevel(aqi);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Air Quality Monitor - Victoria, BC
          </h1>
          
          <div className="flex items-center gap-6 mb-4">
            <div 
              style={{ 
                width: '100px', 
                height: '60px', 
                backgroundColor: aqiInfo.colour,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: aqi > 150 ? 'white' : 'black'
              }}
            >
              {Math.round(aqi)}
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: aqiInfo.colour }}>
                {aqiInfo.level}
              </p>
              <p className="text-gray-600">Current Air Quality Index</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div 
            ref={mapRef} 
            style={{ 
              width: '100%', 
              height: '500px' 
            }}
          />
        </div>

        <footer className="text-center text-gray-600 text-sm mt-6">
          Built with open source data at the NASA Space Apps Challenge 2025
        </footer>
      </div>
    </div>
  );
}
