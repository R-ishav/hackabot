import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView({ events, currentDate, setCurrentDate }) {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const daysArray = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    return (dayNum > 0 && dayNum <= days) ? dayNum : null;
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
         <h3 className="font-bold text-slate-800 dark:text-white">{monthName}</h3>
         <div className="flex gap-2">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><ChevronLeft className="h-5 w-5 dark:text-white" /></button>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><ChevronRight className="h-5 w-5 dark:text-white" /></button>
         </div>
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 py-2 border-b dark:border-slate-700">
         <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-700 gap-px">
         {daysArray.map((day, idx) => {
            const dateStr = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0] : '';
            const dayEvents = day ? events.filter(e => e.date === dateStr) : [];
            return (
               <div key={idx} className={`bg-white dark:bg-slate-800 min-h-[80px] p-1 ${!day ? 'bg-slate-50 dark:bg-slate-900' : ''}`}>
                  {day && (
                     <>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{day}</span>
                        <div className="mt-1 space-y-1">
                           {dayEvents.map(e => (
                              <div key={e.id} className="text-[10px] bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 p-1 rounded truncate border-l-2 border-indigo-500">
                                 {e.time.split(' ')[0]} {e.title}
                              </div>
                           ))}
                        </div>
                     </>
                  )}
               </div>
            );
         })}
      </div>
    </div>
  );
}