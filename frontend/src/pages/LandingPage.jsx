import React from 'react';
import { 
  ShieldCheck, Zap, Award, CheckCircle2, ArrowRight, Briefcase, 
  MapPin, Clock, DollarSign, Sparkles, Building2, Users2, TrendingUp, Lock
} from 'lucide-react';

export default function LandingPage({ theme, onEnterApp }) {
  const isDark = theme === 'dark';

  const jobCategories = [
    { name: 'Web & App Development', count: '340+ Gigs', rate: '$35 - $75/hr', icon: Briefcase, bg: 'from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/20' },
    { name: 'Event Operations', count: '210+ Gigs', rate: '$25 - $45/hr', icon: Users2, bg: 'from-purple-600/20 to-pink-600/20 text-purple-400 border-purple-500/20' },
    { name: 'Logistics & Supply', count: '180+ Gigs', rate: '$20 - $35/hr', icon: MapPin, bg: 'from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/20' },
    { name: 'Technical Support', count: '150+ Gigs', rate: '$30 - $55/hr', icon: TrendingUp, bg: 'from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/20' },
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-between transition-all duration-300 ${
      isDark ? 'bg-mesh-dark text-white' : 'bg-mesh-light text-slate-900'
    }`}>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center overflow-hidden">
        
        {/* Glowing Background Radial */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Hero Tagline Pill */}
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/25 px-4 py-1.5 rounded-full text-xs font-bold text-blue-400 mb-8 shadow-xs backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
          <span className="tracking-wide">AI-Powered Contingent Hiring & Short-Term Gig Platform</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.15] font-heading">
          Find Short-Term Gigs.<br className="hidden sm:inline" />
          Hire Qualified Talent <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent">Instantly.</span>
        </h1>
        
        {/* Subtitle */}
        <p className={`mt-6 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}>
          InstaJob links freelancers, students, and skilled professionals with verified enterprise employers for 2-4 day projects. Driven by Groq AI matching & GPS-geofenced QR attendance tracking.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto sm:max-w-none">
          <button
            onClick={() => onEnterApp('worker')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-sm"
          >
            <span>Explore Gigs as Job Seeker</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
          
          <button
            onClick={() => onEnterApp('employer')}
            className={`w-full sm:w-auto flex items-center justify-center space-x-2 border px-8 py-4 rounded-xl font-bold transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-sm ${
              isDark 
                ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 text-white' 
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 shadow-xs'
            }`}
          >
            <Building2 className="h-4.5 w-4.5 text-blue-500" />
            <span>Hire Talent as Employer</span>
          </button>
        </div>

        {/* Platform Metrics Bar */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {[
            { label: 'Short-Term Gigs Completed', val: '14,800+', sub: 'Verified by client QR logs' },
            { label: 'Attendance Precision Rate', val: '99.4%', sub: 'GPS-geofenced telemetry' },
            { label: 'Instant Payout Speed', val: '< 5 Mins', sub: 'Direct corporate UPI release' },
            { label: 'Enterprise Employer Trust', val: '4.9 / 5.0', sub: 'Based on 3,200+ reviews' }
          ].map((stat, i) => (
            <div key={i} className={`p-6 rounded-2xl border text-left transition-all duration-200 ${
              isDark 
                ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' 
                : 'bg-white/80 border-slate-200 shadow-xs hover:shadow-md'
            }`}>
              <div className="text-3xl font-extrabold text-blue-500 font-heading">{stat.val}</div>
              <div className="text-xs font-bold uppercase tracking-wider mt-1 opacity-90">{stat.label}</div>
              <div className="text-[10px] opacity-60 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Job Categories */}
      <section className={`py-16 border-t ${
        isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-100/50 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading">High-Demand Gig Categories</h2>
            <p className="opacity-70 text-sm mt-2">Explore top temporary job categories with verified hourly rates and immediate start dates.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobCategories.map((cat, i) => (
              <div 
                key={i} 
                onClick={() => onEnterApp('worker')}
                className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer job-card-hover ${
                  isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className={`p-3.5 rounded-xl inline-block border bg-gradient-to-tr ${cat.bg}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold mt-4 font-heading">{cat.name}</h3>
                <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-slate-800/20">
                  <span className="text-blue-500 font-semibold">{cat.count}</span>
                  <span className="font-bold opacity-80">{cat.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Platform Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading">Why Leading Companies Trust InstaJob</h2>
          <p className="opacity-75 text-sm mt-2">Our platform streamlines short-term hiring using secure AI telemetry protocols and verified talent metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: ShieldCheck,
              color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
              title: 'AI Fraud Screening & Trust Ratings',
              desc: 'Every applicant is scored on attendance history and reliability. Job listings undergo real-time AI risk analysis to prevent fake employer schemes.'
            },
            {
              icon: Zap,
              color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
              title: 'GPS-Geofenced QR Attendance',
              desc: 'Workers check in on-site by scanning dynamic QR codes validated by active GPS check boundaries, automatically recording exact hours worked.'
            },
            {
              icon: Award,
              color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
              title: 'Digital Experience Credentials',
              desc: 'Upon job completion, workers receive verifiable digital skill certificates highlighting verified competencies and client reviews.'
            }
          ].map((feat, i) => (
            <div key={i} className={`p-8 rounded-2xl border transition-all duration-300 ${
              isDark ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
            }`}>
              <div className={`p-4 rounded-xl inline-block border ${feat.color}`}>
                <feat.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold mt-5 font-heading">{feat.title}</h3>
              <p className="text-xs opacity-75 mt-2.5 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-10 text-center text-xs opacity-60 border-t ${
        isDark ? 'border-slate-900 bg-slate-950' : 'border-slate-200 bg-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-blue-500" />
            <span className="font-bold text-sm tracking-tight font-heading">InstaJob Enterprise</span>
          </div>
          <p>© 2026 InstaJob Technologies Inc. Verified AI Short-Term Talent Marketplace.</p>
          <div className="flex space-x-4 text-[11px]">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Security Ledger</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
