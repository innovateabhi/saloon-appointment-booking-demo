<?php

namespace App\Models;

use App\Config\Database;

class Salon extends BaseModel
{
    protected static string $table = 'salons';

    public static function getDefault(): ?array
    {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT * FROM salons WHERE is_active = 1 ORDER BY id ASC LIMIT 1");
        $salon = $stmt->fetch();
        return $salon ?: null;
    }
}

