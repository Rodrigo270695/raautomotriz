<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperadminUserSeeder extends Seeder
{
    /**
     * Crea el usuario superadmin y le asigna el rol.
     * Contraseña por defecto: usar SUPERADMIN_PASSWORD en .env o 'password'.
     */
    public function run(): void
    {
        $role = Role::firstOrCreate(
            ['name' => 'superadmin'],
            ['guard_name' => 'web']
        );

        $password = env('SUPERADMIN_PASSWORD', 'password');

        $user = User::firstOrCreate(
            ['username' => 'superadmin'],
            [
                'first_name' => 'Super',
                'last_name' => 'Administrador',
                'document_type' => 'dni',
                'document_number' => '00000000',
                'email' => 'superadmin@raautomotriz.local',
                'status' => 'active',
                'password' => Hash::make($password),
            ]
        );

        if (! $user->hasRole('superadmin')) {
            $user->assignRole($role);
        }
    }
}
