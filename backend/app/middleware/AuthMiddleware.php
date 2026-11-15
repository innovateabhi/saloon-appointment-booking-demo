<?php

namespace App\Middleware;

use App\Helpers\Response;
use App\Models\User;

class AuthMiddleware
{
    public static function user(): ?array
    {
        if (empty($_SESSION['user_id'])) {
            return null;
        }

        $user = User::findById((int)$_SESSION['user_id']);
        if (!$user || !$user['is_active']) {
            unset($_SESSION['user_id']);
            return null;
        }

        return $user;
    }

    public static function requireAuth(): array
    {
        $user = self::user();
        if (!$user) {
            Response::unauthorized('Please sign in to access this resource.');
        }
        return $user;
    }

    public static function requireRole(string|array $allowedRoles): array
    {
        $user = self::requireAuth();
        $allowed = is_array($allowedRoles) ? $allowedRoles : [$allowedRoles];

        if (!in_array($user['role_slug'], $allowed, true)) {
            Response::forbidden('You do not possess the required permissions for this action.');
        }

        return $user;
    }

    public static function requireAdmin(): array
    {
        return self::requireRole(['admin', 'owner']);
    }

    public static function requireStaffOrAdmin(): array
    {
        return self::requireRole(['admin', 'owner', 'staff']);
    }
}

