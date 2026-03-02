<?php

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleModel;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'work_orders.view', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'dashboard.view', 'guard_name' => 'web']);
});

it('muestra la orden al creador', function () {
    $creator = UserHelper::makeSuperadmin();
    $order = WorkOrder::factory()->create(['created_by' => $creator->id]);

    $this->actingAs($creator)
        ->get(route('dashboard.services.work-orders.show', $order))
        ->assertOk();
});

it('prohíbe ver la orden a usuario que no es el creador', function () {
    $creator = UserHelper::makeSuperadmin();
    $other   = UserHelper::makeUserWithPermissions(['work_orders.view']);
    $order   = WorkOrder::factory()->create(['created_by' => $creator->id]);

    $this->actingAs($other)
        ->get(route('dashboard.services.work-orders.show', $order))
        ->assertForbidden();
});

it('redirige a invitados al intentar ver una orden', function () {
    $order = WorkOrder::factory()->create();

    $this->get(route('dashboard.services.work-orders.show', $order))
        ->assertRedirect(route('login'));
});

it('superadmin puede ver cualquier orden', function () {
    $creator = UserHelper::makeSuperadmin();
    $admin   = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create(['created_by' => $creator->id]);

    $this->actingAs($admin)
        ->get(route('dashboard.services.work-orders.show', $order))
        ->assertOk();
});

it('muestra la pestaña config al creador', function () {
    $creator = UserHelper::makeSuperadmin();
    $order   = WorkOrder::factory()->create(['created_by' => $creator->id]);

    $this->actingAs($creator)
        ->get(route('dashboard.services.work-orders.config', $order))
        ->assertOk();
});

it('prohíbe ver config a usuario que no es el creador', function () {
    $creator = UserHelper::makeSuperadmin();
    $other   = UserHelper::makeUserWithPermissions(['work_orders.view']);
    $order   = WorkOrder::factory()->create(['created_by' => $creator->id]);

    $this->actingAs($other)
        ->get(route('dashboard.services.work-orders.config', $order))
        ->assertForbidden();
});
