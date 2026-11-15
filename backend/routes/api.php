<?php

use App\Routes\Router;
use App\Controllers\AuthController;
use App\Controllers\PublicController;
use App\Controllers\BookingController;
use App\Controllers\CustomerController;
use App\Controllers\StaffController;
use App\Controllers\AdminController;
use App\Controllers\MarketingController;

// Health & Public Salon Endpoints
Router::get('/api/v1/health', [AuthController::class, 'me']);
Router::get('/api/v1/public/salon', [PublicController::class, 'salon']);
Router::get('/api/v1/public/categories', [PublicController::class, 'categories']);
Router::get('/api/v1/public/services', [PublicController::class, 'services']);
Router::get('/api/v1/public/staff', [PublicController::class, 'staff']);
Router::get('/api/v1/public/offers', [PublicController::class, 'offers']);
Router::get('/api/v1/public/reviews', [PublicController::class, 'reviews']);
Router::get('/api/v1/public/availability', [PublicController::class, 'availability']);
Router::post('/api/v1/public/contact', [PublicController::class, 'contact']);

// Authentication Routes
Router::post('/api/v1/auth/login', [AuthController::class, 'login']);
Router::post('/api/v1/auth/register', [AuthController::class, 'register']);
Router::post('/api/v1/auth/logout', [AuthController::class, 'logout']);
Router::get('/api/v1/auth/me', [AuthController::class, 'me']);
Router::put('/api/v1/auth/profile', [AuthController::class, 'updateProfile']);
Router::put('/api/v1/auth/password', [AuthController::class, 'changePassword']);

// Booking Engine Routes
Router::post('/api/v1/bookings', [BookingController::class, 'create']);
Router::get('/api/v1/bookings/{id}', [BookingController::class, 'show']);
Router::get('/api/v1/bookings/reference/{reference}', [BookingController::class, 'byReference']);
Router::post('/api/v1/bookings/{id}/cancel', [BookingController::class, 'cancel']);
Router::post('/api/v1/bookings/{id}/reschedule', [BookingController::class, 'reschedule']);

// Customer Portal Routes
Router::get('/api/v1/customer/dashboard', [CustomerController::class, 'dashboard']);
Router::get('/api/v1/customer/appointments', [CustomerController::class, 'appointments']);
Router::get('/api/v1/customer/loyalty', [CustomerController::class, 'loyalty']);
Router::post('/api/v1/customer/reviews', [CustomerController::class, 'submitReview']);

// Staff / Stylist Workspace Routes
Router::get('/api/v1/staff/dashboard', [StaffController::class, 'dashboard']);
Router::get('/api/v1/staff/calendar', [StaffController::class, 'calendar']);
Router::get('/api/v1/staff/appointments', [StaffController::class, 'appointments']);
Router::patch('/api/v1/staff/appointments/{id}/status', [StaffController::class, 'updateStatus']);
Router::get('/api/v1/staff/availability', [StaffController::class, 'availability']);
Router::post('/api/v1/staff/leave', [StaffController::class, 'requestLeave']);

// Owner / Admin Console Routes
Router::get('/api/v1/admin/dashboard', [AdminController::class, 'dashboard']);
Router::get('/api/v1/admin/calendar', [AdminController::class, 'calendar']);
Router::get('/api/v1/admin/appointments', [AdminController::class, 'appointments']);
Router::post('/api/v1/admin/appointments', [AdminController::class, 'createAppointment']);
Router::patch('/api/v1/admin/appointments/{id}/status', [AdminController::class, 'updateStatus']);
Router::get('/api/v1/admin/services', [AdminController::class, 'services']);
Router::post('/api/v1/admin/services', [AdminController::class, 'createService']);
Router::get('/api/v1/admin/staff', [AdminController::class, 'staff']);
Router::get('/api/v1/admin/customers', [AdminController::class, 'customers']);
Router::get('/api/v1/admin/payments', [AdminController::class, 'payments']);
Router::post('/api/v1/admin/payments', [AdminController::class, 'recordPayment']);
Router::get('/api/v1/admin/reports', [AdminController::class, 'reports']);
Router::get('/api/v1/admin/reports/export', [AdminController::class, 'exportReportsCsv']);
Router::get('/api/v1/admin/settings', [AdminController::class, 'settings']);
Router::put('/api/v1/admin/settings', [AdminController::class, 'updateSettings']);
Router::get('/api/v1/admin/settings/full', [AdminController::class, 'fullSettings']);
Router::put('/api/v1/admin/settings/full', [AdminController::class, 'updateFullSettings']);
Router::post('/api/v1/admin/settings/closures', [AdminController::class, 'addClosure']);
Router::delete('/api/v1/admin/settings/closures/{id}', [AdminController::class, 'deleteClosure']);

// Marketing & Growth Studio Routes
Router::get('/api/v1/marketing/overview', [MarketingController::class, 'overview']);
Router::get('/api/v1/marketing/campaigns', [MarketingController::class, 'campaigns']);
Router::post('/api/v1/marketing/campaigns', [MarketingController::class, 'createCampaign']);
Router::get('/api/v1/marketing/segments', [MarketingController::class, 'segments']);
Router::get('/api/v1/marketing/coupons', [MarketingController::class, 'coupons']);
Router::post('/api/v1/marketing/coupons', [MarketingController::class, 'createCoupon']);
Router::put('/api/v1/marketing/coupons/{id}', [MarketingController::class, 'updateCoupon']);
Router::patch('/api/v1/marketing/coupons/{id}/toggle', [MarketingController::class, 'toggleCoupon']);
Router::delete('/api/v1/marketing/coupons/{id}', [MarketingController::class, 'deleteCoupon']);
Router::post('/api/v1/marketing/validate-coupon', [MarketingController::class, 'validateCoupon']);
Router::get('/api/v1/marketing/loyalty', [MarketingController::class, 'loyalty']);
Router::post('/api/v1/marketing/loyalty/adjust', [MarketingController::class, 'adjustLoyalty']);
Router::get('/api/v1/marketing/loyalty/ledger', [MarketingController::class, 'loyaltyLedger']);
Router::get('/api/v1/marketing/loyalty/rules', [MarketingController::class, 'loyaltyRules']);
Router::put('/api/v1/marketing/loyalty/rules', [MarketingController::class, 'updateLoyaltyRules']);
