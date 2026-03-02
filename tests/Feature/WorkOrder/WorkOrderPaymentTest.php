<?php

use App\Models\WorkOrder;
use App\Models\WorkOrderPayment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'work_order_payments.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_order_payments.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_order_payments.delete', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_order_payments.view',   'guard_name' => 'web']);
});

it('registra un pago correctamente', function () {
    $user  = UserHelper::makeSuperadmin();
    $order = WorkOrder::factory()->create(['total_amount' => 500]);

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.payments.store', $order), [
            'type'           => 'partial',
            'amount'         => 200,
            'payment_method' => 'efectivo',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('work_order_payments', [
        'work_order_id' => $order->id,
        'type'          => 'partial',
        'amount'        => 200,
    ]);
});

it('rechaza pago cuando el total de la orden es 0', function () {
    $user  = UserHelper::makeSuperadmin();
    $order = WorkOrder::factory()->create(['total_amount' => 0]);

    $response = $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.payments.store', $order), [
            'type'           => 'partial',
            'amount'         => 100,
            'payment_method' => 'efectivo',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseMissing('work_order_payments', [
        'work_order_id' => $order->id,
        'amount'        => 100,
    ]);
});

it('rechaza pago que excede el total restante', function () {
    $user  = UserHelper::makeSuperadmin();
    $order = WorkOrder::factory()->create(['total_amount' => 100]);

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.payments.store', $order), [
            'type'           => 'partial',
            'amount'         => 500,
            'payment_method' => 'efectivo',
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('work_order_payments', [
        'work_order_id' => $order->id,
        'amount'        => 500,
    ]);
});

it('elimina un pago correctamente', function () {
    $user    = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create(['total_amount' => 500]);
    $payment = WorkOrderPayment::factory()->create([
        'work_order_id'      => $order->id,
        'amount'             => 100,
        'is_initial_advance' => false,
    ]);

    $this->actingAs($user)
        ->delete(route('dashboard.services.work-orders.payments.destroy', [$order, $payment]))
        ->assertRedirect();

    $this->assertDatabaseMissing('work_order_payments', ['id' => $payment->id]);
});

it('al eliminar adelanto inicial, resetea advance_payment_amount', function () {
    $user    = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create([
        'total_amount'           => 500,
        'advance_payment_amount' => 150,
    ]);
    $payment = WorkOrderPayment::factory()->create([
        'work_order_id'      => $order->id,
        'type'               => 'advance',
        'is_initial_advance' => true,
        'amount'             => 150,
    ]);

    $this->actingAs($user)
        ->delete(route('dashboard.services.work-orders.payments.destroy', [$order, $payment]))
        ->assertRedirect();

    $this->assertDatabaseHas('work_orders', [
        'id'                     => $order->id,
        'advance_payment_amount' => '0.00',
    ]);
});

it('rechaza pago sin autenticación', function () {
    $order = WorkOrder::factory()->create(['total_amount' => 500]);

    $this->post(route('dashboard.services.work-orders.payments.store', $order), [
        'type'   => 'partial',
        'amount' => 100,
    ])->assertRedirect(route('login'));
});
