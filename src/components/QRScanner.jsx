import React, { useRef, useEffect, useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

export default function QRScanner({ eventId, onClose, onScanSuccess }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const stopCamera = () => {
    try {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    if (!scanning || !videoRef.current) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        setError('Could not access camera. Please check permissions.');
      }
    };

    startCamera();

    return () => stopCamera();
  }, [scanning]);

  const captureAndDecode = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // For demo purposes, we'll use a text input fallback
    // In production, you'd use a QR code library like 'jsqr' or 'html5-qrcode'
    // This is a simplified version
  };

  const handleManualQRInput = async (e) => {
    e.preventDefault();
    const qrCode = (e.target.qrInput?.value || '').trim().toUpperCase();
    
    if (!qrCode) {
      setError('Please enter a QR code or 6-digit code');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/events/${eventId}/verify-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: qrCode })
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: data.message,
          name: data.registration.studentName,
          rollNumber: data.registration.rollNumber
        });
        stopCamera();
        setScanning(false);
        if (onScanSuccess) onScanSuccess(data.registration);
        setTimeout(() => {
          setResult(null);
          setScanning(true);
          e.target.reset();
        }, 3000);
      } else {
        setError(data.error || 'Invalid QR code or 6-digit code');
      }
    } catch (err) {
      setError('Error verifying QR code. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Scan Student QR Code</h2>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        {result && result.success ? (
          <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-500 rounded-lg p-6 text-center mb-6">
            <Check className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-green-800 dark:text-green-200 font-bold text-lg mb-2">Check-in Successful!</p>
            <p className="text-green-700 dark:text-green-300">{result.name} ({result.rollNumber})</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-500 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800 dark:text-red-200">Error</p>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        ) : null}

        {scanning && !result && (
          <>
            {/* Camera preview */}
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden mb-6 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full aspect-video"
              />
              <canvas ref={canvasRef} className="hidden" width="640" height="480" />
            </div>

            {/* Manual QR Input */}
            <form onSubmit={handleManualQRInput} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Or Enter 6-Digit Code Manually:
                </label>
                <input
                  type="text"
                  name="qrInput"
                  placeholder="E.g., A3K9M2"
                  maxLength="6"
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 dark:text-white text-sm text-center text-xl font-bold tracking-widest"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Check In Student
              </button>
            </form>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-4">
              📸 Point camera at QR code or enter 6-digit code above
            </p>
          </>
        )}
      </div>
    </div>
  );
}
