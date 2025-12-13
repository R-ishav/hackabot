import React, { useState } from 'react';
import { Clock, MapPin, Users, Heart, CheckCircle, Send } from 'lucide-react';

const gradientMap = {
  'from-blue-500 to-cyan-400': 'linear-gradient(to right, #3b82f6, #22d3ee)',
  'from-purple-500 to-pink-400': 'linear-gradient(to right, #a855f7, #f472b6)',
  'from-green-400 to-emerald-500': 'linear-gradient(to right, #4ade80, #10b981)',
  'from-indigo-600 to-blue-600': 'linear-gradient(to right, #4f46e5, #2563eb)'
};

export default function EventCard({ event, isStudent, isRegistered, onAction, onAddComment, registration, onShowTicket }) {
  const [activeTab, setActiveTab] = useState('details');
  const [comment, setComment] = useState('');

   const gradientStyle = event.poster
      ? {
            backgroundImage: `url(${event.poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
         }
      : {
            background: gradientMap[event.imageColor] || 'linear-gradient(to right, #3b82f6, #22d3ee)'
         };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
      <div className="h-32 relative p-6 flex flex-col justify-between" style={gradientStyle}>
         <div className="absolute inset-0 bg-black/40 z-0" style={{borderRadius: 'inherit'}}></div>
         <div className="absolute top-4 right-4 bg-black/30 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
            {event.category}
         </div>
         <div className="relative z-10">
            <h3 className="text-white text-xl font-bold shadow-md drop-shadow-lg">{event.title}</h3>
            <p className="text-white/95 text-sm drop-shadow-md">{event.society}</p>
         </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-700">
        <button onClick={() => setActiveTab('details')} className={`flex-1 py-2 text-sm font-medium ${activeTab === 'details' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Details</button>
        <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-sm font-medium ${activeTab === 'chat' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Discussion</button>
      </div>

      <div className="p-5 flex-1 flex flex-col">
         {activeTab === 'details' ? (
            <>
               <div className="flex gap-4 mb-4">
                  <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-center min-w-[3.5rem]">
                     <span className="block text-xs font-bold text-indigo-600 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                     <span className="block text-xl font-black text-slate-800 dark:text-white">{new Date(event.date).getDate()}</span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                     <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-indigo-500" /> {event.time}</div>
                     <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-indigo-500" /> {event.venue}</div>
                  </div>
               </div>
               <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-grow">{event.description}</p>
               
               <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                     <Users className="h-4 w-4" /> {event.registrants.length} going
                  </div>
                  {isStudent && (
                     <button 
                        onClick={isRegistered && registration ? () => onShowTicket(registration) : onAction}
                        disabled={isRegistered && !registration}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                           isRegistered 
                           ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer' 
                           : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                        }`}
                     >
                        {isRegistered ? <CheckCircle className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                        {isRegistered ? 'Show Ticket' : 'Join Event'}
                     </button>
                  )}
               </div>
            </>
         ) : (
            <div className="flex flex-col h-[200px]">
               <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2">
                  {/* Announcements Section */}
                  {event.announcements && event.announcements.length > 0 && (
                     <div className="mb-4">
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">📢 Announcements</p>
                        {event.announcements.map((a, i) => (
                           <div key={i} className="bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-600 p-3 rounded mb-2 text-sm">
                              <span className="font-bold text-indigo-800 dark:text-indigo-200">{a.author}</span>
                              <p className="text-indigo-700 dark:text-indigo-300 mt-1">{a.text}</p>
                              <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">
                                 {a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}
                              </p>
                           </div>
                        ))}
                     </div>
                  )}
                  
                  {/* Comments Section */}
                  {event.comments && event.comments.length > 0 && (
                     <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">💬 Comments</p>
                        {event.comments.map((c, i) => (
                           <div key={i} className="bg-slate-50 dark:bg-slate-700 p-2 rounded-lg text-sm mb-2">
                              <span className="font-bold text-slate-800 dark:text-white">{c.user}: </span>
                              <span className="text-slate-600 dark:text-slate-300">{c.text}</span>
                           </div>
                        ))}
                     </div>
                  )}
                  
                  {(!event.comments || event.comments.length === 0) && (!event.announcements || event.announcements.length === 0) && (
                     <p className="text-center text-slate-400 text-xs mt-4">No announcements or comments yet.</p>
                  )}
               </div>
               <div className="flex gap-2">
                  <input 
                     className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full px-3 py-1 text-sm outline-none dark:text-white"
                     placeholder="Type comment..."
                     value={comment} onChange={(e) => setComment(e.target.value)}
                  />
                  <button onClick={() => { if(comment) { onAddComment(event._id || event.id, comment); setComment(''); } }} className="p-1.5 bg-indigo-600 text-white rounded-full"><Send className="h-4 w-4" /></button>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}