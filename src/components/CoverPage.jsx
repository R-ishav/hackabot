import React, { useEffect } from 'react';

export default function CoverPage({ navigate }) {
  useEffect(() => {
    document.title = 'Welcome to UniVent';
  }, []);

  const handleStudent = (e) => {
    e.preventDefault();
    if (navigate) navigate('/student-login');
    else window.location.href = '/student-login';
  };
  const handleAdmin = (e) => {
    e.preventDefault();
    if (navigate) navigate('/admin-login');
    else window.location.href = '/admin-login';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 cool-font text-center px-6 py-16">
      <div className="text-center px-6 py-16">
        <h1 className="text-xl md:text-2xl font-normal text-white mb-2 animate-fadein-slow tracking-wide cool-font">
          Welcome to<br />
          <span className="univent-font text-6xl md:text-9xl font-extrabold text-white-500 fade-in-up glow-text">UniVent</span>
        </h1>
        <p className="text-xl md:text-2xl text-white font-medium mb-6 animate-fadein-slow delay-200 cool-font">
          Your campus events, all in one place.
        </p>
        <p className="text-xl md:text-2xl text-white mb-8 animate-fadein-slow delay-300 cool-font">
          <br />Are you a Student or Admin?
        </p>
        <div className="flex justify-center gap-8 mt-8">
          <button onClick={handleStudent} className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg shadow-xl transition-all duration-200 animate-wiggle focus:outline-none focus:ring-4 focus:ring-indigo-300 cool-font">Student</button>
          <button onClick={handleAdmin} className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-extrabold text-lg shadow-xl transition-all duration-200 animate-wiggle focus:outline-none focus:ring-4 focus:ring-indigo-300 cool-font">Admin</button>
        </div>
      </div>
    </div>
  );
}
