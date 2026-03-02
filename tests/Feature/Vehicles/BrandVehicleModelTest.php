<?php

use App\Models\Brand;
use App\Models\VehicleModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'brands.view',          'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'brands.create',        'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'brands.update',        'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'brands.delete',        'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'vehicle_models.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'vehicle_models.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'vehicle_models.delete', 'guard_name' => 'web']);
});

it('muestra el índice de marcas', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->get(route('dashboard.vehicles.brands.index'))
        ->assertOk();
});

it('crea una marca correctamente', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->post(route('dashboard.vehicles.brands.store'), [
            'name'        => 'TOYOTA',
            'description' => 'Marca japonesa',
            'status'      => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('brands', ['name' => 'TOYOTA']);
});

it('convierte el nombre de marca a mayúsculas', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->post(route('dashboard.vehicles.brands.store'), [
            'name'   => 'honda',
            'status' => 'active',
        ]);

    $this->assertDatabaseHas('brands', ['name' => 'HONDA']);
});

it('actualiza una marca correctamente', function () {
    $user  = UserHelper::makeSuperadmin();
    $brand = Brand::factory()->create(['name' => 'VIEJA MARCA']);

    $this->actingAs($user)
        ->put(route('dashboard.vehicles.brands.update', $brand), [
            'name'   => 'NUEVA MARCA',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('brands', ['id' => $brand->id, 'name' => 'NUEVA MARCA']);
});

it('elimina una marca correctamente', function () {
    $user  = UserHelper::makeSuperadmin();
    $brand = Brand::factory()->create();

    $this->actingAs($user)
        ->delete(route('dashboard.vehicles.brands.destroy', $brand))
        ->assertRedirect();

    $this->assertDatabaseMissing('brands', ['id' => $brand->id]);
});

it('crea un modelo de vehículo correctamente', function () {
    $user  = UserHelper::makeSuperadmin();
    $brand = Brand::factory()->create();

    $this->actingAs($user)
        ->post(route('dashboard.vehicles.brands.models.store', $brand), [
            'brand_id'    => $brand->id,
            'name'        => 'COROLLA',
            'description' => 'Sedán',
            'status'      => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('vehicle_models', [
        'name'     => 'COROLLA',
        'brand_id' => $brand->id,
    ]);
});

it('actualiza un modelo de vehículo correctamente', function () {
    $user  = UserHelper::makeSuperadmin();
    $model = VehicleModel::factory()->create(['name' => 'VIEJO']);

    $this->actingAs($user)
        ->put(route('dashboard.vehicles.models.update', $model), [
            'brand_id' => $model->brand_id,
            'name'     => 'NUEVO',
            'status'   => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('vehicle_models', ['id' => $model->id, 'name' => 'NUEVO']);
});

it('elimina un modelo de vehículo correctamente', function () {
    $user  = UserHelper::makeSuperadmin();
    $model = VehicleModel::factory()->create();

    $this->actingAs($user)
        ->delete(route('dashboard.vehicles.models.destroy', $model))
        ->assertRedirect();

    $this->assertDatabaseMissing('vehicle_models', ['id' => $model->id]);
});

it('rechaza crear marca sin permiso', function () {
    $user = UserHelper::makeUserWithPermissions(['brands.view']);

    $this->actingAs($user)
        ->post(route('dashboard.vehicles.brands.store'), ['name' => 'FORD'])
        ->assertForbidden();
});
