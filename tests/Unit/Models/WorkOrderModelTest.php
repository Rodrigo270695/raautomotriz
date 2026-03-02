<?php

use App\Models\WorkOrder;
use App\Models\WorkOrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('recalcula el total desde los servicios', function () {
    $order = WorkOrder::factory()->create(['total_amount' => 0]);

    WorkOrderService::factory()->create([
        'work_order_id' => $order->id,
        'quantity'      => 2,
        'unit_price'    => 100,
        'subtotal'      => 200,
    ]);

    WorkOrderService::factory()->create([
        'work_order_id' => $order->id,
        'quantity'      => 1,
        'unit_price'    => 50,
        'subtotal'      => 50,
    ]);

    $order->recalcTotalFromServices();

    expect((float) $order->fresh()->total_amount)->toBe(250.0);
});

it('recalcula a 0 cuando no hay servicios', function () {
    $order = WorkOrder::factory()->create(['total_amount' => 500]);

    $order->recalcTotalFromServices();

    expect((float) $order->fresh()->total_amount)->toBe(0.0);
});

it('tiene relación con vehicle', function () {
    $order = WorkOrder::factory()->create();

    expect($order->vehicle)->not->toBeNull();
    expect($order->vehicle->id)->toBe($order->vehicle_id);
});

it('tiene relación con client', function () {
    $order = WorkOrder::factory()->create();

    expect($order->client)->not->toBeNull();
    expect($order->client->id)->toBe($order->client_id);
});

it('tiene relación con services', function () {
    $order = WorkOrder::factory()->create();
    WorkOrderService::factory()->count(3)->create(['work_order_id' => $order->id]);

    expect($order->services)->toHaveCount(3);
});

it('tiene relación con payments', function () {
    $order = WorkOrder::factory()->create(['total_amount' => 500]);
    $order->payments()->create([
        'type'           => 'partial',
        'is_initial_advance' => false,
        'amount'         => 100,
        'payment_method' => 'efectivo',
        'paid_at'        => now(),
    ]);

    expect($order->payments)->toHaveCount(1);
});

it('los casts de decimales funcionan correctamente', function () {
    $order = WorkOrder::factory()->create([
        'total_amount'           => 150.5,
        'advance_payment_amount' => 50.25,
    ]);

    expect((float) $order->total_amount)->toBe(150.5);
    expect((float) $order->advance_payment_amount)->toBe(50.25);
});

it('entry_date se castea a fecha', function () {
    $order = WorkOrder::factory()->create(['entry_date' => '2024-06-15']);

    expect($order->entry_date)->toBeInstanceOf(\DateTimeInterface::class);
    expect($order->entry_date->format('Y-m-d'))->toBe('2024-06-15');
});
