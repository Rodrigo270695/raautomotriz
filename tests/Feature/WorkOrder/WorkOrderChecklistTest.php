<?php

use App\Models\ServiceChecklist;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use App\Jobs\SendChecklistNotificationJob;
use Spatie\Permission\Models\Permission;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'work_order_checklist_results.update', 'guard_name' => 'web']);
    Queue::fake();
});

it('guarda los resultados del checklist correctamente', function () {
    $user      = UserHelper::makeSuperadmin();
    $order     = WorkOrder::factory()->create(['status' => 'ingreso']);
    $checklist = ServiceChecklist::factory()->create();

    $this->actingAs($user)
        ->put(route('dashboard.services.work-orders.checklist-results.update', $order), [
            'results' => [
                [
                    'service_checklist_id' => $checklist->id,
                    'checked'              => true,
                    'note'                 => 'Todo bien',
                ],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('work_order_checklist_results', [
        'work_order_id'        => $order->id,
        'service_checklist_id' => $checklist->id,
        'checked'              => true,
    ]);
});

it('el primer guardado cambia el status a en_checklist', function () {
    $user      = UserHelper::makeSuperadmin();
    $order     = WorkOrder::factory()->create(['status' => 'ingreso']);
    $checklist = ServiceChecklist::factory()->create();

    $this->actingAs($user)
        ->put(route('dashboard.services.work-orders.checklist-results.update', $order), [
            'results' => [
                ['service_checklist_id' => $checklist->id, 'checked' => false, 'note' => null],
            ],
        ]);

    $this->assertDatabaseHas('work_orders', [
        'id'     => $order->id,
        'status' => 'en_checklist',
    ]);
});

it('despacha el job de notificación de checklist', function () {
    $user      = UserHelper::makeSuperadmin();
    $order     = WorkOrder::factory()->create();
    $checklist = ServiceChecklist::factory()->create();

    $this->actingAs($user)
        ->put(route('dashboard.services.work-orders.checklist-results.update', $order), [
            'results' => [
                ['service_checklist_id' => $checklist->id, 'checked' => true, 'note' => null],
            ],
        ]);

    Queue::assertPushed(SendChecklistNotificationJob::class);
});

it('el segundo guardado no cambia el status', function () {
    $user      = UserHelper::makeSuperadmin();
    $order     = WorkOrder::factory()->create(['status' => 'en_reparacion']);
    $checklist = ServiceChecklist::factory()->create();

    // Ya existe un resultado previo
    $order->checklistResults()->create([
        'service_checklist_id' => $checklist->id,
        'checked'              => false,
        'completed_by'         => $user->id,
        'completed_at'         => now(),
    ]);

    $this->actingAs($user)
        ->put(route('dashboard.services.work-orders.checklist-results.update', $order), [
            'results' => [
                ['service_checklist_id' => $checklist->id, 'checked' => true, 'note' => null],
            ],
        ]);

    $this->assertDatabaseHas('work_orders', [
        'id'     => $order->id,
        'status' => 'en_reparacion',
    ]);
});

it('rechaza actualización sin permiso', function () {
    $order     = WorkOrder::factory()->create();
    $checklist = ServiceChecklist::factory()->create();
    $user      = \App\Models\User::factory()->create();
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'sin_permisos_cl', 'guard_name' => 'web']);
    $role = \Spatie\Permission\Models\Role::where('name', 'sin_permisos_cl')->first();
    $user->assignRole($role);

    $this->actingAs($user)
        ->put(route('dashboard.services.work-orders.checklist-results.update', $order), [
            'results' => [
                ['service_checklist_id' => $checklist->id, 'checked' => true, 'note' => null],
            ],
        ])
        ->assertForbidden();
});
