<?php

namespace Database\Seeders;

// use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // 1. Roles y permisos (siempre primero)
            RoleSeeder::class,
            RolesPermissionSeeder::class,

            // 2. Usuario superadmin
            SuperadminUserSeeder::class,

            // 3. Marcas y modelos de vehículos + clientes con vehículos asignados
            VehicleSeeder::class,

            // 4. Tipos, marcas y productos de inventario
            InventorySeeder::class,

            // 5. Lista de chequeo de recepción de vehículo
            ServiceChecklistSeeder::class,

            // 6. Tipos y paquetes de servicio (depende de InventorySeeder para los productos)
            ServicePackageSeeder::class,
        ]);
    }
}
