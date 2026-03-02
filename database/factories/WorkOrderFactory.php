<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkOrder>
 */
class WorkOrderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'vehicle_id'             => Vehicle::factory(),
            'client_id'              => function (array $attrs) {
                return Vehicle::find($attrs['vehicle_id'])?->client_id
                    ?? User::factory()->create()->id;
            },
            'created_by'             => User::factory(),
            'entry_date'             => $this->faker->date(),
            'entry_time'             => $this->faker->time('H:i'),
            'entry_mileage'          => $this->faker->numberBetween(0, 100000),
            'exit_mileage'           => null,
            'client_observation'     => $this->faker->sentence(),
            'diagnosis'              => null,
            'status'                 => 'ingreso',
            'advance_payment_amount' => '0.00',
            'total_amount'           => '0.00',
            'notes'                  => null,
        ];
    }

    public function withStatus(string $status): static
    {
        return $this->state(['status' => $status]);
    }

    public function inRepair(): static
    {
        return $this->state(['status' => 'en_reparacion']);
    }

    public function delivered(): static
    {
        return $this->state(['status' => 'entregado']);
    }

    public function forClient(User $client): static
    {
        return $this->state(function () use ($client) {
            $vehicle = Vehicle::factory()->create(['client_id' => $client->id]);
            return [
                'vehicle_id' => $vehicle->id,
                'client_id'  => $client->id,
            ];
        });
    }
}
