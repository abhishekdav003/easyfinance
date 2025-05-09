import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, Navigation, RefreshCw, ExternalLink } from "lucide-react";

// Fix default marker icon (Leaflet quirk)
delete L.Icon.Default.prototype._getIconUrl;

// Custom location marker icon
const locationIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMjU2M0VCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9ImZlYXRoZXIgZmVhdGhlci1tYXAtcGluIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOS02LTktMTNhOSA5IDAgMCAxIDE4IDB6Ij48L3BhdGg+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIgZmlsbD0iIzI1NjNFQiI+PC9jaXJjbGU+PC9zdmc+",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const LocationDisplay = ({ location }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center justify-center h-96">
        <RefreshCw className="animate-spin text-blue-600 dark:text-blue-400 mb-3" size={32} />
        <p className="text-gray-700 dark:text-gray-300">Loading location data...</p>
      </div>
    );
  }

  if (!location?.lat || !location?.lng) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center flex-col gap-3 h-64">
          <div className="rounded-full bg-red-100 dark:bg-red-900 p-3">
            <MapPin className="text-red-500 dark:text-red-300" size={24} />
          </div>
          <h3 className="text-lg font-medium text-red-500 dark:text-red-300">Location Not Available</h3>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            We couldn't access your location information. Please check your permissions and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-blue-600">
        <div className="flex items-center">
          <Navigation className="text-white mr-3" size={24} />
          <h2 className="text-xl font-semibold text-white">
            Your Location
          </h2>
        </div>
      </div>
      
      <div className="relative" style={{ height: "380px", width: "100%" }}>
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={[location.lat, location.lng]}
            radius={100}
            pathOptions={{ fillColor: '#2563eb', fillOpacity: 0.1, color: '#2563eb', weight: 1 }}
          />
          <Marker position={[location.lat, location.lng]} icon={locationIcon}>
            <Popup className="custom-popup">
              <div className="font-medium">{location.address || "Your current location"}</div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      <div className="p-4 bg-gray-900 text-white">
        <div className="flex items-center">
          <MapPin className="text-blue-400 mr-2 flex-shrink-0" size={18} />
          <h3 className="font-medium">Lat: {location.lat.toFixed(7)}, Lng: {location.lng.toFixed(7)}</h3>
        </div>
        
        <div className="text-sm text-gray-400 mt-1">
          <span>Lat: {location.lat.toFixed(6)} • Lng: {location.lng.toFixed(6)}</span>
        </div>
        
        <div className="mt-4 flex justify-between items-center pt-2 border-t border-gray-700">
          <a
            href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            Open in Google Maps
            <ExternalLink size={14} className="ml-1" />
          </a>
          
          <button
            onClick={() => alert("Directions functionality would go here")}
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Get Directions
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationDisplay;