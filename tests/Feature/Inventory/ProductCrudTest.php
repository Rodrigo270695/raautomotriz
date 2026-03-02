<?php

use App\Models\InventoryBrand;
use App\Models\InventoryType;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'products.view',   'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'products.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'products.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'products.delete', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'products.export', 'guard_name' => 'web']);
});

it('muestra el índice de productos al usuario autorizado', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->get(route('dashboard.inventory.products.index'))
        ->assertOk();
});

it('redirige invitados al índice de productos', function () {
    $this->get(route('dashboard.inventory.products.index'))
        ->assertRedirect(route('login'));
});

it('rechaza ver productos sin permiso', function () {
    $user = \App\Models\User::factory()->create();
    $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'sin_perm_pr', 'guard_name' => 'web']);
    $user->assignRole($role);

    $this->actingAs($user)
        ->get(route('dashboard.inventory.products.index'))
        ->assertForbidden();
});

it('crea un producto correctamente', function () {
    $user  = UserHelper::makeSuperadmin();
    $brand = InventoryBrand::factory()->create();

    $this->actingAs($user)
        ->post(route('dashboard.inventory.brands.products.store', $brand), [
            'name'               => 'ACEITE CASTROL 5W30',
            'description'        => 'Aceite sintético',
            'sale_price'         => 85.00,
            'purchase_price'     => 60.00,
            'stock'              => 20,
            'status'             => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('products', [
        'name'               => 'ACEITE CASTROL 5W30',
        'inventory_brand_id' => $brand->id,
        'stock'              => 20,
    ]);
});

it('actualiza un producto correctamente', function () {
    $user    = UserHelper::makeSuperadmin();
    $product = Product::factory()->create(['stock' => 10]);

    $this->actingAs($user)
        ->put(route('dashboard.inventory.products.update', $product), [
            'name'           => 'PRODUCTO ACTUALIZADO',
            'sale_price'     => 90.00,
            'purchase_price' => 70.00,
            'stock'          => 25,
            'status'         => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('products', [
        'id'    => $product->id,
        'name'  => 'PRODUCTO ACTUALIZADO',
        'stock' => 25,
    ]);
});

it('elimina un producto correctamente', function () {
    $user    = UserHelper::makeSuperadmin();
    $product = Product::factory()->create();

    $this->actingAs($user)
        ->delete(route('dashboard.inventory.products.destroy', $product))
        ->assertRedirect();

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

it('rechaza crear producto sin permiso', function () {
    $user  = UserHelper::makeUserWithPermissions(['products.view']);
    $brand = InventoryBrand::factory()->create();

    $this->actingAs($user)
        ->post(route('dashboard.inventory.brands.products.store', $brand), [
            'name'           => 'PRODUCTO TEST',
            'sale_price'     => 50.00,
            'purchase_price' => 30.00,
            'stock'          => 5,
        ])
        ->assertForbidden();
});

it('rechaza eliminar producto sin permiso', function () {
    $user    = UserHelper::makeUserWithPermissions(['products.view']);
    $product = Product::factory()->create();

    $this->actingAs($user)
        ->delete(route('dashboard.inventory.products.destroy', $product))
        ->assertForbidden();
});
