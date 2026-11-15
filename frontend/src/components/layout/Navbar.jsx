import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Sparkles, Menu, X, User, Calendar, LogOut, ChevronDown } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const { user, isAuthenticated, logout, isAdmin, isStaff } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Our Team', path: '/team' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Exclusive Offers', path: '/offers' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isStaff) return '/staff/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-[#E5D2B8]/50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-espresso flex items-center justify-center text-gold border border-gold/40 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl tracking-[0.2em] font-semibold text-espresso block leading-none">
                AURELIA
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-taupe block mt-1">
                Haute Coiffure & Spa
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs uppercase tracking-widest font-medium transition-colors duration-200 ${
                    active ? 'text-gold font-semibold border-b-2 border-gold pb-1' : 'text-espresso/80 hover:text-gold'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/book">
              <Button variant="gold" size="md">
                Reserve Appointment
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 p-1.5 pl-3 pr-2 rounded-sm border border-[#E5D2B8] bg-white text-xs font-medium text-espresso hover:border-gold transition-colors"
                >
                  <User className="w-4 h-4 text-gold" />
                  <span>{user.first_name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-taupe" />
                </button>

                {profileDropdown && (
                  <div
                    onMouseLeave={() => setProfileDropdown(false)}
                    className="absolute right-0 mt-2 w-48 bg-white border border-[#E5D2B8] shadow-luxury rounded-sm py-1 z-50 text-xs"
                  >
                    <div className="px-4 py-2 border-b border-[#F1EAE1] bg-ivory/50">
                      <p className="font-semibold text-espresso truncate">{user.first_name} {user.last_name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-taupe capitalize">{user.role_name}</p>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setProfileDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-espresso hover:bg-cream/40"
                    >
                      <Calendar className="w-3.5 h-3.5 text-gold" />
                      Portal Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-status-error hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="md">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/book">
              <Button variant="gold" size="sm">
                Reserve
              </Button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-espresso hover:text-gold focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-[#E5D2B8] bg-ivory px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm uppercase tracking-wider font-medium text-espresso hover:bg-cream/60 rounded-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-[#E5D2B8]/60 flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 bg-espresso text-ivory rounded-sm text-xs uppercase tracking-wider font-medium"
                >
                  Open Dashboard ({user.first_name})
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full py-2 border border-status-error/40 text-status-error rounded-sm text-xs uppercase tracking-wider"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2 border border-gold text-espresso rounded-sm text-xs uppercase tracking-wider font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

