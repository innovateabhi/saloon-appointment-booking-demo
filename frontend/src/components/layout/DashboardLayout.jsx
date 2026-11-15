import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, ExternalLink, Sparkles } from 'lucide-react';

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Simple title generator from path
  const getPageTitle = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length > 1) {
      return parts[1].replace('-', ' ').toUpperCase();
    }
    return 'DASHBOARD';
  };

  return (
    <div className="flex h-screen bg-[#F8F5F0] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#E5D2B8]/60 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-espresso hover:text-gold focus:outline-none p-1"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-taupe block">
                Aurelia Management Console
              </span>
              <h1 className="font-serif text-xl font-semibold text-espresso">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-taupe hover:text-espresso font-medium px-3 py-1.5 rounded-sm border border-[#E5D2B8] hover:border-gold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>

            <button
              className="relative p-2 rounded-sm text-espresso/70 hover:text-espresso hover:bg-cream/40 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold ring-2 ring-white" />
            </button>

            <div className="h-8 w-px bg-[#E5D2B8]/80 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-cream border border-gold/40 flex items-center justify-center text-espresso font-serif font-bold text-xs">
                {user?.first_name?.[0] || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-espresso leading-tight">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[10px] text-taupe uppercase tracking-wider">
                  {user?.role_name}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

