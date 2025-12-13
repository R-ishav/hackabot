import React from 'react';
import { Calendar as CalendarIcon, Sun, Moon, LogOut } from 'lucide-react';

export default function Navbar({ currentUser, darkMode, setDarkMode, onLogout }) {
  return (
    <nav className="sticky top-0 z-40 bg-primary/90 dark:bg-black/90 backdrop-blur-md border-b border-primary/30 dark:border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="univent-font text-3xl font-extrabold text-white dark:text-primary leading-tight drop-shadow-lg tracking-wide">UniVent</h1>
            <span className="text-xs font-bold text-white dark:text-primary-light uppercase tracking-widest">
              {currentUser.role === 'admin' ? 'Admin Portal' : 'Student Hub'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-white hover:text-primary dark:text-primary-light dark:hover:text-primary transition-colors">
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-3 bg-primary/30 dark:bg-black/60 px-4 py-2 rounded-full border border-primary/30 dark:border-black">
            <div className="w-8 h-8 rounded-full bg-primary text-white dark:bg-primary/30 dark:text-primary-light flex items-center justify-center font-bold">
              {currentUser.name[0]}
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-bold text-white dark:text-primary leading-none">{currentUser.name}</p>
              <p className="text-xs text-white dark:text-primary-light capitalize">{currentUser.role}</p>
            </div>
            <button onClick={onLogout} className="ml-2 text-white hover:text-primary dark:text-primary-light dark:hover:text-primary transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}