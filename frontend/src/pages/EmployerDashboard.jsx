import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Building, PlusCircle, Users, CheckSquare, DollarSign, Clock, 
  MapPin, AlertTriangle, ShieldCheck, Star, ArrowRight, Loader, Award, Sparkles, X
} from 'lucide-react';

export default function EmployerDashboard({ activeUserId, theme }) {
  const [activeTab, setActiveTab] = useState('profile'); // profile, post-job, applicants, active-shifts
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Post Job Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [workingHours, setWorkingHours] = useState('9 AM - 5 PM');
  const [duration, setDuration] = useState('3');
  const [vacancies, setVacancies] = useState('2');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('12.9716');
  const [longitude, setLongitude] = useState('77.5946');
  const [date, setDate] = useState('2026-10-10');
  const [dressCode, setDressCode] = useState('Casual');
  const [contactPerson, setContactPerson] = useState('');
  const [emergency, setEmergency] = useState(false);

  // AI Salary & Fake Score states
  const [salaryReason, setSalaryReason] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [salaryLoading, setSalaryLoading] = useState(false);

  // Active Job selection state (for Applicants and Verification boards)
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [aiWorkers, setAiWorkers] = useState([]);
  const [aiWorkersLoading, setAiWorkersLoading] = useState(false);

  // Rating Modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null); // { appId, workerId, workerName, jobId }
  const [punctuality, setPunctuality] = useState(5);
  const [workQuality, setWorkQuality] = useState(5);
  const [behaviour, setBehaviour] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [activeUserId]);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicants(selectedJobId);
      fetchAttendance(selectedJobId);
      fetchAIRecommendedWorkers(selectedJobId);
    } else {
      setApplicants([]);
      setAttendanceLogs([]);
      setAiWorkers([]);
    }
  }, [selectedJobId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employers/profile');
      setProfileData(res.data);
      if (res.data.jobs && res.data.jobs.length > 0) {
        setSelectedJobId(res.data.jobs[0]._id);
      }
      setContactPerson(res.data.employer.name);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (jobId) => {
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setApplicants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async (jobId) => {
    try {
      const res = await api.get(`/attendance/job/${jobId}`);
      setAttendanceLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAIRecommendedWorkers = async (jobId) => {
    try {
      setAiWorkersLoading(true);
      const res = await api.get(`/ai/workers-for-job/${jobId}`);
      setAiWorkers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiWorkersLoading(false);
    }
  };

  const handleAISalarySuggest = async () => {
    if (!title) {
      alert('Please fill in a Job Title first.');
      return;
    }
    try {
      setSalaryLoading(true);
      const res = await api.post('/ai/salary-suggestion', {
        title,
        skillsRequired
      });
      setSalaryRange(`$${res.data.suggestedMin} - $${res.data.suggestedMax} / hour`);
      setSalaryReason(res.data.reason);
      setSalary(res.data.suggestedMin);
    } catch (err) {
      console.error(err);
    } finally {
      setSalaryLoading(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title,
        category,
        description,
        salary: parseFloat(salary),
        workingHours,
        duration: parseInt(duration),
        vacancies: parseInt(vacancies),
        skillsRequired,
        locationName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        date,
        dressCode,
        contactPerson,
        emergency
      };

      const res = await api.post('/jobs', payload);
      alert(`Job posted successfully! AI Fraud screening risk score: ${res.data.aiFakeScore}%.`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setSalary('');
      setLocationName('');
      setEmergency(false);
      
      fetchProfile();
      setActiveTab('profile');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post job.');
    }
  };

  const handleApplicantStatus = async (appId, status) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status });
      alert(`Candidate application status updated to: ${status}`);
      fetchApplicants(selectedJobId);
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleCompleteWork = async (appId) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: 'completed' });
      alert('Work completion approved! Digital skill certificate dispatched to worker.');
      fetchApplicants(selectedJobId);
      fetchAttendance(selectedJobId);
    } catch (err) {
      alert('Failed to complete work.');
    }
  };

  const triggerRatingModal = (appId, workerId, workerName, jobId) => {
    setRatingTarget({ appId, workerId, workerName, jobId });
    setRatingModalOpen(true);
  };

  const submitWorkerRating = async () => {
    if (!ratingTarget) return;

    try {
      const payload = {
        jobId: ratingTarget.jobId,
        revieweeId: ratingTarget.workerId,
        revieweeType: 'Worker',
        punctuality,
        workQuality,
        behaviour,
        communication,
        overallRating: Math.round((punctuality + workQuality + behaviour + communication) / 4),
        comment
      };

      await api.post('/ratings', payload);
      alert('Worker review submitted! Trust score updated.');
      
      setPunctuality(5);
      setWorkQuality(5);
      setBehaviour(5);
      setCommunication(5);
      setComment('');
      setRatingModalOpen(false);
      
      fetchApplicants(selectedJobId);
    } catch (err) {
      alert('Failed to submit rating feedback.');
    }
  };

  const handleUPIRelease = async (appId) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: 'paid' });
      alert('UPI payment released successfully! Corporate invoice generated.');
      fetchApplicants(selectedJobId);
    } catch (err) {
      alert('Payment processing failed.');
    }
  };

  const isDark = theme === 'dark';

  if (loading || !profileData) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] space-y-4">
        <Loader className="h-10 w-10 text-emerald-500 animate-spin" />
        <span className="text-gray-400 text-sm font-semibold">Resolving enterprise portal ledger...</span>
      </div>
    );
  }

  const { employer, jobs: companyJobs, ratings } = profileData;

  return (
    <div className={`flex flex-col md:flex-row min-h-[calc(100vh-64px)] ${isDark ? 'bg-mesh-dark text-white' : 'bg-mesh-light text-slate-900'}`}>
      
      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 p-5 flex flex-col justify-between border-b md:border-r transition-all duration-300 ${
        isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-white border-slate-200'
      }`}>
        <div className="space-y-6">
          
          {/* Company Profile Card */}
          <div className={`flex items-center space-x-3 p-3.5 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-white text-base shadow-sm ring-1 ring-white/20">
              {employer.companyName.split(' ').map(n=>n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold truncate w-32 font-heading">{employer.companyName}</h4>
              <p className="text-[10px] text-gray-400 truncate">{employer.name} • Hiring Manager</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1.5 pb-2 md:pb-0">
            {[
              { id: 'profile', label: 'Corporate Overview', icon: Building },
              { id: 'post-job', label: 'Post New Gig', icon: PlusCircle },
              { id: 'applicants', label: 'Candidate Screening', icon: Users },
              { id: 'active-shifts', label: 'Shift Verification & Pay', icon: CheckSquare }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setActiveTab(btn.id)}
                className={`flex items-center space-x-3 w-full p-3 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeTab === btn.id 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20' 
                    : isDark ? 'text-gray-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <btn.icon className="h-4.5 w-4.5" />
                <span>{btn.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Employer Rating Widget */}
        <div className={`mt-6 p-4 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100/60 border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Employer Rating</span>
            <Star className="h-4.5 w-4.5 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-extrabold mt-1 text-emerald-500 font-heading">{employer.rating} ★</div>
          <p className="text-[9px] opacity-60 mt-1">Calculated from prompt payment speed & worker reviews</p>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        
        {/* Profile Overview Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* Stats Header Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-xs ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                <Building className="absolute right-4 top-4 h-12 w-12 opacity-10 text-emerald-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Gig Listings</span>
                <h2 className="text-3xl font-extrabold mt-1 text-emerald-500 font-heading">{companyJobs.length}</h2>
                <p className="text-[10px] opacity-60 mt-2">Currently seeking short-term workers</p>
              </div>

              <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-xs ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                <Users className="absolute right-4 top-4 h-12 w-12 opacity-10 text-blue-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Shifts Today</span>
                <h2 className="text-3xl font-extrabold mt-1 text-blue-500 font-heading">{attendanceLogs.length}</h2>
                <p className="text-[10px] opacity-60 mt-2">Workers checked in via GPS QR</p>
              </div>

              <div className={`p-6 rounded-2xl border relative overflow-hidden shadow-xs ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
                <DollarSign className="absolute right-4 top-4 h-12 w-12 opacity-10 text-indigo-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Corporate Payout Gateway</span>
                <h2 className="text-xl font-extrabold mt-1 text-indigo-500 font-heading">Instant Corporate UPI</h2>
                <p className="text-[10px] opacity-60 mt-2">Auto-released upon shift approval</p>
              </div>
            </div>

            {/* Active Job Postings Overview */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 font-heading">Active Job Postings Overview</h3>
              <div className="space-y-3">
                {companyJobs.map(job => (
                  <div key={job._id} className="p-4 bg-slate-950/30 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div>
                      <p className="font-bold text-sm font-heading">{job.title}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">{job.category} • {job.duration} Days • ${job.salary}/hr</p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedJobId(job._id);
                        setActiveTab('applicants');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2 px-4 rounded-xl transition-all duration-200 cursor-pointer shadow-xs"
                    >
                      Screen Candidates
                    </button>
                  </div>
                ))}
                {companyJobs.length === 0 && (
                  <p className="text-xs opacity-50 italic">No job postings active yet. Create your first position under Post New Gig.</p>
                )}
              </div>
            </div>

            {/* Past Worker Feedback */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 font-heading">Worker Feedback Logs</h3>
              <div className="space-y-3">
                {ratings.map(rate => (
                  <div key={rate._id} className="p-3.5 bg-slate-950/20 border border-slate-800 rounded-xl text-xs">
                    <div className="flex justify-between font-bold opacity-80">
                      <span className="flex items-center space-x-1 text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>Rating: {rate.overallRating} / 5</span>
                      </span>
                      <span className="text-[10px] opacity-50">{new Date(rate.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="opacity-75 italic mt-1 font-medium">"{rate.comment || 'No comment provided.'}"</p>
                  </div>
                ))}
                {ratings.length === 0 && (
                  <p className="text-xs opacity-50 italic">No worker reviews recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Post Job Tab */}
        {activeTab === 'post-job' && (
          <form onSubmit={handlePostJob} className={`p-6 sm:p-8 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'} space-y-6`}>
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wider text-gray-400 font-heading">Post an Instant Short-Term Position</h3>
                <p className="text-xs opacity-60">List 2-4 day short-term gigs with instant applicant matching.</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 p-1.5 px-3 rounded-full border border-emerald-500/20">
                AI Fraud Screen Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Job Title</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Frontend UI Developer for Event Page"
                    className={`text-xs p-3 rounded-xl border flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAISalarySuggest}
                    disabled={salaryLoading}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold text-[10px] px-3.5 rounded-xl border border-emerald-500/20 transition-all duration-200 flex items-center space-x-1 cursor-pointer"
                  >
                    {salaryLoading ? <Loader className="animate-spin h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>AI Rate</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Job Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Event Management">Event Management</option>
                  <option value="Logistics">Logistics</option>
                </select>
              </div>
            </div>

            {/* AI Salary estimation output box */}
            {salaryRange && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-400 font-medium space-y-0.5">
                <div>💰 <strong>AI Market Hourly Recommendation:</strong> {salaryRange}</div>
                <div className="text-gray-400 text-[10px] font-normal">{salaryReason}</div>
              </div>
            )}

            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Position Scope & Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key responsibilities, deliverables, and schedule..."
                className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Salary ($ / Hour)</label>
                <input
                  type="number"
                  required
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration (2-4 Days)</label>
                <input
                  type="number"
                  min="2"
                  max="4"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Open Positions</label>
                <input
                  type="number"
                  required
                  value={vacancies}
                  onChange={(e) => setVacancies(e.target.value)}
                  className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Site / Venue Name</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Indiranagar Business Hub"
                  className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GPS Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GPS Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1.5 col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  placeholder="e.g. React.js, Tailwind CSS, JavaScript"
                  className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Manager</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className={`text-xs p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/40 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20">
              <input
                type="checkbox"
                id="emergency"
                checked={emergency}
                onChange={(e) => setEmergency(e.target.checked)}
                className="h-4 w-4 rounded accent-rose-500 cursor-pointer"
              />
              <label htmlFor="emergency" className="text-xs text-rose-400 font-bold cursor-pointer">
                🚨 Mark as Emergency Order: Immediate Same-Day Hiring Flag.
              </label>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs p-3.5 rounded-xl w-full transition-all duration-200 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Publish Job Listing
            </button>
          </form>
        )}

        {/* Applicants Tab */}
        {activeTab === 'applicants' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-heading">Candidate Screening Board</h3>
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Select Job:</span>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="bg-slate-950 text-xs text-white border-0 focus:ring-0 rounded cursor-pointer font-semibold"
                >
                  {companyJobs.map(job => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Applicants List */}
              <div className="lg:col-span-8 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Direct Applicants</h4>
                
                {applicants.map(app => {
                  const worker = app.workerId;
                  if (!worker) return null;

                  return (
                    <div key={app._id} className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'} space-y-3`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="font-bold text-sm font-heading">{worker.name} <span className="text-[10px] opacity-60 font-normal">({worker.email})</span></p>
                          <p className="text-[11px] text-blue-400 font-medium">Availability: {worker.availability} • Trust Score: {worker.trustScore}%</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {app.status === 'applied' ? (
                            <>
                              <button
                                onClick={() => handleApplicantStatus(app._id, 'selected')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2 px-4 rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-xs"
                              >
                                Select Candidate
                              </button>
                              <button
                                onClick={() => handleApplicantStatus(app._id, 'rejected')}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold p-2 px-4 rounded-xl text-xs transition-all duration-200 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1 bg-slate-950/40 border border-slate-800 rounded-full">
                              Candidate {app.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* AI Matching explanation banner */}
                      <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl text-[11px] opacity-80">
                        🤖 <strong>AI Matching Rationale ({app.aiMatchScore}%):</strong> {app.aiMatchExplanation}
                      </div>
                    </div>
                  );
                })}

                {applicants.length === 0 && (
                  <p className="text-xs opacity-50 italic py-6">No applicants have registered for this posting yet.</p>
                )}
              </div>

              {/* AI Recommended Talent sidebar */}
              <div className="lg:col-span-4 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-heading">AI Recommended Candidates</h4>

                {aiWorkersLoading ? (
                  <div className="flex items-center space-x-2 text-xs opacity-60 py-6">
                    <Loader className="animate-spin h-4 w-4 text-emerald-500" />
                    <span>Llama3 scanning profiles...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiWorkers.map((match, i) => (
                      <div key={i} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} text-xs space-y-2`}>
                        <div className="flex justify-between font-bold font-heading">
                          <span>{match.worker.name}</span>
                          <span className="text-blue-500">{match.score}% Score</span>
                        </div>
                        <p className="text-[10px] opacity-60 font-medium">Skills: {match.worker.skills.slice(0, 3).join(', ')}</p>
                        <p className="text-[10px] opacity-75 italic font-medium">"{match.explanation}"</p>
                      </div>
                    ))}
                    {aiWorkers.length === 0 && (
                      <p className="text-xs opacity-50 italic">No recommendations calculated.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Shift verification & Payouts Tab */}
        {activeTab === 'active-shifts' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-heading">Shift Verification & UPI Payout Board</h3>
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Select Job:</span>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="bg-slate-950 text-xs text-white border-0 focus:ring-0 rounded cursor-pointer font-semibold"
                >
                  {companyJobs.map(job => (
                    <option key={job._id} value={job._id}>{job.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Real time checkins telemetry feed */}
              <div className="lg:col-span-6 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-heading">GPS Check-in Telemetry Feed</h4>
                
                {attendanceLogs.map(log => (
                  <div key={log._id} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} text-xs space-y-2`}>
                    <div className="flex justify-between font-bold">
                      <span>{log.workerId.name}</span>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        log.status === 'checked_out' ? 'bg-slate-800 text-gray-400' :
                        log.status === 'checked_in' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-[10px] opacity-60 space-y-0.5">
                      <p>Check-In: {new Date(log.checkInTime).toLocaleTimeString()}</p>
                      {log.checkOutTime && <p>Check-Out: {new Date(log.checkOutTime).toLocaleTimeString()}</p>}
                    </div>

                    <div className="bg-slate-950/40 p-2 rounded-lg text-[9px] flex justify-between items-center opacity-80">
                      <span>LAT: {log.checkInLat.toFixed(4)} | LNG: {log.checkInLng.toFixed(4)}</span>
                      <span className={`font-bold ${log.gpsVerified ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {log.gpsVerified ? '✓ GPS MATCH' : '⚠️ OUT OF RANGE'}
                      </span>
                    </div>
                  </div>
                ))}

                {attendanceLogs.length === 0 && (
                  <p className="text-xs opacity-50 italic">No shift check-in logs recorded for this job today.</p>
                )}
              </div>

              {/* Action board: Approve work and release pay */}
              <div className="lg:col-span-6 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-heading">Approve Work & Release Payouts</h4>

                <div className="space-y-3">
                  {applicants.filter(app => ['selected', 'work_started', 'completed', 'paid'].includes(app.status)).map(app => {
                    const worker = app.workerId;
                    if (!worker) return null;

                    return (
                      <div key={app._id} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'} text-xs space-y-3`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-sm font-heading">{worker.name}</p>
                            <p className="text-[10px] opacity-60">Status: <strong className="uppercase text-blue-400">{app.status.replace('_', ' ')}</strong></p>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5">
                            {app.status === 'work_started' && (
                              <button
                                onClick={() => handleCompleteWork(app._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 px-3.5 rounded-xl text-[10px] transition-all duration-200 cursor-pointer"
                              >
                                Approve Work Completion
                              </button>
                            )}

                            {app.status === 'completed' && (
                              <>
                                <button
                                  onClick={() => handleUPIRelease(app._id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2 px-3.5 rounded-xl text-[10px] transition-all duration-200 cursor-pointer shadow-xs"
                                >
                                  Release Instant Pay
                                </button>
                                <button
                                  onClick={() => triggerRatingModal(app._id, worker._id, worker.name, selectedJobId)}
                                  className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold p-2 px-3.5 rounded-xl text-[10px] transition-all duration-200 cursor-pointer"
                                >
                                  Rate Worker
                                </button>
                              </>
                            )}

                            {app.status === 'paid' && (
                              <div className="flex items-center space-x-1 text-emerald-500 font-bold uppercase text-[10px]">
                                <ShieldCheck className="h-4 w-4" />
                                <span>Settled via UPI</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {applicants.filter(app => ['selected', 'work_started', 'completed', 'paid'].includes(app.status)).length === 0 && (
                    <p className="text-xs opacity-50 italic">No active workers currently assigned to this shift.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Rating Feed Feedback Modal */}
      {ratingModalOpen && ratingTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-md w-full relative shadow-2xl">
            <button
              onClick={() => setRatingModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-3 font-heading">
              Rate Worker Performance: {ratingTarget.workerName}
            </h3>

            <div className="space-y-4 my-4 text-xs">
              {[
                { label: 'Punctuality & Attendance', val: punctuality, set: setPunctuality },
                { label: 'Work Quality & Speed', val: workQuality, set: setWorkQuality },
                { label: 'Behavioral Etiquette', val: behaviour, set: setBehaviour },
                { label: 'Communication Channels', val: communication, set: setCommunication }
              ].map((metric, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-gray-400">{metric.label}</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => metric.set(star)}
                        className={`text-base cursor-pointer ${
                          star <= metric.val ? 'text-amber-400' : 'text-gray-700'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex flex-col space-y-1.5 mt-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Comment Feedback</label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Excellent work speed, prompt arrival..."
                  className="bg-slate-900 border border-slate-800 text-xs rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setRatingModalOpen(false)}
                className="bg-slate-900 text-gray-400 font-bold text-xs p-2.5 px-4 rounded-xl border border-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={submitWorkerRating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs p-2.5 px-5 rounded-xl cursor-pointer shadow-xs"
              >
                Submit Worker Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
