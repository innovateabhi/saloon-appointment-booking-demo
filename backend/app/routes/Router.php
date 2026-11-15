<?php

namespace App\Routes;

use App\Helpers\Response;

class Router
{
    private static array $routes = [];

    public static function get(string $path, array $handler, array $middlewares = []): void
    {
        self::addRoute('GET', $path, $handler, $middlewares);
    }

    public static function post(string $path, array $handler, array $middlewares = []): void
    {
        self::addRoute('POST', $path, $handler, $middlewares);
    }

    public static function put(string $path, array $handler, array $middlewares = []): void
    {
        self::addRoute('PUT', $path, $handler, $middlewares);
    }

    public static function patch(string $path, array $handler, array $middlewares = []): void
    {
        self::addRoute('PATCH', $path, $handler, $middlewares);
    }

    public static function delete(string $path, array $handler, array $middlewares = []): void
    {
        self::addRoute('DELETE', $path, $handler, $middlewares);
    }

    private static function addRoute(string $method, string $path, array $handler, array $middlewares = []): void
    {
        self::$routes[] = [
            'method'      => $method,
            'path'        => rtrim($path, '/'),
            'handler'     => $handler,
            'middlewares' => $middlewares,
        ];
    }

    public static function dispatch(string $method, string $uri): void
    {
        // Remove query parameters
        $cleanUri = parse_url($uri, PHP_URL_PATH);

        // Normalize base path if running inside XAMPP subdirectory
        $prefixToStrip = '/aurelia-salon/backend/public';
        if (str_starts_with($cleanUri, $prefixToStrip)) {
            $cleanUri = substr($cleanUri, strlen($prefixToStrip));
        }

        $cleanUri = rtrim($cleanUri, '/');
        if (empty($cleanUri)) {
            $cleanUri = '/';
        }

        foreach (self::$routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            // Convert path with {param} into regex
            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $cleanUri, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                // Run route-level middlewares
                foreach ($route['middlewares'] as $middleware) {
                    if (is_callable($middleware)) {
                        call_user_func($middleware);
                    }
                }

                // Call controller action
                [$controllerClass, $action] = $route['handler'];
                if (!class_exists($controllerClass)) {
                    Response::error("Controller '{$controllerClass}' not found", 500);
                }

                $controller = new $controllerClass();
                if (!method_exists($controller, $action)) {
                    Response::error("Action '{$action}' not found on '{$controllerClass}'", 500);
                }

                call_user_func_array([$controller, $action], array_values($params));
                return;
            }
        }

        Response::notFound("Endpoint '{$method} {$cleanUri}' not found.");
    }
}
