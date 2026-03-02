<?php

use App\Models\ServicePackage;
use App\Models\ServiceType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'service_packages.view',   'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'service_packages.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'service_packages.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'service_packages.delete', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'service_types.view',      'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'service_types.create',    'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'service_types.update',    'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'service_types.delete',    'guard_name' => 'web']);
});

it('muestra el índice de paquetes de servicio', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->get(route('dashboard.services.packages.index'))
        ->assertOk();
});

it('crea un paquete de servicio correctamente', function () {
    $user        = UserHelper::makeSuperadmin();
    $serviceType = ServiceType::factory()->create();

    $this->actingAs($user)
        ->post(route('dashboard.services.packages.store'), [
            'name'            => 'MANTENIMIENTO 5000KM',
            'description'     => 'Mantenimiento básico',
            'service_type_id' => $serviceType->id,
            'status'          => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('service_packages', [
        'name'            => 'MANTENIMIENTO 5000KM',
        'service_type_id' => $serviceType->id,
    ]);
});

it('actualiza un paquete correctamente', function () {
    $user    = UserHelper::makeSuperadmin();
    $package = ServicePackage::factory()->create(['name' => 'PAQUETE VIEJO']);

    $this->actingAs($user)
        ->put(route('dashboard.services.packages.update', $package), [
            'name'            => 'PAQUETE NUEVO',
            'service_type_id' => $package->service_type_id,
            'status'          => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('service_packages', [
        'id'   => $package->id,
        'name' => 'PAQUETE NUEVO',
    ]);
});

it('invalida la caché al crear paquete', function () {
    $user        = UserHelper::makeSuperadmin();
    $serviceType = ServiceType::factory()->create();
    Cache::put('packages_for_select', 'cached', 300);

    $this->actingAs($user)
        ->post(route('dashboard.services.packages.store'), [
            'name'            => 'PAQUETE CACHE TEST',
            'service_type_id' => $serviceType->id,
            'status'          => 'active',
        ]);

    expect(Cache::has('packages_for_select'))->toBeFalse();
});

it('elimina un paquete y limpia la caché', function () {
    $user    = UserHelper::makeSuperadmin();
    $package = ServicePackage::factory()->create();
    Cache::put('packages_for_select', 'cached', 300);

    $this->actingAs($user)
        ->delete(route('dashboard.services.packages.destroy', $package))
        ->assertRedirect();

    $this->assertDatabaseMissing('service_packages', ['id' => $package->id]);
    expect(Cache::has('packages_for_select'))->toBeFalse();
});

it('crea un tipo de servicio correctamente', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->post(route('dashboard.services.types.store'), [
            'name'   => 'MANTENIMIENTO PREVENTIVO',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('service_types', ['name' => 'MANTENIMIENTO PREVENTIVO']);
});

it('actualiza un tipo de servicio correctamente', function () {
    $user = UserHelper::makeSuperadmin();
    $type = ServiceType::factory()->create(['name' => 'VIEJO TIPO']);

    $this->actingAs($user)
        ->put(route('dashboard.services.types.update', $type), [
            'name'   => 'NUEVO TIPO',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('service_types', ['id' => $type->id, 'name' => 'NUEVO TIPO']);
});

it('elimina un tipo de servicio correctamente', function () {
    $user = UserHelper::makeSuperadmin();
    $type = ServiceType::factory()->create();

    $this->actingAs($user)
        ->delete(route('dashboard.services.types.destroy', $type))
        ->assertRedirect();

    $this->assertDatabaseMissing('service_types', ['id' => $type->id]);
});

it('rechaza crear paquete sin permiso', function () {
    $user        = UserHelper::makeUserWithPermissions(['service_packages.view']);
    $serviceType = ServiceType::factory()->create();

    $this->actingAs($user)
        ->post(route('dashboard.services.packages.store'), [
            'name'            => 'PAQUETE TEST',
            'service_type_id' => $serviceType->id,
            'status'          => 'active',
        ])
        ->assertForbidden();
});
