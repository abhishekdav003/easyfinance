import React, { useState, useEffect } from "react";
import { Map, Navigation, Loader2, AlertCircle } from "lucide-react";

const LocationDisplay = ({ onLocationFetched }) => {
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [location, setLocation] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    // Reset states
    setGettingLocation(true);
    setLocationError(null);
    
    // Set a backup timeout in case the geolocation API doesn't respond properly
    const timeoutId = setTimeout(() => {
      if (gettingLocation) {
        setLocationError("Location request timed out. Please try again.");
        setGettingLocation(false);
      }
    }, 15000); // 15 seconds backup timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const address = `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`;
        const coordinates = [coords.lng, coords.lat];

        const locationData = {
          address,
          coordinates,
        };

        setLocation(locationData);
        if (typeof onLocationFetched === 'function') {
          onLocationFetched(locationData);
        }
        setGettingLocation(false);
      },
      (err) => {
        clearTimeout(timeoutId);
        
        // More user-friendly error messages
        let errorMessage;
        switch(err.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Location access denied. Please enable location permissions in your browser settings.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Your location information is unavailable. Please check your device's GPS.";
            break;
          case 3: // TIMEOUT
            errorMessage = "Location request timed out. Please try again.";
            break;
          default:
            errorMessage = `Error getting location: ${err.message}`;
        }
        
        setLocationError(errorMessage);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Show status/help message when appropriate
  const [showHelp, setShowHelp] = useState(false);
  
  useEffect(() => {
    // Display help message after 5 seconds of loading with no error
    let helpTimer;
    if (gettingLocation && !locationError) {
      helpTimer = setTimeout(() => {
        setShowHelp(true);
      }, 5000);
    } else {
      setShowHelp(false);
    }
    
    return () => {
      clearTimeout(helpTimer);
    };
  }, [gettingLocation, locationError]);
  
  return (
    <div className="w-full max-w-md mx-auto rounded-xl shadow-lg overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Navigation className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Location Finder</h2>
        </div>
        
        <button
          onClick={getLocation}
          disabled={gettingLocation}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-300 ${
            gettingLocation
              ? "bg-blue-400 dark:bg-blue-700 cursor-wait"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-md"
          } text-white font-medium`}
        >
          {gettingLocation ? (
            <>
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
              <span>Locating you...</span>
            </>
          ) : (
            <>
              <Map className="mr-2 h-5 w-5" />
              <span>Get Current Location</span>
            </>
          )}
        </button>

        {showHelp && gettingLocation && !locationError && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-700 dark:text-yellow-400 text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-1 flex-shrink-0" />
              Make sure you've allowed location access in your browser. Check for permission prompts or browser settings.
            </p>
          </div>
        )}
        
        {locationError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm flex items-start">
              <AlertCircle className="h-5 w-5 mr-1 flex-shrink-0" />
              {locationError}
            </p>
          </div>
        )}

        {location && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
            <div className="flex items-start">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg mr-3">
                <Navigation className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Your Location</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{location.address}</p>
                <a
                  href={`https://www.google.com/maps?q=${location.coordinates[1]},${location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  <Map className="h-4 w-4 mr-1" />
                  View on Google Maps
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDisplay;