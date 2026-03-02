<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleModel;
use Database\Factories\VehicleModelFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class VehicleSeeder extends Seeder
{
    /** Colores de vehículos en español. */
    private const COLORS = [
        'Blanco', 'Negro', 'Gris', 'Plateado', 'Rojo', 'Azul', 'Verde',
        'Beige', 'Marrón', 'Naranja', 'Amarillo', 'Vino',
    ];

    /** Placas en formato peruano: 3 letras + 3 dígitos. */
    private static int $plateSeq = 0;

    public function run(): void
    {
        $this->command->info('  → Creando marcas y modelos de vehículos…');
        $this->seedBrandsAndModels();

        $this->command->info('  → Creando 25 clientes con 1–3 vehículos cada uno…');
        $this->seedClientsWithVehicles();
    }

    // ─────────────────────────────────────────────────────────────
    // Marcas y modelos
    // ─────────────────────────────────────────────────────────────

    private function seedBrandsAndModels(): void
    {
        foreach (VehicleModelFactory::MODELS_BY_BRAND as $brandName => $modelNames) {
            $brand = Brand::firstOrCreate(
                ['name' => $brandName],
                ['description' => "Vehículos {$brandName}", 'status' => 'active']
            );

            foreach ($modelNames as $modelName) {
                VehicleModel::firstOrCreate(
                    ['brand_id' => $brand->id, 'name' => $modelName],
                    ['description' => null, 'status' => 'active']
                );
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Clientes y vehículos
    // ─────────────────────────────────────────────────────────────

    private function seedClientsWithVehicles(): void
    {
        $clienteRole = Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);

        // Modelos disponibles para asignar a vehículos
        $vehicleModelIds = VehicleModel::where('status', 'active')->pluck('id')->toArray();

        // Datos de clientes peruanos (nombres + apellidos reales)
        $clientsData = [
            ['first_name' => 'Carlos',    'last_name' => 'Quispe Mamani'],
            ['first_name' => 'María',     'last_name' => 'Flores Huanca'],
            ['first_name' => 'Jorge',     'last_name' => 'Gutierrez Paredes'],
            ['first_name' => 'Ana',       'last_name' => 'Torres Condori'],
            ['first_name' => 'Luis',      'last_name' => 'Vargas Ccallo'],
            ['first_name' => 'Rosa',      'last_name' => 'Puma Chávez'],
            ['first_name' => 'Pedro',     'last_name' => 'Huanca Quispe'],
            ['first_name' => 'Carmen',    'last_name' => 'Mamani Larico'],
            ['first_name' => 'Roberto',   'last_name' => 'Sánchez Cruz'],
            ['first_name' => 'Patricia',  'last_name' => 'Mendoza Apaza'],
            ['first_name' => 'Miguel',    'last_name' => 'Coaquira Llanos'],
            ['first_name' => 'Lucia',     'last_name' => 'Quispe Alata'],
            ['first_name' => 'Fernando',  'last_name' => 'Ramos Lupaca'],
            ['first_name' => 'Sandra',    'last_name' => 'Cáceres Pinto'],
            ['first_name' => 'Alejandro', 'last_name' => 'Montes Espinoza'],
            ['first_name' => 'Claudia',   'last_name' => 'Tapia Ibáñez'],
            ['first_name' => 'Raúl',      'last_name' => 'Aquino Ttito'],
            ['first_name' => 'Silvia',    'last_name' => 'Carpio Beltrán'],
            ['first_name' => 'David',     'last_name' => 'Medina Soria'],
            ['first_name' => 'Miriam',    'last_name' => 'Huayhua Ponce'],
            ['first_name' => 'Arturo',    'last_name' => 'Cóndor Chipana'],
            ['first_name' => 'Beatriz',   'last_name' => 'Palomino Urquizo'],
            ['first_name' => 'Enrique',   'last_name' => 'Velarde Huanacuni'],
            ['first_name' => 'Norma',     'last_name' => 'Lazo Cutipa'],
            ['first_name' => 'Víctor',    'last_name' => 'Apaza Villanueva'],
        ];

        foreach ($clientsData as $index => $clientData) {
            $dni = $this->uniqueDni($index);

            $user = User::firstOrCreate(
                ['document_number' => $dni],
                [
                    'first_name'        => $clientData['first_name'],
                    'last_name'         => $clientData['last_name'],
                    'document_type'     => 'dni',
                    'username'          => $dni,
                    'email'             => $this->emailFrom($clientData['first_name'], $clientData['last_name'], $index),
                    'phone'             => '9' . str_pad((string) (50000000 + $index * 37), 8, '0', STR_PAD_LEFT),
                    'status'            => 'active',
                    'password'          => bcrypt('password'),
                    'email_verified_at' => now(),
                ]
            );

            if (! $user->hasRole('cliente')) {
                $user->assignRole($clienteRole);
            }

            // Asignar entre 1 y 3 vehículos por cliente
            $numVehicles = ($index % 3) + 1; // cicla 1, 2, 3, 1, 2, 3…

            for ($v = 0; $v < $numVehicles; $v++) {
                $modelId = $vehicleModelIds[($index * 3 + $v) % count($vehicleModelIds)];

                Vehicle::firstOrCreate(
                    ['plate' => $this->generatePlate($index, $v)],
                    [
                        'vehicle_model_id' => $modelId,
                        'client_id'        => $user->id,
                        'year'             => rand(2010, 2024),
                        'color'            => self::COLORS[($index + $v) % count(self::COLORS)],
                        'entry_mileage'    => rand(5000, 120000),
                        'exit_mileage'     => null,
                        'status'           => 'active',
                        'created_by_id'    => null,
                        'updated_by_id'    => null,
                    ]
                );
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    /** Genera un DNI de 8 dígitos único basado en índice. */
    private function uniqueDni(int $index): string
    {
        return str_pad((string) (10000000 + $index * 1234 + 567), 8, '0', STR_PAD_LEFT);
    }

    /** Genera una placa peruana en formato AAA-000 única por índice+vehículo. */
    private function generatePlate(int $clientIndex, int $vehicleIndex): string
    {
        $seq   = $clientIndex * 3 + $vehicleIndex;
        $num   = str_pad((string) (100 + $seq), 3, '0', STR_PAD_LEFT);
        $alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M', 'P', 'T', 'V'];
        $l1    = $alpha[$seq % count($alpha)];
        $l2    = $alpha[($seq + 3) % count($alpha)];
        $l3    = $alpha[($seq + 7) % count($alpha)];

        return "{$l1}{$l2}{$l3}-{$num}";
    }

    /** Genera un email único y legible a partir del nombre. */
    private function emailFrom(string $firstName, string $lastName, int $index): string
    {
        $base = strtolower(
            iconv('UTF-8', 'ASCII//TRANSLIT', $firstName) . '.' .
            str_replace(' ', '', iconv('UTF-8', 'ASCII//TRANSLIT', $lastName))
        );

        return "{$base}{$index}@example.com";
    }
}
