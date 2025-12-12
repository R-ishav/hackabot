import React, { useState } from 'react';
import { CATEGORIES } from '../data/constants';

export default function PostEventModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({ title: '', date: '', time: '', venue: '', category: 'Technical', description: '' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Post New Event</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
          <input required placeholder="Event Title" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" onChange={e => setFormData({...formData, title: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
             <input required type="date" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" onChange={e => setFormData({...formData, date: e.target.value})} />
             <input required type="time" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" onChange={e => setFormData({...formData, time: e.target.value})} />
          </div>
          <input required placeholder="Venue" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" onChange={e => setFormData({...formData, venue: e.target.value})} />
          <select className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" onChange={e => setFormData({...formData, category: e.target.value})}>
             {CATEGORIES.filter(c => c.name !== 'All').map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <textarea required placeholder="Description" rows="3" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-600 dark:text-white" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          <div className="flex gap-3 pt-2">
             <button type="button" onClick={onClose} className="flex-1 p-2 border rounded hover:bg-slate-100 dark:text-white dark:hover:bg-slate-700">Cancel</button>
             <button className="flex-1 p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Post Event</button>
          </div>
        </form>
      </div>
    </div>
  );
}