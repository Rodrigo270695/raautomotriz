<?php

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'vehicles.view',   'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'vehicles.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'vehicles.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'vehicles.delete', 'guard_name' => 'web']);
});

it('muestra el índice de vehículos', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->get(route('dashboard.vehicles.vehicles.index'))
        ->assertOk();
});

it('redirige invitados al índice de vehículos', function () {
    $this->get(route('dashboard.vehicles.vehicles.index'))
        ->assertRedirect(route('login'));
});

it('crea un vehículo correctamente', function () {
    $user         = UserHelper::makeSuperadmin();
    $client       = User::factory()->create();
    $vehicleModel = VehicleModel::factory()->create();

    $this->actingAs($user)
        ->post(route('dashboard.vehicles.vehicles.store'), [
            'plate'            => 'AAA-111',
            'year'             => 2020,
            'color'            => 'Rojo',
            'vehicle_model_id' => $vehicleModel->id,
            'client_id'        => $client->id,
            'status'           => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('vehicles', [
        'plate'     => 'AAA-111',
        'client_id' => $client->id,
    ]);
});

it('convierte la placa a mayúsculas', function () {
    $user         = UserHelper::makeSuperadmin();
    $client       = User::factory()->create();
    $vehicleModel = VehicleModel::factory()->create();

    $this->actingAs($user)
        ->post(route('dashboard.vehicles.vehicles.store'), [
            'plate'            => 'aaa-222',
            'vehicle_model_id' => $vehicleModel->id,
            'client_id'        => $client->id,
            'status'           => 'active',
        ]);

    $this->assertDatabaseHas('vehicles', ['plate' => 'AAA-222']);
});

it('rechaza crear vehículo con placa duplicada', function () {
    $user         = UserHelper::makeSuperadmin();
    $client       = User::factory()->create();
    $vehicleModel = VehicleModel::factory()->create();
    Vehicle::factory()->create(['plate' => 'DUP-001', 'client_id' => $client->id]);

    $this->actingAs($user)
        ->post(route('dashboard.vehicles.vehicles.store'), [
            'plate'            => 'DUP-001',
            'vehicle_model_id' => $vehicleModel->id,
            'client_id'        => $client->id,
            'status'           => 'active',
        ])
        ->assertSessionHasErrors('plate');
});

it('actualiza un vehículo correctamente', function () {
    $user    = UserHelper::makeSuperadmin();
    $vehicle = Vehicle::factory()->create(['year' => 2018]);

    $this->actingAs($user)
        ->put(route('dashboard.vehicles.vehicles.update', $vehicle), [
            'plate'            => $vehicle->plate,
            'year'             => 2022,
            'vehicle_model_id' => $vehicle->vehicle_model_id,
            'client_id'        => $vehicle->client_id,
            'status'           => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('vehicles', [
        'id'   => $vehicle->id,
        'year' => 2022,
    ]);
});

it('elimina un vehículo correctamente', function () {
    $user    = UserHelper::makeSuperadmin();
    $vehicle = Vehicle::factory()->create();

    $this->actingAs($user)
        ->delete(route('dashboard.vehicles.vehicles.destroy', $vehicle))
        ->assertRedirect();

    $this->assertDatabaseMissing('vehicles', ['id' => $vehicle->id]);
});

it('rechaza crear vehículo sin permiso', function () {
    $user   = UserHelper::makeUserWithPermissions(['vehicles.view']);
    $client = User::factory()->create();
    $vm     = VehicleModel::factory()->create();

    $this->actingAs($user)
        ->post(route('dashboard.vehicles.vehicles.store'), [
            'plate'            => 'TST-001',
            'vehicle_model_id' => $vm->id,
            'client_id'        => $client->id,
            'status'           => 'active',
        ])
        ->assertForbidden();
});
