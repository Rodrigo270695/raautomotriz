<?php

namespace Database\Factories;

use App\Models\InventoryBrand;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'               => strtoupper($this->faker->unique()->words(3, true)),
            'description'        => $this->faker->sentence(),
            'sale_price'         => $this->faker->randomFloat(2, 5, 500),
            'purchase_price'     => $this->faker->randomFloat(2, 1, 200),
            'stock'              => $this->faker->numberBetween(1, 100),
            'image'              => null,
            'inventory_brand_id' => InventoryBrand::factory(),
            'status'             => 'active',
            'created_by_id'      => null,
            'updated_by_id'      => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['status' => 'inactive']);
    }

    public function lowStock(): static
    {
        return $this->state(['stock' => $this->faker->numberBetween(0, 5)]);
    }

    public function withCreator(User $user): static
    {
        return $this->state(['created_by_id' => $user->id]);
    }
}
