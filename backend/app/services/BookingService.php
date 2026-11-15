<?php

namespace App\Services;

use App\Config\Database;
use App\Helpers\Security;
use InvalidArgumentException;
use DateTime;

class BookingService
{
    public static function createBooking(array $payload, ?int $userId = null): array
    {
        $db = Database::getConnection();

        $serviceIds = $payload['service_ids'] ?? [];
        if (empty($serviceIds) || !is_array($serviceIds)) {
            throw new InvalidArgumentException('Please select at least one treatment.');
        }

        $date = trim($payload['appointment_date'] ?? '');
        $startTime = trim($payload['start_time'] ?? '');
        $staffId = !empty($payload['staff_id']) ? (int)$payload['staff_id'] : null;

        if (empty($date) || empty($startTime)) {
            throw new InvalidArgumentException('Appointment date and start time are required.');
        }

        // Calculate service totals and duration
        $placeholders = implode(',', array_fill(0, count($serviceIds), '?'));
        $stmt = $db->prepare("SELECT id, name, price, duration_minutes, buffer_minutes FROM services WHERE id IN ({$placeholders}) AND is_active = 1");
        $stmt->execute($serviceIds);
        $selectedServices = $stmt->fetchAll();

        if (count($selectedServices) !== count($serviceIds)) {
            throw new InvalidArgumentException('One or more selected treatments are no longer active.');
        }

        $totalDuration = 0;
        $maxBuffer = 0;
        $subtotal = 0.0;
        foreach ($selectedServices as $srv) {
            $totalDuration += (int)$srv['duration_minutes'];
            $maxBuffer = max($maxBuffer, (int)$srv['buffer_minutes']);
            $subtotal += (float)$srv['price'];
        }

        $endTime = date('H:i:s', strtotime("{$startTime} + {$totalDuration} minutes"));
        $slotEnd = date('H:i:s', strtotime("{$startTime} + " . ($totalDuration + $maxBuffer) . " minutes"));
        $dayOfWeek = (int) date('w', strtotime($date));

        // Start Transaction with concurrency locking
        Database::beginTransaction();
        try {
            // Find or confirm stylist
            if ($staffId === null || $staffId === 0) {
                // Deterministic Any Stylist selector
                $stmt = $db->prepare("
                    SELECT sp.id FROM staff_profiles sp
                    WHERE sp.salon_id = 1 AND sp.is_active = 1
                    ORDER BY sp.display_order ASC
                ");
                $stmt->execute();
                $allStylists = $stmt->fetchAll();

                $chosenStylistId = null;
                foreach ($allStylists as $s) {
                    if (AvailabilityService::isStylistFree((int)$s['id'], $date, $dayOfWeek, $startTime, $slotEnd)) {
                        $chosenStylistId = (int)$s['id'];
                        break;
                    }
                }

                if (!$chosenStylistId) {
                    throw new InvalidArgumentException('No stylist is available for the selected slot. Please pick another time.');
                }
                $staffId = $chosenStylistId;
            } else {
                // Re-verify specific stylist availability with locking
                if (!AvailabilityService::isStylistFree($staffId, $date, $dayOfWeek, $startTime, $slotEnd)) {
                    throw new InvalidArgumentException('The selected stylist has just been reserved. Please pick another time slot.');
                }
            }

            // Lock potential overlapping appointments row to prevent race conditions
            $lockStmt = $db->prepare("
                SELECT id FROM appointments
                WHERE staff_id = ? AND appointment_date = ?
                  AND status NOT IN ('cancelled', 'no_show')
                  AND start_time < ? AND end_time > ?
                FOR UPDATE
            ");
            $lockStmt->execute([$staffId, $date, $slotEnd, $startTime]);
            if ($lockStmt->fetch()) {
                throw new InvalidArgumentException('Slot collision detected. This time has just been booked.');
            }

            // Resolve customer ID
            $customerId = null;
            if ($userId) {
                $cStmt = $db->prepare("SELECT id FROM customers WHERE user_id = ? LIMIT 1");
                $cStmt->execute([$userId]);
                $customerId = $cStmt->fetchColumn();
            }

            if (!$customerId) {
                // Guest booking
                $firstName = trim($payload['first_name'] ?? 'Guest');
                $lastName = trim($payload['last_name'] ?? 'Client');
                $email = strtolower(trim($payload['email'] ?? ''));
                $phone = trim($payload['phone'] ?? '');

                if (empty($phone)) {
                    throw new InvalidArgumentException('A contact phone number is required.');
                }

                // Check existing customer by phone
                $cStmt = $db->prepare("SELECT id FROM customers WHERE phone = ? LIMIT 1");
                $cStmt->execute([$phone]);
                $customerId = $cStmt->fetchColumn();

                if (!$customerId) {
                    $custCode = 'CUST-GUEST-' . strtoupper(substr(uniqid(), -5));
                    $stmt = $db->prepare("
                        INSERT INTO customers (user_id, salon_id, customer_code, first_name, last_name, email, phone)
                        VALUES (NULL, 1, ?, ?, ?, ?, ?)
                    ");
                    $stmt->execute([$custCode, $firstName, $lastName, $email, $phone]);
                    $customerId = (int) $db->lastInsertId();

                    // Marketing consent
                    $optEmail = !empty($payload['marketing_opt_in_email']) ? 1 : 0;
                    $optWhatsapp = !empty($payload['marketing_opt_in_whatsapp']) ? 1 : 0;
                    $stmtPref = $db->prepare("
                        INSERT INTO customer_preferences (customer_id, marketing_opt_in_email, marketing_opt_in_whatsapp)
                        VALUES (?, ?, ?)
                    ");
                    $stmtPref->execute([$customerId, $optEmail, $optWhatsapp]);
                }
            }

            // Apply Coupon discount if present
            $discountAmount = 0.00;
            $couponCode = trim($payload['coupon_code'] ?? '');
            if (!empty($couponCode)) {
                $cpStmt = $db->prepare("SELECT * FROM coupons WHERE salon_id = 1 AND UPPER(code) = UPPER(?) AND is_active = 1 AND CURDATE() BETWEEN start_date AND end_date LIMIT 1");
                $cpStmt->execute([$couponCode]);
                $coupon = $cpStmt->fetch();

                if ($coupon && $subtotal >= (float)$coupon['min_spend']) {
                    if ($coupon['discount_type'] === 'percentage') {
                        $discountAmount = ($subtotal * (float)$coupon['discount_value']) / 100;
                        if (!empty($coupon['max_discount'])) {
                            $discountAmount = min($discountAmount, (float)$coupon['max_discount']);
                        }
                    } else {
                        $discountAmount = min($subtotal, (float)$coupon['discount_value']);
                    }
                    $discountAmount = round($discountAmount, 2);
                }
            }

            // Compute tax (18% GST)
            $taxable = max(0, $subtotal - $discountAmount);
            $taxAmount = round($taxable * 0.18, 2);
            $totalAmount = round($taxable + $taxAmount, 2);

            $bookingRef = Security::generateReference('AUR');
            $customerNotes = trim($payload['customer_notes'] ?? '');
            $source = $payload['source'] ?? ($userId ? 'online_customer' : 'online_guest');

            // Insert Appointment
            $stmt = $db->prepare("
                INSERT INTO appointments (salon_id, customer_id, staff_id, booking_reference, appointment_date, start_time, end_time,
                                          total_duration_minutes, subtotal, discount_amount, tax_amount, total_amount, status, payment_status, source, customer_notes)
                VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'unpaid', ?, ?)
            ");
            $stmt->execute([$customerId, $staffId, $bookingRef, $date, $startTime, $endTime, $totalDuration, $subtotal, $discountAmount, $taxAmount, $totalAmount, $source, $customerNotes]);
            $appointmentId = (int) $db->lastInsertId();

            // Insert Appointment Services
            $seq = 1;
            foreach ($selectedServices as $srv) {
                $stmt = $db->prepare("
                    INSERT INTO appointment_services (appointment_id, service_id, staff_id, sequence_order, price, duration_minutes)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([$appointmentId, $srv['id'], $staffId, $seq++, $srv['price'], $srv['duration_minutes']]);
            }

            // Record status history
            $stmt = $db->prepare("
                INSERT INTO appointment_status_history (appointment_id, old_status, new_status, notes)
                VALUES (?, NULL, 'confirmed', 'Online reservation confirmed')
            ");
            $stmt->execute([$appointmentId]);

            // Create initial invoice
            $invNum = 'INV-' . strtoupper(date('ymd', strtotime($date))) . '-' . sprintf('%05d', $appointmentId);
            $stmt = $db->prepare("
                INSERT INTO invoices (salon_id, appointment_id, customer_id, invoice_number, invoice_date, due_date, subtotal, tax_total, discount_total, grand_total, paid_total, balance_due, status)
                VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, ?, 'issued')
            ");
            $stmt->execute([$appointmentId, $customerId, $invNum, $date, $date, $subtotal, $taxAmount, $discountAmount, $totalAmount, $totalAmount]);

            Database::commit();

            return self::getAppointmentDetails($appointmentId);
        } catch (\Throwable $e) {
            Database::rollBack();
            throw $e;
        }
    }

    public static function getAppointmentDetails(int $appointmentId): ?array
    {
        $db = Database::getConnection();

        $stmt = $db->prepare("
            SELECT a.*,
                   CONCAT(u.first_name, ' ', u.last_name) AS stylist_name,
                   sp.title AS stylist_title,
                   c.customer_code, c.first_name AS customer_first_name, c.last_name AS customer_last_name,
                   c.email AS customer_email, c.phone AS customer_phone
            FROM appointments a
            JOIN staff_profiles sp ON a.staff_id = sp.id
            JOIN users u ON sp.user_id = u.id
            JOIN customers c ON a.customer_id = c.id
            WHERE a.id = ?
            LIMIT 1
        ");
        $stmt->execute([$appointmentId]);
        $appt = $stmt->fetch();

        if (!$appt) {
            return null;
        }

        // Fetch services
        $stmtSrv = $db->prepare("
            SELECT aps.*, s.name, s.slug, s.description
            FROM appointment_services aps
            JOIN services s ON aps.service_id = s.id
            WHERE aps.appointment_id = ?
            ORDER BY aps.sequence_order ASC
        ");
        $stmtSrv->execute([$appointmentId]);
        $appt['services'] = $stmtSrv->fetchAll();

        return $appt;
    }

    public static function cancelBooking(int $appointmentId, string $reason, ?int $cancelledByUserId = null): bool
    {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM appointments WHERE id = ? LIMIT 1");
        $stmt->execute([$appointmentId]);
        $appt = $stmt->fetch();

        if (!$appt) {
            throw new InvalidArgumentException('Appointment not found.');
        }

        if (in_array($appt['status'], ['cancelled', 'completed', 'in_service'])) {
            throw new InvalidArgumentException("Cannot cancel an appointment that is already {$appt['status']}.");
        }

        // Check cancellation cutoff (e.g. 4 hours)
        $apptTime = new DateTime("{$appt['appointment_date']} {$appt['start_time']}");
        $now = new DateTime();
        $diffHours = ($apptTime->getTimestamp() - $now->getTimestamp()) / 3600;

        if ($diffHours < 4 && $cancelledByUserId !== null) {
            // Check if cancelling user is customer (not admin)
            $uStmt = $db->prepare("SELECT r.slug FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ? LIMIT 1");
            $uStmt->execute([$cancelledByUserId]);
            $roleSlug = $uStmt->fetchColumn();

            if ($roleSlug === 'customer') {
                throw new InvalidArgumentException('Cancellations within 4 hours of appointment require direct concierge assistance.');
            }
        }

        Database::beginTransaction();
        try {
            $stmt = $db->prepare("
                UPDATE appointments
                SET status = 'cancelled', cancellation_reason = ?, cancelled_at = NOW(), cancelled_by = ?
                WHERE id = ?
            ");
            $stmt->execute([$reason, $cancelledByUserId, $appointmentId]);

            // Status history
            $stmt = $db->prepare("
                INSERT INTO appointment_status_history (appointment_id, old_status, new_status, notes)
                VALUES (?, ?, 'cancelled', ?)
            ");
            $stmt->execute([$appointmentId, $appt['status'], $reason]);

            Database::commit();
            return true;
        } catch (\Throwable $e) {
            Database::rollBack();
            throw $e;
        }
    }
}

