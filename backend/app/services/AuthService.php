<?php

namespace App\Services;

use App\Config\Database;
use App\Models\User;
use App\Models\Role;
use App\Helpers\Security;
use InvalidArgumentException;

class AuthService
{
    public static function login(string $email, string $password): array
    {
        $user = User::findByEmail($email);

        if (!$user) {
            throw new InvalidArgumentException('Invalid email or password credentials.');
        }

        if (!password_verify($password, $user['password_hash'])) {
            throw new InvalidArgumentException('Invalid email or password credentials.');
        }

        if (!$user['is_active']) {
            throw new InvalidArgumentException('This account has been deactivated. Please contact salon concierge.');
        }

        // Regenerate session id to protect against session fixation
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role_slug'] = $user['role_slug'];

        // Update last login timestamp
        User::update($user['id'], ['last_login_at' => date('Y-m-d H:i:s')]);

        return User::findById($user['id']);
    }

    public static function register(array $data): array
    {
        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';
        $firstName = trim($data['first_name'] ?? '');
        $lastName = trim($data['last_name'] ?? '');
        $phone = trim($data['phone'] ?? '');

        if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('A valid email address is required.');
        }

        if (strlen($password) < 6) {
            throw new InvalidArgumentException('Password must be at least 6 characters long.');
        }

        if (empty($firstName) || empty($lastName)) {
            throw new InvalidArgumentException('First name and last name are required.');
        }

        if (User::findByEmail($email)) {
            throw new InvalidArgumentException('An account with this email address already exists.');
        }

        $customerRole = Role::findBySlug('customer');
        if (!$customerRole) {
            throw new InvalidArgumentException('Customer role is not configured.');
        }

        Database::beginTransaction();
        try {
            // Create user
            $userId = User::create([
                'role_id'       => $customerRole['id'],
                'email'         => $email,
                'password_hash' => password_hash($password, PASSWORD_BCRYPT),
                'first_name'    => $firstName,
                'last_name'     => $lastName,
                'phone'         => $phone,
                'is_active'     => 1,
            ]);

            // Create customer record
            $customerCode = 'CUST-' . strtoupper(substr(uniqid(), -6));
            $db = Database::getConnection();
            $stmt = $db->prepare("
                INSERT INTO customers (user_id, salon_id, customer_code, first_name, last_name, email, phone, loyalty_points_balance)
                VALUES (?, 1, ?, ?, ?, ?, ?, 50)
            ");
            $stmt->execute([$userId, $customerCode, $firstName, $lastName, $email, $phone]);
            $customerId = (int) $db->lastInsertId();

            // Create customer loyalty account with welcome bonus
            $stmtLoyalty = $db->prepare("
                INSERT INTO loyalty_accounts (salon_id, customer_id, points_balance, lifetime_earned, tier)
                VALUES (1, ?, 50, 50, 'Silver')
            ");
            $stmtLoyalty->execute([$customerId]);
            $loyaltyAccountId = (int) $db->lastInsertId();

            // Log loyalty welcome points
            $stmtLog = $db->prepare("
                INSERT INTO loyalty_transactions (loyalty_account_id, transaction_type, points, points_value, balance_after, description)
                VALUES (?, 'earned', 50, 50.00, 50, 'Welcome Gift: 50 Aurelia Privilege Points')
            ");
            $stmtLog->execute([$loyaltyAccountId]);

            // Save marketing consents
            $optEmail = !empty($data['marketing_opt_in_email']) ? 1 : 0;
            $optWhatsapp = !empty($data['marketing_opt_in_whatsapp']) ? 1 : 0;
            $stmtPref = $db->prepare("
                INSERT INTO customer_preferences (customer_id, marketing_opt_in_email, marketing_opt_in_whatsapp)
                VALUES (?, ?, ?)
            ");
            $stmtPref->execute([$customerId, $optEmail, $optWhatsapp]);

            Database::commit();

            // Authenticate session
            session_regenerate_id(true);
            $_SESSION['user_id'] = $userId;
            $_SESSION['role_slug'] = 'customer';

            return User::findById($userId);
        } catch (\Throwable $e) {
            Database::rollBack();
            throw $e;
        }
    }

    public static function logout(): void
    {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
    }
}

