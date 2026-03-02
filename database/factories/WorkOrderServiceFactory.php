<?php

namespace Database\Factories;

use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkOrderService>
 */
class WorkOrderServiceFactory extends Factory
{
    public function definition(): array
    {
        $qty   = $this->faker->randomFloat(2, 1, 10);
        $price = $this->faker->randomFloat(2, 10, 500);

        return [
            'work_order_id'          => WorkOrder::factory(),
            'service_package_id'     => null,
            'service_package_item_id'=> null,
            'product_id'             => null,
            'description'            => $this->faker->sentence(),
            'quantity'               => $qty,
            'unit_price'             => $price,
            'subtotal'               => round($qty * $price, 2),
            'type'                   => 'service',
            'stock_deducted_at'      => null,
        ];
    }
}
