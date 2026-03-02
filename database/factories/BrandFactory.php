<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Brand>
 */
class BrandFactory extends Factory
{
    /** Marcas de vehículos reales — usadas en el factory y en el VehicleSeeder. */
    public const BRANDS = [
        'Toyota', 'Hyundai', 'Kia', 'Nissan', 'Honda', 'Mitsubishi',
        'Chevrolet', 'Ford', 'Mazda', 'Suzuki', 'Volkswagen', 'Subaru',
        'Renault', 'Peugeot', 'Mercedes-Benz', 'BMW', 'Audi', 'Jeep',
        'Volvo', 'Land Rover',
    ];

    public function definition(): array
    {
        return [
            'name'        => $this->faker->unique()->randomElement(self::BRANDS),
            'description' => $this->faker->sentence(),
            'status'      => 'active',
        ];
    }

    public function inactive(): static
    {
        return $this->state(['status' => 'inactive']);
    }
}
