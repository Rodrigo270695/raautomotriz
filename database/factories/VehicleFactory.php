<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\VehicleModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Vehicle>
 */
class VehicleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'plate'            => strtoupper($this->faker->unique()->bothify('???-###')),
            'year'             => $this->faker->numberBetween(2000, 2024),
            'color'            => $this->faker->colorName(),
            'entry_mileage'    => $this->faker->numberBetween(0, 100000),
            'exit_mileage'     => null,
            'vehicle_model_id' => VehicleModel::factory(),
            'client_id'        => User::factory(),
            'status'           => 'active',
            'created_by_id'    => null,
            'updated_by_id'    => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['status' => 'inactive']);
    }
}
