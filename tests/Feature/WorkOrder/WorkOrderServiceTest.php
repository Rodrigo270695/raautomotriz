<?php

use App\Models\Product;
use App\Models\WorkOrder;
use App\Models\WorkOrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'work_order_services.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_order_services.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_order_services.delete', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_order_services.view',   'guard_name' => 'web']);
});

it('agrega un servicio manual a la orden', function () {
    $user  = UserHelper::makeSuperadmin();
    $order = WorkOrder::factory()->create();

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.services.store', $order), [
            'description' => 'Cambio de aceite',
            'quantity'    => 1,
            'unit_price'  => 50,
            'type'        => 'service',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('work_order_services', [
        'work_order_id' => $order->id,
        'description'   => 'Cambio de aceite',
        'quantity'      => 1,
        'unit_price'    => 50,
        'subtotal'      => 50,
    ]);
});

it('recalcula el total de la orden al agregar un servicio', function () {
    $user  = UserHelper::makeSuperadmin();
    $order = WorkOrder::factory()->create(['total_amount' => 0]);

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.services.store', $order), [
            'description' => 'Diagnóstico',
            'quantity'    => 2,
            'unit_price'  => 75,
            'type'        => 'service',
        ]);

    $this->assertDatabaseHas('work_orders', [
        'id'           => $order->id,
        'total_amount' => '150.00',
    ]);
});

it('agrega un producto a la orden', function () {
    $user    = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create();
    $product = Product::factory()->create(['sale_price' => 100, 'stock' => 10]);

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.services.store', $order), [
            'product_id'  => $product->id,
            'description' => $product->name,
            'quantity'    => 2,
            'unit_price'  => 100,
            'type'        => 'product',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('work_order_services', [
        'work_order_id' => $order->id,
        'product_id'    => $product->id,
        'subtotal'      => 200,
    ]);
});

it('actualiza un servicio correctamente', function () {
    $user    = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create();
    $service = WorkOrderService::factory()->create([
        'work_order_id' => $order->id,
        'quantity'      => 1,
        'unit_price'    => 50,
        'subtotal'      => 50,
    ]);

    $this->actingAs($user)
        ->put(route('dashboard.services.work-orders.services.update', [$order, $service]), [
            'description' => 'Servicio actualizado',
            'quantity'    => 3,
            'unit_price'  => 30,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('work_order_services', [
        'id'          => $service->id,
        'description' => 'Servicio actualizado',
        'quantity'    => 3,
        'unit_price'  => 30,
        'subtotal'    => 90,
    ]);
});

it('elimina un servicio y recalcula el total', function () {
    $user    = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create(['total_amount' => 100]);
    $service = WorkOrderService::factory()->create([
        'work_order_id' => $order->id,
        'subtotal'      => 100,
    ]);

    $this->actingAs($user)
        ->delete(route('dashboard.services.work-orders.services.destroy', [$order, $service]))
        ->assertRedirect();

    $this->assertDatabaseMissing('work_order_services', ['id' => $service->id]);
    $this->assertDatabaseHas('work_orders', [
        'id'           => $order->id,
        'total_amount' => '0.00',
    ]);
});

it('rechaza agregar servicio sin permiso', function () {
    $user  = \App\Models\User::factory()->create();
    $role  = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'sin_perm_sv', 'guard_name' => 'web']);
    $user->assignRole($role);
    $order = WorkOrder::factory()->create();

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.services.store', $order), [
            'description' => 'Test',
            'quantity'    => 1,
            'unit_price'  => 10,
        ])
        ->assertForbidden();
});
