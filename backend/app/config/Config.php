<?php

namespace App\Config;

class Config
{
    private static array $env = [];
    private static bool $loaded = false;

    public static function load(string $path): void
    {
        if (self::$loaded) {
            return;
        }

        if (file_exists($path)) {
            $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || str_starts_with($line, '#')) {
                    continue;
                }
                if (str_contains($line, '=')) {
                    [$name, $value] = explode('=', $line, 2);
                    $name = trim($name);
                    $value = trim($value);
                    $value = trim($value, '"\'');
                    if (strtolower($value) === 'true') $value = true;
                    elseif (strtolower($value) === 'false') $value = false;
                    elseif (strtolower($value) === 'null') $value = null;

                    self::$env[$name] = $value;
                    if (!isset($_ENV[$name])) {
                        $_ENV[$name] = $value;
                    }
                }
            }
        }

        self::$loaded = true;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return self::$env[$key] ?? $_ENV[$key] ?? $default;
    }
}

