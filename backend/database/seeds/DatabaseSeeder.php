<?php

if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    require_once __DIR__ . '/../../vendor/autoload.php';
}

// Linux case-safe autoloader fallback
spl_autoload_register(function ($class) {
    if (str_starts_with($class, 'App\\')) {
        $relative = substr($class, 4);
        $parts = explode('\\', $relative);
        $file = array_pop($parts);
        $subDir = strtolower(implode('/', $parts));
        $candidates = [
            __DIR__ . '/../../app/' . $subDir . '/' . $file . '.php',
            __DIR__ . '/../../app/' . str_replace('\\', '/', $relative) . '.php',
            __DIR__ . '/../../app/' . strtolower(str_replace('\\', '/', $relative)) . '.php'
        ];
        foreach ($candidates as $cand) {
            if (file_exists($cand)) {
                require_once $cand;
                return;
            }
        }
    }
});

use App\Config\Config;
use App\Config\Database;

Config::load(__DIR__ . '/../../.env');

echo "🌱 Starting AURELIA Database Seeder...\n";

$db = Database::getConnection();

// 1. Seed Roles
$roles = [
    ['slug' => 'admin', 'name' => 'Owner / Salon Administrator', 'description' => 'Full administrative access across all salon operations'],
    ['slug' => 'staff', 'name' => 'Stylist / Professional Staff', 'description' => 'Access to assigned appointments, schedule, and guest notes'],
    ['slug' => 'customer', 'name' => 'Registered Customer', 'description' => 'Booking management, loyalty rewards, and service history'],
    ['slug' => 'guest', 'name' => 'Guest Visitor', 'description' => 'Public browsing and one-time appointment reservations']
];

foreach ($roles as $role) {
    $stmt = $db->prepare("
        INSERT INTO roles (slug, name, description)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)
    ");
    $stmt->execute([$role['slug'], $role['name'], $role['description']]);
}
echo "✅ Roles seeded.\n";

// 2. Seed Default Salon
$stmt = $db->prepare("
    INSERT INTO salons (id, name, slug, tagline, description, email, phone, address, city, state, postal_code, currency, currency_symbol, timezone, tax_percentage, booking_notice_hours, booking_horizon_days, cancellation_cutoff_hours, is_active)
    VALUES (1, 'AURELIA — Luxury Hair & Beauty Studio', 'aurelia-luxury-salon', 'Where Haute Coiffure Meets Bespoke Wellness',
            'A sanctuary of high-end aesthetics, bespoke hair couture, and restorative botanical beauty.',
            'concierge@aurelia-salon.com', '+91 98765 43210', '42 Royale Boulevard, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 'INR', '₹', 'Asia/Kolkata', 18.00, 2, 60, 4, 1)
    ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), phone = VALUES(phone)
");
$stmt->execute();
echo "✅ Salon profile seeded.\n";

// 3. Seed Salon Business Hours (Monday to Sunday)
for ($day = 0; $day <= 6; $day++) {
    $stmt = $db->prepare("
        INSERT INTO salon_business_hours (salon_id, day_of_week, is_open, open_time, close_time)
        VALUES (1, ?, 1, '09:00:00', '20:00:00')
        ON DUPLICATE KEY UPDATE is_open = VALUES(is_open), open_time = VALUES(open_time), close_time = VALUES(close_time)
    ");
    $stmt->execute([$day]);
}
echo "✅ Salon business hours seeded.\n";

// 4. Default Password Hash
$defaultPasswordHash = password_hash('Password123!', PASSWORD_BCRYPT);

// 5. Seed Admin / Owner User
$adminRoleStmt = $db->query("SELECT id FROM roles WHERE slug = 'admin' LIMIT 1");
$adminRoleId = $adminRoleStmt->fetchColumn();

$stmt = $db->prepare("
    INSERT INTO users (role_id, email, password_hash, first_name, last_name, phone, is_active)
    VALUES (?, 'admin@aurelia.com', ?, 'Genevieve', 'Sinclair', '+91 98765 00001', 1)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), first_name = VALUES(first_name), last_name = VALUES(last_name)
");
$stmt->execute([$adminRoleId, $defaultPasswordHash]);
echo "✅ Owner / Admin account seeded (admin@aurelia.com / Password123!).\n";

// 6. Seed Staff Members
$staffRoleStmt = $db->query("SELECT id FROM roles WHERE slug = 'staff' LIMIT 1");
$staffRoleId = $staffRoleStmt->fetchColumn();

$stylists = [
    [
        'email' => 'elena.rostova@aurelia.com',
        'first_name' => 'Elena',
        'last_name' => 'Rostova',
        'phone' => '+91 98765 10001',
        'title' => 'Creative Director & Master Stylist',
        'bio' => 'Paris & Milan trained editorial hair artist with over 12 years creating iconic cuts and bespoke styling.',
        'experience' => 12,
        'rating' => 4.95,
        'reviews' => 184
    ],
    [
        'email' => 'marcus.vance@aurelia.com',
        'first_name' => 'Marcus',
        'last_name' => 'Vance',
        'phone' => '+91 98765 10002',
        'title' => 'Master Barber & Precision Sculptor',
        'bio' => 'London Academy graduate specializing in razor fades, textured gentleman cuts, and luxury hot towel beard therapies.',
        'experience' => 9,
        'rating' => 4.92,
        'reviews' => 142
    ],
    [
        'email' => 'sophia.chen@aurelia.com',
        'first_name' => 'Sophia',
        'last_name' => 'Chen',
        'phone' => '+91 98765 10003',
        'title' => 'Senior Colorist & Balayage Artisan',
        'bio' => 'Internationally certified master colorist celebrated for lived-in balayage, sun-kissed babylights, and multi-dimensional tones.',
        'experience' => 8,
        'rating' => 4.98,
        'reviews' => 210
    ],
    [
        'email' => 'isabella.moretti@aurelia.com',
        'first_name' => 'Isabella',
        'last_name' => 'Moretti',
        'phone' => '+91 98765 10004',
        'title' => 'Lead Aesthetician & Botanical Skincare Specialist',
        'bio' => 'Certified dermal therapist with holistic expertise in collagen restoration, micro-needling, and lymphatic facial rituals.',
        'experience' => 10,
        'rating' => 4.89,
        'reviews' => 128
    ],
    [
        'email' => 'liam.gallagher@aurelia.com',
        'first_name' => 'Liam',
        'last_name' => 'Gallagher',
        'phone' => '+91 98765 10005',
        'title' => 'Texture Architect & Hair Spa Specialist',
        'bio' => 'Expert in organic keratin therapies, Japanese hair straightening, and restorative deep scalp detox treatments.',
        'experience' => 7,
        'rating' => 4.88,
        'reviews' => 96
    ]
];

$staffDisplayOrder = 1;
foreach ($stylists as $s) {
    $stmt = $db->prepare("
        INSERT INTO users (role_id, email, password_hash, first_name, last_name, phone, is_active)
        VALUES (?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), first_name = VALUES(first_name), last_name = VALUES(last_name)
    ");
    $stmt->execute([$staffRoleId, $s['email'], $defaultPasswordHash, $s['first_name'], $s['last_name'], $s['phone']]);
    
    // Get user id
    $userStmt = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $userStmt->execute([$s['email']]);
    $userId = $userStmt->fetchColumn();

    $staffProfileStmt = $db->prepare("
        INSERT INTO staff_profiles (user_id, salon_id, title, bio, experience_years, display_order, is_active, rating_avg, reviews_count)
        VALUES (?, 1, ?, ?, ?, ?, 1, ?, ?)
        ON DUPLICATE KEY UPDATE title = VALUES(title), bio = VALUES(bio), rating_avg = VALUES(rating_avg), reviews_count = VALUES(reviews_count)
    ");
    $staffProfileStmt->execute([$userId, $s['title'], $s['bio'], $s['experience'], $staffDisplayOrder++, $s['rating'], $s['reviews']]);

    // Fetch staff_profile id
    $spStmt = $db->prepare("SELECT id FROM staff_profiles WHERE user_id = ? LIMIT 1");
    $spStmt->execute([$userId]);
    $staffProfileId = $spStmt->fetchColumn();

    // Seed staff weekly working hours (Mon-Sat 9:30 AM - 6:30 PM, Sun off)
    for ($d = 0; $d <= 6; $d++) {
        $isWorking = ($d === 0) ? 0 : 1; // Sunday off for this stylist
        $whStmt = $db->prepare("
            INSERT INTO staff_working_hours (staff_id, day_of_week, is_working, start_time, end_time)
            VALUES (?, ?, ?, '09:30:00', '18:30:00')
            ON DUPLICATE KEY UPDATE is_working = VALUES(is_working)
        ");
        $whStmt->execute([$staffProfileId, $d, $isWorking]);

        // Break time
        $brkStmt = $db->prepare("
            INSERT INTO staff_breaks (staff_id, day_of_week, break_name, start_time, end_time)
            VALUES (?, ?, 'Lunch & Refreshment', '13:30:00', '14:30:00')
        ");
        $brkStmt->execute([$staffProfileId, $d]);
    }
}
echo "✅ 5 Stylists seeded with schedules and breaks.\n";

// 7. Seed Demo Customer
$customerRoleStmt = $db->query("SELECT id FROM roles WHERE slug = 'customer' LIMIT 1");
$customerRoleId = $customerRoleStmt->fetchColumn();

$stmt = $db->prepare("
    INSERT INTO users (role_id, email, password_hash, first_name, last_name, phone, is_active)
    VALUES (?, 'clara.oswald@example.com', ?, 'Clara', 'Oswald', '+91 98765 20001', 1)
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), first_name = VALUES(first_name)
");
$stmt->execute([$customerRoleId, $defaultPasswordHash]);

$userStmt = $db->prepare("SELECT id FROM users WHERE email = 'clara.oswald@example.com' LIMIT 1");
$userStmt->execute();
$claraUserId = $userStmt->fetchColumn();

$stmt = $db->prepare("
    INSERT INTO customers (user_id, salon_id, customer_code, first_name, last_name, email, phone, loyalty_points_balance, total_spend, total_visits)
    VALUES (?, 1, 'CUST-AUR101', 'Clara', 'Oswald', 'clara.oswald@example.com', '+91 98765 20001', 350, 4850.00, 3)
    ON DUPLICATE KEY UPDATE loyalty_points_balance = VALUES(loyalty_points_balance)
");
$stmt->execute([$claraUserId]);

$custStmt = $db->prepare("SELECT id FROM customers WHERE user_id = ? LIMIT 1");
$custStmt->execute([$claraUserId]);
$claraCustomerId = $custStmt->fetchColumn();

$stmt = $db->prepare("
    INSERT INTO loyalty_accounts (salon_id, customer_id, points_balance, lifetime_earned, tier)
    VALUES (1, ?, 350, 450, 'Gold')
    ON DUPLICATE KEY UPDATE points_balance = VALUES(points_balance)
");
$stmt->execute([$claraCustomerId]);

$stmt = $db->prepare("
    INSERT INTO customer_preferences (customer_id, preferred_contact_method, marketing_opt_in_email, marketing_opt_in_whatsapp)
    VALUES (?, 'whatsapp', 1, 1)
    ON DUPLICATE KEY UPDATE marketing_opt_in_email = VALUES(marketing_opt_in_email)
");
$stmt->execute([$claraCustomerId]);

echo "✅ Demo Customer account seeded (clara.oswald@example.com / Password123!).\n";
echo "🎉 Phase 1 Seeder completed successfully!\n";

