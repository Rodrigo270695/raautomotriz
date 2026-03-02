<?php

use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'work_orders.view', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_orders.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_orders.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_orders.delete', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'work_order_photos.view', 'guard_name' => 'web']);
});

it('requiere autenticación para ver el listado', function () {
    $this->get(route('dashboard.services.work-orders.index'))
        ->assertRedirect(route('login'));
});

it('muestra el listado paginado de órdenes', function () {
    $user = UserHelper::makeSuperadmin();

    $clientRole = Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);
    $client = User::factory()->create();
    $client->assignRole($clientRole);

    WorkOrder::factory()->count(15)->create([
        'client_id' => $client->id,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard.services.work-orders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('services/work-orders/index')
            ->has('workOrders.data', 10)
            ->has('workOrders.total')
            ->has('filters')
        );
});

it('filtra órdenes por estado', function () {
    $user = UserHelper::makeSuperadmin();

    $clientRole = Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);
    $client = User::factory()->create();
    $client->assignRole($clientRole);

    WorkOrder::factory()->count(3)->create(['status' => 'ingreso', 'client_id' => $client->id, 'created_by' => $user->id]);
    WorkOrder::factory()->count(2)->create(['status' => 'entregado', 'client_id' => $client->id, 'created_by' => $user->id]);

    $this->actingAs($user)
        ->get(route('dashboard.services.work-orders.index', ['filter_status' => 'ingreso']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('workOrders.data', 3)
            ->where('filters.filter_status', 'ingreso')
        );
});

it('rechaza usuarios sin permiso work_orders.view', function () {
    $role = Role::firstOrCreate(['name' => 'sin_permisos', 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole($role);

    $this->actingAs($user)
        ->get(route('dashboard.services.work-orders.index'))
        ->assertForbidden();
});
