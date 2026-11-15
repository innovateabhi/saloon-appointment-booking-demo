<?php

namespace App\Models;

use App\Config\Database;
use PDO;

abstract class BaseModel
{
    protected static string $table = '';
    protected static string $primaryKey = 'id';

    public static function all(string $orderBy = 'id DESC'): array
    {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT * FROM " . static::$table . " ORDER BY {$orderBy}");
        return $stmt->fetchAll();
    }

    public static function find(int $id): ?array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM " . static::$table . " WHERE " . static::$primaryKey . " = ? LIMIT 1");
        $stmt->execute([$id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public static function where(string $column, mixed $value, string $operator = '='): array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM " . static::$table . " WHERE {$column} {$operator} ?");
        $stmt->execute([$value]);
        return $stmt->fetchAll();
    }

    public static function firstWhere(string $column, mixed $value, string $operator = '='): ?array
    {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM " . static::$table . " WHERE {$column} {$operator} ? LIMIT 1");
        $stmt->execute([$value]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public static function create(array $data): int
    {
        $db = Database::getConnection();
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));

        $sql = "INSERT INTO " . static::$table . " ({$columns}) VALUES ({$placeholders})";
        $stmt = $db->prepare($sql);
        $stmt->execute(array_values($data));

        return (int) $db->lastInsertId();
    }

    public static function update(int $id, array $data): bool
    {
        $db = Database::getConnection();
        $setParts = [];
        $values = [];

        foreach ($data as $column => $value) {
            $setParts[] = "{$column} = ?";
            $values[] = $value;
        }

        $values[] = $id;
        $sql = "UPDATE " . static::$table . " SET " . implode(', ', $setParts) . " WHERE " . static::$primaryKey . " = ?";
        $stmt = $db->prepare($sql);
        return $stmt->execute($values);
    }

    public static function delete(int $id): bool
    {
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM " . static::$table . " WHERE " . static::$primaryKey . " = ?");
        return $stmt->execute([$id]);
    }
}

