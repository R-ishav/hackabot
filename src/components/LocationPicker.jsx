import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Loader2, Navigation, Check, Building, Star } from 'lucide-react';

// Google Places API Key - Replace with your own key
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAmu3ZJ_L1nGU-RTz-3ryA9qSqLjggP0RE';

// Predefined KIIT Campus locations for quick selection (fallback when no API key)
const KIIT_LOCATIONS = [
  { name: "KIIT Campus 1", fullName: "KIIT Campus 1, Patia, Bhubaneswar", coordinates: [20.3563, 85.8143] },
  { name: "KIIT Campus 2", fullName: "KIIT Campus 2, Patia, Bhubaneswar", coordinates: [20.3551, 85.8148] },
  { name: "KIIT Campus 3", fullName: "KIIT Campus 3, Patia, Bhubaneswar", coordinates: [20.3538, 85.8155] },
  { name: "KIIT Campus 4", fullName: "KIIT Campus 4, Patia, Bhubaneswar", coordinates: [20.3525, 85.8162] },
  { name: "KIIT Campus 5", fullName: "KIIT Campus 5, Patia, Bhubaneswar", coordinates: [20.3512, 85.8175] },
  { name: "KIIT Campus 6", fullName: "KIIT Campus 6, Patia, Bhubaneswar", coordinates: [20.3535, 85.8195] },
  { name: "KIIT Campus 7", fullName: "KIIT Campus 7, Patia, Bhubaneswar", coordinates: [20.3548, 85.8188] },
  { name: "KIIT Campus 8", fullName: "KIIT Campus 8, Patia, Bhubaneswar", coordinates: [20.3565, 85.8178] },
  { name: "KIIT Campus 9", fullName: "KIIT Campus 9, Patia, Bhubaneswar", coordinates: [20.3578, 85.8165] },
  { name: "KIIT Campus 10", fullName: "KIIT Campus 10, Patia, Bhubaneswar", coordinates: [20.3588, 85.8152] },
  { name: "KIIT Campus 11", fullName: "KIIT Campus 11, Patia, Bhubaneswar", coordinates: [20.3595, 85.8140] },
  { name: "KIIT Campus 12", fullName: "KIIT Campus 12, Patia, Bhubaneswar", coordinates: [20.3518, 85.8205] },
  { name: "KIIT Campus 13 (Stadium)", fullName: "KIIT Campus 13 Stadium, Patia, Bhubaneswar", coordinates: [20.3505, 85.8218] },
  { name: "KIIT Campus 14", fullName: "KIIT Campus 14, Patia, Bhubaneswar", coordinates: [20.3492, 85.8225] },
  { name: "KIIT Campus 15", fullName: "KIIT Campus 15, Patia, Bhubaneswar", coordinates: [20.3480, 85.8232] },
  { name: "KIIT Auditorium", fullName: "KIIT Main Auditorium, Patia, Bhubaneswar", coordinates: [20.3545, 85.8170] },
  { name: "KIIT Convention Center", fullName: "KIIT Convention Center, Patia, Bhubaneswar", coordinates: [20.3558, 85.8158] },
  { name: "KIIT Food Court", fullName: "KIIT Food Court, Patia, Bhubaneswar", coordinates: [20.3540, 85.8182] },
  { name: "KIIT Library", fullName: "KIIT Central Library, Patia, Bhubaneswar", coordinates: [20.3552, 85.8175] },
  { name: "KISS Campus", fullName: "KISS Campus, Patia, Bhubaneswar", coordinates: [20.3498, 85.8135] },
];

export default function LocationPicker({ value, onChange, onCoordinatesChange }) {
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const searchTimeoutRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const mapDivRef = useRef(null);

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_API_KEY) {
      console.warn('No Google Maps API key provided. Using fallback search.');
      return;
    }

    if (window.google?.maps?.places) {
      setGoogleLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      setGoogleLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup not needed as Google Maps should persist
    };
  }, []);

  // Initialize services when modal opens and Google is loaded
  useEffect(() => {
    if (showMapSearch && googleLoaded && mapDivRef.current) {
      if (!autocompleteServiceRef.current) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }
      if (!placesServiceRef.current) {
        // Need a map or div for PlacesService
        placesServiceRef.current = new window.google.maps.places.PlacesService(mapDivRef.current);
      }
    }
  }, [showMapSearch, googleLoaded]);

  // Search using Google Places Autocomplete
  const searchWithGoogle = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // If Google not loaded or service not ready, use fallback
    if (!googleLoaded || !autocompleteServiceRef.current) {
      console.log('Google not ready, using Nominatim fallback');
      searchWithNominatim(query);
      return;
    }

    setIsSearching(true);
    
    try {
      const request = {
        input: query,
        componentRestrictions: { country: 'in' }
      };
      
      autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
        console.log('Google Places response:', status, predictions);
        
        if (status === 'OK' && predictions && predictions.length > 0) {
          const results = predictions.map(p => ({
            name: p.structured_formatting?.main_text || p.description.split(',')[0],
            fullName: p.description,
            placeId: p.place_id,
            coordinates: null
          }));
          setSearchResults(results);
          setIsSearching(false);
        } else {
          console.log('Google returned no results, falling back to Nominatim');
          searchWithNominatim(query);
        }
      });
    } catch (error) {
      console.error('Google Places error:', error);
      searchWithNominatim(query);
    }
  };

  // Fallback search using Nominatim (when no API key)
  const searchWithNominatim = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&viewbox=85.78,20.38,85.88,20.32&bounded=0`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await response.json();
      
      const results = data.map(item => ({
        name: item.display_name.split(',').slice(0, 2).join(', '),
        fullName: item.display_name,
        coordinates: [parseFloat(item.lat), parseFloat(item.lon)],
        placeId: null
      }));
      
      // Also add matching KIIT locations
      const matchingKiit = KIIT_LOCATIONS.filter(loc => 
        loc.name.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults([...matchingKiit, ...results]);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Debounced search - always use Nominatim, it's more reliable
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        // Use Nominatim - it works without API key issues
        searchWithNominatim(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, googleLoaded]);

  // Get place details (coordinates) from Google
  const getPlaceDetails = (placeId, callback) => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.getDetails(
      { placeId, fields: ['geometry', 'name', 'formatted_address'] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          callback({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          });
        } else {
          callback(null);
        }
      }
    );
  };

  // Handle location selection
  const handleSelectMapLocation = (location) => {
    if (location.placeId && !location.coordinates) {
      // Need to fetch coordinates from Google
      setIsSearching(true);
      getPlaceDetails(location.placeId, (coords) => {
        if (coords) {
          const updatedLocation = {
            ...location,
            coordinates: [coords.lat, coords.lng]
          };
          setSelectedMapLocation(updatedLocation);
          onCoordinatesChange(updatedLocation.coordinates);
        }
        setIsSearching(false);
      });
    } else if (location.coordinates) {
      setSelectedMapLocation(location);
      onCoordinatesChange(location.coordinates);
    }
  };

  // Confirm and close
  const handleConfirmLocation = () => {
    setShowMapSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Get map embed URL
  const getMapUrl = () => {
    if (selectedMapLocation?.coordinates) {
      const [lat, lng] = selectedMapLocation.coordinates;
      return `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`;
    }
    return `https://www.google.com/maps?q=20.3548,85.8169&z=14&output=embed`;
  };

  return (
    <div className="space-y-3">
      {/* Venue Name Input */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          Venue Name (shown on event card)
        </label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Main Auditorium, Convention Center, etc."
          className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Map Location Picker Button */}
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          Map Location (for navigation)
        </label>
        <button
          type="button"
          onClick={() => setShowMapSearch(true)}
          className={`w-full p-2.5 border rounded-lg flex items-center gap-2 transition-all ${
            selectedMapLocation 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400' 
              : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:border-indigo-400'
          }`}
        >
          {selectedMapLocation ? (
            <>
              <Check className="h-4 w-4" />
              <span className="flex-1 text-left truncate">{selectedMapLocation.name}</span>
              <Navigation className="h-4 w-4" />
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 text-indigo-500" />
              <span className="flex-1 text-left">Click to search & pin location on map</span>
              <Search className="h-4 w-4 text-slate-400" />
            </>
          )}
        </button>
      </div>

      {/* Hidden div for PlacesService */}
      <div ref={mapDivRef} style={{ display: 'none' }} />

      {/* Map Search Modal */}
      {showMapSearch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-500" />
                Search Location on Map
              </h3>
              <button
                type="button"
                onClick={() => setShowMapSearch(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any place... (restaurants, shops, landmarks, addresses)"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {GOOGLE_API_KEY ? (
                  <>Powered by Google Places - search any location worldwide</>
                ) : (
                  <>⚠️ No Google API key - using limited search. Add VITE_GOOGLE_MAPS_API_KEY for full search.</>
                )}
              </p>
            </div>

            {/* Content: Search Results + Map */}
            <div className="flex-1 flex overflow-hidden" style={{ minHeight: '350px' }}>
              {/* Search Results */}
              <div className="w-1/2 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
                {isSearching ? (
                  <div className="p-6 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <span className="text-sm">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {searchResults.map((location, index) => (
                      <button
                        key={location.placeId || index}
                        type="button"
                        onClick={() => handleSelectMapLocation(location)}
                        className={`w-full p-3 text-left hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-start gap-3 transition-colors ${
                          selectedMapLocation?.fullName === location.fullName 
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 border-l-4 border-indigo-500' 
                            : ''
                        }`}
                      >
                        <MapPin className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          selectedMapLocation?.fullName === location.fullName ? 'text-indigo-600' : 'text-slate-400'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {location.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {location.fullName}
                          </p>
                        </div>
                        {selectedMapLocation?.fullName === location.fullName && (
                          <Check className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="p-6 text-center text-slate-400">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No locations found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="overflow-y-auto">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
                      <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                        <Star className="h-3 w-3" /> Quick Select - KIIT Campus
                      </p>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {KIIT_LOCATIONS.slice(0, 10).map((location, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectMapLocation(location)}
                          className={`w-full p-3 text-left hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-start gap-3 transition-colors ${
                            selectedMapLocation?.fullName === location.fullName 
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 border-l-4 border-indigo-500' 
                              : ''
                          }`}
                        >
                          <Building className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                            selectedMapLocation?.fullName === location.fullName ? 'text-indigo-600' : 'text-indigo-400'
                          }`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {location.name}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 text-center">
                      <p className="text-xs text-slate-400">Or search for any location above ↑</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Preview */}
              <div className="w-1/2 flex flex-col">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 text-center border-b border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedMapLocation ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        📍 {selectedMapLocation.name}
                      </span>
                    ) : (
                      'Select a location from search results'
                    )}
                  </p>
                </div>
                <div className="flex-1">
                  <iframe
                    title="Location Map"
                    src={getMapUrl()}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '300px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-500">
                {selectedMapLocation?.coordinates ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ [{selectedMapLocation.coordinates[0].toFixed(5)}, {selectedMapLocation.coordinates[1].toFixed(5)}]
                  </span>
                ) : (
                  <span>No location selected</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMapSearch(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLocation}
                  disabled={!selectedMapLocation?.coordinates}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                    selectedMapLocation?.coordinates
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
