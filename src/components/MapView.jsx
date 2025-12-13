import React from 'react';

export default function MapView({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl w-full max-w-3xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white">Close</button>
        <h2 className="text-lg font-bold mb-4">KIIT University Map</h2>
        <div className="w-full h-[60vh]">
          <iframe
            title="KIIT University Map"
            src="https://www.google.com/maps?q=KIIT+University,+Bhubaneswar,+Odisha,+India&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
