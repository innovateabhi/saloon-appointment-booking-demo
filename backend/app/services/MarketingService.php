<?php

namespace App\Services;

use App\Config\Database;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;
use App\Config\Config;
use InvalidArgumentException;

class MarketingService
{
    public static function getMarketingOverview(): array
    {
        $db = Database::getConnection();

        // Active campaigns
        $stmt = $db->query("SELECT COUNT(*) FROM marketing_campaigns WHERE salon_id = 1 AND status = 'active'");
        $activeCampaigns = (int)$stmt->fetchColumn();

        // Total coupons redeemed
        $stmt = $db->query("SELECT COUNT(*) FROM coupon_redemptions WHERE coupon_id IN (SELECT id FROM coupons WHERE salon_id = 1)");
        $totalRedemptions = (int)$stmt->fetchColumn();

        // Total loyalty points in circulation
        $stmt = $db->query("SELECT COALESCE(SUM(points_balance), 0) FROM loyalty_accounts WHERE salon_id = 1");
        $pointsInCirculation = (int)$stmt->fetchColumn();

        // Total campaign attributed revenue (from appointments using coupons)
        $stmt = $db->query("
            SELECT COALESCE(SUM(a.total_amount), 0)
            FROM appointments a
            JOIN coupon_redemptions cr ON cr.appointment_id = a.id
            WHERE a.salon_id = 1 AND a.status = 'completed'
        ");
        $campaignRevenue = (float)$stmt->fetchColumn();

        // Active campaigns list
        $stmt = $db->query("
            SELECT mc.*, ms.name AS segment_name, c.code AS coupon_code,
                   (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = mc.id) AS recipients_count
            FROM marketing_campaigns mc
            LEFT JOIN marketing_segments ms ON mc.audience_segment_id = ms.id
            LEFT JOIN coupons c ON mc.coupon_id = c.id
            WHERE mc.salon_id = 1
            ORDER BY mc.id DESC
        ");
        $campaigns = $stmt->fetchAll();

        return [
            'active_campaigns' => $activeCampaigns,
            'total_redemptions' => $totalRedemptions,
            'points_in_circulation' => $pointsInCirculation,
            'campaign_revenue' => $campaignRevenue,
            'campaigns' => $campaigns,
        ];
    }

    public static function validateCoupon(string $code, float $subtotal, ?int $customerId = null): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT * FROM coupons
            WHERE salon_id = 1 AND UPPER(code) = UPPER(?) AND is_active = 1
              AND CURDATE() BETWEEN start_date AND end_date
            LIMIT 1
        ");
        $stmt->execute([trim($code)]);
        $coupon = $stmt->fetch();

        if (!$coupon) {
            throw new InvalidArgumentException('Invalid or expired coupon code.');
        }

        if ($subtotal < (float)$coupon['min_spend']) {
            throw new InvalidArgumentException("Minimum spend of ₹{$coupon['min_spend']} required for this offer.");
        }

        if ($coupon['times_used'] >= $coupon['usage_limit']) {
            throw new InvalidArgumentException('This promotional code has reached its maximum redemptions.');
        }

        if ($customerId) {
            $stmtRedeem = $db->prepare("SELECT COUNT(*) FROM coupon_redemptions WHERE coupon_id = ? AND customer_id = ?");
            $stmtRedeem->execute([$coupon['id'], $customerId]);
            $usedCount = (int)$stmtRedeem->fetchColumn();
            if ($usedCount >= $coupon['per_customer_limit']) {
                throw new InvalidArgumentException('You have already redeemed this promotional offer.');
            }
        }

        // Calculate discount
        $discount = 0.0;
        if ($coupon['discount_type'] === 'percentage') {
            $discount = ($subtotal * (float)$coupon['discount_value']) / 100;
            if (!empty($coupon['max_discount'])) {
                $discount = min($discount, (float)$coupon['max_discount']);
            }
        } else {
            $discount = min($subtotal, (float)$coupon['discount_value']);
        }
        $discount = round($discount, 2);

        return [
            'valid' => true,
            'code' => $coupon['code'],
            'title' => $coupon['title'],
            'discount_type' => $coupon['discount_type'],
            'discount_value' => (float)$coupon['discount_value'],
            'discount_amount' => $discount,
            'final_amount' => max(0, $subtotal - $discount),
        ];
    }

    public static function sendCampaignEmail(string $recipientEmail, string $recipientName, string $subject, string $htmlBody): array
    {
        $isLocalSim = Config::get('MAIL_SIMULATE_LOCAL', true);

        if ($isLocalSim) {
            // Simulated local transport
            return [
                'status' => 'simulated',
                'recipient' => $recipientEmail,
                'message' => 'Email simulated locally in development environment.',
            ];
        }

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = Config::get('MAIL_HOST', 'smtp.mailtrap.io');
            $mail->SMTPAuth   = true;
            $mail->Username   = Config::get('MAIL_USERNAME', '');
            $mail->Password   = Config::get('MAIL_PASSWORD', '');
            $mail->SMTPSecure = Config::get('MAIL_ENCRYPTION', 'tls');
            $mail->Port       = (int) Config::get('MAIL_PORT', 2525);

            $mail->setFrom(Config::get('MAIL_FROM_ADDRESS', 'concierge@aurelia-salon.com'), Config::get('MAIL_FROM_NAME', 'AURELIA Luxury Concierge'));
            $mail->addAddress($recipientEmail, $recipientName);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;

            $mail->send();
            return ['status' => 'sent', 'recipient' => $recipientEmail];
        } catch (MailException $e) {
            return ['status' => 'failed', 'recipient' => $recipientEmail, 'error' => $mail->ErrorInfo];
        }
    }
}

