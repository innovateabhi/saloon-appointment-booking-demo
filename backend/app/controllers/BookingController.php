<?php

namespace App\Controllers;

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\BookingService;
use App\Services\AvailabilityService;
use App\Config\Database;
use InvalidArgumentException;

class BookingController
{
    public function create(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $user = AuthMiddleware::user();
        $userId = $user ? (int)$user['id'] : null;

        try {
            $appointment = BookingService::createBooking($input, $userId);
            Response::success($appointment, 'Appointment confirmed successfully!', 201);
        } catch (InvalidArgumentException $e) {
            Response::validationError(['booking' => $e->getMessage()], $e->getMessage());
        } catch (\Throwable $e) {
            Response::error('Failed to create appointment: ' . $e->getMessage(), 500);
        }
    }

    public function show(string $id): void
    {
        $appointmentId = (int)$id;
        $appointment = BookingService::getAppointmentDetails($appointmentId);

        if (!$appointment) {
            Response::notFound('Appointment not found.');
        }

        // Authorization check: if logged in as customer, can only see own booking
        $user = AuthMiddleware::user();
        if ($user && $user['role_slug'] === 'customer') {
            if ($appointment['customer_id'] != $user['customer_id']) {
                Response::forbidden('You do not have permission to view this reservation.');
            }
        }

        Response::success($appointment);
    }

    public function byReference(string $reference): void
    {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT id FROM appointments WHERE booking_reference = ? LIMIT 1");
        $stmt->execute([trim($reference)]);
        $id = $stmt->fetchColumn();

        if (!$id) {
            Response::notFound('Booking reference not found.');
        }

        $appointment = BookingService::getAppointmentDetails((int)$id);
        Response::success($appointment);
    }

    public function cancel(string $id): void
    {
        $appointmentId = (int)$id;
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $reason = trim($input['reason'] ?? 'Cancelled by guest request');

        $user = AuthMiddleware::user();
        $userId = $user ? (int)$user['id'] : null;

        try {
            BookingService::cancelBooking($appointmentId, $reason, $userId);
            Response::success(null, 'Appointment has been cancelled successfully.');
        } catch (InvalidArgumentException $e) {
            Response::error($e->getMessage(), 400);
        } catch (\Throwable $e) {
            Response::error('Failed to cancel appointment: ' . $e->getMessage(), 500);
        }
    }

    public function reschedule(string $id): void
    {
        $appointmentId = (int)$id;
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $newDate = trim($input['appointment_date'] ?? '');
        $newStartTime = trim($input['start_time'] ?? '');
        $newStaffId = !empty($input['staff_id']) ? (int)$input['staff_id'] : null;

        if (empty($newDate) || empty($newStartTime)) {
            Response::validationError(['fields' => 'New appointment date and start time are required.']);
        }

        $db = Database::getConnection();
        $appt = BookingService::getAppointmentDetails($appointmentId);
        if (!$appt) {
            Response::notFound('Appointment not found.');
        }

        if (in_array($appt['status'], ['cancelled', 'completed', 'in_service'])) {
            Response::error("Cannot reschedule an appointment that is {$appt['status']}.", 400);
        }

        $staffId = $newStaffId ?: (int)$appt['staff_id'];
        $dur = (int)$appt['total_duration_minutes'];
        $endTime = date('H:i:s', strtotime("{$newStartTime} + {$dur} minutes"));
        $slotEnd = date('H:i:s', strtotime("{$newStartTime} + " . ($dur + 10) . " minutes"));
        $dayOfWeek = (int) date('w', strtotime($newDate));

        if (!AvailabilityService::isStylistFree($staffId, $newDate, $dayOfWeek, $newStartTime, $slotEnd)) {
            Response::error('The requested slot is not available for this stylist.', 400);
        }

        Database::beginTransaction();
        try {
            // Update appointment
            $stmt = $db->prepare("
                UPDATE appointments
                SET appointment_date = ?, start_time = ?, end_time = ?, staff_id = ?, status = 'confirmed'
                WHERE id = ?
            ");
            $stmt->execute([$newDate, $newStartTime, $endTime, $staffId, $appointmentId]);

            // Record reschedule audit
            $stmt = $db->prepare("
                INSERT INTO appointment_reschedules (appointment_id, old_date, old_start_time, old_end_time, old_staff_id,
                                                    new_date, new_start_time, new_end_time, new_staff_id, reason)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $appointmentId,
                $appt['appointment_date'], $appt['start_time'], $appt['end_time'], $appt['staff_id'],
                $newDate, $newStartTime, $endTime, $staffId,
                trim($input['reason'] ?? 'Client requested reschedule')
            ]);

            Database::commit();
            $updated = BookingService::getAppointmentDetails($appointmentId);
            Response::success($updated, 'Appointment rescheduled successfully.');
        } catch (\Throwable $e) {
            Database::rollBack();
            Response::error('Failed to reschedule: ' . $e->getMessage(), 500);
        }
    }
}

