<?php

namespace App\Models;

class Role extends BaseModel
{
    protected static string $table = 'roles';

    public static function findBySlug(string $slug): ?array
    {
        return self::firstWhere('slug', $slug);
    }
}

