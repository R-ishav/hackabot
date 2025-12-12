import React from 'react';
import { Calendar as CalendarIcon, Sun, Moon, LogOut } from 'lucide-react';

export default function Navbar({ currentUser, darkMode, setDarkMode, onLogout }) {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Events Everywhere</h1>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              {currentUser.role === 'admin' ? 'Admin Portal' : 'Student Hub'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
              {currentUser.name[0]}
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-bold text-slate-800 dark:text-white leading-none">{currentUser.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{currentUser.role}</p>
            </div>
            <button onClick={onLogout} className="ml-2 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}