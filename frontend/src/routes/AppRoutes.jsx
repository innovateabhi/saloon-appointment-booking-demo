import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { ServicesPage } from '../pages/public/ServicesPage';
import { TeamPage } from '../pages/public/TeamPage';
import { GalleryPage } from '../pages/public/GalleryPage';
import { OffersPage } from '../pages/public/OffersPage';
import { AboutPage } from '../pages/public/AboutPage';
import { ContactPage } from '../pages/public/ContactPage';
import { BookingWizardPage } from '../pages/booking/BookingWizardPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminCalendarPage } from '../pages/admin/AdminCalendarPage';
import { AdminAppointmentsPage } from '../pages/admin/AdminAppointmentsPage';
import { AdminWalkinPage } from '../pages/admin/AdminWalkinPage';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage';
import { AdminServicesPage } from '../pages/admin/AdminServicesPage';
import { AdminStaffPage } from '../pages/admin/AdminStaffPage';
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminMarketingPage } from '../pages/admin/AdminMarketingPage';
import { AdminLoyaltyOffersPage } from '../pages/admin/AdminLoyaltyOffersPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

// Staff Pages
import { StaffDashboardPage } from '../pages/staff/StaffDashboardPage';
import { StaffCalendarPage } from '../pages/staff/StaffCalendarPage';
import { StaffAppointmentsPage } from '../pages/staff/StaffAppointmentsPage';
import { StaffAvailabilityPage } from '../pages/staff/StaffAvailabilityPage';
import { StaffProfilePage } from '../pages/staff/StaffProfilePage';

// Customer Pages
import { CustomerDashboardPage } from '../pages/customer/CustomerDashboardPage';
import { CustomerAppointmentsPage } from '../pages/customer/CustomerAppointmentsPage';
import { CustomerRewardsPage } from '../pages/customer/CustomerRewardsPage';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-ivory text-espresso">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with Luxury Shell */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/book" element={<BookingWizardPage />} />
      </Route>

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Admin Console */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'owner']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="calendar" element={<AdminCalendarPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="walkin" element={<AdminWalkinPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="services" element={<AdminServicesPage />} />
        <Route path="staff" element={<AdminStaffPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="marketing" element={<AdminMarketingPage />} />
        <Route path="loyalty" element={<AdminLoyaltyOffersPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="cms" element={<AdminSettingsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Protected Staff Studio */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StaffDashboardPage />} />
        <Route path="calendar" element={<StaffCalendarPage />} />
        <Route path="appointments" element={<StaffAppointmentsPage />} />
        <Route path="availability" element={<StaffAvailabilityPage />} />
        <Route path="profile" element={<StaffProfilePage />} />
      </Route>

      {/* Protected Customer Lounge */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['customer', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CustomerDashboardPage />} />
        <Route path="appointments" element={<CustomerAppointmentsPage />} />
        <Route path="favorites" element={<CustomerAppointmentsPage />} />
        <Route path="rewards" element={<CustomerRewardsPage />} />
        <Route path="profile" element={<CustomerProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};
