import React, { useState, useEffect } from 'react';
import { QrCode, X, CheckCircle, AlertTriangle, ScanLine } from 'lucide-react';
import api from '../utils/api';

export default function QRModal({ application, type, userLat, userLng, onClose, onSuccess }) {
  const [scanning, setScanning] = useState(true);
  const [status, setStatus] = useState('idle'); // idle, scanning, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAttendance();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleAttendance = async () => {
    setStatus('scanning');
    try {
      const endpoint = type === 'check-in' ? '/attendance/check-in' : '/attendance/check-out';
      const payload = {
        applicationId: application._id,
        lat: userLat,
        lng: userLng,
        qrCodeContent: `instajob-qr-code-job-${application.jobId._id || application.jobId}`
      };

      const res = await api.post(endpoint, payload);
      setStatus('success');
      setTimeout(() => {
        onSuccess(res.data);
      }, 1500);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.error || 'Attendance validation failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative overflow-hidden shadow-2xl">
        
        {/* Glowing Background Radial */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-600/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close Action */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-200 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center justify-center space-x-2 font-heading">
            <QrCode className="h-5 w-5 text-blue-400" />
            <span>Attendance {type === 'check-in' ? 'Check-In' : 'Check-Out'}</span>
          </h3>
          <p className="text-xs opacity-60 mt-1">
            Validating GPS telemetry & scanning site location QR token
          </p>
        </div>

        {/* Scanner Simulation Box */}
        <div className="flex flex-col items-center justify-center py-4">
          {status === 'scanning' || (scanning && status === 'idle') ? (
            <div className="relative w-56 h-56 border-2 border-dashed border-blue-500/40 rounded-3xl flex items-center justify-center bg-slate-900/60 overflow-hidden shadow-inner">
              {/* Laser Beam Animation */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-lg shadow-blue-500/80 animate-laser"></div>
              
              <QrCode className="h-28 w-28 text-blue-500/30 animate-pulse" />
              
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-blue-500/10 border border-blue-500/30 text-[10px] text-blue-400 font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse flex items-center space-x-1 whitespace-nowrap">
                <ScanLine className="h-3 w-3" />
                <span>Simulating Camera Scan</span>
              </div>
            </div>
          ) : status === 'success' ? (
            <div className="w-56 h-56 bg-emerald-950/20 border-2 border-emerald-500/40 rounded-3xl flex flex-col items-center justify-center text-center p-4">
              <CheckCircle className="h-14 w-14 text-emerald-400 animate-bounce" />
              <h4 className="text-emerald-400 font-bold mt-3 text-sm font-heading">Attendance Verified</h4>
              <p className="text-[10px] text-emerald-300/80 mt-1 font-mono">
                GPS MATCH: PASS <br />
                SITE TOKEN: VALID
              </p>
            </div>
          ) : (
            <div className="w-56 h-56 bg-rose-950/20 border-2 border-rose-500/40 rounded-3xl flex flex-col items-center justify-center text-center p-4">
              <AlertTriangle className="h-14 w-14 text-rose-400 animate-pulse" />
              <h4 className="text-rose-400 font-bold mt-3 text-sm font-heading">Validation Mismatch</h4>
              <p className="text-[10px] text-rose-300/85 mt-2 px-2 max-w-full truncate break-words font-mono">
                {errorMessage}
              </p>
            </div>
          )}
        </div>

        {/* Telemetry Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 mt-2 text-[10px] font-mono opacity-80 space-y-1">
          <div className="flex justify-between">
            <span className="opacity-50">JOB SITE ID:</span>
            <span className="font-bold">{application.jobId._id || application.jobId}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-50">WORKER LAT/LNG:</span>
            <span className="font-bold">{userLat.toFixed(4)}, {userLng.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-50">CHECK-IN TYPE:</span>
            <span className="uppercase text-blue-400 font-bold">{type}</span>
          </div>
        </div>

        {/* Exit button on error */}
        {status === 'error' && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2 px-6 rounded-xl border border-slate-700 transition-all duration-200 cursor-pointer"
            >
              Close Scanner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
