<?php

namespace App\Services;

use App\Config\Database;

class ReportingService
{
    public static function getDashboardSummary(): array
    {
        $db = Database::getConnection();
        $today = date('Y-m-d');
        $startOfMonth = date('Y-m-01');

        // Today's appointments count
        $stmt = $db->prepare("SELECT COUNT(*) FROM appointments WHERE salon_id = 1 AND appointment_date = ?");
        $stmt->execute([$today]);
        $todayCount = (int)$stmt->fetchColumn();

        // Today's completed
        $stmt = $db->prepare("SELECT COUNT(*) FROM appointments WHERE salon_id = 1 AND appointment_date = ? AND status = 'completed'");
        $stmt->execute([$today]);
        $todayCompleted = (int)$stmt->fetchColumn();

        // Today's revenue
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE salon_id = 1 AND DATE(created_at) = ? AND status = 'success'");
        $stmt->execute([$today]);
        $todayRevenue = (float)$stmt->fetchColumn();

        // Month's revenue
        $stmt = $db->prepare("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE salon_id = 1 AND DATE(created_at) >= ? AND status = 'success'");
        $stmt->execute([$startOfMonth]);
        $monthRevenue = (float)$stmt->fetchColumn();

        // Total active customers
        $stmt = $db->query("SELECT COUNT(*) FROM customers WHERE salon_id = 1");
        $totalCustomers = (int)$stmt->fetchColumn();

        // Pending approvals
        $stmt = $db->query("SELECT COUNT(*) FROM appointments WHERE salon_id = 1 AND status = 'pending'");
        $pendingApprovals = (int)$stmt->fetchColumn();

        // 14-day revenue trend
        $stmt = $db->query("
            SELECT DATE(created_at) AS date, COALESCE(SUM(amount), 0) AS revenue, COUNT(*) AS transactions
            FROM payments
            WHERE salon_id = 1 AND status = 'success' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        ");
        $trend = $stmt->fetchAll();

        // Popular treatments
        $stmt = $db->query("
            SELECT s.name, COUNT(aps.id) AS bookings_count, SUM(aps.price) AS total_revenue
            FROM appointment_services aps
            JOIN services s ON aps.service_id = s.id
            GROUP BY s.id
            ORDER BY bookings_count DESC
            LIMIT 5
        ");
        $popularServices = $stmt->fetchAll();

        // Staff productivity
        $stmt = $db->query("
            SELECT CONCAT(u.first_name, ' ', u.last_name) AS stylist_name,
                   COUNT(a.id) AS appointments_count,
                   COALESCE(SUM(a.total_amount), 0) AS total_volume,
                   sp.rating_avg
            FROM staff_profiles sp
            JOIN users u ON sp.user_id = u.id
            LEFT JOIN appointments a ON a.staff_id = sp.id AND a.status = 'completed'
            WHERE sp.salon_id = 1 AND sp.is_active = 1
            GROUP BY sp.id
            ORDER BY appointments_count DESC
        ");
        $staffProductivity = $stmt->fetchAll();

        return [
            'today_bookings' => $todayCount,
            'today_completed' => $todayCompleted,
            'today_revenue' => $todayRevenue,
            'month_revenue' => $monthRevenue,
            'total_customers' => $totalCustomers,
            'pending_approvals' => $pendingApprovals,
            'revenue_trend' => $trend,
            'popular_services' => $popularServices,
            'staff_productivity' => $staffProductivity,
        ];
    }
}

