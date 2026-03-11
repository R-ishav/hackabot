import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Navigation, Calendar, Clock, MapPin, ExternalLink, RefreshCw } from 'lucide-react';

// KIIT University center coordinates
const KIIT_CENTER = { lat: 20.3548, lng: 85.8169 };
const GOOGLE_API_KEY = 'AIzaSyAmu3ZJ_L1nGU-RTz-3ryA9qSqLjggP0RE';

export default function MapView({ isOpen, onClose, events = [], onRefresh }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowsRef = useRef([]);

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => setMapLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map
  const initMap = useCallback(() => {
    if (!mapRef.current || !window.google || mapInstanceRef.current) return;

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: KIIT_CENTER,
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });
  }, []);

  // Create markers for events
  const createMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    infoWindowsRef.current.forEach(iw => iw.close());
    infoWindowsRef.current = [];

    const eventsWithLocation = events.filter(
      e => e.coordinates && Array.isArray(e.coordinates) && e.coordinates.length === 2
    );

    eventsWithLocation.forEach((event) => {
      const [lat, lng] = event.coordinates;
      
      // Create custom marker
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: event.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#4F46E5',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        animation: window.google.maps.Animation.DROP,
      });

      // Create InfoWindow with event details (floating tile)
      const infoContent = `
        <div style="
          min-width: 220px;
          max-width: 280px;
          padding: 12px;
          font-family: 'Inter', -apple-system, sans-serif;
        ">
          <h3 style="
            margin: 0 0 6px 0;
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.3;
          ">${event.title}</h3>
          <p style="
            margin: 0 0 8px 0;
            font-size: 13px;
            color: #4F46E5;
            font-weight: 600;
          ">${event.society}</p>
          <div style="
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 6px;
          ">
            <span>📅 ${event.date}</span>
            <span>🕐 ${event.time}</span>
          </div>
          <p style="
            margin: 0 0 10px 0;
            font-size: 12px;
            color: #94a3b8;
          ">📍 ${event.venue}</p>
          <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}', '_blank')" style="
            width: 100%;
            background: #4F46E5;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          ">
            🧭 Get Directions
          </button>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
        pixelOffset: new window.google.maps.Size(0, -5),
      });

      // Show InfoWindow on marker click
      marker.addListener('click', () => {
        // Close all other InfoWindows
        infoWindowsRef.current.forEach(iw => iw.close());
        infoWindow.open(mapInstanceRef.current, marker);
        setSelectedEvent(event);
        
        // Pan to marker
        mapInstanceRef.current.panTo({ lat, lng });
      });

      // Show mini tooltip on hover
      marker.addListener('mouseover', () => {
        if (!infoWindow.getMap()) {
          // Only show if not already open
          const hoverContent = `
            <div style="padding: 8px; font-family: sans-serif;">
              <strong style="font-size: 14px; color: #1e293b;">${event.title}</strong>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #4F46E5;">${event.society}</p>
            </div>
          `;
          const hoverWindow = new window.google.maps.InfoWindow({
            content: hoverContent,
          });
          hoverWindow.open(mapInstanceRef.current, marker);
          
          marker.addListener('mouseout', () => {
            hoverWindow.close();
          });
        }
      });

      markersRef.current.push(marker);
      infoWindowsRef.current.push(infoWindow);
    });

    // Fit bounds to show all markers
    if (eventsWithLocation.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      eventsWithLocation.forEach(event => {
        bounds.extend({ lat: event.coordinates[0], lng: event.coordinates[1] });
      });
      mapInstanceRef.current.fitBounds(bounds);
      
      // Don't zoom in too much
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'idle', () => {
        if (mapInstanceRef.current.getZoom() > 17) {
          mapInstanceRef.current.setZoom(17);
        }
        window.google.maps.event.removeListener(listener);
      });
    }
  }, [events]);

  // Initialize map when loaded
  useEffect(() => {
    if (mapLoaded && isOpen) {
      initMap();
    }
  }, [mapLoaded, isOpen, initMap]);

  // Create markers when events change
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      createMarkers();
    }
  }, [mapLoaded, events, createMarkers]);

  // Refresh events when map opens
  useEffect(() => {
    const doRefresh = async () => {
      if (onRefresh) {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
      }
    };
    if (isOpen) {
      doRefresh();
    }
  }, [isOpen, onRefresh]);

  // Clean up on close
  useEffect(() => {
    if (!isOpen) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      infoWindowsRef.current = [];
      mapInstanceRef.current = null;
    }
  }, [isOpen]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  if (!isOpen) return null;

  // Filter events that have coordinates
  const eventsWithLocation = events.filter(e => e.coordinates && Array.isArray(e.coordinates) && e.coordinates.length === 2);

  // Handle navigation - opens Google Maps directions
  const handleNavigate = (coordinates, venueName) => {
    const [lat, lng] = coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  // Handle event selection from sidebar
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    
    // Pan to marker and open InfoWindow
    if (mapInstanceRef.current && event.coordinates) {
      const [lat, lng] = event.coordinates;
      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(17);
      
      // Find and click the marker
      const markerIndex = eventsWithLocation.findIndex(
        e => (e._id || e.id) === (event._id || event.id)
      );
      if (markerIndex !== -1 && markersRef.current[markerIndex]) {
        window.google.maps.event.trigger(markersRef.current[markerIndex], 'click');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black bg-opacity-50">
      {/* Event List Sidebar */}
      <div className="w-80 bg-white dark:bg-slate-800 shadow-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-500" />
            Campus Events
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Refresh events"
            >
              <RefreshCw className={`h-4 w-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full">
              {eventsWithLocation.length} events
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {eventsWithLocation.length > 0 ? (
            eventsWithLocation.map((event) => {
              const eventId = event._id || event.id;
              return (
                <button
                  key={eventId}
                  onClick={() => handleEventClick(event)}
                  className={`w-full p-4 text-left border-b border-slate-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors ${
                    selectedEvent && (selectedEvent._id || selectedEvent.id) === eventId
                      ? 'bg-indigo-50 dark:bg-slate-700 border-l-4 border-l-indigo-500'
                      : ''
                  }`}
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{event.title}</h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">{event.society}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.venue}
                  </p>
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-slate-400">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No events with location data</p>
              <p className="text-xs mt-2">Events will appear here when admins add venue locations</p>
              <p className="text-xs mt-2 text-indigo-400">Total events received: {events.length}</p>
              {events.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-xs font-bold mb-2">Debug - All events:</p>
                  {events.slice(0, 5).map((e, i) => (
                    <p key={i} className="text-xs truncate">
                      {e.title}: {e.coordinates ? `[${e.coordinates.join(', ')}]` : 'no coords'}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="h-5 w-5 text-slate-600 dark:text-white" />
        </button>

        {/* Google Maps Container */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Loading State */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400">Loading map...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
    </div>
  );
}
