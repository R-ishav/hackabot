import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import StudentDashboard from './dashboards/StudentDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import CoverPage from './components/CoverPage';
import { Loader2 } from 'lucide-react';

// Connect to your local backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function AppRoutes(props) {
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [registrations, setRegistrations] = useState({}); // Store registrations by eventId
  const navigate = useNavigate();

  // --- Notification Helper ---
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  // --- 1. Load Data on Startup ---
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      const data = await res.json();
      console.log('fetchEvents - Raw data from server:', data);
      console.log('fetchEvents - Events with coordinates:', data.filter(e => e.coordinates));
      setEvents(data);
    } catch (err) {
      console.error("API Error", err);
      addNotification("Could not connect to server. Is 'node server.js' running?", "error");
    }
  };

  useEffect(() => {
    fetchEvents();
    // Check if user was already logged in (persist session)
    const savedUser = localStorage.getItem('campusUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      // fetch user's registrations so UI shows registered events
      (async () => {
        try {
          const res = await fetch(`${API_URL}/users/${user._id}/registrations`);
          if (res.ok) {
            const regs = await res.json();
            const mapping = {};
            regs.forEach(r => { mapping[r.eventId] = r; });
            setRegistrations(mapping);
          }
        } catch (err) {
          console.error('Could not load registrations', err);
        }
      })();
    }
    setLoading(false);
  }, []);

  // --- Apply dark mode to html element ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- 2. Auth Handlers ---

  const handleRegister = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        // Save user to local storage and state
        localStorage.setItem('campusUser', JSON.stringify(data));
        setCurrentUser(data);
        addNotification("Account created successfully!", "success");
      } else {
        addNotification(data.error || "Registration failed", "error");
      }
    } catch (err) {
      addNotification("Server connection error", "error");
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('campusUser', JSON.stringify(data));
        setCurrentUser(data);
        // load user's registrations after login
        try {
          const rres = await fetch(`${API_URL}/users/${data._id}/registrations`);
          if (rres.ok) {
            const regs = await rres.json();
            const mapping = {};
            regs.forEach(r => { mapping[r.eventId] = r; });
            setRegistrations(mapping);
          }
        } catch (err) {
          console.error('Could not load registrations', err);
        }
        addNotification(`Welcome back, ${data.name}!`, "success");
        return true;
      } else {
        addNotification(data.error || "Login failed", "error");
        return false;
      }
    } catch (err) {
      addNotification("Server connection error", "error");
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('campusUser');
    setCurrentUser(null);
    addNotification("Logged out successfully");
  };

  // --- 3. Event Handlers ---

  const handleAddEvent = async (newEvent) => {
    try {
      // Add creator details to the payload
      const payload = { 
        ...newEvent, 
        createdBy: currentUser._id, // MongoDB uses _id, not id
        society: currentUser.societyName || currentUser.name 
      };
      
      console.log('handleAddEvent - newEvent received:', newEvent);
      console.log('handleAddEvent - payload with coordinates:', payload.coordinates);
      console.log('handleAddEvent - Full payload:', JSON.stringify(payload));
      
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedEvent = await res.json();
        console.log('handleAddEvent - Server response:', savedEvent);
        console.log('handleAddEvent - Saved coordinates:', savedEvent.coordinates);
        await fetchEvents(); // Refresh list from DB to get the new event
        addNotification("Event posted successfully!", "success");
      } else {
        addNotification("Failed to post event", "error");
      }
    } catch (err) {
      console.error('handleAddEvent - Error:', err);
      addNotification("Error posting event", "error");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await fetch(`${API_URL}/events/${eventId}`, { method: 'DELETE' });
      // Optimistic update: remove from UI immediately
      setEvents(prev => prev.filter(e => e._id !== eventId));
      addNotification("Event deleted", "info");
    } catch (err) { 
      console.error(err); 
      addNotification("Error deleting event", "error");
    }
  };

  const handleRegisterInterest = async (eventId) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUser._id, 
          userName: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone || '',
          rollNumber: currentUser.rollNumber || '',
          year: currentUser.year || '',
          branch: currentUser.branch || '',
          course: currentUser.course || ''
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Update the event in the list with the new data from server
        setEvents(prev => prev.map(e => e._id === eventId ? data.event : e));
        
        // Store registration data
        if (data.registration) {
          setRegistrations(prev => ({
            ...prev,
            [eventId]: data.registration
          }));
          // also persist to server-side user.registeredEvents is updated in backend
        }
        
        // If the server returned an updated user object (with new XP), update it
        if (data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('campusUser', JSON.stringify(data.user));
        }
        
        addNotification("Registered successfully! +50 XP", "success");
        
        // Return registration data for ticket display
        return data.registration;
      }
    } catch (err) {
      addNotification("Registration failed", "error");
    }
  };

  const handleAddComment = async (eventId, text) => {
    try {
      await fetch(`${API_URL}/events/${eventId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: currentUser.name, text })
      });
      fetchEvents(); // Refresh to show the new comment
      addNotification("Comment posted");
    } catch (err) { 
      console.error(err); 
    }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Notifications Toast */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto animate-in slide-in-from-right fade-in bg-white dark:bg-slate-800 shadow-xl rounded-lg p-4 border-l-4 flex items-center gap-3 min-w-[300px] ${n.type === 'success' ? 'border-green-500' : n.type === 'error' ? 'border-red-500' : 'border-indigo-500'}`}>
            <span className="font-medium text-sm text-slate-800 dark:text-slate-200">{n.message}</span>
          </div>
        ))}
      </div>

      <Routes>
        <Route path="/" element={<CoverPage navigate={navigate} />} />
        <Route path="/student-login" element={<AuthScreen onLogin={handleLogin} onRegister={handleRegister} />} />
        <Route path="/admin-login" element={<AuthScreen onLogin={handleLogin} onRegister={handleRegister} />} />
        <Route path="/dashboard" element={
          currentUser ? (
            <>
              <Navbar 
                currentUser={currentUser} 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                onLogout={handleLogout} 
              />
              {currentUser.role === 'admin' ? (
                <AdminDashboard 
                  key={events.length}
                  user={currentUser} 
                  events={events} 
                  onAddEvent={handleAddEvent} 
                  onDeleteEvent={handleDeleteEvent} 
                />
              ) : (
                <StudentDashboard 
                  key={events.length}
                  user={currentUser} 
                  events={events} 
                  registrations={registrations}
                  onRegisterInterest={handleRegisterInterest} 
                  onAddComment={handleAddComment}
                  onRefreshEvents={fetchEvents}
                />
              )}
            </>
          ) : (
            <CoverPage navigate={navigate} />
          )
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}