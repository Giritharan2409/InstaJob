import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import MapWidget from '../components/MapWidget';
import QRModal from '../components/QRModal';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  User, Briefcase, FileText, BrainCircuit, ShieldAlert, Award, 
  MapPin, Clock, DollarSign, Send, CheckCircle, Smartphone, Play, Square, Loader, Star, ExternalLink, Sparkles
} from 'lucide-react';

export default function WorkerDashboard({ activeUserId, theme }) {
  const [activeTab, setActiveTab] = useState('profile'); // profile, jobs, applications, ai-hub
  const [profileData, setProfileData] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Job Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(15);

  // Simulated GPS Location (Indiranagar / MG Road Bangalore area coordinates)
  const [userLat, setUserLat] = useState(12.9716);
  const [userLng, setUserLng] = useState(77.5946);
  const [geoInitialized, setGeoInitialized] = useState(false);

  // QR Attendance Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalType, setQrModalType] = useState('check-in'); // check-in or check-out
  const [selectedApp, setSelectedApp] = useState(null);

  // AI Guidance States
  const [guidance, setGuidance] = useState('');
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumeLoading, setResumeLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);

  // Auto-detect user's real GPS location on mount
  useEffect(() => {
    const fallbackToIP = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.latitude && data.longitude) {
          setUserLat(parseFloat(data.latitude));
          setUserLng(parseFloat(data.longitude));
        }
      } catch (err) {
        console.error('IP Geolocation fallback failed', err);
      } finally {
        setGeoInitialized(true);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLat(parseFloat(position.coords.latitude.toFixed(6)));
          setUserLng(parseFloat(position.coords.longitude.toFixed(6)));
          setGeoInitialized(true);
        },
        () => {
          // Permission denied or error — use IP-based location
          fallbackToIP();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      fallbackToIP();
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchApplications();
    fetchRecommendedJobs();
  }, [activeUserId]);

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
    }
  }, [activeTab, search, category, emergencyOnly, maxDistance, userLat, userLng]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workers/profile');
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/worker');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const params = {
        lat: userLat,
        lng: userLng,
        maxDistance
      };
      if (search) params.search = search;
      if (category) params.category = category;
      if (emergencyOnly) params.emergency = true;

      const res = await api.get('/jobs', { params });
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendedJobs = async () => {
    try {
      setRecsLoading(true);
      const res = await api.get('/ai/recommendations');
      setAiRecs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRecsLoading(false);
    }
  };

  const applyForJob = async (jobId) => {
    try {
      await api.post('/applications/apply', { jobId });
      alert('Applied successfully! AI Compatibility matching check completed.');
      fetchApplications();
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to apply.');
    }
  };

  const triggerCheckIn = (app) => {
    setSelectedApp(app);
    setQrModalType('check-in');
    setQrModalOpen(true);
  };

  const triggerCheckOut = (app) => {
    setSelectedApp(app);
    setQrModalType('check-out');
    setQrModalOpen(true);
  };

  const handleAttendanceSuccess = () => {
    setQrModalOpen(false);
    fetchApplications();
    fetchProfile();
  };

  const handleClaimUPI = async (appId) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: 'paid' });
      alert('UPI Payment Successful! Check details under payment history.');
      fetchApplications();
      fetchProfile();
    } catch (err) {
      alert('Failed to release payment.');
    }
  };

  const getCareerGuidance = async () => {
    try {
      setGuidanceLoading(true);
      const res = await api.post('/ai/career-guidance');
      setGuidance(res.data.guidance);
    } catch (err) {
      console.error(err);
    } finally {
      setGuidanceLoading(false);
    }
  };

  const generateResume = async () => {
    try {
      setResumeLoading(true);
      const res = await api.post('/ai/resume');
      setResumeText(res.data.resume);
    } catch (err) {
      console.error(err);
    } finally {
      setResumeLoading(false);
    }
  };

  const isDark = theme === 'dark';

  if (loading || !profileData) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] space-y-4">
        <Loader className="h-10 w-10 text-blue-500 animate-spin" />
        <span className="text-gray-400 text-sm font-semibold">Loading worker profile & AI ledger...</span>
      </div>
    );
  }

  const { worker, certificates, payments, ratings } = profileData;

  const earningsData = payments.map(p => ({
    name: new Date(p.releasedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    amount: p.amount
  })).reverse();

  const defaultChartData = earningsData.length > 0 ? earningsData : [
    { name: 'Start', amount: 0 },
    { name: 'Shift 1', amount: 320 },
    { name: 'Shift 2', amount: 480 },
    { name: 'Shift 3', amount: 750 }
  ];

  return (
    <div className={`flex flex-col md:flex-row min-h-[calc(100vh-64px)] ${isDark ? 'bg-mesh-dark text-white' : 'bg-mesh-light text-slate-900'}`}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 p-5 flex flex-col justify-between border-b md:border-r transition-all duration-300 ${
        isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-white border-slate-200'
      }`}>
        <div className="space-y-6">
          
          {/* User Profile Card */}
          <div className={`flex items-center space-x-3 p-3.5 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm ring-1 ring-white/20">
              {worker.name.split(' ').map(n=>n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold truncate w-32 font-heading">{worker.name}</h4>
              <p className="text-[10px] text-gray-400 truncate">{worker.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1.5 pb-2 md:pb-0">
            {[
              { id: 'profile', label: 'Dashboard Overview', icon: User },
              { id: 'jobs', label: 'Explore Gigs', icon: Briefcase },
              { id: 'applications', label: 'Applications & Shifts', icon: FileText },
              { id: 'ai-hub', label: 'AI Career Studio', icon: BrainCircuit }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setActiveTab(btn.id)}
                className={`flex items-center space-x-3 w-full p-3 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeTab === btn.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
                    : isDark ? 'text-gray-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <btn.icon className="h-4.5 w-4.5" />
                <span>{btn.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Reliability / Trust Score Box */}
        <div className={`mt-6 p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/60 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Trust Index</span>
            <ShieldAlert className={`h-4.5 w-4.5 ${worker.trustScore >= 90 ? 'text-emerald-500' : 'text-rose-500'}`} />
          </div>
          <div className="text-2xl font-extrabold mt-1 text-blue-500 font-heading">{worker.trustScore}%</div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${worker.trustScore >= 90 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
              style={{ width: `${worker.trustScore}%` }}
            ></div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        
        {/* Profile / Overview Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* Stats Header Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-xs transition-all duration-200 ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <DollarSign className="absolute right-4 top-4 h-12 w-12 opacity-10 text-blue-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Wallet Balance</span>
                <h2 className="text-3xl font-extrabold mt-1 text-blue-500 font-heading">${worker.earnings}</h2>
                <p className="text-[10px] opacity-60 mt-2">Earned through validated short-term shifts</p>
              </div>

              <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-xs transition-all duration-200 ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <Award className="absolute right-4 top-4 h-12 w-12 opacity-10 text-indigo-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Skill Badges</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {worker.badges.map((badge, i) => (
                    <span 
                      key={i} 
                      className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs uppercase tracking-wider"
                    >
                      {badge}
                    </span>
                  ))}
                  {worker.badges.length === 0 && <span className="text-xs opacity-60">No badges awarded yet.</span>}
                </div>
              </div>

              <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-xs transition-all duration-200 ${
                isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <FileText className="absolute right-4 top-4 h-12 w-12 opacity-10 text-emerald-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verified Certificates</span>
                <h2 className="text-3xl font-extrabold mt-1 text-emerald-500 font-heading">{certificates.length}</h2>
                <p className="text-[10px] opacity-60 mt-2">Downloadable verified skill credentials</p>
              </div>
            </div>

            {/* Earnings History Chart */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 font-heading">Earnings Analytics Trend</h3>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={defaultChartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke={isDark ? "#4b5563" : "#9ca3af"} fontSize={10} />
                    <YAxis stroke={isDark ? "#4b5563" : "#9ca3af"} fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: '#3b82f6', borderRadius: '12px', fontSize: 11 }} />
                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skills & Digital Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 font-heading">Verified Skills Portfolio</h3>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill, i) => (
                    <span key={i} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-xl font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="text-xs opacity-75 mt-6 space-y-1">
                  <p>Preferred Category: <strong className="opacity-100">{worker.preferredCategory}</strong></p>
                  <p>Schedule Availability: <strong className="opacity-100">{worker.availability}</strong></p>
                </div>
              </div>

              {/* Work Certificates List */}
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 font-heading">Digital Skill Credentials</h3>
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div key={cert._id} className="p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold">{cert.title}</p>
                        <p className="text-[10px] opacity-60">{cert.companyName} • Verification Code: {cert.verificationCode}</p>
                      </div>
                      <a 
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(cert, null, 2))}`} 
                        download={`instajob-cert-${cert.verificationCode}.json`}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-1.5 px-3.5 rounded-lg text-[10px] transition-all duration-200 flex items-center space-x-1"
                      >
                        <span>Download</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                  {certificates.length === 0 && (
                    <p className="text-xs opacity-50 italic">Complete gig assignments to earn digital credentials here.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Reviews */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 font-heading">Employer Review Feedback</h3>
              <div className="space-y-3">
                {ratings.map((rate) => (
                  <div key={rate._id} className="p-3.5 bg-slate-950/20 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="flex items-center space-x-1 text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>Rating: {rate.overallRating} / 5</span>
                      </span>
                      <span className="text-[10px] opacity-50">{new Date(rate.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="opacity-80 italic font-medium">"{rate.comment || 'No written feedback description.'}"</p>
                  </div>
                ))}
                {ratings.length === 0 && (
                  <p className="text-xs opacity-50 italic">No ratings logged yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Explore Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Map & Filters Sidebar */}
              <div className="lg:col-span-7 space-y-6">
                <MapWidget 
                  jobs={jobs}
                  userLat={userLat}
                  userLng={userLng}
                  onLocationChange={(lat, lng) => {
                    setUserLat(lat);
                    setUserLng(lng);
                  }}
                  maxDistance={maxDistance}
                  setMaxDistance={setMaxDistance}
                />

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-heading">Search & Filter Gigs</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Search title, skills..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <option value="">All Job Categories</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Event Management">Event Management</option>
                      <option value="Logistics">Logistics</option>
                    </select>
                  </div>
                  
                  <label className="flex items-center space-x-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={emergencyOnly}
                      onChange={(e) => setEmergencyOnly(e.target.checked)}
                      className="rounded accent-rose-500 h-4 w-4"
                    />
                    <span className="text-xs text-rose-400 font-bold">🚨 Emergency Orders Only ("Work Today")</span>
                  </label>
                </div>
              </div>

              {/* Jobs List Grid */}
              <div className="lg:col-span-5 space-y-4 max-h-[720px] overflow-y-auto pr-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold opacity-80 font-heading">Available Short-Term Gigs</h3>
                  <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    {jobs.length} Positions
                  </span>
                </div>

                {jobs.map((job) => (
                  <div 
                    key={job._id}
                    className={`p-5 rounded-2xl border transition-all duration-200 relative job-card-hover ${
                      job.emergency 
                        ? 'border-rose-500/60 bg-rose-500/5' 
                        : isDark ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    {job.emergency && (
                      <span className="absolute top-4 right-4 bg-rose-600 text-white text-[8px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Emergency
                      </span>
                    )}

                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{job.category}</div>
                    <h4 className="font-bold text-base mt-1 font-heading">{job.title}</h4>
                    <p className="text-xs font-bold text-blue-500 mt-0.5">{job.companyName}</p>
                    
                    <p className="text-xs opacity-75 mt-3 line-clamp-2 leading-relaxed">{job.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skillsRequired.map((s, i) => (
                        <span key={i} className="text-[9px] bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-md font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-xs mt-5 pt-3 border-t border-slate-800/40">
                      <div>
                        <div className="flex items-center space-x-1 text-emerald-500 font-bold">
                          <DollarSign className="h-4 w-4" />
                          <span>${job.salary} / hour</span>
                        </div>
                        {job.distance !== undefined && (
                          <div className="text-[10px] opacity-60 mt-0.5">
                            📍 {job.distance} km away ({job.locationName})
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => applyForJob(job._id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2.5 px-5 rounded-xl transition-all duration-200 text-xs shadow-md shadow-blue-500/20 cursor-pointer"
                      >
                        Quick Apply
                      </button>
                    </div>
                  </div>
                ))}

                {jobs.length === 0 && (
                  <div className="text-center py-12 opacity-50 italic text-xs">
                    No positions found within search radius. Try increasing the search distance on the map slider.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-heading">Application & Shift Tracking</h3>

            <div className="space-y-4">
              {applications.map((app) => {
                const job = app.jobId;
                if (!job) return null;

                return (
                  <div 
                    key={app._id} 
                    className={`p-6 rounded-2xl border transition-all duration-200 ${
                      isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-base font-heading">{job.title}</h4>
                        <p className="text-xs text-blue-500 font-semibold">{job.companyName}</p>
                        <div className="text-[11px] opacity-70 mt-1 flex items-center space-x-3">
                          <span className="flex items-center"><DollarSign className="h-3.5 w-3.5 text-emerald-500" /> ${job.salary}/hr</span>
                          <span className="flex items-center"><Clock className="h-3.5 w-3.5 text-blue-400" /> {job.duration} Days ({job.workingHours})</span>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status:</span>
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                            app.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            app.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            app.status === 'work_started' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            app.status === 'selected' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          }`}>
                            {app.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {app.status === 'selected' && (
                            <button
                              onClick={() => triggerCheckIn(app)}
                              className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold p-2 px-4 rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-md shadow-amber-500/20"
                            >
                              <Play className="h-3.5 w-3.5" />
                              <span>Site QR Check-in</span>
                            </button>
                          )}
                          
                          {app.status === 'work_started' && (
                            <button
                              onClick={() => triggerCheckOut(app)}
                              className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold p-2 px-4 rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-md shadow-rose-500/20"
                            >
                              <Square className="h-3.5 w-3.5" />
                              <span>Site QR Check-out</span>
                            </button>
                          )}

                          {app.status === 'completed' && (
                            <button
                              onClick={() => handleClaimUPI(app._id)}
                              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2 px-4 rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-md shadow-emerald-500/20"
                            >
                              <Smartphone className="h-3.5 w-3.5" />
                              <span>Claim Instant UPI Pay</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Feedback Banner */}
                    <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-3 mt-4 text-[11px] opacity-80">
                      🤖 <strong>AI Matching Analysis ({app.aiMatchScore}%):</strong> {app.aiMatchExplanation}
                    </div>
                  </div>
                );
              })}

              {applications.length === 0 && (
                <div className="text-center py-12 opacity-50 italic text-xs">
                  No active applications logged. Visit the Explore Gigs tab to apply for jobs.
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Career Studio Tab */}
        {activeTab === 'ai-hub' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recommendations Card */}
              <div className={`p-6 rounded-2xl border lg:col-span-2 ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold flex items-center space-x-2 font-heading">
                    <BrainCircuit className="h-5 w-5 text-blue-400" />
                    <span>AI Groq Smart Recommendations</span>
                  </h3>
                  <button 
                    onClick={fetchRecommendedJobs}
                    className="text-[11px] text-blue-400 hover:underline cursor-pointer flex items-center space-x-1 font-semibold"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Refresh AI Matches</span>
                  </button>
                </div>

                {recsLoading ? (
                  <div className="flex items-center space-x-2 text-xs opacity-60 py-6">
                    <Loader className="animate-spin h-4 w-4 text-blue-500" />
                    <span>Evaluating skill matrix with Groq model...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiRecs.map((rec, i) => (
                      <div key={i} className="p-3.5 bg-slate-950/30 border border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between text-xs gap-3">
                        <div>
                          <p className="font-bold">{rec.job.title} <span className="text-blue-400 text-[10px] ml-1">({rec.score}% Match)</span></p>
                          <p className="text-[10px] opacity-60">{rec.job.companyName} • {rec.job.category}</p>
                          <p className="text-[10px] opacity-75 italic mt-1 font-medium">"{rec.explanation}"</p>
                        </div>
                        <button 
                          onClick={() => applyForJob(rec.job._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-1.5 px-4 rounded-xl text-[10px] self-start sm:self-center transition-all duration-200 cursor-pointer"
                        >
                          Apply Now
                        </button>
                      </div>
                    ))}
                    {aiRecs.length === 0 && (
                      <p className="text-xs opacity-50 italic">No recommendations calculated yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* AI Resume Builder Card */}
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 font-heading">AI Resume Builder</h3>
                <p className="text-xs opacity-75 leading-relaxed mb-4">
                  Automatically synthesize your temporary work history, attendance rating, and verified skills into a sleek resume.
                </p>
                <button
                  onClick={generateResume}
                  disabled={resumeLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {resumeLoading ? <Loader className="animate-spin h-4 w-4" /> : null}
                  <span>Generate Resume (Groq Llama-3)</span>
                </button>
              </div>
            </div>

            {/* Career Coach & Resume Preview Output */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Career Coach Guidance */}
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-heading">AI Career Coach Suggestions</h3>
                  <button
                    onClick={getCareerGuidance}
                    disabled={guidanceLoading}
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-semibold text-[10px] py-1.5 px-3 rounded-lg border border-blue-500/20 transition-all duration-200 cursor-pointer"
                  >
                    Consult Coach
                  </button>
                </div>

                {guidanceLoading ? (
                  <div className="flex items-center space-x-2 text-xs opacity-60 py-6">
                    <Loader className="animate-spin h-4 w-4 text-blue-500" />
                    <span>Llama3 is drafting recommendations...</span>
                  </div>
                ) : guidance ? (
                  <div 
                    className="text-xs leading-relaxed space-y-2 prose prose-invert opacity-90"
                    dangerouslySetInnerHTML={{ __html: guidance }}
                  ></div>
                ) : (
                  <p className="text-xs opacity-50 italic py-4">Click "Consult Coach" to generate career trajectory advice based on market demand.</p>
                )}
              </div>

              {/* Resume Output */}
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 font-heading">Synthesized AI Resume</h3>

                {resumeLoading ? (
                  <div className="flex items-center space-x-2 text-xs opacity-60 py-6">
                    <Loader className="animate-spin h-4 w-4 text-blue-500" />
                    <span>Formatting profile details...</span>
                  </div>
                ) : resumeText ? (
                  <div className="space-y-4">
                    <pre className="bg-slate-950 p-4 border border-slate-800 rounded-xl text-[10px] font-mono opacity-90 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                      {resumeText}
                    </pre>
                    <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(resumeText)}`}
                      download={`${worker.name.replace(' ', '_')}_Resume.txt`}
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all duration-200 shadow-sm"
                    >
                      Download TXT Resume
                    </a>
                  </div>
                ) : (
                  <p className="text-xs opacity-50 italic py-4">Click "Generate Resume" above to synthesize your resume document.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Camera check-in scanning Modal simulator */}
      {qrModalOpen && selectedApp && (
        <QRModal 
          application={selectedApp}
          type={qrModalType}
          userLat={userLat}
          userLng={userLng}
          onClose={() => setQrModalOpen(false)}
          onSuccess={handleAttendanceSuccess}
        />
      )}
    </div>
  );
}
