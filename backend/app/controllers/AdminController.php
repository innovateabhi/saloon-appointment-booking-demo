<?php

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\ReportingService;
use App\Services\BookingService;
use InvalidArgumentException;

class AdminController
{
    public function dashboard(): void
    {
        AuthMiddleware::requireAdmin();
        $summary = ReportingService::getDashboardSummary();
        Response::success($summary);
    }

    public function calendar(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $startDate = $_GET['start'] ?? date('Y-m-d', strtotime('-7 days'));
        $endDate = $_GET['end'] ?? date('Y-m-d', strtotime('+14 days'));
        $staffId = !empty($_GET['staff_id']) ? (int)$_GET['staff_id'] : null;

        $sql = "
            SELECT a.id, a.booking_reference, a.appointment_date, a.start_time, a.end_time, a.status, a.total_amount,
                   CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
                   CONCAT(u.first_name, ' ', u.last_name) AS stylist_name,
                   sp.id AS stylist_id,
                   (SELECT GROUP_CONCAT(s.name SEPARATOR ', ') FROM appointment_services aps JOIN services s ON aps.service_id = s.id WHERE aps.appointment_id = a.id) AS service_names
            FROM appointments a
            JOIN customers c ON a.customer_id = c.id
            JOIN staff_profiles sp ON a.staff_id = sp.id
            JOIN users u ON sp.user_id = u.id
            WHERE a.salon_id = 1 AND a.appointment_date BETWEEN ? AND ?
        ";
        $params = [$startDate, $endDate];

        if ($staffId) {
            $sql .= " AND a.staff_id = ?";
            $params[] = $staffId;
        }

        $sql .= " ORDER BY a.appointment_date ASC, a.start_time ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $events = $stmt->fetchAll();

        Response::success($events);
    }

    public function appointments(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $perPage = max(1, (int)($_GET['per_page'] ?? 20));
        $offset = ($page - 1) * $perPage;

        $status = $_GET['status'] ?? null;
        $search = $_GET['search'] ?? null;
        $date = $_GET['date'] ?? null;

        $where = "WHERE a.salon_id = 1";
        $params = [];

        if (!empty($status)) {
            $where .= " AND a.status = ?";
            $params[] = $status;
        }

        if (!empty($date)) {
            $where .= " AND a.appointment_date = ?";
            $params[] = $date;
        }

        if (!empty($search)) {
            $where .= " AND (a.booking_reference LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        // Count total
        $stmtCount = $db->prepare("SELECT COUNT(*) FROM appointments a JOIN customers c ON a.customer_id = c.id {$where}");
        $stmtCount->execute($params);
        $total = (int)$stmtCount->fetchColumn();

        // Fetch records
        $sql = "
            SELECT a.*,
                   CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
                   c.phone AS customer_phone, c.email AS customer_email,
                   CONCAT(u.first_name, ' ', u.last_name) AS stylist_name,
                   sp.title AS stylist_title
            FROM appointments a
            JOIN customers c ON a.customer_id = c.id
            JOIN staff_profiles sp ON a.staff_id = sp.id
            JOIN users u ON sp.user_id = u.id
            {$where}
            ORDER BY a.appointment_date DESC, a.start_time DESC
            LIMIT {$perPage} OFFSET {$offset}
        ";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();

        foreach ($items as &$item) {
            $stmtSrv = $db->prepare("
                SELECT aps.*, s.name FROM appointment_services aps
                JOIN services s ON aps.service_id = s.id
                WHERE aps.appointment_id = ?
            ");
            $stmtSrv->execute([$item['id']]);
            $item['services'] = $stmtSrv->fetchAll();
        }

        Response::paginated($items, $total, $page, $perPage);
    }

    public function createAppointment(): void
    {
        $user = AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $appt = BookingService::createBooking($input, null);
            Response::success($appt, 'Walk-in appointment registered successfully.', 201);
        } catch (InvalidArgumentException $e) {
            Response::validationError(['walkin' => $e->getMessage()], $e->getMessage());
        } catch (\Throwable $e) {
            Response::error('Failed to create appointment: ' . $e->getMessage(), 500);
        }
    }

    public function updateStatus(string $id): void
    {
        $user = AuthMiddleware::requireAdmin();
        $appointmentId = (int)$id;
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $newStatus = trim($input['status'] ?? '');

        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM appointments WHERE id = ? LIMIT 1");
        $stmt->execute([$appointmentId]);
        $appt = $stmt->fetch();

        if (!$appt) {
            Response::notFound('Appointment not found.');
        }

        Database::beginTransaction();
        try {
            $stmt = $db->prepare("UPDATE appointments SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $appointmentId]);

            $stmtHist = $db->prepare("
                INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, notes)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmtHist->execute([$appointmentId, $appt['status'], $newStatus, $user['id'], trim($input['notes'] ?? 'Updated via Admin Console')]);

            Database::commit();
            Response::success(null, "Appointment marked as {$newStatus}.");
        } catch (\Throwable $e) {
            Database::rollBack();
            Response::error('Failed to update status: ' . $e->getMessage(), 500);
        }
    }

    public function services(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT s.*, sc.name AS category_name
            FROM services s
            JOIN service_categories sc ON s.category_id = sc.id
            WHERE s.salon_id = 1
            ORDER BY sc.display_order ASC, s.display_order ASC
        ");
        $services = $stmt->fetchAll();
        Response::success($services);
    }

    public function createService(): void
    {
        AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $catId = (int)($input['category_id'] ?? 1);
        $name = trim($input['name'] ?? '');
        $price = (float)($input['price'] ?? 0);
        $duration = (int)($input['duration_minutes'] ?? 30);
        $buffer = (int)($input['buffer_minutes'] ?? 10);
        $desc = trim($input['description'] ?? '');

        if (empty($name) || $price <= 0) {
            Response::validationError(['fields' => 'Service name and valid price are required.']);
        }

        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
        $db = Database::getConnection();

        $stmt = $db->prepare("
            INSERT INTO services (salon_id, category_id, name, slug, description, price, duration_minutes, buffer_minutes, is_active)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, 1)
        ");
        $stmt->execute([$catId, $name, $slug, $desc, $price, $duration, $buffer]);
        $newId = (int)$db->lastInsertId();

        // Assign to all stylists by default
        $staffIds = $db->query("SELECT id FROM staff_profiles WHERE salon_id = 1")->fetchAll(\PDO::FETCH_COLUMN);
        foreach ($staffIds as $sId) {
            $stmtSt = $db->prepare("INSERT INTO staff_services (staff_id, service_id) VALUES (?, ?)");
            $stmtSt->execute([$sId, $newId]);
        }

        Response::success(['id' => $newId], 'Service added successfully.', 201);
    }

    public function staff(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT sp.*, u.first_name, u.last_name, u.email, u.phone
            FROM staff_profiles sp
            JOIN users u ON sp.user_id = u.id
            WHERE sp.salon_id = 1
            ORDER BY sp.display_order ASC
        ");
        $staff = $stmt->fetchAll();
        Response::success($staff);
    }

    public function customers(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $search = $_GET['search'] ?? null;
        $sql = "
            SELECT c.*, la.tier AS loyalty_tier
            FROM customers c
            LEFT JOIN loyalty_accounts la ON la.customer_id = c.id
            WHERE c.salon_id = 1
        ";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.phone LIKE ? OR c.customer_code LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $sql .= " ORDER BY c.total_spend DESC LIMIT 100";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $customers = $stmt->fetchAll();

        Response::success($customers);
    }

    public function payments(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT p.*, a.booking_reference, CONCAT(c.first_name, ' ', c.last_name) AS customer_name, c.phone AS customer_phone
            FROM payments p
            JOIN appointments a ON p.appointment_id = a.id
            JOIN customers c ON a.customer_id = c.id
            WHERE p.salon_id = 1
            ORDER BY p.id DESC
            LIMIT 100
        ");
        $payments = $stmt->fetchAll();
        Response::success($payments);
    }

    public function recordPayment(): void
    {
        $user = AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $appointmentId = (int)($input['appointment_id'] ?? 0);
        $method = trim($input['payment_method'] ?? 'cash');
        $amount = (float)($input['amount'] ?? 0);

        if ($appointmentId <= 0 || $amount <= 0) {
            Response::validationError(['fields' => 'Appointment and valid payment amount are required.']);
        }

        $db = Database::getConnection();
        Database::beginTransaction();
        try {
            $payRef = 'PAY-' . strtoupper(bin2hex(random_bytes(4)));
            $stmt = $db->prepare("
                INSERT INTO payments (salon_id, appointment_id, payment_reference, payment_method, amount, status, recorded_by)
                VALUES (1, ?, ?, ?, ?, 'success', ?)
            ");
            $stmt->execute([$appointmentId, $payRef, $method, $amount, $user['id']]);

            // Update appointment payment status
            $stmtAppt = $db->prepare("UPDATE appointments SET payment_status = 'paid' WHERE id = ?");
            $stmtAppt->execute([$appointmentId]);

            Database::commit();
            Response::success(['reference' => $payRef], 'Payment recorded successfully.');
        } catch (\Throwable $e) {
            Database::rollBack();
            Response::error('Failed to record payment: ' . $e->getMessage(), 500);
        }
    }

    public function reports(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        // 30-day sales volume
        $stmtSales = $db->query("
            SELECT DATE(created_at) AS date, SUM(amount) AS revenue, COUNT(*) AS transactions
            FROM payments
            WHERE salon_id = 1 AND status = 'success' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        ");
        $sales = $stmtSales->fetchAll();

        // Revenue by stylist
        $stmtStylist = $db->query("
            SELECT CONCAT(u.first_name, ' ', u.last_name) AS stylist_name,
                   COUNT(a.id) AS total_services,
                   COALESCE(SUM(a.total_amount), 0) AS total_revenue
            FROM staff_profiles sp
            JOIN users u ON sp.user_id = u.id
            LEFT JOIN appointments a ON a.staff_id = sp.id AND a.status = 'completed'
            WHERE sp.salon_id = 1
            GROUP BY sp.id
            ORDER BY total_revenue DESC
        ");
        $byStylist = $stmtStylist->fetchAll();

        // Payment method breakdown
        $stmtMethods = $db->query("
            SELECT payment_method, COUNT(*) AS count, SUM(amount) AS total
            FROM payments
            WHERE salon_id = 1 AND status = 'success'
            GROUP BY payment_method
        ");
        $methods = $stmtMethods->fetchAll();

        Response::success([
            'sales_history' => $sales,
            'by_stylist' => $byStylist,
            'payment_methods' => $methods,
        ]);
    }

    public function exportReportsCsv(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT a.booking_reference, a.appointment_date, a.start_time, a.status, a.payment_status,
                   CONCAT(c.first_name, ' ', c.last_name) AS customer_name, c.phone AS customer_phone,
                   CONCAT(u.first_name, ' ', u.last_name) AS stylist_name,
                   a.subtotal, a.discount_amount, a.tax_amount, a.total_amount
            FROM appointments a
            JOIN customers c ON a.customer_id = c.id
            JOIN staff_profiles sp ON a.staff_id = sp.id
            JOIN users u ON sp.user_id = u.id
            WHERE a.salon_id = 1
            ORDER BY a.appointment_date DESC, a.start_time DESC
        ");

        header('Content-Type: text/csv; charset=UTF-8');
        header('Content-Disposition: attachment; filename="aurelia_appointments_report.csv"');

        $out = fopen('php://output', 'w');
        fputcsv($out, ['Booking Ref', 'Date', 'Time', 'Status', 'Payment', 'Client', 'Phone', 'Stylist', 'Subtotal', 'Discount', 'Tax', 'Total (INR)']);

        while ($row = $stmt->fetch(\PDO::FETCH_NUM)) {
            fputcsv($out, $row);
        }
        fclose($out);
        exit;
    }

    public function settings(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $stmt = $db->query("SELECT setting_key, setting_value FROM salon_settings WHERE salon_id = 1");
        $settings = [];
        while ($row = $stmt->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        Response::success($settings);
    }

    public function updateSettings(): void
    {
        AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        foreach ($input as $key => $val) {
            $stmt = $db->prepare("
                INSERT INTO salon_settings (salon_id, setting_key, setting_value, setting_group)
                VALUES (1, ?, ?, 'branding')
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            ");
            $stmt->execute([$key, $val]);
        }

        Response::success(null, 'Settings updated successfully.');
    }

    public function fullSettings(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        // Salon details
        $stmtSalon = $db->prepare("SELECT id, name, slug, phone, email, address, city, state, postal_code, currency, currency_symbol, timezone, tax_percentage, booking_notice_hours, booking_horizon_days, cancellation_cutoff_hours FROM salons WHERE id = 1");
        $stmtSalon->execute();
        $salon = $stmtSalon->fetch() ?: [];

        // Key-value settings
        $stmtSettings = $db->query("SELECT setting_key, setting_value, setting_group FROM salon_settings WHERE salon_id = 1");
        $settings = [];
        while ($row = $stmtSettings->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        // Business hours
        $stmtHours = $db->query("SELECT day_of_week, is_open, open_time, close_time FROM salon_business_hours WHERE salon_id = 1 ORDER BY day_of_week ASC");
        $hours = $stmtHours->fetchAll();

        // Closures
        $stmtClosures = $db->query("SELECT id, closure_date, reason, is_full_day, start_time, end_time FROM salon_closures WHERE salon_id = 1 ORDER BY closure_date ASC");
        $closures = $stmtClosures->fetchAll();

        Response::success([
            'salon' => $salon,
            'settings' => $settings,
            'business_hours' => $hours,
            'closures' => $closures
        ]);
    }

    public function updateFullSettings(): void
    {
        AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();
        $db->beginTransaction();

        try {
            // Update Salon Profile
            if (!empty($input['salon'])) {
                $s = $input['salon'];
                $stmt = $db->prepare("
                    UPDATE salons 
                    SET name = ?, phone = ?, email = ?, address = ?, city = ?, state = ?, postal_code = ?, timezone = ?
                    WHERE id = 1
                ");
                $stmt->execute([
                    $s['name'] ?? 'AURELIA — Salon & Beauty Studio',
                    $s['phone'] ?? '+91 98765 43210',
                    $s['email'] ?? 'concierge@aureliasalon.com',
                    $s['address'] ?? '42 Crescent Avenue, Jubilee Hills',
                    $s['city'] ?? 'Hyderabad',
                    $s['state'] ?? 'Telangana',
                    $s['postal_code'] ?? '500033',
                    $s['timezone'] ?? 'Asia/Kolkata'
                ]);
            }

            // Update Settings Map
            if (!empty($input['settings']) && is_array($input['settings'])) {
                foreach ($input['settings'] as $key => $val) {
                    $stmt = $db->prepare("
                        INSERT INTO salon_settings (salon_id, setting_key, setting_value, setting_group)
                        VALUES (1, ?, ?, 'general')
                        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
                    ");
                    $stmt->execute([$key, (string)$val]);
                }
            }

            // Update Business Hours
            if (!empty($input['business_hours']) && is_array($input['business_hours'])) {
                foreach ($input['business_hours'] as $h) {
                    $dow = (int)$h['day_of_week'];
                    $isOpen = !empty($h['is_open']) ? 1 : 0;
                    $open = $h['open_time'] ?? '09:00:00';
                    $close = $h['close_time'] ?? '20:00:00';

                    $stmt = $db->prepare("
                        INSERT INTO salon_business_hours (salon_id, day_of_week, is_open, open_time, close_time)
                        VALUES (1, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE is_open = VALUES(is_open), open_time = VALUES(open_time), close_time = VALUES(close_time)
                    ");
                    $stmt->execute([$dow, $isOpen, $open, $close]);
                }
            }

            $db->commit();
            Response::success(null, 'Complete studio settings, profile, and hours saved successfully.');
        } catch (\Exception $e) {
            $db->rollBack();
            Response::error('Failed to update settings: ' . $e->getMessage(), 500);
        }
    }

    public function addClosure(): void
    {
        AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $date = trim($input['closure_date'] ?? '');
        $reason = trim($input['reason'] ?? 'Studio Closure / Holiday');
        $isFullDay = isset($input['is_full_day']) ? (int)$input['is_full_day'] : 1;
        $startTime = !empty($input['start_time']) ? trim($input['start_time']) : null;
        $endTime = !empty($input['end_time']) ? trim($input['end_time']) : null;

        if (empty($date) || empty($reason)) {
            Response::validationError(['fields' => 'Closure date and reason are required.']);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO salon_closures (salon_id, closure_date, reason, is_full_day, start_time, end_time)
            VALUES (1, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$date, $reason, $isFullDay, $startTime, $endTime]);

        Response::success(['id' => (int)$db->lastInsertId()], 'Studio holiday closure scheduled.', 201);
    }

    public function deleteClosure(string $id): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM salon_closures WHERE id = ? AND salon_id = 1");
        $stmt->execute([(int)$id]);
        Response::success(null, 'Closure removed.');
    }
}

