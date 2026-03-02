<?php

namespace Database\Factories;

use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkOrderPhoto>
 */
class WorkOrderPhotoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'work_order_id' => WorkOrder::factory(),
            'type'          => $this->faker->randomElement(['entry', 'diagnosis', 'process', 'delivery']),
            'path'          => 'work_order_photos/test/photo.jpg',
            'caption'       => $this->faker->sentence(),
        ];
    }
}
