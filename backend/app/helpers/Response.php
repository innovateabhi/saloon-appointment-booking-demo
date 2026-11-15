<?php

namespace App\Helpers;

class Response
{
    public static function json(array $payload, int $statusCode = 200, array $headers = []): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=UTF-8');

        foreach ($headers as $header => $value) {
            header("{$header}: {$value}");
        }

        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'Success', int $statusCode = 200, array $meta = []): void
    {
        $payload = [
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ];

        if (!empty($meta)) {
            $payload['meta'] = $meta;
        }

        self::json($payload, $statusCode);
    }

    public static function error(string $message = 'An error occurred', int $statusCode = 400, array $errors = [], ?string $errorCode = null): void
    {
        $payload = [
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ];

        if ($errorCode !== null) {
            $payload['error_code'] = $errorCode;
        }

        self::json($payload, $statusCode);
    }

    public static function validationError(array $errors, string $message = 'Validation failed'): void
    {
        self::error($message, 422, $errors, 'VALIDATION_ERROR');
    }

    public static function unauthorized(string $message = 'Authentication required'): void
    {
        self::error($message, 401, [], 'UNAUTHORIZED');
    }

    public static function forbidden(string $message = 'Access forbidden: Insufficient permissions'): void
    {
        self::error($message, 403, [], 'FORBIDDEN');
    }

    public static function notFound(string $message = 'Requested resource not found'): void
    {
        self::error($message, 404, [], 'NOT_FOUND');
    }

    public static function paginated(array $items, int $total, int $page, int $perPage, string $message = 'Items retrieved successfully'): void
    {
        $totalPages = (int) ceil($total / ($perPage > 0 ? $perPage : 1));
        self::json([
            'success' => true,
            'message' => $message,
            'data'    => $items,
            'pagination' => [
                'total'        => $total,
                'per_page'     => $perPage,
                'current_page' => $page,
                'last_page'    => $totalPages,
                'has_more'     => $page < $totalPages
            ]
        ], 200);
    }
}

