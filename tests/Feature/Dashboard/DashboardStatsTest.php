<?php

use App\Models\Product;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderPayment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'dashboard.view', 'guard_name' => 'web']);
});

it('redirige invitados al login', function () {
    $this->get(route('dashboard.index'))->assertRedirect(route('login'));
});

it('permite acceso al superadmin', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->get(route('dashboard.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard')->has('stats'));
});

it('devuelve los KPIs correctos', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->get(route('dashboard.index'))
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('stats.activeOrders')
            ->has('stats.revenueThisMonth')
            ->has('stats.totalClients')
            ->has('stats.statusDistribution')
            ->has('stats.recentOrders')
            ->has('stats.lowStockProducts')
        );
});

it('cuenta correctamente las órdenes activas', function () {
    $superadmin = UserHelper::makeSuperadmin();

    Permission::firstOrCreate(['name' => 'work_orders.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'clients.view', 'guard_name' => 'web']);

    $clientRole = Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);
    $client = User::factory()->create();
    $client->assignRole($clientRole);

    WorkOrder::factory()->count(3)->create([
        'status' => 'en_reparacion',
        'client_id' => $client->id,
        'created_by' => $superadmin->id,
    ]);

    WorkOrder::factory()->count(2)->create([
        'status' => 'entregado',
        'client_id' => $client->id,
        'created_by' => $superadmin->id,
    ]);

    \Illuminate\Support\Facades\Cache::flush();

    $this->actingAs($superadmin)
        ->get(route('dashboard.index'))
        ->assertInertia(fn ($page) => $page
            ->where('stats.activeOrders', 3)
        );
});

it('detecta productos con stock bajo', function () {
    $user = UserHelper::makeSuperadmin();

    $brand = \App\Models\InventoryBrand::factory()->create();
    Product::factory()->count(2)->create(['status' => 'active', 'stock' => 0, 'inventory_brand_id' => $brand->id]);
    Product::factory()->count(1)->create(['status' => 'active', 'stock' => 100, 'inventory_brand_id' => $brand->id]);

    \Illuminate\Support\Facades\Cache::flush();

    $this->actingAs($user)
        ->get(route('dashboard.index'))
        ->assertInertia(fn ($page) => $page
            ->where('stats.lowStockProducts.0.stock', 0)
        );
});
