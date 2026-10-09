import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import WorkerDashboard from './pages/WorkerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import api, { setClientContext } from './utils/api';
import { Loader } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [view, setView] = useState('landing'); // landing, auth, dashboard
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState('worker');
  const [currentUserId, setCurrentUserId] = useState('');
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [authTargetRole, setAuthTargetRole] = useState('worker');

  // Initialize theme & load cached context
  useEffect(() => {
    document.documentElement.classList.add('dark'); // default dark mode
    const cachedRole = localStorage.getItem('insta_role');
    const cachedUserId = localStorage.getItem('insta_user_id');
    
    if (cachedRole) {
      setCurrentRole(cachedRole);
      setCurrentUserId(cachedUserId || '');
      setIsLoggedIn(true);
      setView('dashboard');
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch active user details whenever logged-in context changes
  useEffect(() => {
    if (isLoggedIn) {
      fetchActiveUser();
    }
  }, [isLoggedIn, currentRole, currentUserId]);

  const fetchActiveUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      setActiveUser(res.data.user);
      setCurrentRole(res.data.role);
      if (res.data.user && res.data.user._id) {
        setCurrentUserId(res.data.user._id);
        setClientContext(res.data.role, res.data.user._id);
      }
    } catch (err) {
      console.error('Session verification failed, logging out:', err);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (role, userId, user) => {
    setCurrentRole(role);
    setCurrentUserId(userId);
    setActiveUser(user);
    setIsLoggedIn(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('insta_role');
    localStorage.removeItem('insta_user_id');
    setIsLoggedIn(false);
    setActiveUser(null);
    setCurrentUserId('');
    setCurrentRole('worker');
    setView('landing');
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    } else {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  };

  const handleEnterApp = (role) => {
    setAuthTargetRole(role || 'worker');
    setView('auth');
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-smooth ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Navigation */}
      <Navbar 
        currentRole={currentRole} 
        activeUser={activeUser} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Main View Manager */}
      {loading && isLoggedIn && !activeUser && currentRole !== 'admin' ? (
        <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] space-y-4">
          <Loader className="h-10 w-10 text-blue-500 animate-spin" />
          <span className="text-gray-400 text-sm font-semibold">Resolving secure gateway logs...</span>
        </div>
      ) : view === 'landing' ? (
        <LandingPage theme={theme} onEnterApp={handleEnterApp} />
      ) : view === 'auth' && !isLoggedIn ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} theme={theme} targetRole={authTargetRole} />
      ) : (
        <div className="pb-12">
          {currentRole === 'worker' && (
            <WorkerDashboard activeUserId={currentUserId} theme={theme} />
          )}
          {currentRole === 'employer' && (
            <EmployerDashboard activeUserId={currentUserId} theme={theme} />
          )}
          {currentRole === 'admin' && (
            <AdminDashboard theme={theme} />
          )}
        </div>
      )}
    </div>
  );
}
