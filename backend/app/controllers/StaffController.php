<?php

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use InvalidArgumentException;

class StaffController
{
    public function dashboard(): void
    {
        $user = AuthMiddleware::requireRole(['staff', 'admin']);
        $staffId = (int)($user['staff_id'] ?? 1);
        $db = Database::getConnection();

        $today = date('Y-m-d');

        // Today's appointments
        $stmt = $db->prepare("
            SELECT a.*, c.first_name AS customer_first_name, c.last_name AS customer_last_name, c.phone AS customer_phone
            FROM appointments a
            JOIN customers c ON a.customer_id = c.id
            WHERE a.staff_id = ? AND a.appointment_date = ?
            ORDER BY a.start_time ASC
        ");
        $stmt->execute([$staffId, $today]);
        $todayAppointments = $stmt->fetchAll();

        foreach ($todayAppointments as &$appt) {
            $stmtSrv = $db->prepare("
                SELECT aps.*, s.name FROM appointment_services aps
                JOIN services s ON aps.service_id = s.id
                WHERE aps.appointment_id = ?
            ");
            $stmtSrv->execute([$appt['id']]);
            $appt['services'] = $stmtSrv->fetchAll();
        }

        // Stats
        $stmtTotal = $db->prepare("SELECT COUNT(*) FROM appointments WHERE staff_id = ? AND appointment_date = ?");
        $stmtTotal->execute([$staffId, $today]);
        $totalToday = (int)$stmtTotal->fetchColumn();

        $stmtCompleted = $db->prepare("SELECT COUNT(*) FROM appointments WHERE staff_id = ? AND appointment_date = ? AND status = 'completed'");
        $stmtCompleted->execute([$staffId, $today]);
        $completedToday = (int)$stmtCompleted->fetchColumn();

        Response::success([
            'today_appointments' => $todayAppointments,
            'stats' => [
                'total_today' => $totalToday,
                'completed_today' => $completedToday,
                'pending_today' => $totalToday - $completedToday,
            ]
        ]);
    }

    public function calendar(): void
    {
        $user = AuthMiddleware::requireRole(['staff', 'admin']);
        $staffId = (int)($user['staff_id'] ?? 1);
        $db = Database::getConnection();

        $startDate = $_GET['start'] ?? date('Y-m-d', strtotime('-7 days'));
        $endDate = $_GET['end'] ?? date('Y-m-d', strtotime('+14 days'));

        $stmt = $db->prepare("
            SELECT a.id, a.booking_reference, a.appointment_date, a.start_time, a.end_time, a.status,
                   CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
                   (SELECT GROUP_CONCAT(s.name SEPARATOR ', ') FROM appointment_services aps JOIN services s ON aps.service_id = s.id WHERE aps.appointment_id = a.id) AS service_names
            FROM appointments a
            JOIN customers c ON a.customer_id = c.id
            WHERE a.staff_id = ? AND a.appointment_date BETWEEN ? AND ?
            ORDER BY a.appointment_date ASC, a.start_time ASC
        ");
        $stmt->execute([$staffId, $startDate, $endDate]);
        $calendarBookings = $stmt->fetchAll();

        Response::success($calendarBookings);
    }

    public function appointments(): void
    {
        $user = AuthMiddleware::requireRole(['staff', 'admin']);
        $staffId = (int)($user['staff_id'] ?? 1);
        $db = Database::getConnection();

        $date = $_GET['date'] ?? null;
        $sql = "
            SELECT a.*, c.first_name AS customer_first_name, c.last_name AS customer_last_name, c.phone AS customer_phone
            FROM appointments a
            JOIN customers c ON a.customer_id = c.id
            WHERE a.staff_id = ?
        ";
        $params = [$staffId];

        if (!empty($date)) {
            $sql .= " AND a.appointment_date = ?";
            $params[] = $date;
        }

        $sql .= " ORDER BY a.appointment_date DESC, a.start_time ASC LIMIT 50";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $appointments = $stmt->fetchAll();

        foreach ($appointments as &$appt) {
            $stmtSrv = $db->prepare("
                SELECT aps.*, s.name FROM appointment_services aps
                JOIN services s ON aps.service_id = s.id
                WHERE aps.appointment_id = ?
            ");
            $stmtSrv->execute([$appt['id']]);
            $appt['services'] = $stmtSrv->fetchAll();
        }

        Response::success($appointments);
    }

    public function updateStatus(string $id): void
    {
        $user = AuthMiddleware::requireRole(['staff', 'admin']);
        $appointmentId = (int)$id;
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $newStatus = trim($input['status'] ?? '');

        $validStatuses = ['pending', 'confirmed', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show'];
        if (!in_array($newStatus, $validStatuses, true)) {
            Response::validationError(['status' => 'Invalid appointment status transition.']);
        }

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

            // Audit history
            $stmt = $db->prepare("
                INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, notes)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([$appointmentId, $appt['status'], $newStatus, $user['id'], trim($input['notes'] ?? 'Updated by stylist')]);

            // If completed and not paid, auto mark paid if cash handed
            if ($newStatus === 'completed' && !empty($input['mark_paid'])) {
                $stmtPay = $db->prepare("UPDATE appointments SET payment_status = 'paid' WHERE id = ?");
                $stmtPay->execute([$appointmentId]);
            }

            Database::commit();
            Response::success(null, "Appointment marked as {$newStatus}.");
        } catch (\Throwable $e) {
            Database::rollBack();
            Response::error('Failed to update status: ' . $e->getMessage(), 500);
        }
    }

    public function availability(): void
    {
        $user = AuthMiddleware::requireRole(['staff', 'admin']);
        $staffId = (int)($user['staff_id'] ?? 1);
        $db = Database::getConnection();

        // Weekly shifts
        $stmt = $db->prepare("SELECT * FROM staff_working_hours WHERE staff_id = ? ORDER BY day_of_week ASC");
        $stmt->execute([$staffId]);
        $shifts = $stmt->fetchAll();

        // Approved and pending leave
        $stmtLeave = $db->prepare("SELECT * FROM staff_leave WHERE staff_id = ? ORDER BY start_date DESC");
        $stmtLeave->execute([$staffId]);
        $leave = $stmtLeave->fetchAll();

        Response::success([
            'shifts' => $shifts,
            'leave' => $leave,
        ]);
    }

    public function requestLeave(): void
    {
        $user = AuthMiddleware::requireRole(['staff', 'admin']);
        $staffId = (int)($user['staff_id'] ?? 1);
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $startDate = trim($input['start_date'] ?? '');
        $endDate = trim($input['end_date'] ?? '');
        $reason = trim($input['reason'] ?? '');

        if (empty($startDate) || empty($endDate) || empty($reason)) {
            Response::validationError(['fields' => 'Start date, end date, and reason are required.']);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO staff_leave (staff_id, start_date, end_date, reason, status)
            VALUES (?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([$staffId, $startDate, $endDate, $reason]);

        Response::success(null, 'Leave request submitted for owner approval.', 201);
    }
}

