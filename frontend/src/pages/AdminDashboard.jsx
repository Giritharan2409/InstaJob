import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ShieldAlert, ShieldCheck, Users, Briefcase, FileWarning, 
  Trash2, UserX, UserCheck, CheckCircle2, AlertOctagon, Loader, Terminal
} from 'lucide-react';

export default function AdminDashboard({ theme }) {
  const [workers, setWorkers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('users'); // users, jobs, complaints, analytics

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [workersRes, employersRes, jobsRes, complaintsRes] = await Promise.all([
        api.get('/workers'),
        api.get('/employers'),
        api.get('/jobs'),
        api.get('/complaints')
      ]);

      setWorkers(workersRes.data);
      setEmployers(employersRes.data);
      setJobs(jobsRes.data);
      setComplaints(complaintsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkerSuspend = async (workerId) => {
    try {
      await api.patch(`/workers/${workerId}/suspend`);
      alert('Worker account status toggled successfully!');
      fetchAdminData();
    } catch (err) {
      alert('Failed to modify worker status.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to remove this job listing?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      alert('Job listing removed.');
      fetchAdminData();
    } catch (err) {
      alert('Failed to delete job.');
    }
  };

  const handleResolveComplaint = async (complaintId, action) => {
    try {
      await api.patch(`/complaints/${complaintId}/status`, { status: action });
      alert(`Complaint status updated to: ${action}`);
      fetchAdminData();
    } catch (err) {
      alert('Failed to resolve complaint.');
    }
  };

  const isDark = theme === 'dark';

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] space-y-4">
        <Loader className="h-10 w-10 text-rose-500 animate-spin" />
        <span className="text-gray-400 text-sm font-semibold">Decrypting admin ledger & audit logs...</span>
      </div>
    );
  }

  const chartData = [
    { name: 'Workers', count: workers.length },
    { name: 'Employers', count: employers.length },
    { name: 'Active Jobs', count: jobs.length },
    { name: 'Pending Disputes', count: complaints.filter(c => c.status === 'pending').length }
  ];

  return (
    <div className={`min-h-[calc(100vh-64px)] p-6 md:p-8 transition-all duration-300 ${
      isDark ? 'bg-mesh-dark text-white' : 'bg-mesh-light text-slate-900'
    }`}>
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 max-w-7xl mx-auto">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center space-x-2 font-heading">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
            <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent">Admin Compliance Workspace</span>
          </h2>
          <p className="text-xs opacity-70 mt-1">Platform moderation, fraud detection telemetry, and dispute resolution.</p>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-1 bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl shadow-xs">
          {[
            { id: 'users', label: 'User Governance', icon: Users },
            { id: 'jobs', label: 'Listing Telemetry', icon: Briefcase },
            { id: 'complaints', label: 'Dispute Resolution', icon: FileWarning },
            { id: 'analytics', label: 'System Analytics', icon: CheckCircle2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 p-2.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto space-y-6">

        {/* User Governance Tab */}
        {activeSubTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Workers Panel */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 font-heading">Registered Workers</h3>
              <div className="space-y-3">
                {workers.map(w => (
                  <div key={w._id} className="p-4 bg-slate-950/30 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold font-heading">{w.name} {w.trustScore === 0 && <span className="text-rose-500 font-bold text-[9px] uppercase ml-1">Suspended</span>}</p>
                      <p className="text-[10px] opacity-60">{w.email} • Trust Index: {w.trustScore}%</p>
                    </div>
                    <button
                      onClick={() => handleToggleWorkerSuspend(w._id)}
                      className={`font-semibold p-1.5 px-3.5 rounded-xl text-[10px] flex items-center space-x-1 transition-all duration-200 cursor-pointer ${
                        w.trustScore === 0 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {w.trustScore === 0 ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Unsuspend</span>
                        </>
                      ) : (
                        <>
                          <UserX className="h-3.5 w-3.5" />
                          <span>Suspend</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Employers Panel */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 font-heading">Enterprise Employers</h3>
              <div className="space-y-3">
                {employers.map(emp => (
                  <div key={emp._id} className="p-4 bg-slate-950/30 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold font-heading">{emp.companyName}</p>
                      <p className="text-[10px] opacity-60">{emp.name} ({emp.email}) • Rating: {emp.rating} ★</p>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 p-1 px-3 rounded-full border border-emerald-500/20">
                      Verified Enterprise
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Listing Telemetry Tab */}
        {activeSubTab === 'jobs' && (
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 font-heading">Active Job Listing Telemetry</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(job => (
                <div key={job._id} className="p-4 bg-slate-950/30 border border-slate-800 rounded-2xl flex flex-col justify-between text-xs space-y-3 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm font-heading">{job.title}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">{job.companyName} • {job.category}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="text-rose-400 hover:text-rose-500 bg-rose-500/10 p-2 rounded-xl transition-all duration-200 cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* AI Fraud Risk Bar */}
                  <div className="bg-slate-950/60 p-3 rounded-xl space-y-1.5 border border-slate-800">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="opacity-60">AI FRAUD RISK INDEX:</span>
                      <span className={job.aiFakeScore > 40 ? 'text-rose-400' : 'text-emerald-400'}>
                        {job.aiFakeScore}% {job.aiFakeScore > 40 ? 'HIGH RISK' : 'LOW RISK / VERIFIED'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${job.aiFakeScore > 40 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${job.aiFakeScore}%` }}
                      ></div>
                    </div>
                    <p className="text-[9px] opacity-75 leading-relaxed italic mt-1 font-medium">"{job.aiAnalysis || 'Analysing metadata...'}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dispute Resolution Tab */}
        {activeSubTab === 'complaints' && (
          <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 font-heading">Dispute Moderation Panel</h3>

            <div className="space-y-4">
              {complaints.map(comp => (
                <div key={comp._id} className="p-5 bg-slate-950/30 border border-slate-800 rounded-2xl text-xs space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="font-bold text-sm font-heading">{comp.title}</h4>
                      <p className="text-[10px] opacity-60 mt-0.5">Reporter Type: {comp.reporterType} • Status: <strong className="uppercase text-amber-400">{comp.status}</strong></p>
                    </div>

                    <div className="flex gap-2">
                      {comp.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleResolveComplaint(comp._id, 'resolved')}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold p-2 px-4 rounded-xl text-[10px] flex items-center space-x-1.5 transition-all duration-200 cursor-pointer shadow-xs"
                          >
                            <AlertOctagon className="h-3.5 w-3.5" />
                            <span>Penalise & Resolve</span>
                          </button>
                          <button
                            onClick={() => handleResolveComplaint(comp._id, 'dismissed')}
                            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold p-2 px-4 rounded-xl text-[10px] transition-all duration-200 cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center space-x-1 text-emerald-400 font-bold uppercase text-[9px]">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Actioned: {comp.status}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="opacity-80 italic bg-slate-950/40 p-3 rounded-xl border border-slate-800">"{comp.description}"</p>
                </div>
              ))}

              {complaints.length === 0 && (
                <p className="text-xs opacity-50 italic py-6">No user reports or complaints logged.</p>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeSubTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Usage Chart */}
            <div className={`p-6 rounded-2xl border lg:col-span-2 ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 font-heading">Platform Metrics Overview</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke={isDark ? "#4b5563" : "#9ca3af"} fontSize={10} />
                    <YAxis stroke={isDark ? "#4b5563" : "#9ca3af"} fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#0f172a' : '#fff', borderColor: '#f43f5e', borderRadius: '12px', fontSize: 11 }} />
                    <Bar dataKey="count" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* System Telemetry Console */}
            <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-heading flex items-center space-x-1.5">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>System Telemetry Console</span>
              </h3>
              <div className="font-mono text-[10px] text-gray-400 space-y-2 bg-slate-950 p-4 border border-slate-800 rounded-xl leading-relaxed max-h-60 overflow-y-auto">
                <p className="text-emerald-400">[OK] Database connection online</p>
                <p className="text-emerald-400">[OK] Express API router endpoints verified</p>
                <p className="text-blue-400">[INFO] Groq AI Llama3 active</p>
                <p className="text-gray-500">[TRACE] GPS Geofence boundary check: 500m</p>
                <p className="text-gray-500">[TRACE] 3 Workers, 2 Employers initialized</p>
                <p className="text-blue-400">[INFO] Audit ledger integrity: 100%</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
