import { useEffect } from 'react';
import React, { useState } from 'react';
import { Plus, Users, Trash2, X, CheckCircle, QrCode, CheckCheck, Download, Megaphone, MessageCircle } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import PostEventModal from '../components/PostEventModal';
import PosterModal from '../components/PosterModal';
import * as XLSX from 'xlsx';

// --- CONSTANTS ---
const CATEGORIES = [
  { name: 'All' },
  { name: 'Technical' },
  { name: 'Cultural' },
  { name: 'Sports' },
  { name: 'Academic' },
];


// --- MAIN COMPONENT ---
export default function AdminDashboard({ user, events, onAddEvent, onDeleteEvent }) {
  useEffect(() => {
    document.title = 'UniVent';
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewRegistrants, setViewRegistrants] = useState(null);
  const [scanningEventId, setScanningEventId] = useState(null);
  const [viewAttendance, setViewAttendance] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [announcementEventId, setAnnouncementEventId] = useState(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [viewDiscussions, setViewDiscussions] = useState(null);
  // Poster modal state
  const [posterUrl, setPosterUrl] = useState(null);

  // Helper to get ID safely (MongoDB uses _id, frontend might use id)
  const getEventId = (event) => event._id || event.id;
  const getUserId = (u) => u?._id || u?.id;

  // Safety check for events array
  const safeEvents = Array.isArray(events) ? events : [];
  
  // ROBUST FILTERING: Handles mismatch between ObjectId objects and ID strings
  const currentUserId = getUserId(user);
  
  const myEvents = safeEvents.filter(e => {
    if (!currentUserId) return false;
    
    // Normalize event creator ID
    const creatorId = (typeof e.createdBy === 'object' && e.createdBy !== null)
        ? (e.createdBy._id || e.createdBy.id)
        : e.createdBy;
        
    return String(creatorId) === String(currentUserId);
  });

  const totalRegistrations = myEvents.reduce((acc, curr) => acc + (curr.registrants ? curr.registrants.length : 0), 0);

  // Fetch attendance data for an event
  const handleViewAttendance = async (eventId) => {
    setLoadingAttendance(true);
    try {
      const API_URL = "https://hackabot-9anw.onrender.com/api";
      const res = await fetch(`${API_URL}/events/${eventId}/registrations`);
      const data = await res.json();
      
      // Filter for checked-in students only
      const checkedIn = data.filter(reg => reg.checkedIn);
      
      setAttendanceData(prev => ({
        ...prev,
        [eventId]: checkedIn
      }));
      setViewAttendance(eventId);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
    setLoadingAttendance(false);
  };

  // Handle successful QR scan: refetch attendance data
  const handleScanSuccess = (eventId) => {
    handleViewAttendance(eventId);
  };

  // Post announcement
  const handlePostAnnouncement = async (eventId) => {
    if (!announcementText.trim()) return;
    
    try {
      const API_URL = "https://hackabot-9anw.onrender.com/api";
      const res = await fetch(`${API_URL}/events/${eventId}/announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: user.name || user.societyName || 'Admin',
          text: announcementText
        })
      });
      
      if (res.ok) {
        setAnnouncementText('');
        setAnnouncementEventId(null);
        // Optionally refetch events to show updated announcements
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to post announcement:', err);
    }
  };

  // Export attendance to Excel
  const handleExportAttendance = (eventId) => {
    const attendees = attendanceData[eventId] || [];
    const eventName = safeEvents.find(e => getEventId(e) === eventId)?.title || 'Event';
    
    // Prepare data for Excel
    const excelData = attendees.map(student => ({
      'Name': student.studentName,
      'Roll Number': student.rollNumber,
      'Email': student.email,
      'Phone': student.phone,
      'Year': student.year,
      'Branch': student.branch,
      'Course': student.course,
      'Check-in Time': student.checkInTime ? new Date(student.checkInTime).toLocaleString() : '-'
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    // Style the header row
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F46E5' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }

    // Adjust column widths
    ws['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 }
    ];

    // Download the file
    const fileName = `${eventName}_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 to-slate-900 bg-fixed px-2 sm:px-6 lg:px-16 py-10 animate-fadein">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/80 dark:bg-slate-800/90 p-8 rounded-3xl shadow-2xl border-0 flex flex-col items-center hover:scale-105 transition-transform duration-300">
            <h3 className="text-indigo-600 text-xs font-extrabold uppercase mb-2 tracking-widest">Total Events Posted</h3>
            <p className="text-4xl font-extrabold text-slate-800 dark:text-white animate-bounce-slow">{myEvents.length}</p>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/90 p-8 rounded-3xl shadow-2xl border-0 flex flex-col items-center hover:scale-105 transition-transform duration-300">
            <h3 className="text-slate-500 text-xs font-extrabold uppercase mb-2 tracking-widest">Total Registrations</h3>
            <p className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 animate-bounce-slow">{totalRegistrations}</p>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-indigo-700 to-slate-700 text-white p-8 rounded-3xl shadow-2xl hover:scale-110 hover:shadow-indigo-200/60 transition-all flex flex-col justify-center items-center gap-2 font-extrabold text-lg tracking-wide focus:outline-none focus:ring-4 focus:ring-indigo-300 animate-wiggle"
          >
            <Plus className="h-10 w-10 animate-spin-slow" />
            <span>Post New Event</span>
          </button>
        </div>

        <h2 className="univent-font text-3xl font-extrabold text-slate-100 dark:text-white mb-10 tracking-tight drop-shadow-lg">Your Events</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {myEvents.length > 0 ? (
            myEvents.map(event => {
              const eventId = getEventId(event);
              return (
                <div key={eventId} className="bg-white/80 dark:bg-slate-800/90 rounded-3xl border-0 shadow-xl overflow-hidden flex flex-col hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 group animate-float">
                  <div
                    className={`h-32 relative p-6 ${!event.poster ? `bg-gradient-to-r from-indigo-800 to-slate-800` : ''}`}
                    style={event.poster ? {
                      backgroundImage: `url(${event.poster})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    } : {}}
                  >
                    {event.poster && <div className="absolute inset-0 bg-black/30 z-0" style={{borderRadius: 'inherit'}}></div>}
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="h-full flex flex-col justify-between">
                        <div>
                          <h3 className="text-white font-extrabold text-2xl leading-tight drop-shadow-lg animate-pop-in">{event.title}</h3>
                          <p className="text-white/90 text-base font-semibold drop-shadow-md">{new Date(event.date).toDateString()}</p>
                          <span className="inline-block mt-2 bg-white/20 backdrop-blur text-indigo-600 text-xs font-extrabold px-4 py-1 rounded-full shadow-lg tracking-widest animate-bounce-slow">
                            {event.category}
                          </span>
                        </div>
                        {event.poster && (
                          <button
                            className="absolute top-4 right-4 bg-gradient-to-r from-indigo-700 to-slate-700 text-white font-extrabold px-3 py-2 rounded-full shadow-lg text-xs z-20 hover:scale-110 hover:shadow-indigo-200/60 transition-all duration-200 animate-wiggle"
                            onClick={() => setPosterUrl(event.poster)}
                          >
                            View Poster
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3 text-indigo-700 dark:text-indigo-300 text-base font-bold animate-pop-in">
                        <Users className="h-5 w-5 animate-bounce-slow" />
                        <span>{event.registrants ? event.registrants.length : 0} Registered</span>
                      </div>
                      <span className="text-xs px-3 py-1 bg-indigo-100 dark:bg-slate-700 rounded-full text-indigo-700 font-bold tracking-wide animate-bounce-slow">{event.category}</span>
                    </div>
                    <div className="flex gap-3 mt-auto">
                      <button onClick={() => setViewRegistrants(eventId)} className="flex-1 py-2 bg-gradient-to-r from-indigo-700 to-slate-700 text-white rounded-xl text-base font-extrabold shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200 animate-wiggle">View Students</button>
                      <button onClick={() => setViewDiscussions(eventId)} className="p-2 bg-slate-200/40 text-slate-700 rounded-xl hover:bg-slate-300/60 transition-colors animate-pop-in" title="View Discussions"><MessageCircle className="h-5 w-5" /></button>
                      <button onClick={() => setAnnouncementEventId(eventId)} className="p-2 bg-indigo-200/40 text-indigo-700 rounded-xl hover:bg-indigo-300/60 transition-colors animate-pop-in" title="Post Announcement"><Megaphone className="h-5 w-5" /></button>
                      <button onClick={() => handleViewAttendance(eventId)} className="p-2 bg-slate-200/40 text-slate-700 rounded-xl hover:bg-slate-300/60 transition-colors animate-pop-in" title="View Attendance"><CheckCheck className="h-5 w-5" /></button>
                      <button onClick={() => setScanningEventId(eventId)} className="p-2 bg-indigo-200/40 text-indigo-700 rounded-xl hover:bg-indigo-300/60 transition-colors animate-pop-in" title="Scan QR Code"><QrCode className="h-5 w-5" /></button>
                      <button onClick={() => onDeleteEvent(eventId)} className="p-2 bg-slate-200/40 text-slate-700 rounded-xl hover:bg-slate-300/60 transition-colors animate-pop-in"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-slate-400">You haven't posted any events yet.</div>
          )}
       </div>

       {viewRegistrants && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
             <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-slate-900 dark:text-white">Registered Students</h3><button onClick={() => setViewRegistrants(null)}><X className="h-5 w-5 text-slate-400" /></button></div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                   {safeEvents.find(e => getEventId(e) === viewRegistrants)?.registrants?.length > 0 ? (
                      safeEvents.find(e => getEventId(e) === viewRegistrants).registrants.map((reg, idx) => (
                         <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">{reg.name ? reg.name[0] : '?'}</div>
                               <div><p className="text-sm font-bold text-slate-800 dark:text-slate-200">{reg.name}</p><p className="text-xs text-slate-400">{new Date(reg.time).toLocaleDateString()}</p></div>
                            </div>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                         </div>
                      ))
                   ) : (<p className="text-slate-400 text-center py-4">No registrations yet.</p>)}
                </div>
             </div>
          </div>
       )}
      {isModalOpen && <PostEventModal onClose={() => setIsModalOpen(false)} onSubmit={(data) => { onAddEvent(data); setIsModalOpen(false); }} />}
       
       {/* Poster Modal (single instance, outside event map) */}
       {posterUrl && (
         <PosterModal imageUrl={posterUrl} onClose={() => setPosterUrl(null)} />
       )}

       {/* Attendance Modal */}
       {viewAttendance && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Attendance</h3>
               <button onClick={() => setViewAttendance(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                 <X className="h-5 w-5" />
               </button>
             </div>
             {loadingAttendance ? (
               <p className="text-center text-slate-500 py-8">Loading attendance data...</p>
             ) : (
               <div className="max-h-96 overflow-y-auto">
                 {attendanceData[viewAttendance]?.length > 0 ? (
                   <div className="space-y-3">
                     {attendanceData[viewAttendance].map((student, idx) => (
                       <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                         <div className="flex-1">
                           <p className="font-bold text-slate-800 dark:text-white">{student.studentName}</p>
                           <p className="text-sm text-slate-600 dark:text-slate-400">Roll: {student.rollNumber}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                             Email: {student.email}
                           </p>
                           <p className="text-xs text-slate-500 dark:text-slate-500">
                             Phone: {student.phone}
                           </p>
                         </div>
                         <div className="ml-4 text-right">
                           <p className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                             <CheckCircle className="h-4 w-4" />
                             Checked In
                           </p>
                           <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                             {student.checkInTime ? new Date(student.checkInTime).toLocaleString() : '-'}
                           </p>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-center text-slate-400 py-8">No students have checked in yet.</p>
                 )}
               </div>
             )}
             <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
               <div className="flex justify-between items-center">
                 <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                   Total Attended: <span className="text-indigo-600 dark:text-indigo-400">{attendanceData[viewAttendance]?.length || 0}</span>
                 </p>
                 <button
                   onClick={() => handleExportAttendance(viewAttendance)}
                   disabled={!attendanceData[viewAttendance] || attendanceData[viewAttendance].length === 0}
                   className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <Download className="h-4 w-4" />
                   Export to Excel
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
       
       {scanningEventId && (
         <QRScanner 
           eventId={scanningEventId} 
           onClose={() => setScanningEventId(null)}
           onScanSuccess={() => handleScanSuccess(scanningEventId)}
         />
       )}

       {/* Announcement Modal */}
       {announcementEventId && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Post Announcement</h3>
               <button onClick={() => { setAnnouncementEventId(null); setAnnouncementText(''); }} className="text-slate-400 hover:text-slate-600">
                 <X className="h-5 w-5" />
               </button>
             </div>
             
             <div className="space-y-4">
               <textarea
                 className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-900 dark:text-white text-sm resize-none"
                 rows="4"
                 placeholder="Type your announcement here..."
                 value={announcementText}
                 onChange={(e) => setAnnouncementText(e.target.value)}
               />
               
               <div className="flex gap-2">
                 <button
                   onClick={() => { setAnnouncementEventId(null); setAnnouncementText(''); }}
                   className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => handlePostAnnouncement(announcementEventId)}
                   className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                 >
                   <Megaphone className="h-4 w-4" />
                   Post
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Discussions Modal */}
       {viewDiscussions && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Discussions</h3>
               <button onClick={() => setViewDiscussions(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                 <X className="h-5 w-5" />
               </button>
             </div>
             
             <div className="max-h-96 overflow-y-auto space-y-4">
               {/* Announcements */}
               {safeEvents.find(e => getEventId(e) === viewDiscussions)?.announcements?.length > 0 && (
                 <div>
                   <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-3">📢 Announcements</p>
                   {safeEvents.find(e => getEventId(e) === viewDiscussions).announcements.map((a, i) => (
                     <div key={i} className="bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-600 p-4 rounded-lg mb-3">
                       <p className="font-bold text-indigo-800 dark:text-indigo-200">{a.author}</p>
                       <p className="text-indigo-700 dark:text-indigo-300 mt-2 text-sm">{a.text}</p>
                       <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">
                         {a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}
                       </p>
                     </div>
                   ))}
                 </div>
               )}

               {/* Comments */}
               {safeEvents.find(e => getEventId(e) === viewDiscussions)?.comments?.length > 0 && (
                 <div>
                   <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">💬 Comments</p>
                   {safeEvents.find(e => getEventId(e) === viewDiscussions).comments.map((c, i) => (
                     <div key={i} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-3 border border-slate-200 dark:border-slate-600">
                       <p className="font-bold text-slate-800 dark:text-slate-200">{c.user}</p>
                       <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm">{c.text}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{c.time}</p>
                     </div>
                   ))}
                 </div>
               )}

               {(!safeEvents.find(e => getEventId(e) === viewDiscussions)?.announcements || safeEvents.find(e => getEventId(e) === viewDiscussions).announcements.length === 0) && 
                (!safeEvents.find(e => getEventId(e) === viewDiscussions)?.comments || safeEvents.find(e => getEventId(e) === viewDiscussions).comments.length === 0) && (
                 <p className="text-center text-slate-400 py-8">No announcements or comments yet.</p>
               )}
             </div>
           </div>
         </div>
       )}
      </div>
    </div>
  );
}