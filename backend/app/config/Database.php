<?php

namespace App\Config;

use PDO;
use PDOException;
use RuntimeException;

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $host = Config::get('DB_HOST', '127.0.0.1');
            $port = Config::get('DB_PORT', '3306');
            $db   = Config::get('DB_DATABASE', 'aurelia_salon');
            $user = Config::get('DB_USERNAME', 'root');
            $pass = Config::get('DB_PASSWORD', '');
            $charset = Config::get('DB_CHARSET', 'utf8mb4');

            $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            if (class_exists('\Pdo\Mysql') && defined('\Pdo\Mysql::ATTR_INIT_COMMAND')) {
                $options[\Pdo\Mysql::ATTR_INIT_COMMAND] = "SET NAMES {$charset} COLLATE {$charset}_unicode_ci";
            } elseif (defined('PDO::MYSQL_ATTR_INIT_COMMAND')) {
                $options[@PDO::MYSQL_ATTR_INIT_COMMAND] = "SET NAMES {$charset} COLLATE {$charset}_unicode_ci";
            } else {
                $options[1002] = "SET NAMES {$charset} COLLATE {$charset}_unicode_ci";
            }

            try {
                self::$instance = new PDO($dsn, $user, $pass, $options);
            } catch (PDOException $e) {
                error_log("Database Connection Error: " . $e->getMessage());
                throw new RuntimeException("Database connection failure: " . $e->getMessage());
            }
        }

        return self::$instance;
    }

    public static function beginTransaction(): bool
    {
        return self::getConnection()->beginTransaction();
    }

    public static function commit(): bool
    {
        return self::getConnection()->commit();
    }

    public static function rollBack(): bool
    {
        if (self::getConnection()->inTransaction()) {
            return self::getConnection()->rollBack();
        }
        return false;
    }
}

