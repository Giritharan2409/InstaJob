import React, { useState } from 'react';
import api, { setClientContext } from '../utils/api';
import { Briefcase, Lock, Mail, Loader, HelpCircle, ArrowRight, UserCheck, Building, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, theme, targetRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allAccounts = [
    { name: 'Jane Doe', role: 'Worker / Student', type: 'worker', email: 'jane@student.edu', password: 'password123', icon: UserCheck, desc: 'Full-stack Developer Candidate' },
    { name: 'Alex Smith', role: 'Worker / Freelancer', type: 'worker', email: 'alex@work.com', password: 'password123', icon: UserCheck, desc: 'Event Lead & Logistics Spec' },
    { name: 'Sophia Chen', role: 'Employer (TechCorp)', type: 'employer', email: 'sophia@techcorp.com', password: 'password123', icon: Building, desc: 'Hiring Manager' },
    { name: 'Mark Vance', role: 'Employer (EpicEvents)', type: 'employer', email: 'mark@epicevents.com', password: 'password123', icon: Building, desc: 'Operations Lead' },
    { name: 'System Admin', role: 'Platform Moderator', type: 'admin', email: 'admin@instajob.com', password: 'adminpassword', icon: ShieldCheck, desc: 'Compliance & Safety Admin' }
  ];

  // Filter demo accounts by target role context, keeping admin available
  const demoAccounts = allAccounts.filter(acc => acc.type === targetRole || acc.type === 'admin');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { role, user } = res.data;
      
      setClientContext(role, user._id || '');
      onLoginSuccess(role, user._id || '', user);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const prefillDemo = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-300 ${
      isDark ? 'bg-mesh-dark text-white' : 'bg-mesh-light text-slate-900'
    }`}>
      
      {/* Subtle Glow Backdrop */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 z-10 my-8">
        
        {/* Main Authentication Form */}
        <div className={`md:col-span-7 p-8 sm:p-10 rounded-3xl border shadow-2xl relative overflow-hidden flex flex-col justify-between ${
          isDark ? 'glass-panel-dark' : 'glass-panel-light'
        }`}>
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex bg-gradient-to-tr from-blue-600 to-indigo-600 p-3.5 rounded-2xl shadow-md shadow-blue-500/20 mb-4 ring-1 ring-white/20">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
                Access Your Workspace
              </h2>
              <p className="text-xs opacity-75 mt-1.5">
                Sign in to manage short-term gig applications, post positions, or verify site attendance.
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-3.5 rounded-xl text-xs font-semibold mb-6 text-center shadow-xs">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-500" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={`text-xs p-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Lock className="h-3.5 w-3.5 text-blue-500" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`text-xs p-3.5 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs p-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer mt-4"
              >
                {loading ? <Loader className="animate-spin h-4 w-4" /> : null}
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="text-[10px] opacity-50 mt-8 text-center">
            InstaJob Enterprise Authentication Engine • SSL 256-bit Encrypted
          </div>
        </div>

        {/* Demo Credentials Sidebar Helper */}
        <div className={`md:col-span-5 p-6 sm:p-8 rounded-3xl border shadow-xl flex flex-col justify-between ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <HelpCircle className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-heading">1-Click Demo Logins</h3>
                <p className="text-[10px] opacity-60">Click any account below to prefill credentials</p>
              </div>
            </div>

            <div className="space-y-2.5 mt-5">
              {demoAccounts.map((account, i) => {
                const AccIcon = account.icon;
                const isSelected = email === account.email;

                return (
                  <div
                    key={i}
                    onClick={() => prefillDemo(account)}
                    className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all duration-200 text-left hover:scale-[1.01] ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 ring-1 ring-blue-500/30'
                        : isDark ? 'bg-slate-950/60 border-slate-800 hover:bg-slate-950' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <AccIcon className={`h-3.5 w-3.5 ${isSelected ? 'text-blue-400' : 'text-gray-400'}`} />
                        <span className="font-bold">{account.name}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        account.type === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        account.type === 'employer' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {account.type}
                      </span>
                    </div>

                    <div className="text-[10px] opacity-70 mt-1 flex justify-between">
                      <span>{account.desc}</span>
                      <span className="text-blue-400 font-mono text-[9px] font-semibold">Click to Fill</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] opacity-50 mt-6 text-center">
            InstaJob interactive demonstration environment.
          </div>
        </div>

      </div>
    </div>
  );
}
