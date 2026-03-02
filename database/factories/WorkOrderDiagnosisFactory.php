<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkOrderDiagnosis>
 */
class WorkOrderDiagnosisFactory extends Factory
{
    public function definition(): array
    {
        return [
            'work_order_id'  => WorkOrder::factory(),
            'diagnosis_text' => $this->faker->paragraph(),
            'diagnosed_by'   => User::factory(),
            'diagnosed_at'   => now(),
            'internal_notes' => null,
        ];
    }
}
