import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarCheck2,
  Users,
  Scissors,
  UserCheck,
  CreditCard,
  Megaphone,
  Gift,
  BarChart3,
  Globe,
  Settings,
  Clock,
  Sparkles,
  Heart,
  Award,
  UserCircle,
  PlusCircle,
  X,
  LogOut
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, closeMobile }) => {
  const { user, isAdmin, isStaff, logout } = useAuth();

  const adminNav = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Calendar Schedule', path: '/admin/calendar', icon: CalendarDays },
    { name: 'Appointments', path: '/admin/appointments', icon: CalendarCheck2 },
    { name: 'Walk-in Terminal', path: '/admin/walkin', icon: PlusCircle },
    { name: 'Customer Directory', path: '/admin/customers', icon: Users },
    { name: 'Services & Menu', path: '/admin/services', icon: Scissors },
    { name: 'Staff & Rosters', path: '/admin/staff', icon: UserCheck },
    { name: 'Billing & Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Marketing Studio', path: '/admin/marketing', icon: Megaphone },
    { name: 'Loyalty & Offers', path: '/admin/loyalty', icon: Gift },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Website CMS', path: '/admin/cms', icon: Globe },
    { name: 'Studio Settings', path: '/admin/settings', icon: Settings },
  ];

  const staffNav = [
    { name: 'Staff Overview', path: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'My Schedule', path: '/staff/calendar', icon: CalendarDays },
    { name: 'Assigned Bookings', path: '/staff/appointments', icon: CalendarCheck2 },
    { name: 'Availability & Leave', path: '/staff/availability', icon: Clock },
    { name: 'My Stylist Profile', path: '/staff/profile', icon: UserCircle },
  ];

  const customerNav = [
    { name: 'My Lounge', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'My Appointments', path: '/customer/appointments', icon: CalendarCheck2 },
    { name: 'Reserve Appointment', path: '/book', icon: PlusCircle },
    { name: 'Favorite Stylists', path: '/customer/favorites', icon: Heart },
    { name: 'Aurelia Privilege', path: '/customer/rewards', icon: Award },
    { name: 'Profile & Care', path: '/customer/profile', icon: UserCircle },
  ];

  const navigation = isAdmin ? adminNav : isStaff ? staffNav : customerNav;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-espresso/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-espresso text-ivory border-r border-gold/20 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-ivory/10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif text-xl tracking-[0.2em] font-semibold text-ivory block leading-none">
                AURELIA
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-taupe block mt-1">
                {isAdmin ? 'Admin Console' : isStaff ? 'Stylist Portal' : 'Member Lounge'}
              </span>
            </div>
          </Link>

          <button
            onClick={closeMobile}
            className="lg:hidden text-taupe hover:text-ivory"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User preview */}
        <div className="px-6 py-4 border-b border-ivory/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-serif font-bold text-sm">
              {user?.first_name?.[0] || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-ivory truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-gold/80 truncate">
                {user?.role_name}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-gold text-espresso font-semibold shadow-sm'
                      : 'text-ivory/70 hover:bg-cream/10 hover:text-gold'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer logout */}
        <div className="p-4 border-t border-ivory/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-wider text-rose hover:bg-rose/10 rounded-sm transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

