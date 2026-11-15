# AURELIA — Luxury Salon & Beauty Studio Management Platform

> **Where Haute Coiffure Meets Bespoke Aesthetics & Operations Excellence**

AURELIA is a complete, production-grade salon appointment booking, multi-chair operations management, CRM, and marketing growth studio built for luxury salons, beauty ateliers, barbershops, and wellness spas.

---

## 1. System Architecture & Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, TanStack Query, Axios, Lucide React, Framer Motion, Recharts, Sonner, date-fns.
- **Backend:** PHP 8.2+ RESTful Architecture, PDO with prepared statements, Composer autoloader, PHPMailer, secure session cookies (`HttpOnly`, `SameSite=Lax`), centralized error handling.
- **Database:** MariaDB / MySQL 10.4+ in XAMPP, 42 normalized relational tables, InnoDB engine, utf8mb4 collation, zero floating-point money storage (`DECIMAL(10,2)`), concurrency row locks (`SELECT ... FOR UPDATE`).
- **Local Environment:** Windows 10/11, XAMPP (Apache :80, MySQL :3306), Node.js v24+, npm 11+.

```
C:\xampp\htdocs\aurelia-salon/ (Linked to D:\saloon-appointment-booking via NTFS Junction)
├── backend/
│   ├── app/
│   │   ├── config/          # Config.php, Database.php (PDO Singleton & Transactions)
│   │   ├── controllers/     # Auth, Public, Booking, Customer, Staff, Admin, Marketing
│   │   ├── helpers/         # Standardized Response, Security & Sanitization
│   │   ├── mail/            # PHPMailer Adapters & Queue
│   │   ├── middleware/      # CorsMiddleware.php, AuthMiddleware.php
│   │   ├── models/          # BaseModel.php, User.php, Role.php, Salon.php
│   │   ├── routes/          # Router.php (RESTful Route Dispatcher)
│   │   └── services/        # AvailabilityService, BookingService, ReportingService, MarketingService
│   ├── database/
│   │   ├── schema.sql       # 42 Relational Tables (100% Normalized)
│   │   └── seeds/           # DatabaseSeeder.php, FullSalonSeeder.php
│   ├── public/              # Front Controller (index.php, .htaccess)
│   ├── routes/              # api.php (30+ REST Endpoints)
│   ├── composer.json        # PSR-4 Autoloading & PHPMailer 6.9
│   └── .env                 # Environment configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Navbar, Footer, DashboardLayout, Sidebar
│   │   │   └── ui/          # Button, Input, Card, Badge, Modal, Spinner
│   │   ├── context/         # AuthContext with session sync
│   │   ├── pages/
│   │   │   ├── public/      # Home, Services, Team, Gallery, Offers, About, Contact
│   │   │   ├── booking/     # 7-Step Sequential BookingWizardPage
│   │   │   ├── auth/        # LoginPage (with 1-click demo switcher), RegisterPage
│   │   │   ├── admin/       # Dashboard, Calendar, Appointments, Walk-in, Services, Staff, Customers, Payments, Marketing, Reports, Settings
│   │   │   ├── staff/       # Dashboard, Calendar, Appointments, Availability, Profile
│   │   │   └── customer/    # Dashboard, Appointments (with Review modal), Rewards, Profile
│   │   ├── routes/          # AppRoutes.jsx, ProtectedRoute.jsx
│   │   ├── services/        # api.js (Axios instance with withCredentials: true)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js   # Luxury Ivory, Champagne, Gold, Espresso palette
│   └── vite.config.js       # Port 5173 with proxy
└── tests/
    ├── verify_phase1.ps1         # Phase 1 Auth & Core Verification
    └── verify_e2e_production.ps1  # Complete 8-Step Business E2E Verification
```

---

## 2. Interactive Navigation & Portals

### 🌟 Public Salon Website
- **Home (`/`)**: Luxury hero showcase, live featured treatments, master artist cards, verified reviews, and atelier hours.
- **Services (`/services`)**: Filter by category (Haircuts, Colour, Treatments, Grooming, Skincare, Bridal, Spa, etc.), live search, price and duration chips, and 1-click booking links.
- **Our Team (`/team`)**: Master stylist profiles, certifications, ratings, and direct booking buttons.
- **Offers (`/offers`)**: Active promotional packages and coupon codes with 1-click clipboard copying.
- **Gallery (`/gallery`)**: Visual atelier lookbook with category filtering.
- **About (`/about`)** & **Contact (`/contact`)**: Studio philosophy, location, phone, and interactive concierge inquiry form.

### 📅 Complete Customer Booking Engine (`/book`)
1. **Step 1: Treatment Selection** — Multi-service basket with live running duration and price total.
2. **Step 2: Stylist Selection** — Specific artist or intelligent "Any Available Stylist" allocation.
3. **Step 3 & 4: Date & Smart Slot Picker** — Server-side availability calculation taking into account weekly hours, closures, lunch breaks, and buffer times.
4. **Step 5: Client Information** — Autofilled for members or guest details with WhatsApp consent.
5. **Step 6: Review & Finalize** — Itemized prices, 18% GST tax calculation, coupon validation box (`AURELIA10`).
6. **Step 7: Instant Confirmation** — Displays Reference (`AUR-XXXXXX`), Add-to-Calendar ICS download, and direct portal navigation.

### 👑 Owner / Admin Operations Command Center (`/admin/*`)
- **Dashboard (`/admin/dashboard`)**: Live KPI cards (Today's bookings, revenue, capacity utilization, pending approvals) and 14-day revenue trend.
- **Interactive Calendar (`/admin/calendar`)**: Daily/weekly multi-stylist schedule with status color-coding and appointment details modal.
- **Appointments (`/admin/appointments`)**: Master appointments table with search, status filters, date filters, and status transitions.
- **Rapid Walk-in Terminal (`/admin/walkin`)**: Register walk-in arrival, select treatments, assign available chair, and generate bill instantly.
- **Services Management (`/admin/services`)**: Full catalog CRUD with category, duration, buffer, and price controls.
- **Staff Roster (`/admin/staff`)**: Stylist directory, ratings, and working schedules.
- **Customer CRM (`/admin/customers`)**: 40+ client profiles, lifetime spending, total visits, and loyalty tier badges.
- **Billing & Payments (`/admin/payments`)**: Collections ledger (Cash/Card/UPI) and printable tax receipts.
- **Marketing Studio (`/admin/marketing`)**: Multi-channel campaign builder, audience segmentation, coupon generator, and WhatsApp click-to-chat.
- **Reports & Analytics (`/admin/reports`)**: Stylist revenue attribution, payment methods distribution, and 1-click master CSV export.
- **Website CMS (`/admin/settings`)**: Live editor for salon name, tagline, address, phone, and cancellation policies.

### ✂️ Staff / Stylist Workbench (`/staff/*`)
- **Dashboard (`/staff/dashboard`)**: Daily appointments agenda, next client alert, and completed count.
- **Calendar (`/staff/calendar`)**: Personal daily agenda and scheduled break times.
- **Appointments (`/staff/appointments`)**: Action buttons: *Check In Guest*, *Start Service*, *Complete Service*, and consultation notes.
- **Availability (`/staff/availability`)**: Shift roster and leave of absence application form.
- **Profile (`/staff/profile`)**: Stylist credentials, certifications, and verified review score.

### 💎 Customer Member Lounge (`/customer/*`)
- **Dashboard (`/customer/dashboard`)**: Upcoming appointment card, loyalty points balance, quick re-booking.
- **My Appointments (`/customer/appointments`)**: Upcoming, Completed, and Cancelled tabs, with Reschedule modal, Cancel modal (4-hr cutoff enforced), and Verified Review submission modal.
- **Privilege Club (`/customer/rewards`)**: Points ledger, tier status (Silver/Gold/Platinum), and redemption vouchers.
- **Profile (`/customer/profile`)**: Contact details and password change.

---

## 3. Demo Credentials

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Owner / Admin** | `admin@aurelia.com` | `Password123!` | Full studio management, appointments, financials & reports |
| **Master Stylist** | `elena.rostova@aurelia.com` | `Password123!` | Stylist workbench, assigned guests, personal calendar |
| **Customer** | `clara.oswald@example.com` | `Password123!` | Booking lounge, 350 Gold loyalty points, appointment history |

*The sign-in page at `/login` provides 1-click demo access buttons to populate credentials automatically.*

---

## 4. Automated Testing & Verification

Run the comprehensive production end-to-end test suite:
```powershell
powershell -ExecutionPolicy Bypass -File "d:\saloon-appointment-booking\tests\verify_e2e_production.ps1"
```
**Test Results:**
- [OK] Public Salon endpoint verified
- [OK] Service catalog verified (26 active treatments loaded)
- [OK] Availability Engine verified (real-time slot calculation)
- [OK] Coupon Engine verified (`AURELIA10` gives ₹500 discount)
- [OK] Atomic Booking Engine verified (`AUR-XXXXXX` generated)
- [OK] Concurrency Protection verified (overlapping double-booking rejected with collision lock)
- [OK] Admin Analytics verified (dashboard summary & revenue trends)
- [OK] Staff Workflow verified (status transition to `in_service`)
