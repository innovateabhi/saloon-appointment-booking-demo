<?php

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\BookingService;
use InvalidArgumentException;

class CustomerController
{
    public function dashboard(): void
    {
        $user = AuthMiddleware::requireRole('customer');
        $customerId = (int)$user['customer_id'];
        $db = Database::getConnection();

        // Next upcoming appointment
        $stmt = $db->prepare("
            SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) AS stylist_name, sp.title AS stylist_title
            FROM appointments a
            JOIN staff_profiles sp ON a.staff_id = sp.id
            JOIN users u ON sp.user_id = u.id
            WHERE a.customer_id = ? AND a.appointment_date >= CURDATE() AND a.status NOT IN ('cancelled', 'completed')
            ORDER BY a.appointment_date ASC, a.start_time ASC
            LIMIT 1
        ");
        $stmt->execute([$customerId]);
        $nextAppt = $stmt->fetch();

        if ($nextAppt) {
            $stmtSrv = $db->prepare("
                SELECT aps.*, s.name FROM appointment_services aps
                JOIN services s ON aps.service_id = s.id
                WHERE aps.appointment_id = ?
            ");
            $stmtSrv->execute([$nextAppt['id']]);
            $nextAppt['services'] = $stmtSrv->fetchAll();
        }

        // Loyalty details
        $stmtLoyalty = $db->prepare("SELECT * FROM loyalty_accounts WHERE customer_id = ? LIMIT 1");
        $stmtLoyalty->execute([$customerId]);
        $loyalty = $stmtLoyalty->fetch() ?: [
            'points_balance' => 0,
            'tier' => 'Silver'
        ];

        // Active coupons
        $stmtCoupons = $db->query("SELECT * FROM coupons WHERE is_active = 1 AND CURDATE() BETWEEN start_date AND end_date LIMIT 3");
        $coupons = $stmtCoupons->fetchAll();

        // Recent appointments
        $stmtRecent = $db->prepare("
            SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) AS stylist_name
            FROM appointments a
            JOIN staff_profiles sp ON a.staff_id = sp.id
            JOIN users u ON sp.user_id = u.id
            WHERE a.customer_id = ?
            ORDER BY a.appointment_date DESC, a.start_time DESC
            LIMIT 5
        ");
        $stmtRecent->execute([$customerId]);
        $recent = $stmtRecent->fetchAll();

        Response::success([
            'next_appointment' => $nextAppt ?: null,
            'loyalty' => $loyalty,
            'recent_appointments' => $recent,
            'active_coupons' => $coupons,
        ]);
    }

    public function appointments(): void
    {
        $user = AuthMiddleware::requireRole('customer');
        $customerId = (int)$user['customer_id'];
        $db = Database::getConnection();

        $status = $_GET['status'] ?? null;
        $sql = "
            SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) AS stylist_name, sp.title AS stylist_title
            FROM appointments a
            JOIN staff_profiles sp ON a.staff_id = sp.id
            JOIN users u ON sp.user_id = u.id
            WHERE a.customer_id = ?
        ";
        $params = [$customerId];

        if ($status === 'upcoming') {
            $sql .= " AND a.appointment_date >= CURDATE() AND a.status NOT IN ('cancelled', 'completed')";
        } elseif ($status === 'completed') {
            $sql .= " AND a.status = 'completed'";
        } elseif ($status === 'cancelled') {
            $sql .= " AND a.status = 'cancelled'";
        }

        $sql .= " ORDER BY a.appointment_date DESC, a.start_time DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $appointments = $stmt->fetchAll();

        foreach ($appointments as &$appt) {
            $stmtSrv = $db->prepare("
                SELECT aps.*, s.name, s.duration_minutes
                FROM appointment_services aps
                JOIN services s ON aps.service_id = s.id
                WHERE aps.appointment_id = ?
            ");
            $stmtSrv->execute([$appt['id']]);
            $appt['services'] = $stmtSrv->fetchAll();
        }

        Response::success($appointments);
    }

    public function loyalty(): void
    {
        $user = AuthMiddleware::requireRole('customer');
        $customerId = (int)$user['customer_id'];
        $db = Database::getConnection();

        $stmt = $db->prepare("SELECT * FROM loyalty_accounts WHERE customer_id = ? LIMIT 1");
        $stmt->execute([$customerId]);
        $account = $stmt->fetch();

        $transactions = [];
        if ($account) {
            $stmtTrans = $db->prepare("
                SELECT * FROM loyalty_transactions
                WHERE loyalty_account_id = ?
                ORDER BY id DESC
            ");
            $stmtTrans->execute([$account['id']]);
            $transactions = $stmtTrans->fetchAll();
        }

        Response::success([
            'account' => $account ?: ['points_balance' => 0, 'tier' => 'Silver'],
            'transactions' => $transactions,
        ]);
    }

    public function submitReview(): void
    {
        $user = AuthMiddleware::requireRole('customer');
        $customerId = (int)$user['customer_id'];
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $appointmentId = (int)($input['appointment_id'] ?? 0);
        $rating = (int)($input['rating'] ?? 5);
        $comment = trim($input['comment'] ?? '');

        if ($rating < 1 || $rating > 5) {
            Response::validationError(['rating' => 'Rating must be between 1 and 5 stars.']);
        }

        $db = Database::getConnection();

        // Must strictly be own completed appointment
        $stmt = $db->prepare("SELECT * FROM appointments WHERE id = ? AND customer_id = ? LIMIT 1");
        $stmt->execute([$appointmentId, $customerId]);
        $appt = $stmt->fetch();

        if (!$appt) {
            Response::error('Appointment not found.', 404);
        }

        if ($appt['status'] !== 'completed') {
            Response::error('You can only review treatments that have been completed.', 400);
        }

        // Insert or update review
        $stmt = $db->prepare("
            INSERT INTO reviews (salon_id, appointment_id, customer_id, staff_id, rating, comment, is_published)
            VALUES (1, ?, ?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)
        ");
        $stmt->execute([$appointmentId, $customerId, $appt['staff_id'], $rating, $comment]);

        Response::success(null, 'Thank you! Your verified review has been submitted.');
    }
}

