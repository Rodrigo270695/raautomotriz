<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InventoryType>
 */
class InventoryTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'        => strtoupper($this->faker->unique()->word()),
            'description' => $this->faker->sentence(),
            'status'      => 'active',
        ];
    }

    public function inactive(): static
    {
        return $this->state(['status' => 'inactive']);
    }
}
