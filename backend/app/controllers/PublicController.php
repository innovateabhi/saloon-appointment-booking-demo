<?php

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Services\AvailabilityService;

class PublicController
{
    public function salon(): void
    {
        $db = Database::getConnection();

        // Salon details
        $stmt = $db->query("SELECT * FROM salons WHERE id = 1 LIMIT 1");
        $salon = $stmt->fetch();

        // Business hours
        $stmtHours = $db->query("SELECT day_of_week, is_open, open_time, close_time FROM salon_business_hours WHERE salon_id = 1 ORDER BY day_of_week ASC");
        $salon['hours'] = $stmtHours->fetchAll();

        // CMS settings
        $stmtSettings = $db->query("SELECT setting_key, setting_value FROM salon_settings WHERE salon_id = 1");
        $settings = [];
        while ($row = $stmtSettings->fetch()) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }
        $salon['settings'] = $settings;

        Response::success($salon);
    }

    public function categories(): void
    {
        $db = Database::getConnection();
        $stmt = $db->query("
            SELECT sc.*, COUNT(s.id) AS services_count
            FROM service_categories sc
            LEFT JOIN services s ON s.category_id = sc.id AND s.is_active = 1
            WHERE sc.salon_id = 1 AND sc.is_active = 1
            GROUP BY sc.id
            ORDER BY sc.display_order ASC
        ");
        $categories = $stmt->fetchAll();
        Response::success($categories);
    }

    public function services(): void
    {
        $db = Database::getConnection();
        $catSlug = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;

        $sql = "
            SELECT s.*, sc.name AS category_name, sc.slug AS category_slug
            FROM services s
            JOIN service_categories sc ON s.category_id = sc.id
            WHERE s.salon_id = 1 AND s.is_active = 1
        ";
        $params = [];

        if (!empty($catSlug)) {
            $sql .= " AND sc.slug = ?";
            $params[] = $catSlug;
        }

        if (!empty($search)) {
            $sql .= " AND (s.name LIKE ? OR s.description LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $sql .= " ORDER BY sc.display_order ASC, s.display_order ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $services = $stmt->fetchAll();

        // Attach eligible stylists to each service
        foreach ($services as &$srv) {
            $stmtSt = $db->prepare("
                SELECT sp.id, CONCAT(u.first_name, ' ', u.last_name) AS name, sp.title
                FROM staff_services ss
                JOIN staff_profiles sp ON ss.staff_id = sp.id
                JOIN users u ON sp.user_id = u.id
                WHERE ss.service_id = ? AND sp.is_active = 1
            ");
            $stmtSt->execute([$srv['id']]);
            $srv['stylists'] = $stmtSt->fetchAll();
        }

        Response::success($services);
    }

    public function staff(): void
    {
        $db = Database::getConnection();
        $stmt = $db->query("
            SELECT sp.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url
            FROM staff_profiles sp
            JOIN users u ON sp.user_id = u.id
            WHERE sp.salon_id = 1 AND sp.is_active = 1
            ORDER BY sp.display_order ASC
        ");
        $staff = $stmt->fetchAll();

        // Fetch service tags
        foreach ($staff as &$st) {
            $stmtSrv = $db->prepare("
                SELECT s.id, s.name, sc.name AS category_name
                FROM staff_services ss
                JOIN services s ON ss.service_id = s.id
                JOIN service_categories sc ON s.category_id = sc.id
                WHERE ss.staff_id = ? AND s.is_active = 1
                LIMIT 6
            ");
            $stmtSrv->execute([$st['id']]);
            $st['services'] = $stmtSrv->fetchAll();
        }

        Response::success($staff);
    }

    public function offers(): void
    {
        $db = Database::getConnection();
        $stmt = $db->query("
            SELECT * FROM coupons
            WHERE salon_id = 1 AND is_active = 1 AND CURDATE() BETWEEN start_date AND end_date
            ORDER BY discount_value DESC
        ");
        $offers = $stmt->fetchAll();
        Response::success($offers);
    }

    public function reviews(): void
    {
        $db = Database::getConnection();
        $stmt = $db->query("
            SELECT r.*, c.first_name AS customer_first_name, c.last_name AS customer_last_name,
                   CONCAT(u.first_name, ' ', u.last_name) AS stylist_name,
                   s.name AS service_name
            FROM reviews r
            JOIN customers c ON r.customer_id = c.id
            JOIN staff_profiles sp ON r.staff_id = sp.id
            JOIN users u ON sp.user_id = u.id
            LEFT JOIN appointments a ON r.appointment_id = a.id
            LEFT JOIN appointment_services aps ON aps.appointment_id = a.id
            LEFT JOIN services s ON aps.service_id = s.id
            WHERE r.salon_id = 1 AND r.is_published = 1
            GROUP BY r.id
            ORDER BY r.id DESC
            LIMIT 10
        ");
        $reviews = $stmt->fetchAll();
        Response::success($reviews);
    }

    public function availability(): void
    {
        $date = $_GET['date'] ?? null;
        $serviceIds = isset($_GET['services']) ? array_filter(array_map('intval', explode(',', $_GET['services']))) : [];
        $staffId = !empty($_GET['staff_id']) ? (int)$_GET['staff_id'] : null;

        if (empty($date) || empty($serviceIds)) {
            Response::validationError(['params' => 'Both date and at least one service ID are required.']);
        }

        $slots = AvailabilityService::getAvailableSlots($date, $serviceIds, $staffId);
        Response::success($slots);
    }

    public function contact(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $message = trim($input['message'] ?? '');

        if (empty($name) || empty($email) || empty($message)) {
            Response::validationError(['fields' => 'Name, email, and message are required.']);
        }

        // Save notification for admin
        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO notifications (salon_id, user_id, title, message, type)
            VALUES (1, 1, 'New Website Concierge Inquiry', ?, 'info')
        ");
        $inquiry = "Inquiry from {$name} ({$email}): {$message}";
        $stmt->execute([$inquiry]);

        Response::success(null, 'Thank you. The Aurelia concierge will connect with you promptly.');
    }
}

