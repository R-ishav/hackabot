import React, { useState } from 'react';
import { Calendar as CalendarIcon, User, Briefcase } from 'lucide-react';

export default function AuthScreen({ onLogin, onRegister }) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', societyName: '',
    rollNumber: '', course: '', branch: '', year: '', gender: '', phone: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const success = onLogin(formData.email, formData.password);
      if (!success) setError('Invalid email or password');
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in required fields');
        return;
      }
      
      if (role === 'student' && (!formData.rollNumber || !formData.course || !formData.branch || !formData.year || !formData.gender || !formData.phone)) {
          setError('Please fill in all student details');
          return;
      }

      if (role === 'admin' && !formData.societyName) {
           setError('Please fill in society name');
           return;
      }
      onRegister({ ...formData, role });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
       <div className={`bg-white rounded-2xl shadow-2xl w-full ${!isLogin && role === 'student' ? 'max-w-lg' : 'max-w-md'} overflow-hidden flex flex-col transition-all duration-300`}>
          <div className="p-8 bg-slate-50 text-center border-b border-slate-100">
             <div className="inline-flex p-3 bg-indigo-600 rounded-xl shadow-lg mb-4"><CalendarIcon className="h-8 w-8 text-white" /></div>
             <h2 className="text-2xl font-bold text-slate-800">Events Everywhere</h2>
             <p className="text-slate-500 mt-1">Campus Event Navigator</p>
          </div>

          <div className="flex p-2 gap-2 bg-slate-50">
             <button onClick={() => { setIsLogin(true); setError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Login</button>
             <button onClick={() => { setIsLogin(false); setError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Register</button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-4">
             {!isLogin && (
                <>
                  <div className="flex gap-4 mb-4">
                    <button type="button" onClick={() => setRole('student')} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'student' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}><User className="h-5 w-5" /><span className="text-xs font-bold">Student</span></button>
                    <button type="button" onClick={() => setRole('admin')} className={`flex-1 p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'admin' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}><Briefcase className="h-5 w-5" /><span className="text-xs font-bold">Society Admin</span></button>
                  </div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label><input type="text" className="w-full px-4 py-2 border rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                  
                  {role === 'student' && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Roll Number</label><input className="w-full px-4 py-2 border rounded-lg text-sm" onChange={e => setFormData({...formData, rollNumber: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label><input type="tel" className="w-full px-4 py-2 border rounded-lg text-sm" onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Course</label><input className="w-full px-4 py-2 border rounded-lg text-sm" onChange={e => setFormData({...formData, course: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Branch</label><input className="w-full px-4 py-2 border rounded-lg text-sm" onChange={e => setFormData({...formData, branch: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label><select className="w-full px-4 py-2 border rounded-lg text-sm bg-white" onChange={e => setFormData({...formData, year: e.target.value})}><option value="">Select</option><option value="1">1st</option><option value="2">2nd</option><option value="3">3rd</option><option value="4">4th</option></select></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label><select className="w-full px-4 py-2 border rounded-lg text-sm bg-white" onChange={e => setFormData({...formData, gender: e.target.value})}><option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
                    </div>
                  )}
                  {role === 'admin' && <div className="animate-in fade-in slide-in-from-top-4"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Society Name</label><input className="w-full px-4 py-2 border rounded-lg" onChange={e => setFormData({...formData, societyName: e.target.value})} /></div>}
                </>
             )}
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label><input type="email" className="w-full px-4 py-2 border rounded-lg" onChange={e => setFormData({...formData, email: e.target.value})} /></div>
             <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label><input type="password" className="w-full px-4 py-2 border rounded-lg" onChange={e => setFormData({...formData, password: e.target.value})} /></div>
             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg mt-2">{isLogin ? 'Login' : 'Register'}</button>
          </form>
       </div>
    </div>
  );
}