<?php

use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'work_orders.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_orders.delete', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_orders.view',   'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_orders.create', 'guard_name' => 'web']);
});

it('actualiza una orden correctamente', function () {
    $creator = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create([
        'created_by' => $creator->id,
        'status'     => 'ingreso',
    ]);

    $this->actingAs($creator)
        ->put(route('dashboard.services.work-orders.update', $order), [
            'vehicle_id' => $order->vehicle_id,
            'client_id'  => $order->client_id,
            'entry_date' => now()->format('Y-m-d'),
            'entry_time' => '10:30',
            'status'     => 'diagnosticado',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('work_orders', [
        'id'     => $order->id,
        'status' => 'diagnosticado',
    ]);
});

it('prohíbe actualizar una orden a quien no es el creador', function () {
    $creator = UserHelper::makeSuperadmin();
    $other   = UserHelper::makeUserWithPermissions(['work_orders.update']);
    $order   = WorkOrder::factory()->create(['created_by' => $creator->id]);

    $this->actingAs($other)
        ->put(route('dashboard.services.work-orders.update', $order), [
            'vehicle_id' => $order->vehicle_id,
            'client_id'  => $order->client_id,
            'entry_date' => now()->format('Y-m-d'),
            'entry_time' => '10:00',
            'status'     => 'diagnosticado',
        ])
        ->assertForbidden();
});

it('superadmin puede actualizar cualquier orden', function () {
    $creator = UserHelper::makeSuperadmin();
    $admin   = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create(['created_by' => $creator->id]);

    $this->actingAs($admin)
        ->put(route('dashboard.services.work-orders.update', $order), [
            'vehicle_id' => $order->vehicle_id,
            'client_id'  => $order->client_id,
            'entry_date' => now()->format('Y-m-d'),
            'entry_time' => '08:00',
            'status'     => 'en_reparacion',
        ])
        ->assertRedirect();
});

it('elimina una orden correctamente', function () {
    $creator = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create(['created_by' => $creator->id]);

    $this->actingAs($creator)
        ->delete(route('dashboard.services.work-orders.destroy', $order))
        ->assertRedirect(route('dashboard.services.work-orders.index'));

    $this->assertDatabaseMissing('work_orders', ['id' => $order->id]);
});

it('prohíbe eliminar una orden a quien no es el creador ni superadmin', function () {
    $creator = UserHelper::makeSuperadmin();
    $other   = UserHelper::makeUserWithPermissions(['work_orders.delete']);
    $order   = WorkOrder::factory()->create(['created_by' => $creator->id]);

    $this->actingAs($other)
        ->delete(route('dashboard.services.work-orders.destroy', $order))
        ->assertForbidden();
});

it('superadmin puede eliminar cualquier orden', function () {
    $creator = UserHelper::makeSuperadmin();
    $admin   = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create(['created_by' => $creator->id]);

    $this->actingAs($admin)
        ->delete(route('dashboard.services.work-orders.destroy', $order))
        ->assertRedirect();

    $this->assertDatabaseMissing('work_orders', ['id' => $order->id]);
});

it('actualización crea pago de adelanto si no existía', function () {
    $creator = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create([
        'created_by'               => $creator->id,
        'advance_payment_amount'   => 0,
    ]);

    $this->actingAs($creator)
        ->put(route('dashboard.services.work-orders.update', $order), [
            'vehicle_id'              => $order->vehicle_id,
            'client_id'               => $order->client_id,
            'entry_date'              => now()->format('Y-m-d'),
            'entry_time'              => '09:00',
            'status'                  => 'ingreso',
            'advance_payment_amount'  => 200,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('work_order_payments', [
        'work_order_id'      => $order->id,
        'type'               => 'advance',
        'is_initial_advance' => true,
        'amount'             => 200,
    ]);
});
