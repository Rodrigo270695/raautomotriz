<?php

use App\Models\InventoryBrand;
use App\Models\InventoryType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'inventory_types.view',   'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'inventory_types.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'inventory_types.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'inventory_types.delete', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'inventory_brands.create','guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'inventory_brands.update','guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'inventory_brands.delete','guard_name' => 'web']);
});

it('muestra el índice de tipos de inventario', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->get(route('dashboard.inventory.types.index'))
        ->assertOk();
});

it('crea un tipo de inventario correctamente', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->post(route('dashboard.inventory.types.store'), [
            'name'   => 'LUBRICANTES',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('inventory_types', ['name' => 'LUBRICANTES']);
});

it('actualiza un tipo de inventario correctamente', function () {
    $user = UserHelper::makeSuperadmin();
    $type = InventoryType::factory()->create(['name' => 'VIEJO']);

    $this->actingAs($user)
        ->put(route('dashboard.inventory.types.update', $type), [
            'name'   => 'NUEVO',
            'status' => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('inventory_types', ['id' => $type->id, 'name' => 'NUEVO']);
});

it('elimina un tipo de inventario correctamente', function () {
    $user = UserHelper::makeSuperadmin();
    $type = InventoryType::factory()->create();

    $this->actingAs($user)
        ->delete(route('dashboard.inventory.types.destroy', $type))
        ->assertRedirect();

    $this->assertDatabaseMissing('inventory_types', ['id' => $type->id]);
});

it('crea una marca de inventario correctamente', function () {
    $user = UserHelper::makeSuperadmin();
    $type = InventoryType::factory()->create();

    $this->actingAs($user)
        ->post(route('dashboard.inventory.types.brands.store', $type), [
            'inventory_type_id' => $type->id,
            'name'              => 'CASTROL',
            'status'            => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('inventory_brands', [
        'name'               => 'CASTROL',
        'inventory_type_id'  => $type->id,
    ]);
});

it('actualiza una marca de inventario e invalida caché', function () {
    $user  = UserHelper::makeSuperadmin();
    $brand = InventoryBrand::factory()->create(['name' => 'VIEJA MARCA']);
    Cache::put('products_for_select', 'cached', 300);

    $this->actingAs($user)
        ->put(route('dashboard.inventory.brands.update', $brand), [
            'inventory_type_id' => $brand->inventory_type_id,
            'name'              => 'NUEVA MARCA',
            'status'            => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('inventory_brands', ['id' => $brand->id, 'name' => 'NUEVA MARCA']);
});

it('elimina una marca de inventario correctamente', function () {
    $user  = UserHelper::makeSuperadmin();
    $brand = InventoryBrand::factory()->create();

    $this->actingAs($user)
        ->delete(route('dashboard.inventory.brands.destroy', $brand))
        ->assertRedirect();

    $this->assertDatabaseMissing('inventory_brands', ['id' => $brand->id]);
});

it('rechaza crear tipo sin permiso', function () {
    $user = UserHelper::makeUserWithPermissions(['inventory_types.view']);

    $this->actingAs($user)
        ->post(route('dashboard.inventory.types.store'), ['name' => 'REPUESTOS'])
        ->assertForbidden();
});
