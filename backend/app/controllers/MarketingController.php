<?php

namespace App\Controllers;

use App\Config\Database;
use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\MarketingService;
use InvalidArgumentException;

class MarketingController
{
    public function overview(): void
    {
        AuthMiddleware::requireAdmin();
        $overview = MarketingService::getMarketingOverview();
        Response::success($overview);
    }

    public function campaigns(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

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
        Response::success($campaigns);
    }

    public function createCampaign(): void
    {
        AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $name = trim($input['name'] ?? '');
        $type = trim($input['campaign_type'] ?? 'seasonal');
        $channel = trim($input['channel'] ?? 'email');
        $desc = trim($input['description'] ?? '');
        $couponId = !empty($input['coupon_id']) ? (int)$input['coupon_id'] : null;
        $segmentId = !empty($input['audience_segment_id']) ? (int)$input['audience_segment_id'] : null;
        $startDate = trim($input['start_date'] ?? date('Y-m-d'));
        $endDate = trim($input['end_date'] ?? date('Y-m-d', strtotime('+30 days')));

        if (empty($name)) {
            Response::validationError(['name' => 'Campaign name is required.']);
        }

        $trackingCode = 'CAMP-' . strtoupper(substr(uniqid(), -6));
        $db = Database::getConnection();

        $stmt = $db->prepare("
            INSERT INTO marketing_campaigns (salon_id, name, campaign_type, channel, description, audience_segment_id, coupon_id, start_date, end_date, status, tracking_code)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
        ");
        $stmt->execute([$name, $type, $channel, $desc, $segmentId, $couponId, $startDate, $endDate, $trackingCode]);
        $campaignId = (int)$db->lastInsertId();

        // Enqueue targeted recipients from customer directory
        $stmtCust = $db->query("SELECT id, email, phone FROM customers WHERE salon_id = 1 LIMIT 40");
        $customers = $stmtCust->fetchAll();

        foreach ($customers as $c) {
            $token = bin2hex(random_bytes(16));
            $stmtRec = $db->prepare("
                INSERT INTO campaign_recipients (campaign_id, customer_id, channel, status, tracking_token)
                VALUES (?, ?, ?, 'sent', ?)
            ");
            $stmtRec->execute([$campaignId, $c['id'], $channel, $token]);
        }

        Response::success(['id' => $campaignId], 'Campaign created and launched successfully.', 201);
    }

    public function segments(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT ms.*, (SELECT COUNT(*) FROM customers WHERE salon_id = 1) AS estimated_reach
            FROM marketing_segments ms
            WHERE ms.salon_id = 1
            ORDER BY ms.id ASC
        ");
        $segments = $stmt->fetchAll();
        Response::success($segments);
    }

    public function coupons(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $stmt = $db->query("SELECT * FROM coupons WHERE salon_id = 1 ORDER BY id DESC");
        $coupons = $stmt->fetchAll();
        Response::success($coupons);
    }

    public function createCoupon(): void
    {
        AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        $code = strtoupper(trim($input['code'] ?? ''));
        $title = trim($input['title'] ?? '');
        $type = trim($input['discount_type'] ?? 'percentage');
        $val = (float)($input['discount_value'] ?? 0);
        $minSpend = (float)($input['min_spend'] ?? 0);
        $maxDiscount = !empty($input['max_discount']) ? (float)$input['max_discount'] : null;
        $usageLimit = (int)($input['usage_limit'] ?? 100);
        $startDate = trim($input['start_date'] ?? date('Y-m-d'));
        $endDate = trim($input['end_date'] ?? date('Y-m-d', strtotime('+90 days')));

        if (empty($code) || empty($title) || $val <= 0) {
            Response::validationError(['fields' => 'Coupon code, title, and valid discount value are required.']);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            INSERT INTO coupons (salon_id, code, title, discount_type, discount_value, min_spend, max_discount, usage_limit, start_date, end_date, is_active)
            VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ");
        $stmt->execute([$code, $title, $type, $val, $minSpend, $maxDiscount, $usageLimit, $startDate, $endDate]);

        Response::success(['id' => (int)$db->lastInsertId()], 'Promotional coupon created.', 201);
    }

    public function validateCoupon(): void
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $code = trim($input['code'] ?? '');
        $subtotal = (float)($input['subtotal'] ?? 0);

        $user = AuthMiddleware::user();
        $customerId = $user ? (int)($user['customer_id'] ?? 0) : null;

        try {
            $result = MarketingService::validateCoupon($code, $subtotal, $customerId);
            Response::success($result);
        } catch (InvalidArgumentException $e) {
            Response::validationError(['coupon' => $e->getMessage()], $e->getMessage());
        }
    }

    public function loyalty(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT la.*, CONCAT(c.first_name, ' ', c.last_name) AS customer_name, c.customer_code, c.phone, c.email
            FROM loyalty_accounts la
            JOIN customers c ON la.customer_id = c.id
            WHERE la.salon_id = 1
            ORDER BY la.points_balance DESC
            LIMIT 100
        ");
        $accounts = $stmt->fetchAll();
        Response::success($accounts);
    }

    public function toggleCoupon(string $id): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE coupons SET is_active = IF(is_active = 1, 0, 1) WHERE id = ? AND salon_id = 1");
        $stmt->execute([(int)$id]);
        Response::success(null, 'Coupon status toggled successfully.');
    }

    public function updateCoupon(string $id): void
    {
        AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $title = trim($input['title'] ?? '');
        $type = trim($input['discount_type'] ?? 'percentage');
        $val = (float)($input['discount_value'] ?? 0);
        $minSpend = (float)($input['min_spend'] ?? 0);
        $maxDiscount = !empty($input['max_discount']) ? (float)$input['max_discount'] : null;
        $usageLimit = (int)($input['usage_limit'] ?? 100);
        $startDate = trim($input['start_date'] ?? date('Y-m-d'));
        $endDate = trim($input['end_date'] ?? date('Y-m-d', strtotime('+90 days')));
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if (empty($title) || $val <= 0) {
            Response::validationError(['fields' => 'Title and valid discount value are required.']);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare("
            UPDATE coupons 
            SET title = ?, discount_type = ?, discount_value = ?, min_spend = ?, max_discount = ?, usage_limit = ?, start_date = ?, end_date = ?, is_active = ?
            WHERE id = ? AND salon_id = 1
        ");
        $stmt->execute([$title, $type, $val, $minSpend, $maxDiscount, $usageLimit, $startDate, $endDate, $isActive, (int)$id]);
        Response::success(null, 'Coupon updated successfully.');
    }

    public function deleteCoupon(string $id): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM coupons WHERE id = ? AND salon_id = 1");
        $stmt->execute([(int)$id]);
        Response::success(null, 'Coupon deleted successfully.');
    }

    public function adjustLoyalty(): void
    {
        AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $customerId = (int)($input['customer_id'] ?? 0);
        $points = (int)($input['points'] ?? 0);
        $type = trim($input['type'] ?? 'credit'); // 'credit' or 'debit'
        $reason = trim($input['reason'] ?? 'Staff manual points adjustment');

        if ($customerId <= 0 || $points <= 0) {
            Response::validationError(['fields' => 'A valid customer and points amount (> 0) are required.']);
        }

        $db = Database::getConnection();
        $db->beginTransaction();
        try {
            $stmt = $db->prepare("SELECT * FROM loyalty_accounts WHERE customer_id = ? AND salon_id = 1 FOR UPDATE");
            $stmt->execute([$customerId]);
            $account = $stmt->fetch();

            if (!$account) {
                $stmt = $db->prepare("INSERT INTO loyalty_accounts (salon_id, customer_id, points_balance, lifetime_earned, lifetime_redeemed, tier) VALUES (1, ?, 0, 0, 0, 'Silver')");
                $stmt->execute([$customerId]);
                $accountId = (int)$db->lastInsertId();
                $currentBalance = 0;
                $lifetimeEarned = 0;
                $lifetimeRedeemed = 0;
            } else {
                $accountId = (int)$account['id'];
                $currentBalance = (int)$account['points_balance'];
                $lifetimeEarned = (int)$account['lifetime_earned'];
                $lifetimeRedeemed = (int)$account['lifetime_redeemed'];
            }

            if ($type === 'debit') {
                if ($points > $currentBalance) {
                    throw new \InvalidArgumentException("Cannot deduct {$points} pts. Client balance is only {$currentBalance} pts.");
                }
                $newBalance = $currentBalance - $points;
                $lifetimeRedeemed += $points;
                $deltaPoints = -$points;
            } else {
                $newBalance = $currentBalance + $points;
                $lifetimeEarned += $points;
                $deltaPoints = $points;
            }

            $newTier = 'Silver';
            if ($lifetimeEarned >= 1500) {
                $newTier = 'Platinum';
            } elseif ($lifetimeEarned >= 500) {
                $newTier = 'Gold';
            }

            $stmtUpdate = $db->prepare("
                UPDATE loyalty_accounts 
                SET points_balance = ?, lifetime_earned = ?, lifetime_redeemed = ?, tier = ?
                WHERE id = ?
            ");
            $stmtUpdate->execute([$newBalance, $lifetimeEarned, $lifetimeRedeemed, $newTier, $accountId]);

            $stmtTx = $db->prepare("
                INSERT INTO loyalty_transactions (loyalty_account_id, appointment_id, transaction_type, points, points_value, balance_after, description)
                VALUES (?, NULL, 'adjusted', ?, ?, ?, ?)
            ");
            $stmtTx->execute([$accountId, $deltaPoints, (float)abs($deltaPoints), $newBalance, $reason]);

            $db->commit();
            Response::success([
                'account_id' => $accountId,
                'customer_id' => $customerId,
                'new_balance' => $newBalance,
                'tier' => $newTier
            ], "Successfully updated client loyalty balance to {$newBalance} points.");
        } catch (\Exception $e) {
            $db->rollBack();
            Response::validationError(['error' => $e->getMessage()], $e->getMessage());
        }
    }

    public function loyaltyLedger(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT lt.*, 
                   CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
                   c.customer_code,
                   c.phone,
                   a.booking_reference
            FROM loyalty_transactions lt
            JOIN loyalty_accounts la ON lt.loyalty_account_id = la.id
            JOIN customers c ON la.customer_id = c.id
            LEFT JOIN appointments a ON lt.appointment_id = a.id
            WHERE la.salon_id = 1
            ORDER BY lt.created_at DESC
            LIMIT 100
        ");
        $records = $stmt->fetchAll();
        Response::success($records);
    }

    public function loyaltyRules(): void
    {
        AuthMiddleware::requireAdmin();
        $db = Database::getConnection();

        $stmt = $db->query("
            SELECT setting_key, setting_value 
            FROM salon_settings 
            WHERE salon_id = 1 AND setting_group = 'loyalty'
        ");
        $rules = [];
        while ($row = $stmt->fetch()) {
            $rules[$row['setting_key']] = $row['setting_value'];
        }

        $rules['earn_rate_inr'] = $rules['earn_rate_inr'] ?? '10'; // 1 pt per ₹10 spent
        $rules['redemption_value_inr'] = $rules['redemption_value_inr'] ?? '1.00'; // 1 pt = ₹1
        $rules['silver_threshold'] = $rules['silver_threshold'] ?? '0';
        $rules['gold_threshold'] = $rules['gold_threshold'] ?? '500';
        $rules['platinum_threshold'] = $rules['platinum_threshold'] ?? '1500';
        $rules['welcome_points'] = $rules['welcome_points'] ?? '50';

        Response::success($rules);
    }

    public function updateLoyaltyRules(): void
    {
        AuthMiddleware::requireAdmin();
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = Database::getConnection();

        foreach ($input as $key => $val) {
            $stmt = $db->prepare("
                INSERT INTO salon_settings (salon_id, setting_key, setting_value, setting_group)
                VALUES (1, ?, ?, 'loyalty')
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            ");
            $stmt->execute([$key, (string)$val]);
        }

        Response::success(null, 'Loyalty program rules updated successfully.');
    }
}

