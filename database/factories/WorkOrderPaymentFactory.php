<?php

namespace Database\Factories;

use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkOrderPayment>
 */
class WorkOrderPaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'work_order_id'     => WorkOrder::factory(),
            'type'              => $this->faker->randomElement(['advance', 'partial', 'final']),
            'is_initial_advance'=> false,
            'amount'            => $this->faker->randomFloat(2, 10, 500),
            'payment_method'    => $this->faker->randomElement(['efectivo', 'yape', 'tarjeta']),
            'paid_at'           => now(),
            'reference'         => null,
            'notes'             => null,
        ];
    }

    public function initialAdvance(): static
    {
        return $this->state([
            'type'               => 'advance',
            'is_initial_advance' => true,
        ]);
    }
}
