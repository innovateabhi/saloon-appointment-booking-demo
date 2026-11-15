<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use App\Config\Config;
use App\Config\Database;

Config::load(__DIR__ . '/../../.env');

echo "🌿 Running AURELIA Comprehensive Seeder with Affordable & Accessible Rates...\n";

$db = Database::getConnection();

// Ensure roles exist
$adminRoleStmt = $db->query("SELECT id FROM roles WHERE slug = 'admin' LIMIT 1");
$adminRoleId = $adminRoleStmt->fetchColumn();

$staffRoleStmt = $db->query("SELECT id FROM roles WHERE slug = 'staff' LIMIT 1");
$staffRoleId = $staffRoleStmt->fetchColumn();

$customerRoleStmt = $db->query("SELECT id FROM roles WHERE slug = 'customer' LIMIT 1");
$customerRoleId = $customerRoleStmt->fetchColumn();

$pwdHash = password_hash('Password123!', PASSWORD_BCRYPT);

// 1. Seed 10 Service Categories
$categories = [
    ['name' => 'Haircuts & Styling', 'slug' => 'haircuts-styling', 'desc' => 'Precision cutting, blowouts, and everyday elegant styling for everyone.', 'order' => 1],
    ['name' => 'Hair Colour & Highlights', 'slug' => 'hair-colour', 'desc' => 'Root touch-ups, natural global shades, fashion highlights, and gloss.', 'order' => 2],
    ['name' => 'Hair Treatments & Spa', 'slug' => 'hair-treatments', 'desc' => 'Deep conditioning hair spa, anti-dandruff detox, and smoothing therapy.', 'order' => 3],
    ['name' => 'Beard & Men\'s Grooming', 'slug' => 'beard-grooming', 'desc' => 'Classic hot towel razor shaves, beard styling, and clean fades.', 'order' => 4],
    ['name' => 'Facials & Skincare', 'slug' => 'facials-skincare', 'desc' => 'Fruit cleansers, gold glow facials, detan therapy, and refreshing skin packs.', 'order' => 5],
    ['name' => 'Makeup & Occasions', 'slug' => 'makeup-artistry', 'desc' => 'Party makeup, evening glam, and lightweight natural occasion looks.', 'order' => 6],
    ['name' => 'Bridal & Groom Packages', 'slug' => 'bridal-couture', 'desc' => 'Complete affordable bridal & groom prep, hair setting, and draping.', 'order' => 7],
    ['name' => 'Manicure & Pedicure', 'slug' => 'manicure-pedicure', 'desc' => 'Classic manicures, foot spa, cuticle care, and vibrant nail polish.', 'order' => 8],
    ['name' => 'Massage & Wellness', 'slug' => 'body-wellness', 'desc' => 'Relaxing head, neck & shoulder massage, and stress-relief therapies.', 'order' => 9],
    ['name' => 'Scalp Care & Detan', 'slug' => 'scalp-therapy', 'desc' => 'Herbal scalp massage, clarifying hair wash, and sun-damage detan packs.', 'order' => 10],
];

$catMap = [];
foreach ($categories as $cat) {
    $stmt = $db->prepare("
        INSERT INTO service_categories (salon_id, name, slug, description, display_order, is_active)
        VALUES (1, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), display_order = VALUES(display_order)
    ");
    $stmt->execute([$cat['name'], $cat['slug'], $cat['desc'], $cat['order']]);
    
    $stmtId = $db->prepare("SELECT id FROM service_categories WHERE salon_id = 1 AND slug = ? LIMIT 1");
    $stmtId->execute([$cat['slug']]);
    $catMap[$cat['slug']] = (int) $stmtId->fetchColumn();
}
echo "✅ 10 Service categories seeded.\n";

// 2. Seed 26 Affordable & Accessible Services
$services = [
    // Haircuts & Styling (Affordable: ₹200 – ₹550)
    ['cat' => 'haircuts-styling', 'name' => 'Classic Haircut & Blowdry', 'slug' => 'classic-haircut-blowdry', 'price' => 350.00, 'dur' => 35, 'buf' => 10, 'desc' => 'Refreshing hair wash, split-end trimming or layer cut, and quick blowout finish.'],
    ['cat' => 'haircuts-styling', 'name' => 'Advanced Precision Layer Cut', 'slug' => 'advanced-precision-layer-cut', 'price' => 550.00, 'dur' => 45, 'buf' => 10, 'desc' => 'Face framing layers, feathered ends, conditioning wash, and salon volume blowdry.'],
    ['cat' => 'haircuts-styling', 'name' => 'Men\'s Smart Haircut & Styling', 'slug' => 'mens-smart-haircut', 'price' => 250.00, 'dur' => 30, 'buf' => 5, 'desc' => 'Neat scissor and clipper cut, neckline taper, and refreshing cooling wash.'],
    ['cat' => 'haircuts-styling', 'name' => 'Kids Haircut (Under 12)', 'slug' => 'kids-haircut', 'price' => 200.00, 'dur' => 25, 'buf' => 5, 'desc' => 'Gentle and patient haircut styling for kids with mild wash.'],
    ['cat' => 'haircuts-styling', 'name' => 'Silk Blowout & Thermal Setting', 'slug' => 'silk-blowout-thermal-setting', 'price' => 400.00, 'dur' => 30, 'buf' => 10, 'desc' => 'Shampoo, deep conditioning, and long-lasting sleek straight or bouncy curl setting.'],

    // Hair Colour & Highlights (Affordable: ₹699 – ₹1,999)
    ['cat' => 'hair-colour', 'name' => 'Root Touch-Up (Ammonia-Free)', 'slug' => 'root-touch-up', 'price' => 799.00, 'dur' => 60, 'buf' => 10, 'desc' => '100% grey coverage root retouch using gentle conditioning color.'],
    ['cat' => 'hair-colour', 'name' => 'Global Hair Colour', 'slug' => 'global-hair-colour', 'price' => 1499.00, 'dur' => 90, 'buf' => 15, 'desc' => 'Full length natural hair coloring with high shine and deep nourishing mask.'],
    ['cat' => 'hair-colour', 'name' => 'Streak Highlights / Balayage Touches', 'slug' => 'streak-highlights-balayage', 'price' => 1999.00, 'dur' => 120, 'buf' => 15, 'desc' => 'Crown section blonde, caramel or burgundy foil highlights with toner.'],

    // Hair Treatments & Spa (Affordable: ₹499 – ₹1,799)
    ['cat' => 'hair-treatments', 'name' => 'Nourishing Herbal Hair Spa', 'slug' => 'nourishing-herbal-hair-spa', 'price' => 499.00, 'dur' => 45, 'buf' => 10, 'desc' => 'Deep moisture cream bath, ozone scalp steam, relaxing head massage, and wash.'],
    ['cat' => 'hair-treatments', 'name' => 'Anti-Dandruff & Scalp Purifying Spa', 'slug' => 'anti-dandruff-scalp-spa', 'price' => 699.00, 'dur' => 50, 'buf' => 10, 'desc' => 'Tea-tree and zinc scrub, dead skin removal, clarifying wash, and cooling serum.'],
    ['cat' => 'hair-treatments', 'name' => 'Keratin Frizz-Free Smoothing', 'slug' => 'keratin-frizz-free-smoothing', 'price' => 1799.00, 'dur' => 120, 'buf' => 15, 'desc' => 'Manageable, smooth, frizz-resistant hair treatment lasting up to 3 months.'],

    // Beard & Men's Grooming (Affordable: ₹150 – ₹499)
    ['cat' => 'beard-grooming', 'name' => 'Beard Trim & Precision Lineup', 'slug' => 'beard-trim-lineup', 'price' => 150.00, 'dur' => 20, 'buf' => 5, 'desc' => 'Beard shaping with clippers, clean razor cheek lines, and beard balm.'],
    ['cat' => 'beard-grooming', 'name' => 'Royal Hot Towel Shave', 'slug' => 'royal-hot-towel-shave', 'price' => 250.00, 'dur' => 25, 'buf' => 5, 'desc' => 'Warm steamed towel prep, rich foaming lather, close razor shave, and aftershave lotion.'],
    ['cat' => 'beard-grooming', 'name' => 'Men\'s Grooming Combo (Cut + Beard + Detan)', 'slug' => 'mens-grooming-combo', 'price' => 499.00, 'dur' => 50, 'buf' => 10, 'desc' => 'Haircut, beard styling, and instant face detan scrub.'],

    // Facials & Skincare (Affordable: ₹299 – ₹1,199)
    ['cat' => 'facials-skincare', 'name' => 'Instant Glow Face Clean-Up', 'slug' => 'instant-glow-face-cleanup', 'price' => 399.00, 'dur' => 35, 'buf' => 5, 'desc' => 'Exfoliating scrub, blackhead extraction, steam, and soothing aloe vera pack.'],
    ['cat' => 'facials-skincare', 'name' => 'Fruit / Herbal Radiance Facial', 'slug' => 'fruit-herbal-radiance-facial', 'price' => 699.00, 'dur' => 50, 'buf' => 10, 'desc' => 'Natural papaya, orange and honey extracts for smooth, glowing, clear skin.'],
    ['cat' => 'facials-skincare', 'name' => 'Gold Radiance Party Facial', 'slug' => 'gold-radiance-party-facial', 'price' => 1199.00, 'dur' => 60, 'buf' => 10, 'desc' => 'Multi-step skin firming and glowing facial with gold dust serum and massage.'],
    ['cat' => 'facials-skincare', 'name' => 'Face & Neck Tan Removal Pack', 'slug' => 'face-neck-tan-removal', 'price' => 299.00, 'dur' => 25, 'buf' => 5, 'desc' => 'Gentle active fruit acids that reverse sun tan and restore even skin tone.'],

    // Makeup & Occasions (Affordable: ₹1,199 – ₹1,799)
    ['cat' => 'makeup-artistry', 'name' => 'Party & Festive Day Makeup', 'slug' => 'party-festive-day-makeup', 'price' => 1199.00, 'dur' => 45, 'buf' => 10, 'desc' => 'Long-lasting HD base, winged eyeliner, soft lipstick, and setting spray.'],
    ['cat' => 'makeup-artistry', 'name' => 'Occasion Glam & Saree Draping', 'slug' => 'occasion-glam-saree-draping', 'price' => 1799.00, 'dur' => 60, 'buf' => 10, 'desc' => 'Smokey or shimmer eye makeup, false lashes, and professional saree/dupatta draping.'],

    // Bridal & Groom (Affordable: ₹2,499 – ₹4,999)
    ['cat' => 'bridal-couture', 'name' => 'Pre-Bridal Glow Package', 'slug' => 'pre-bridal-glow-package', 'price' => 2499.00, 'dur' => 120, 'buf' => 15, 'desc' => 'Facial, full body detan, manicure, pedicure, and hair spa bundle.'],
    ['cat' => 'bridal-couture', 'name' => 'Complete Bridal Day Styling', 'slug' => 'complete-bridal-day-styling', 'price' => 4999.00, 'dur' => 150, 'buf' => 20, 'desc' => 'Bridal HD makeup, hair updo with floral setting, jewelry placement, and draping.'],

    // Manicure & Pedicure (Affordable: ₹299 – ₹499)
    ['cat' => 'manicure-pedicure', 'name' => 'Classic Clean Manicure', 'slug' => 'classic-clean-manicure', 'price' => 299.00, 'dur' => 30, 'buf' => 5, 'desc' => 'Warm water soak, nail shaping, cuticle cleaning, hand massage, and polish.'],
    ['cat' => 'manicure-pedicure', 'name' => 'Rose Petal Spa Pedicure', 'slug' => 'rose-petal-spa-pedicure', 'price' => 499.00, 'dur' => 45, 'buf' => 5, 'desc' => 'Dead skin buffing, salt scrub, foot massage, and nail shaping.'],

    // Massage & Wellness (Affordable: ₹349 – ₹899)
    ['cat' => 'body-wellness', 'name' => 'Head, Neck & Shoulder Stress Relief', 'slug' => 'head-neck-shoulder-stress-relief', 'price' => 349.00, 'dur' => 30, 'buf' => 5, 'desc' => 'Warm almond or coconut oil acupressure massage relieving work fatigue and headache.'],
    ['cat' => 'body-wellness', 'name' => 'Full Body Aromatherapy Massage (45m)', 'slug' => 'full-body-aromatherapy-massage', 'price' => 899.00, 'dur' => 45, 'buf' => 10, 'desc' => 'Gentle muscle relaxation with lavender and eucalyptus essential oils.']
];

$serviceMap = [];
$displayOrder = 1;
foreach ($services as $srv) {
    $catId = $catMap[$srv['cat']];
    $stmt = $db->prepare("
        INSERT INTO services (salon_id, category_id, name, slug, description, price, duration_minutes, buffer_minutes, is_active, display_order)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), price = VALUES(price), duration_minutes = VALUES(duration_minutes), buffer_minutes = VALUES(buffer_minutes)
    ");
    $stmt->execute([$catId, $srv['name'], $srv['slug'], $srv['desc'], $srv['price'], $srv['dur'], $srv['buf'], $displayOrder++]);

    $stmtId = $db->prepare("SELECT id FROM services WHERE salon_id = 1 AND slug = ? LIMIT 1");
    $stmtId->execute([$srv['slug']]);
    $serviceMap[$srv['slug']] = (int) $stmtId->fetchColumn();
}
echo "✅ " . count($services) . " Affordable services seeded with accessible rates.\n";

// 3. Map Staff to Qualified Services
$staffList = $db->query("SELECT id, user_id FROM staff_profiles WHERE salon_id = 1 ORDER BY id ASC")->fetchAll();
$allServiceIds = array_values($serviceMap);

foreach ($staffList as $st) {
    $staffId = (int)$st['id'];
    foreach ($allServiceIds as $sId) {
        $stmt = $db->prepare("
            INSERT INTO staff_services (staff_id, service_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE staff_id = staff_id
        ");
        $stmt->execute([$staffId, $sId]);
    }
}
echo "✅ Staff service qualifications mapped.\n";

// 4. Seed Affordable Coupons (Min spend ₹300 - ₹999)
$coupons = [
    ['code' => 'AURELIA10', 'title' => 'Flat 10% Welcome Discount', 'type' => 'percentage', 'val' => 10.00, 'min' => 300.00, 'max' => 200.00, 'limit' => 500, 'per' => 1],
    ['code' => 'FESTIVE20', 'title' => 'Celebration Special (20% Off)', 'type' => 'percentage', 'val' => 20.00, 'min' => 700.00, 'max' => 500.00, 'limit' => 200, 'per' => 1],
    ['code' => 'FLAT100', 'title' => 'Flat ₹100 Off on Services', 'type' => 'fixed', 'val' => 100.00, 'min' => 499.00, 'max' => 100.00, 'limit' => 300, 'per' => 2],
    ['code' => 'GLOW50', 'title' => 'Facial & Skin Care ₹50 Savings', 'type' => 'fixed', 'val' => 50.00, 'min' => 350.00, 'max' => 50.00, 'limit' => 200, 'per' => 2],
];

foreach ($coupons as $c) {
    $stmt = $db->prepare("
        INSERT INTO coupons (salon_id, code, title, discount_type, discount_value, min_spend, max_discount, usage_limit, per_customer_limit, start_date, end_date, is_active)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, '2026-01-01', '2027-12-31', 1)
        ON DUPLICATE KEY UPDATE title = VALUES(title), discount_value = VALUES(discount_value), min_spend = VALUES(min_spend), max_discount = VALUES(max_discount)
    ");
    $stmt->execute([$c['code'], $c['title'], $c['type'], $c['val'], $c['min'], $c['max'], $c['limit'], $c['per']]);
}
echo "✅ Accessible coupons seeded.\n";

// Update existing appointments with affordable prices
$allAppointments = $db->query("SELECT id FROM appointments WHERE salon_id = 1")->fetchAll();
foreach ($allAppointments as $a) {
    $aId = (int)$a['id'];
    // Update appointment services with realistic price
    $srvs = $db->query("SELECT aps.id, s.price, s.duration_minutes FROM appointment_services aps JOIN services s ON aps.service_id = s.id WHERE aps.appointment_id = {$aId}")->fetchAll();
    if (!empty($srvs)) {
        $subtotal = 0;
        foreach ($srvs as $s) {
            $p = (float)$s['price'];
            $subtotal += $p;
            $db->exec("UPDATE appointment_services SET price = {$p} WHERE id = {$s['id']}");
        }
        $tax = round($subtotal * 0.18, 2);
        $total = $subtotal + $tax;
        $db->exec("UPDATE appointments SET subtotal = {$subtotal}, tax_amount = {$tax}, total_amount = {$total} WHERE id = {$aId}");
        $db->exec("UPDATE invoices SET subtotal = {$subtotal}, tax_total = {$tax}, grand_total = {$total}, paid_total = {$total} WHERE appointment_id = {$aId}");
        $db->exec("UPDATE payments SET amount = {$total} WHERE appointment_id = {$aId}");
    }
}
echo "✅ Existing appointments and invoices adjusted to affordable pricing.\n";

echo "🎉 Affordable & Accessible Seeding completed successfully!\n";
