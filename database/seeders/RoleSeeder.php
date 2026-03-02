<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Crea los roles del sistema.
     */
    public function run(): void
    {
        $roles = ['superadmin', 'admin', 'tecnico', 'recepcionista', 'cliente'];

        foreach ($roles as $name) {
            Role::firstOrCreate(
                ['name' => $name],
                ['guard_name' => 'web']
            );
        }
    }
}
