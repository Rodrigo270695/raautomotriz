<?php

use App\Models\WorkOrder;
use App\Models\WorkOrderDiagnosis;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'work_order_diagnoses.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_order_diagnoses.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_order_diagnoses.delete', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_orders.view',            'guard_name' => 'web']);
});

it('crea un diagnóstico correctamente', function () {
    $user  = UserHelper::makeSuperadmin();
    $order = WorkOrder::factory()->create(['status' => 'ingreso']);

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.diagnoses.store', $order), [
            'diagnosis_text' => 'Falla en el motor de arranque',
            'diagnosed_at'   => now()->format('Y-m-d H:i:s'),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('work_order_diagnoses', [
        'work_order_id'  => $order->id,
        'diagnosis_text' => 'Falla en el motor de arranque',
    ]);
});

it('el primer diagnóstico cambia el status de la orden a diagnosticado', function () {
    $user  = UserHelper::makeSuperadmin();
    $order = WorkOrder::factory()->create(['status' => 'ingreso']);

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.diagnoses.store', $order), [
            'diagnosis_text' => 'Motor en mal estado',
            'diagnosed_at'   => now()->format('Y-m-d H:i:s'),
        ]);

    $this->assertDatabaseHas('work_orders', [
        'id'     => $order->id,
        'status' => 'diagnosticado',
    ]);
});

it('el segundo diagnóstico no cambia el status', function () {
    $user  = UserHelper::makeSuperadmin();
    $order = WorkOrder::factory()->create(['status' => 'en_reparacion']);

    WorkOrderDiagnosis::factory()->create([
        'work_order_id' => $order->id,
        'diagnosed_by'  => $user->id,
    ]);

    $this->actingAs($user)
        ->post(route('dashboard.services.work-orders.diagnoses.store', $order), [
            'diagnosis_text' => 'Diagnóstico adicional',
            'diagnosed_at'   => now()->format('Y-m-d H:i:s'),
        ]);

    $this->assertDatabaseHas('work_orders', [
        'id'     => $order->id,
        'status' => 'en_reparacion',
    ]);
});

it('actualiza un diagnóstico correctamente', function () {
    $user  = UserHelper::makeSuperadmin();
    $order = WorkOrder::factory()->create();
    $diag  = WorkOrderDiagnosis::factory()->create([
        'work_order_id' => $order->id,
        'diagnosed_by'  => $user->id,
    ]);

    $this->actingAs($user)
        ->put(route('dashboard.services.work-orders.diagnoses.update', [$order, $diag]), [
            'diagnosis_text' => 'Diagnóstico actualizado',
            'diagnosed_at'   => now()->format('Y-m-d H:i:s'),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('work_order_diagnoses', [
        'id'             => $diag->id,
        'diagnosis_text' => 'Diagnóstico actualizado',
    ]);
});

it('prohíbe actualizar el diagnóstico de otro usuario', function () {
    $owner = UserHelper::makeSuperadmin();
    $other = UserHelper::makeUserWithPermissions(['work_order_diagnoses.update']);
    $order = WorkOrder::factory()->create();
    $diag  = WorkOrderDiagnosis::factory()->create([
        'work_order_id' => $order->id,
        'diagnosed_by'  => $owner->id,
    ]);

    $this->actingAs($other)
        ->put(route('dashboard.services.work-orders.diagnoses.update', [$order, $diag]), [
            'diagnosis_text' => 'Intento no autorizado',
            'diagnosed_at'   => now()->format('Y-m-d H:i:s'),
        ])
        ->assertForbidden();
});

it('elimina un diagnóstico correctamente', function () {
    $user  = UserHelper::makeSuperadmin();
    $order = WorkOrder::factory()->create();
    $diag  = WorkOrderDiagnosis::factory()->create([
        'work_order_id' => $order->id,
        'diagnosed_by'  => $user->id,
    ]);

    $this->actingAs($user)
        ->delete(route('dashboard.services.work-orders.diagnoses.destroy', [$order, $diag]))
        ->assertRedirect();

    $this->assertDatabaseMissing('work_order_diagnoses', ['id' => $diag->id]);
});

it('prohíbe eliminar diagnóstico de otro usuario sin ser superadmin', function () {
    $owner = UserHelper::makeSuperadmin();
    $other = UserHelper::makeUserWithPermissions(['work_order_diagnoses.delete']);
    $order = WorkOrder::factory()->create();
    $diag  = WorkOrderDiagnosis::factory()->create([
        'work_order_id' => $order->id,
        'diagnosed_by'  => $owner->id,
    ]);

    $this->actingAs($other)
        ->delete(route('dashboard.services.work-orders.diagnoses.destroy', [$order, $diag]))
        ->assertForbidden();
});
