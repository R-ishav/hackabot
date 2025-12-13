import React from 'react';
import { X } from 'lucide-react';

export default function PosterModal({ imageUrl, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" style={{marginTop: '4rem'}}>
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-all"
        >
          <X size={24} />
        </button>
        <img src={imageUrl} alt="Event Poster" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
      </div>
    </div>
  );
}