<?php

namespace App\Services;

use App\Config\Database;
use DateTime;
use DateInterval;

class AvailabilityService
{
    /**
     * Calculate available time slots for a given date, service(s), and optional stylist.
     */
    public static function getAvailableSlots(string $date, array $serviceIds, ?int $staffId = null): array
    {
        $db = Database::getConnection();

        // 1. Calculate total duration + max buffer needed
        $placeholders = implode(',', array_fill(0, count($serviceIds), '?'));
        $stmt = $db->prepare("SELECT SUM(duration_minutes) AS total_duration, MAX(buffer_minutes) AS max_buffer FROM services WHERE id IN ({$placeholders}) AND is_active = 1");
        $stmt->execute($serviceIds);
        $srvInfo = $stmt->fetch();

        $totalDuration = (int)($srvInfo['total_duration'] ?? 30);
        $buffer = (int)($srvInfo['max_buffer'] ?? 10);
        $slotRequiredMinutes = $totalDuration + $buffer;

        // 2. Check if salon is closed on this date
        $stmt = $db->prepare("SELECT * FROM salon_closures WHERE salon_id = 1 AND closure_date = ? AND is_full_day = 1 LIMIT 1");
        $stmt->execute([$date]);
        if ($stmt->fetch()) {
            return []; // Salon closed
        }

        // 3. Check salon business hours for this day of week
        $dayOfWeek = (int) date('w', strtotime($date));
        $stmt = $db->prepare("SELECT * FROM salon_business_hours WHERE salon_id = 1 AND day_of_week = ? LIMIT 1");
        $stmt->execute([$dayOfWeek]);
        $salonHours = $stmt->fetch();

        if (!$salonHours || !$salonHours['is_open']) {
            return []; // Salon closed on this day of week
        }

        $salonOpenTime = $salonHours['open_time'];
        $salonCloseTime = $salonHours['close_time'];

        // 4. Find qualified stylists
        if ($staffId !== null && $staffId > 0) {
            $stmt = $db->prepare("SELECT sp.id, sp.user_id, u.first_name, u.last_name FROM staff_profiles sp JOIN users u ON sp.user_id = u.id WHERE sp.id = ? AND sp.salon_id = 1 AND sp.is_active = 1 LIMIT 1");
            $stmt->execute([$staffId]);
            $candidateStylists = $stmt->fetchAll();
        } else {
            // Find all active stylists who can perform these services
            $stmt = $db->prepare("
                SELECT DISTINCT sp.id, sp.user_id, u.first_name, u.last_name
                FROM staff_profiles sp
                JOIN users u ON sp.user_id = u.id
                JOIN staff_services ss ON ss.staff_id = sp.id
                WHERE sp.salon_id = 1 AND sp.is_active = 1 AND ss.service_id IN ({$placeholders})
                GROUP BY sp.id
                HAVING COUNT(DISTINCT ss.service_id) = ?
            ");
            $params = array_merge($serviceIds, [count($serviceIds)]);
            $stmt->execute($params);
            $candidateStylists = $stmt->fetchAll();
        }

        if (empty($candidateStylists)) {
            return [];
        }

        // 5. Generate candidate 30-minute intervals between salon open and close
        $candidateSlots = [];
        $current = new DateTime("{$date} {$salonOpenTime}");
        $close = new DateTime("{$date} {$salonCloseTime}");

        // Minimum advance notice check (e.g. 2 hours in future if date is today)
        $now = new DateTime();
        $minBookingTime = (clone $now)->modify('+2 hours');

        while ($current < $close) {
            $slotStart = $current->format('H:i:s');
            $slotEndObj = (clone $current)->modify("+{$slotRequiredMinutes} minutes");
            
            // Slot cannot extend beyond salon closing time
            if ($slotEndObj > $close) {
                break;
            }

            // Cannot book in the past
            if ($current < $minBookingTime && $date === $now->format('Y-m-d')) {
                $current->modify('+30 minutes');
                continue;
            }

            $slotEnd = $slotEndObj->format('H:i:s');
            $serviceEnd = (clone $current)->modify("+{$totalDuration} minutes")->format('H:i:s');

            // Find an eligible stylist free during this window
            $availableStylist = null;
            foreach ($candidateStylists as $stylist) {
                $sId = (int)$stylist['id'];

                if (self::isStylistFree($sId, $date, $dayOfWeek, $slotStart, $slotEnd)) {
                    $availableStylist = [
                        'id' => $sId,
                        'name' => "{$stylist['first_name']} {$stylist['last_name']}",
                    ];
                    break;
                }
            }

            if ($availableStylist !== null) {
                $candidateSlots[] = [
                    'time' => date('h:i A', strtotime($slotStart)),
                    'time_raw' => $slotStart,
                    'service_end_time' => $serviceEnd,
                    'slot_end_time' => $slotEnd,
                    'stylist' => $availableStylist,
                    'available' => true,
                ];
            }

            $current->modify('+30 minutes');
        }

        return $candidateSlots;
    }

    /**
     * Helper to verify if a stylist is working, not on break/leave, and has no overlapping booking.
     */
    public static function isStylistFree(int $staffId, string $date, int $dayOfWeek, string $startTime, string $endTime): bool
    {
        $db = Database::getConnection();

        // Check working schedule
        $stmt = $db->prepare("SELECT * FROM staff_working_hours WHERE staff_id = ? AND day_of_week = ? LIMIT 1");
        $stmt->execute([$staffId, $dayOfWeek]);
        $wh = $stmt->fetch();

        if (!$wh || !$wh['is_working']) {
            return false;
        }

        if ($startTime < $wh['start_time'] || $endTime > $wh['end_time']) {
            return false;
        }

        // Check breaks (e.g. lunch)
        $stmt = $db->prepare("SELECT * FROM staff_breaks WHERE staff_id = ? AND day_of_week = ? AND start_time < ? AND end_time > ? LIMIT 1");
        $stmt->execute([$staffId, $dayOfWeek, $endTime, $startTime]);
        if ($stmt->fetch()) {
            return false;
        }

        // Check approved leave
        $stmt = $db->prepare("SELECT * FROM staff_leave WHERE staff_id = ? AND status = 'approved' AND ? BETWEEN start_date AND end_date LIMIT 1");
        $stmt->execute([$staffId, $date]);
        if ($stmt->fetch()) {
            return false;
        }

        // Check custom time blocks
        $stmt = $db->prepare("SELECT * FROM staff_time_blocks WHERE staff_id = ? AND block_date = ? AND start_time < ? AND end_time > ? LIMIT 1");
        $stmt->execute([$staffId, $date, $endTime, $startTime]);
        if ($stmt->fetch()) {
            return false;
        }

        // Check overlapping appointments (excluding cancelled)
        $stmt = $db->prepare("
            SELECT id FROM appointments
            WHERE staff_id = ? AND appointment_date = ?
              AND status NOT IN ('cancelled', 'no_show')
              AND start_time < ? AND end_time > ?
            LIMIT 1
        ");
        $stmt->execute([$staffId, $date, $endTime, $startTime]);
        if ($stmt->fetch()) {
            return false;
        }

        return true;
    }
}

