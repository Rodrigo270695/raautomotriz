<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ServiceChecklist>
 */
class ServiceChecklistFactory extends Factory
{
    public function definition(): array
    {
        return [
            'order_number' => $this->faker->unique()->numberBetween(1, 9999),
            'name'         => strtoupper($this->faker->unique()->words(4, true)),
            'description'  => $this->faker->sentence(),
            'status'       => 'active',
        ];
    }

    public function inactive(): static
    {
        return $this->state(['status' => 'inactive', 'order_number' => null]);
    }
}
