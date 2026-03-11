import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X, Loader2, Navigation, Check } from 'lucide-react';

export default function LocationPicker({ value, onChange, onCoordinatesChange }) {
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Search for locations using OpenStreetMap Nominatim API - NO location bias, worldwide search
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          }
        }
      );
      const data = await response.json();
      
      const results = data.map(item => ({
        name: item.display_name.split(',').slice(0, 2).join(', '),
        fullName: item.display_name,
        coordinates: [parseFloat(item.lat), parseFloat(item.lon)],
        type: item.type
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(searchQuery);
      }, 400);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle map location selection
  const handleSelectMapLocation = (location) => {
    setSelectedMapLocation(location);
    onCoordinatesChange(location.coordinates);
    console.log('LocationPicker - Map location selected:', location);
    console.log('LocationPicker - Coordinates:', location.coordinates);
  };

  // Confirm and close map search
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
      {/* Venue Name Input - What displays on the event tile */}
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

      {/* Map Location Picker */}
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
                  placeholder="Search any place worldwide... (city, restaurant, landmark, address)"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-slate-900 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Type at least 3 characters. Search works worldwide - try any address, landmark, or business name.
              </p>
            </div>

            {/* Content: Search Results + Map */}
            <div className="flex-1 flex overflow-hidden">
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
                        key={index}
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
                ) : searchQuery.length >= 3 ? (
                  <div className="p-6 text-center text-slate-400">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No locations found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">Search for a location</p>
                    <p className="text-xs mt-1">Results will appear here</p>
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
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="text-sm text-slate-500">
                {selectedMapLocation ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ Location selected: [{selectedMapLocation.coordinates[0].toFixed(4)}, {selectedMapLocation.coordinates[1].toFixed(4)}]
                  </span>
                ) : (
                  <span>No location selected yet</span>
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
                  disabled={!selectedMapLocation}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
                    selectedMapLocation 
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
