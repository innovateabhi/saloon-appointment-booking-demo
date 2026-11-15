<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$db = App\Config\Database::getConnection();

$hours = $db->query("SELECT * FROM salon_business_hours WHERE salon_id = 1")->fetchAll();
echo "Hours count: " . count($hours) . PHP_EOL;

if (count($hours) === 0) {
    echo "Seeding default business hours...\n";
    for ($d = 0; $d <= 6; $d++) {
        // 0 = Sunday (10:00 to 19:00), 1-6 = Mon-Sat (09:00 to 20:00)
        $isOpen = 1;
        $open = ($d === 0) ? '10:00:00' : '09:00:00';
        $close = ($d === 0) ? '19:00:00' : '20:00:00';
        $stmt = $db->prepare("INSERT INTO salon_business_hours (salon_id, day_of_week, is_open, open_time, close_time) VALUES (1, ?, ?, ?, ?)");
        $stmt->execute([$d, $isOpen, $open, $close]);
    }
    echo "Done.\n";
}

$closures = $db->query("SELECT * FROM salon_closures WHERE salon_id = 1")->fetchAll();
echo "Closures count: " . count($closures) . PHP_EOL;

if (count($closures) === 0) {
    echo "Seeding sample closures...\n";
    $sampleClosures = [
        ['2026-10-20', 'Diwali Festival Holiday', 1],
        ['2026-12-25', 'Christmas Day Observance', 1],
        ['2027-01-01', 'New Year Holiday', 1],
    ];
    foreach ($sampleClosures as $c) {
        $stmt = $db->prepare("INSERT INTO salon_closures (salon_id, closure_date, reason, is_full_day) VALUES (1, ?, ?, ?)");
        $stmt->execute($c);
    }
    echo "Done.\n";
}

$coupons = $db->query("SELECT id, code, discount_value, times_used, is_active FROM coupons WHERE salon_id = 1")->fetchAll();
echo "Coupons: " . count($coupons) . PHP_EOL;
foreach ($coupons as $cp) {
    echo " - {$cp['code']}: {$cp['discount_value']} ({$cp['times_used']} used, active: {$cp['is_active']})\n";
}

$loyalty = $db->query("SELECT COUNT(*) FROM loyalty_accounts WHERE salon_id = 1")->fetchColumn();
echo "Loyalty Accounts: " . $loyalty . PHP_EOL;

$tx = $db->query("SELECT COUNT(*) FROM loyalty_transactions")->fetchColumn();
echo "Loyalty Transactions: " . $tx . PHP_EOL;

