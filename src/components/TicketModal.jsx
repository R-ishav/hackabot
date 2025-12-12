import React from 'react';
import { X, Download } from 'lucide-react';

export default function TicketModal({ registration, eventTitle, onClose }) {
  if (!registration) return null;

  const handleDownload = () => {
    // Create a canvas to draw the ticket
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Event Ticket', 50, 50);

    // Event details
    ctx.font = '16px Arial';
    ctx.fillText(`Event: ${eventTitle}`, 50, 100);
    ctx.fillText(`Name: ${registration.studentName}`, 50, 130);
    ctx.fillText(`Roll: ${registration.rollNumber}`, 50, 160);
    ctx.fillText(`Year: ${registration.year}`, 50, 190);
    ctx.fillText(`Branch: ${registration.branch}`, 50, 220);

    // Draw QR code image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 250, 100, 500, 500);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `ticket-${registration.studentName}.png`;
      link.click();
    };
    img.src = registration.qrCode;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md sm:max-w-lg w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Event Ticket</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Event Info */}
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6 space-y-2 text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-bold">Event:</span> {eventTitle}
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-bold">Name:</span> {registration.studentName}
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-bold">Roll:</span> {registration.rollNumber}
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-bold">Year:</span> {registration.year}
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-bold">Branch:</span> {registration.branch}
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-bold">Course:</span> {registration.course}
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-bold">Email:</span> {registration.email}
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            <span className="font-bold">Phone:</span> {registration.phone}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6 bg-white p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <img 
              src={registration.qrCode} 
              alt="QR Code" 
              className="w-48 h-48 sm:w-64 sm:h-64 border-4 border-indigo-600"
            />
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">EVENT CODE</p>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-widest">
                {registration.uniqueCode}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4 mb-6 text-sm text-indigo-800 dark:text-indigo-200">
          <p className="font-bold mb-2">📱 Instructions:</p>
          <p>Show this QR code to the event admin at the entrance to check in.</p>
        </div>

        <button
          onClick={handleDownload}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Ticket
        </button>
      </div>
    </div>
  );
}
