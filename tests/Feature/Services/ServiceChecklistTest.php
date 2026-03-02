<?php

use App\Models\ServiceChecklist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'service_checklists.view',   'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'service_checklists.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'service_checklists.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'service_checklists.delete', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'service_checklists.reorder','guard_name' => 'web']);
});

it('muestra el índice de checklists', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->get(route('dashboard.services.checklists.index'))
        ->assertOk();
});

it('crea un checklist correctamente', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->post(route('dashboard.services.checklists.store'), [
            'order_number' => 1,
            'name'         => 'REVISION DE FRENOS',
            'description'  => 'Revisar frenos delanteros y traseros',
            'status'       => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('service_checklists', [
        'name'   => 'REVISION DE FRENOS',
        'status' => 'active',
    ]);
});

it('actualiza un checklist correctamente', function () {
    $user      = UserHelper::makeSuperadmin();
    $checklist = ServiceChecklist::factory()->create(['name' => 'VIEJO NOMBRE', 'order_number' => 1]);

    $this->actingAs($user)
        ->put(route('dashboard.services.checklists.update', $checklist), [
            'order_number' => 1,
            'name'         => 'NUEVO NOMBRE',
            'status'       => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('service_checklists', [
        'id'   => $checklist->id,
        'name' => 'NUEVO NOMBRE',
    ]);
});

it('inactiva un checklist y quita el order_number', function () {
    $user      = UserHelper::makeSuperadmin();
    $checklist = ServiceChecklist::factory()->create(['status' => 'active', 'order_number' => 5]);

    $this->actingAs($user)
        ->put(route('dashboard.services.checklists.update', $checklist), [
            'name'   => $checklist->name,
            'status' => 'inactive',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('service_checklists', [
        'id'           => $checklist->id,
        'status'       => 'inactive',
        'order_number' => null,
    ]);
});

it('elimina un checklist correctamente', function () {
    $user      = UserHelper::makeSuperadmin();
    $checklist = ServiceChecklist::factory()->create();

    $this->actingAs($user)
        ->delete(route('dashboard.services.checklists.destroy', $checklist))
        ->assertRedirect();

    $this->assertDatabaseMissing('service_checklists', ['id' => $checklist->id]);
});

it('invalida la caché al actualizar checklist', function () {
    $user      = UserHelper::makeSuperadmin();
    $checklist = ServiceChecklist::factory()->create(['order_number' => 1]);
    Cache::put('service_checklists_active', 'cached_value', 300);

    $this->actingAs($user)
        ->put(route('dashboard.services.checklists.update', $checklist), [
            'order_number' => 1,
            'name'         => 'NOMBRE NUEVO',
            'status'       => 'active',
        ]);

    expect(Cache::has('service_checklists_active'))->toBeFalse();
});

it('rechaza crear checklist sin permiso', function () {
    $user = UserHelper::makeUserWithPermissions(['service_checklists.view']);

    $this->actingAs($user)
        ->post(route('dashboard.services.checklists.store'), [
            'name'   => 'TEST',
            'status' => 'active',
        ])
        ->assertForbidden();
});
