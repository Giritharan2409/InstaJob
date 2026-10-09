import React from 'react';
import { Briefcase, Sun, Moon, LogOut, ShieldCheck, Building, UserCheck } from 'lucide-react';

export default function Navbar({ currentRole, activeUser, theme, toggleTheme, isLoggedIn, onLogout }) {
  const isDark = theme === 'dark';

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'admin': 
        return {
          label: 'Admin Moderator',
          icon: ShieldCheck,
          style: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };
      case 'employer': 
        return {
          label: 'Employer Workspace',
          icon: Building,
          style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      default: 
        return {
          label: 'Worker Portal',
          icon: UserCheck,
          style: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };
    }
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-300 ${
      isDark 
        ? 'bg-slate-950/80 border-slate-800/80 text-white' 
        : 'bg-white/80 border-slate-200/90 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 ring-1 ring-white/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent font-heading">
                  InstaJob
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                  PRO
                </span>
              </div>
              <span className="text-[10px] block font-semibold opacity-60 tracking-wider uppercase -mt-0.5">
                AI Temp Gig Network
              </span>
            </div>
          </div>

          {/* User Status & Navigation Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Active User Chip */}
            {isLoggedIn && activeUser && (
              <div className={`hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100/80 border-slate-200'
              }`}>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
                  {(activeUser.companyName || activeUser.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold truncate max-w-[140px] leading-tight">
                    {activeUser.companyName || activeUser.name}
                  </div>
                  <div className={`text-[9px] font-bold inline-flex items-center space-x-1 px-1.5 py-0.2 rounded border uppercase tracking-wider mt-0.5 ${roleBadge.style}`}>
                    <RoleIcon className="h-2.5 w-2.5" />
                    <span>{roleBadge.label}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-amber-400 hover:border-slate-700'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200/80 text-slate-700'
              }`}
              title="Toggle color theme"
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5 text-slate-700" />}
            </button>

            {/* Logout Action */}
            {isLoggedIn && (
              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold p-2 px-3.5 rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-xs"
                title="Sign out of account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
