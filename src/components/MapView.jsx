import React, { useState, useEffect } from 'react';
import { X, Navigation, Calendar, Clock, MapPin, ExternalLink, RefreshCw } from 'lucide-react';

// KIIT University center coordinates
const KIIT_CENTER = [20.3548, 85.8169];

export default function MapView({ isOpen, onClose, events = [], onRefresh }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  if (!isOpen) return null;

  // Debug: log events received
  console.log('MapView - All events received:', events);
  console.log('MapView - Events with coordinates:', events.filter(e => e.coordinates));

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
  };

  // Generate Google Maps embed URL
  const getMapUrl = () => {
    if (selectedEvent && selectedEvent.coordinates) {
      const [lat, lng] = selectedEvent.coordinates;
      return `https://www.google.com/maps?q=${lat},${lng}&z=18&output=embed`;
    }
    // Default KIIT campus view
    return `https://www.google.com/maps?q=${KIIT_CENTER[0]},${KIIT_CENTER[1]}&z=16&output=embed`;
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

        {/* Google Maps Embed */}
        <iframe
          key={selectedEvent ? (selectedEvent._id || selectedEvent.id) : 'default'}
          title="Campus Event Map"
          src={getMapUrl()}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* Selected Event Card Overlay */}
        {selectedEvent && (
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 max-w-md">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white">{selectedEvent.title}</h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">{selectedEvent.society}</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {selectedEvent.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {selectedEvent.time}
              </span>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {selectedEvent.venue}
            </p>
            <button
              onClick={() => handleNavigate(selectedEvent.coordinates, selectedEvent.venue)}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg font-medium text-sm transition-colors"
            >
              <Navigation className="h-4 w-4" />
              Get Directions
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
