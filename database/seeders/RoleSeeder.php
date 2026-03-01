<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Crea los roles: superadmin y cliente.
     */
    public function run(): void
    {
        Role::firstOrCreate(
            ['name' => 'superadmin'],
            ['guard_name' => 'web']
        );

        Role::firstOrCreate(
            ['name' => 'cliente'],
            ['guard_name' => 'web']
        );
    }
}
