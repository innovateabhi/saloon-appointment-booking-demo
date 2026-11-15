<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\Config\Config;
use App\Middleware\CorsMiddleware;
use App\Helpers\Security;
use App\Helpers\Response;
use App\Routes\Router;

// Load environment configuration
Config::load(__DIR__ . '/../.env');

// Set timezone
date_default_timezone_set((string) Config::get('APP_TIMEZONE', 'Asia/Kolkata'));

// Centralized error reporting
$isDebug = (bool) Config::get('APP_DEBUG', true);
ini_set('display_errors', $isDebug ? '1' : '0');
error_reporting($isDebug ? E_ALL : 0);

// Global exception handler
set_exception_handler(function (\Throwable $e) use ($isDebug) {
    error_log("Unhandled Exception: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    Response::error(
        $isDebug ? $e->getMessage() : 'An unexpected server error occurred.',
        500,
        $isDebug ? ['file' => $e->getFile(), 'line' => $e->getLine(), 'trace' => $e->getTraceAsString()] : []
    );
});

// Handle CORS
CorsMiddleware::handle();

// Initialize Session with secure cookie parameters
Security::startSession();

// Register API routes
require_once __DIR__ . '/../routes/api.php';

// Dispatch request
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri    = $_SERVER['REQUEST_URI'] ?? '/';

Router::dispatch($method, $uri);

