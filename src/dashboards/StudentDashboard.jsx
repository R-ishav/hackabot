import React, { useState, useMemo } from 'react';
import { Filter, Search, Grid, Calendar as CalendarIcon, Trophy } from 'lucide-react';
import { CATEGORIES, LEVEL_THRESHOLDS } from '../data/constants'; // Ensure this path matches your project
import EventCard from '../components/EventCard';
import CalendarView from '../components/CalendarView';
import TicketModal from '../components/TicketModal';

export default function StudentDashboard({ user = { xp: 0 }, events = [], registrations = {}, onRegisterInterest, onAddComment }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [ticketData, setTicketData] = useState(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');

  // 1. NEW: Local state to track "instant" joins for UI feedback
  const [locallyJoined, setLocallyJoined] = useState([]); 

  // Safe helper for IDs
  const getUserId = (u) => u?._id || u?.id;
  const getEventId = (e) => e?._id || e?.id;

  // 2. NEW: Wrapper function to handle the join interaction
  const handleJoinInteraction = async (eventId, eventTitle) => {
    try {
      // Trigger the parent function (API call)
      // We await it in case the parent function returns a Promise (recommended)
      const registration = await onRegisterInterest(eventId);
      
      // If successful, show ticket and update local state to reflect change instantly
      if (registration) {
        setTicketData(registration);
        setSelectedEventTitle(eventTitle);
      }
      
      setLocallyJoined((prev) => [...new Set([...prev, eventId])]);
    } catch (error) {
      console.error("Failed to join event:", error);
      // Optional: Add toast notification here
    }
  };

  // Handler to show ticket for already registered event
  const handleShowTicket = (registration, eventTitle) => {
    setTicketData(registration);
    setSelectedEventTitle(eventTitle);
  };

  const filteredEvents = useMemo(() => {
    const currentUserId = getUserId(user);

    // If 'Registered' tab selected, show events user has a registration for
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       {/* XP Bar */}
       <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm"><Trophy className="h-8 w-8 text-yellow-300" /></div>
             <div><h2 className="text-2xl font-bold">Level {currentLevel} Scholar</h2><p className="text-indigo-100">Keep attending events to rank up!</p></div>
          </div>
          <div className="w-full md:w-1/3">
             <div className="flex justify-between text-xs font-bold uppercase mb-2 text-indigo-100"><span>XP Progress</span><span>{user.xp || 0} / {LEVEL_THRESHOLDS[currentLevel]} XP</span></div>
             <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm"><div className="h-full bg-yellow-400 transition-all duration-1000" style={{ width: `${xpProgress}%` }}></div></div>
          </div>
       </div>

       <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
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
             </div>
          </aside>

          <main className="flex-1">
             <div className="flex justify-between items-center mb-6">
                <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input type="text" placeholder="Search events..." className="pl-10 pr-4 py-2 w-full border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 ml-4">
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
                        <EventCard 
                           key={eventId} 
                           event={event} 
                           isStudent={true} 
                           isRegistered={isRegisteredFinal} 
                           registration={registrations[eventId] || null}
                           onAction={() => handleJoinInteraction(eventId, event.title)}
                           onShowTicket={(reg) => handleShowTicket(reg, event.title)}
                           onAddComment={onAddComment} 
                        />
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
    </div>
  );
}