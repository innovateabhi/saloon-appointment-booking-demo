<?php

namespace App\Middleware;

use App\Config\Config;

class CorsMiddleware
{
    private static array $allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ];

    public static function handle(): void
    {
        $frontendUrl = rtrim((string)Config::get('FRONTEND_URL', 'http://localhost:5173'), '/');
        if (!in_array($frontendUrl, self::$allowedOrigins, true)) {
            self::$allowedOrigins[] = $frontendUrl;
        }

        $origin = rtrim($_SERVER['HTTP_ORIGIN'] ?? '', '/');
        $serverHost = $_SERVER['HTTP_HOST'] ?? '';
        $isSameHost = !empty($origin) && str_ends_with($origin, $serverHost);

        if (in_array($origin, self::$allowedOrigins, true) || $isSameHost || empty($origin) || str_contains($origin, 'duckdns.org')) {
            if (!empty($origin)) {
                header("Access-Control-Allow-Origin: {$origin}");
                header('Access-Control-Allow-Credentials: true');
            }
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-Idempotency-Key');
            header('Access-Control-Max-Age: 86400');
        }

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}

