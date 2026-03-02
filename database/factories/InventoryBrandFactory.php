<?php

namespace Database\Factories;

use App\Models\InventoryType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\InventoryBrand>
 */
class InventoryBrandFactory extends Factory
{
    public function definition(): array
    {
        return [
            'inventory_type_id' => InventoryType::factory(),
            'name'              => strtoupper($this->faker->unique()->word()),
            'description'       => $this->faker->sentence(),
            'status'            => 'active',
        ];
    }

    public function inactive(): static
    {
        return $this->state(['status' => 'inactive']);
    }
}
