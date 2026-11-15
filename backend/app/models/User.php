<?php

namespace App\Models;

use App\Config\Database;

class User extends BaseModel
{
    protected static string $table = 'users';

    public static function findById(int $id): ?array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT u.id, u.role_id, r.slug AS role_slug, r.name AS role_name,
                   u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
                   u.is_active, u.email_verified_at, u.last_login_at, u.created_at,
                   c.id AS customer_id, c.customer_code, c.loyalty_points_balance,
                   s.id AS staff_id, s.title AS staff_title
            FROM users u
            JOIN roles r ON u.role_id = r.id
            LEFT JOIN customers c ON c.user_id = u.id
            LEFT JOIN staff_profiles s ON s.user_id = u.id
            WHERE u.id = ?
            LIMIT 1
        ");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        return $user ?: null;
    }

    public static function findByEmail(string $email): ?array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare("
            SELECT u.*, r.slug AS role_slug, r.name AS role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE LOWER(u.email) = LOWER(?)
            LIMIT 1
        ");
        $stmt->execute([trim($email)]);
        $user = $stmt->fetch();
        return $user ?: null;
    }
}

