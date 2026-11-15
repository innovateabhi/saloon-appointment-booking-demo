<?php

namespace App\Helpers;

use App\Config\Config;

class Security
{
    public static function startSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            $lifetime = (int) Config::get('SESSION_LIFETIME', 86400);
            $secure = Config::get('SESSION_SECURE_COOKIE', false);
            $sameSite = Config::get('SESSION_SAMESITE', 'Lax');

            session_set_cookie_params([
                'lifetime' => $lifetime,
                'path'     => '/',
                'domain'   => '',
                'secure'   => (bool)$secure,
                'httponly' => true,
                'samesite' => $sameSite,
            ]);

            session_name('AURELIA_SESSID');
            session_start();
        }
    }

    public static function sanitize(mixed $data): mixed
    {
        if (is_array($data)) {
            foreach ($data as $key => $val) {
                $data[$key] = self::sanitize($val);
            }
            return $data;
        }

        if (is_string($data)) {
            return trim(htmlspecialchars($data, ENT_QUOTES, 'UTF-8'));
        }

        return $data;
    }

    public static function generateToken(int $bytes = 32): string
    {
        return bin2hex(random_bytes($bytes));
    }

    public static function generateReference(string $prefix = 'AUR'): string
    {
        return $prefix . '-' . strtoupper(date('ymd')) . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));
    }
}

