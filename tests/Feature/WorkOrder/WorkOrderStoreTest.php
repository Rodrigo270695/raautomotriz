<?php

use App\Jobs\SendWelcomeNotificationJob;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleModel;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'work_orders.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_orders.view', 'guard_name' => 'web']);
    Queue::fake();
});

function makeClientAndVehicle(): array
{
    $clientRole = Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);
    $client = User::factory()->create();
    $client->assignRole($clientRole);

    $brand = \App\Models\Brand::factory()->create();
    $vehicleModel = VehicleModel::factory()->create(['brand_id' => $brand->id]);
    $vehicle = Vehicle::factory()->create([
        'client_id' => $client->id,
        'vehicle_model_id' => $vehicleModel->id,
    ]);

    return compact('client', 'vehicle');
}

it('crea una orden de trabajo correctamente', function () {
    $user = UserHelper::makeSuperadmin();
    ['client' => $client, 'vehicle' => $vehicle] = makeClientAndVehicle();

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.store'), [
            'vehicle_id' => $vehicle->id,
            'client_id' => $client->id,
            'entry_date' => now()->format('Y-m-d'),
            'entry_time' => '09:00',
            'status' => 'ingreso',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('work_orders', [
        'vehicle_id' => $vehicle->id,
        'client_id' => $client->id,
        'status' => 'ingreso',
    ]);
});

it('despacha el job de notificación al crear una orden', function () {
    $user = UserHelper::makeSuperadmin();
    ['client' => $client, 'vehicle' => $vehicle] = makeClientAndVehicle();

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.store'), [
            'vehicle_id' => $vehicle->id,
            'client_id' => $client->id,
            'entry_date' => now()->format('Y-m-d'),
            'entry_time' => '10:00',
            'status' => 'ingreso',
        ]);

    Queue::assertPushed(SendWelcomeNotificationJob::class, function ($job) {
        return is_int($job->workOrderId);
    });
});

it('crea un pago de adelanto cuando se especifica', function () {
    $user = UserHelper::makeSuperadmin();
    ['client' => $client, 'vehicle' => $vehicle] = makeClientAndVehicle();

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.store'), [
            'vehicle_id' => $vehicle->id,
            'client_id' => $client->id,
            'entry_date' => now()->format('Y-m-d'),
            'entry_time' => '10:00',
            'status' => 'ingreso',
            'advance_payment_amount' => 150.00,
        ]);

    $order = WorkOrder::latest()->first();
    $this->assertDatabaseHas('work_order_payments', [
        'work_order_id' => $order->id,
        'type' => 'advance',
        'is_initial_advance' => true,
        'amount' => 150.00,
    ]);
});

it('rechaza crear orden sin permiso', function () {
    $role = Role::firstOrCreate(['name' => 'sin_permisos', 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.store'), [])
        ->assertForbidden();
});
