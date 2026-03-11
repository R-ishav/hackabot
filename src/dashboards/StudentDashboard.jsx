import { useEffect } from 'react';
import React, { useState, useMemo } from 'react';
import { Filter, Search, Grid, Calendar as CalendarIcon, Trophy, MapPin } from 'lucide-react';
import { CATEGORIES, LEVEL_THRESHOLDS } from '../data/constants';
import EventCard from '../components/EventCard';
import CalendarView from '../components/CalendarView';
import TicketModal from '../components/TicketModal';
import PosterModal from '../components/PosterModal';
import MapView from '../components/MapView';

// KIIT University center
const KIIT_CENTER = [20.3548, 85.8169];


export default function StudentDashboard({ user = { xp: 0 }, events = [], registrations = {}, onRegisterInterest, onAddComment, onRefreshEvents }) {
  const [mapOpen, setMapOpen] = useState(false);
  useEffect(() => {
    document.title = 'UniVent';
  }, []);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [ticketData, setTicketData] = useState(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  // Poster modal state
  const [posterUrl, setPosterUrl] = useState(null);
  const [locallyJoined, setLocallyJoined] = useState([]);
  const getUserId = (u) => u?._id || u?.id;
  const getEventId = (e) => e?._id || e?.id;
  const handleJoinInteraction = async (eventId, eventTitle) => {
    try {
      const registration = await onRegisterInterest(eventId);
      if (registration) {
        setTicketData(registration);
        setSelectedEventTitle(eventTitle);
      }
      setLocallyJoined((prev) => [...new Set([...prev, eventId])]);
    } catch (error) {
      console.error("Failed to join event:", error);
    }
  };
  const handleShowTicket = (registration, eventTitle) => {
    setTicketData(registration);
    setSelectedEventTitle(eventTitle);
  };
  const filteredEvents = useMemo(() => {
    const currentUserId = getUserId(user);
    if (selectedCategory === 'Registered') {
      return events.filter(event => {
        const eventId = getEventId(event);
        const hasLocal = locallyJoined.includes(eventId);
        const hasServerReg = Boolean(registrations && registrations[eventId]);
        const hasRegistrantList = event.registrants?.some(r => String(r.id || r._id) === String(currentUserId));
        return hasLocal || hasServerReg || hasRegistrantList;
      }).filter(event => {
        const societyMatch = event.society ? event.society.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const titleMatch = event.title ? event.title.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        return titleMatch || societyMatch;
      });
    }
    return events.filter(event => {
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      const societyMatch = event.society ? event.society.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const titleMatch = event.title ? event.title.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      return matchesCategory && (titleMatch || societyMatch);
    });
  }, [events, selectedCategory, searchQuery, registrations, locallyJoined, user]);
  const currentLevel = useMemo(() => {
    return LEVEL_THRESHOLDS.findIndex(threshold => user.xp < threshold) || LEVEL_THRESHOLDS.length;
  }, [user.xp]);
  const xpProgress = useMemo(() => {
     const prevThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
     const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || 3000;
     return ((user.xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
  }, [user.xp, currentLevel]);

  return (
    <>
      <MapView isOpen={mapOpen} onClose={() => setMapOpen(false)} events={events} onRefresh={onRefreshEvents} />
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 to-slate-900 bg-fixed px-4 sm:px-6 lg:px-8 py-10 animate-fadein">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <button onClick={() => setMapOpen(true)} className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 transition flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            View Events on Map
          </button>
        </div>
        {/* XP Bar */}
        <div className="bg-gradient-to-r from-indigo-800 to-slate-800 rounded-2xl p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm"><Trophy className="h-8 w-8 text-yellow-300" /></div>
            <div><h2 className="univent-font text-2xl font-bold">Level {currentLevel} Scholar</h2><p className="text-indigo-100">Keep attending events to rank up!</p></div>
          </div>
          <div className="w-full md:w-1/3">
            <div className="flex justify-between text-xs font-bold uppercase mb-2 text-indigo-100"><span>XP Progress</span><span>{user.xp || 0} / {LEVEL_THRESHOLDS[currentLevel]} XP</span></div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm"><div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${xpProgress}%` }}></div></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
            <div className="bg-white/80 dark:bg-slate-800/90 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Filter className="h-3 w-3" /> Categories</h2>
              <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button key={cat.name} onClick={() => setSelectedCategory(cat.name)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat.name ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                      <Icon className={`h-4 w-4 ${selectedCategory === cat.name ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} /> {cat.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Event Locations
                  </h2>
                  <span className="text-xs text-indigo-500 dark:text-indigo-400">
                    {events.filter(e => e.coordinates?.length === 2).length} pinned
                  </span>
                </div>
                <div 
                  className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all" 
                  style={{ width: '100%', height: '180px' }}
                  onClick={() => setMapOpen(true)}
                >
                  <iframe
                    title="Campus Events Map Preview"
                    src={`https://www.google.com/maps?q=${KIIT_CENTER[0]},${KIIT_CENTER[1]}&z=15&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, pointerEvents: 'none' }}
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 left-2 right-2 z-10 pointer-events-none">
                    <div className="bg-white/90 dark:bg-slate-800/90 text-xs text-center py-1 px-2 rounded text-indigo-600 dark:text-indigo-400 font-medium">
                      Click to view full map with {events.filter(e => e.coordinates?.length === 2).length} events
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Search events..." className="pl-10 pr-4 py-2 w-full border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex bg-white/80 dark:bg-slate-800/90 rounded-lg p-1 border border-slate-200 dark:border-slate-700 ml-4">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-100 dark:bg-slate-700 text-indigo-600' : 'text-slate-400'}`}><Grid className="h-4 w-4" /></button>
                <button onClick={() => setViewMode('calendar')} className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-indigo-100 dark:bg-slate-700 text-indigo-600' : 'text-slate-400'}`}><CalendarIcon className="h-4 w-4" /></button>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map(event => {
                  const eventId = getEventId(event);
                  const currentUserId = getUserId(user);
                  // 3. UPDATED: Logic to check registration (Server Data OR Local Optimistic Data)
                  const isRegisteredServer = event.registrants?.some(r => {
                    const rId = r._id || r.id; 
                    return String(rId) === String(currentUserId);
                  });

                  const isRegisteredLocal = locallyJoined.includes(eventId);
                  const isRegisteredFinal = isRegisteredServer || isRegisteredLocal;

                  return (
                    <div key={eventId} className="relative">
                      <div className="relative">
                        <EventCard 
                          event={event} 
                          isStudent={true} 
                          isRegistered={isRegisteredFinal} 
                          registration={registrations[eventId] || null}
                          onAction={() => handleJoinInteraction(eventId, event.title)}
                          onShowTicket={(reg) => handleShowTicket(reg, event.title)}
                          onAddComment={onAddComment} 
                        />
                        {event.poster && (
                          <div className="absolute top-0 left-0 w-full h-32 flex items-end justify-end p-4 pointer-events-none">
                            <button
                              className="bg-white/80 hover:bg-white text-indigo-600 font-bold px-2 py-1 rounded shadow text-xs z-20 pointer-events-auto"
                              onClick={() => setPosterUrl(event.poster)}
                            >
                              View Poster
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <CalendarView events={events} currentDate={currentDate} setCurrentDate={setCurrentDate} />
            )}
          </main>
        </div>

        {/* Ticket Modal */}
        <TicketModal 
          registration={ticketData} 
          eventTitle={selectedEventTitle}
          onClose={() => setTicketData(null)} 
        />
        {/* Poster Modal */}
        {posterUrl && (
          <PosterModal imageUrl={posterUrl} onClose={() => setPosterUrl(null)} />
        )}
      </div>
    </div>
    </>
  );
}