-- ============================================================
-- AURELIA — Luxury Salon & Beauty Studio Management Platform
-- Relational MySQL Schema (v1.0)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. ROLES
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USERS
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id INT UNSIGNED NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NULL,
    avatar_url VARCHAR(255) NULL,
    is_active TINYINT(1) DEFAULT 1,
    email_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. SALONS
DROP TABLE IF EXISTS salons;
CREATE TABLE salons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    tagline VARCHAR(255) NULL,
    description TEXT NULL,
    logo_url VARCHAR(255) NULL,
    cover_url VARCHAR(255) NULL,
    email VARCHAR(191) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    currency_symbol VARCHAR(10) DEFAULT '₹',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    tax_percentage DECIMAL(5,2) DEFAULT 18.00,
    booking_notice_hours INT DEFAULT 2,
    booking_horizon_days INT DEFAULT 60,
    cancellation_cutoff_hours INT DEFAULT 4,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. SALON SETTINGS
DROP TABLE IF EXISTS salon_settings;
CREATE TABLE salon_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value LONGTEXT NULL,
    setting_group VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_salon_setting (salon_id, setting_key),
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SALON BUSINESS HOURS (0 = Sunday, 1 = Monday, ... 6 = Saturday)
DROP TABLE IF EXISTS salon_business_hours;
CREATE TABLE salon_business_hours (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    day_of_week TINYINT UNSIGNED NOT NULL,
    is_open TINYINT(1) DEFAULT 1,
    open_time TIME NOT NULL DEFAULT '09:00:00',
    close_time TIME NOT NULL DEFAULT '20:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_salon_day (salon_id, day_of_week),
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SALON CLOSURES / HOLIDAYS
DROP TABLE IF EXISTS salon_closures;
CREATE TABLE salon_closures (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    closure_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    is_full_day TINYINT(1) DEFAULT 1,
    start_time TIME NULL,
    end_time TIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. SERVICE CATEGORIES
DROP TABLE IF EXISTS service_categories;
CREATE TABLE service_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(255) NULL,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cat_slug (salon_id, slug),
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. SERVICES
DROP TABLE IF EXISTS services;
CREATE TABLE services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(170) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(255) NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    duration_minutes INT UNSIGNED NOT NULL DEFAULT 30,
    buffer_minutes INT UNSIGNED NOT NULL DEFAULT 10,
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_service_slug (salon_id, slug),
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. STAFF PROFILES
DROP TABLE IF EXISTS staff_profiles;
CREATE TABLE staff_profiles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    salon_id INT UNSIGNED NOT NULL,
    title VARCHAR(100) NOT NULL,
    bio TEXT NULL,
    experience_years INT DEFAULT 1,
    display_order INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    rating_avg DECIMAL(3,2) DEFAULT 5.00,
    reviews_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. STAFF SERVICES MAPPING
DROP TABLE IF EXISTS staff_services;
CREATE TABLE staff_services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    service_id INT UNSIGNED NOT NULL,
    custom_price DECIMAL(10,2) NULL,
    custom_duration_minutes INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_staff_service (staff_id, service_id),
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. STAFF WORKING HOURS (0 = Sunday, 1 = Monday, ... 6 = Saturday)
DROP TABLE IF EXISTS staff_working_hours;
CREATE TABLE staff_working_hours (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    day_of_week TINYINT UNSIGNED NOT NULL,
    is_working TINYINT(1) DEFAULT 1,
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '18:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_staff_day (staff_id, day_of_week),
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. STAFF BREAKS
DROP TABLE IF EXISTS staff_breaks;
CREATE TABLE staff_breaks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    day_of_week TINYINT UNSIGNED NOT NULL,
    break_name VARCHAR(100) DEFAULT 'Lunch Break',
    start_time TIME NOT NULL DEFAULT '13:00:00',
    end_time TIME NOT NULL DEFAULT '14:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. STAFF LEAVE
DROP TABLE IF EXISTS staff_leave;
CREATE TABLE staff_leave (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. STAFF TIME BLOCKS
DROP TABLE IF EXISTS staff_time_blocks;
CREATE TABLE staff_time_blocks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    block_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. CUSTOMERS
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL UNIQUE,
    salon_id INT UNSIGNED NOT NULL,
    customer_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NULL,
    phone VARCHAR(30) NOT NULL,
    birth_date DATE NULL,
    gender ENUM('female', 'male', 'non_binary', 'prefer_not_to_say') DEFAULT 'prefer_not_to_say',
    notes TEXT NULL,
    total_spend DECIMAL(10,2) DEFAULT 0.00,
    total_visits INT UNSIGNED DEFAULT 0,
    last_visit_at TIMESTAMP NULL,
    loyalty_points_balance INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    INDEX idx_customer_phone (phone),
    INDEX idx_customer_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. CUSTOMER PREFERENCES & MARKETING CONSENT
DROP TABLE IF EXISTS customer_preferences;
CREATE TABLE customer_preferences (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNSIGNED NOT NULL UNIQUE,
    preferred_stylist_id INT UNSIGNED NULL,
    preferred_contact_method ENUM('whatsapp', 'email', 'sms') DEFAULT 'whatsapp',
    allergens_notes TEXT NULL,
    marketing_opt_in_email TINYINT(1) DEFAULT 1,
    marketing_opt_in_sms TINYINT(1) DEFAULT 1,
    marketing_opt_in_whatsapp TINYINT(1) DEFAULT 1,
    consent_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (preferred_stylist_id) REFERENCES staff_profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. APPOINTMENTS
DROP TABLE IF EXISTS appointments;
CREATE TABLE appointments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    staff_id INT UNSIGNED NOT NULL,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_duration_minutes INT UNSIGNED NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'confirmed', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show') NOT NULL DEFAULT 'pending',
    payment_status ENUM('unpaid', 'partially_paid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
    source ENUM('online_guest', 'online_customer', 'walk_in', 'phone', 'admin') NOT NULL DEFAULT 'online_customer',
    customer_notes TEXT NULL,
    internal_notes TEXT NULL,
    cancellation_reason VARCHAR(255) NULL,
    cancelled_at TIMESTAMP NULL,
    cancelled_by INT UNSIGNED NULL,
    idempotency_key VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id) ON DELETE RESTRICT,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_appt_schedule (staff_id, appointment_date, status),
    INDEX idx_appt_customer (customer_id, appointment_date),
    INDEX idx_appt_date (salon_id, appointment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. APPOINTMENT SERVICES
DROP TABLE IF EXISTS appointment_services;
CREATE TABLE appointment_services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT UNSIGNED NOT NULL,
    service_id INT UNSIGNED NOT NULL,
    staff_id INT UNSIGNED NOT NULL,
    sequence_order INT UNSIGNED NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. APPOINTMENT STATUS HISTORY
DROP TABLE IF EXISTS appointment_status_history;
CREATE TABLE appointment_status_history (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT UNSIGNED NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by INT UNSIGNED NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. APPOINTMENT RESCHEDULES
DROP TABLE IF EXISTS appointment_reschedules;
CREATE TABLE appointment_reschedules (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT UNSIGNED NOT NULL,
    old_date DATE NOT NULL,
    old_start_time TIME NOT NULL,
    old_end_time TIME NOT NULL,
    old_staff_id INT UNSIGNED NOT NULL,
    new_date DATE NOT NULL,
    new_start_time TIME NOT NULL,
    new_end_time TIME NOT NULL,
    new_staff_id INT UNSIGNED NOT NULL,
    reason VARCHAR(255) NULL,
    requested_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (old_staff_id) REFERENCES staff_profiles(id) ON DELETE RESTRICT,
    FOREIGN KEY (new_staff_id) REFERENCES staff_profiles(id) ON DELETE RESTRICT,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. INVOICES
DROP TABLE IF EXISTS invoices;
CREATE TABLE invoices (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    appointment_id INT UNSIGNED NULL,
    customer_id INT UNSIGNED NOT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    balance_due DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('draft', 'issued', 'paid', 'partially_paid', 'void') DEFAULT 'issued',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. INVOICE ITEMS
DROP TABLE IF EXISTS invoice_items;
CREATE TABLE invoice_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT UNSIGNED NOT NULL,
    service_id INT UNSIGNED NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. PAYMENTS
DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    appointment_id INT UNSIGNED NULL,
    invoice_id INT UNSIGNED NULL,
    payment_reference VARCHAR(60) NOT NULL UNIQUE,
    payment_method ENUM('cash', 'upi', 'card', 'bank_transfer', 'loyalty_points') NOT NULL DEFAULT 'cash',
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('success', 'pending', 'failed', 'refunded') DEFAULT 'success',
    transaction_reference VARCHAR(100) NULL,
    notes VARCHAR(255) NULL,
    recorded_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. PAYMENT REFUNDS
DROP TABLE IF EXISTS payment_refunds;
CREATE TABLE payment_refunds (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_id INT UNSIGNED NOT NULL,
    refund_amount DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    processed_by INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. COUPONS
DROP TABLE IF EXISTS coupons;
CREATE TABLE coupons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    min_spend DECIMAL(10,2) DEFAULT 0.00,
    max_discount DECIMAL(10,2) NULL,
    usage_limit INT UNSIGNED DEFAULT 100,
    per_customer_limit INT UNSIGNED DEFAULT 1,
    times_used INT UNSIGNED DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_coupon_code (salon_id, code),
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. COUPON REDEMPTIONS
DROP TABLE IF EXISTS coupon_redemptions;
CREATE TABLE coupon_redemptions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    appointment_id INT UNSIGNED NOT NULL,
    discount_applied DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. LOYALTY ACCOUNTS
DROP TABLE IF EXISTS loyalty_accounts;
CREATE TABLE loyalty_accounts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED NOT NULL UNIQUE,
    points_balance INT NOT NULL DEFAULT 0,
    lifetime_earned INT NOT NULL DEFAULT 0,
    lifetime_redeemed INT NOT NULL DEFAULT 0,
    tier ENUM('Silver', 'Gold', 'Platinum') DEFAULT 'Silver',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. LOYALTY TRANSACTIONS
DROP TABLE IF EXISTS loyalty_transactions;
CREATE TABLE loyalty_transactions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loyalty_account_id INT UNSIGNED NOT NULL,
    appointment_id INT UNSIGNED NULL,
    transaction_type ENUM('earned', 'redeemed', 'adjusted', 'expired') NOT NULL,
    points INT NOT NULL,
    points_value DECIMAL(10,2) DEFAULT 0.00,
    balance_after INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loyalty_account_id) REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. REFERRALS
DROP TABLE IF EXISTS referrals;
CREATE TABLE referrals (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    referrer_customer_id INT UNSIGNED NOT NULL,
    referee_customer_id INT UNSIGNED NULL,
    referral_code VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('pending', 'completed', 'rewarded') DEFAULT 'pending',
    reward_points INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (referrer_customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (referee_customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30. REVIEWS
DROP TABLE IF EXISTS reviews;
CREATE TABLE reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    appointment_id INT UNSIGNED NOT NULL UNIQUE,
    customer_id INT UNSIGNED NOT NULL,
    staff_id INT UNSIGNED NOT NULL,
    rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
    comment TEXT NULL,
    is_published TINYINT(1) DEFAULT 1,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 31. NOTIFICATIONS
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    link VARCHAR(255) NULL,
    is_read TINYINT(1) DEFAULT 0,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. NOTIFICATION TEMPLATES
DROP TABLE IF EXISTS notification_templates;
CREATE TABLE notification_templates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    template_key VARCHAR(100) NOT NULL,
    channel ENUM('email', 'sms', 'whatsapp', 'in_app') NOT NULL,
    subject VARCHAR(200) NULL,
    body LONGTEXT NOT NULL,
    variables_json TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_template_key (salon_id, template_key, channel),
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 33. NOTIFICATION JOBS (QUEUE & AUDIT)
DROP TABLE IF EXISTS notification_jobs;
CREATE TABLE notification_jobs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    channel ENUM('email', 'sms', 'whatsapp') NOT NULL,
    recipient VARCHAR(191) NOT NULL,
    subject VARCHAR(255) NULL,
    payload_json LONGTEXT NOT NULL,
    status ENUM('queued', 'sent', 'failed', 'simulated') DEFAULT 'queued',
    attempts TINYINT DEFAULT 0,
    error_message TEXT NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 34. MARKETING CAMPAIGNS
DROP TABLE IF EXISTS marketing_campaigns;
CREATE TABLE marketing_campaigns (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    campaign_type ENUM('festival', 'birthday', 'first_visit', 'referral', 'win_back', 'loyalty', 'service_specific', 'seasonal') NOT NULL,
    channel ENUM('email', 'whatsapp', 'sms', 'multi_channel') NOT NULL DEFAULT 'email',
    description TEXT NULL,
    audience_segment_id INT UNSIGNED NULL,
    offer_details_json TEXT NULL,
    coupon_id INT UNSIGNED NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('draft', 'scheduled', 'active', 'paused', 'completed') DEFAULT 'draft',
    tracking_code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 35. MARKETING SEGMENTS
DROP TABLE IF EXISTS marketing_segments;
CREATE TABLE marketing_segments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    description TEXT NULL,
    criteria_json LONGTEXT NOT NULL,
    is_system TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_segment_slug (salon_id, slug),
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 36. CAMPAIGN RECIPIENTS
DROP TABLE IF EXISTS campaign_recipients;
CREATE TABLE campaign_recipients (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT UNSIGNED NOT NULL,
    customer_id INT UNSIGNED NOT NULL,
    channel ENUM('email', 'whatsapp', 'sms') NOT NULL,
    status ENUM('queued', 'sent', 'delivered', 'opened', 'clicked', 'converted', 'failed', 'unsubscribed') DEFAULT 'queued',
    tracking_token VARCHAR(64) NOT NULL UNIQUE,
    sent_at TIMESTAMP NULL,
    converted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 37. CAMPAIGN EVENTS
DROP TABLE IF EXISTS campaign_events;
CREATE TABLE campaign_events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    campaign_id INT UNSIGNED NOT NULL,
    recipient_id INT UNSIGNED NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    metadata_json TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES campaign_recipients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 38. CUSTOMER CONSENTS
DROP TABLE IF EXISTS customer_consents;
CREATE TABLE customer_consents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNSIGNED NOT NULL,
    channel ENUM('email', 'sms', 'whatsapp') NOT NULL,
    consent_status ENUM('opted_in', 'opted_out') NOT NULL DEFAULT 'opted_in',
    consent_source VARCHAR(100) NOT NULL DEFAULT 'web_booking',
    ip_address VARCHAR(45) NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 39. CUSTOMER NOTES
DROP TABLE IF EXISTS customer_notes;
CREATE TABLE customer_notes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id INT UNSIGNED NOT NULL,
    author_user_id INT UNSIGNED NOT NULL,
    note TEXT NOT NULL,
    is_private TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 40. MEDIA ASSETS
DROP TABLE IF EXISTS media_assets;
CREATE TABLE media_assets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    salon_id INT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT UNSIGNED NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_category ENUM('service', 'staff', 'gallery', 'branding', 'general') DEFAULT 'general',
    alt_text VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 41. AUDIT LOGS
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    salon_id INT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT UNSIGNED NULL,
    old_values_json LONGTEXT NULL,
    new_values_json LONGTEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 42. PASSWORD RESET TOKENS
DROP TABLE IF EXISTS password_reset_tokens;
CREATE TABLE password_reset_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL,
    token VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reset_token (email, token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

