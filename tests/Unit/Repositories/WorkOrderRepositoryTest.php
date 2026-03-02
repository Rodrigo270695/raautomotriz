<?php

use App\Models\User;
use App\Models\WorkOrder;
use App\Repositories\WorkOrderRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

function makeClientUser(): User
{
    $role = Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

it('pagina las órdenes correctamente', function () {
    $client = makeClientUser();
    $creator = User::factory()->create();
    WorkOrder::factory()->count(25)->create(['client_id' => $client->id, 'created_by' => $creator->id]);

    $repo = new WorkOrderRepository;
    $request = Request::create('/', 'GET', ['per_page' => 10]);

    $result = $repo->paginatedList($request);

    expect($result->count())->toBe(10);
    expect($result->total())->toBe(25);
});

it('filtra por estado', function () {
    $client = makeClientUser();
    $creator = User::factory()->create();
    WorkOrder::factory()->count(4)->create(['status' => 'ingreso', 'client_id' => $client->id, 'created_by' => $creator->id]);
    WorkOrder::factory()->count(2)->create(['status' => 'entregado', 'client_id' => $client->id, 'created_by' => $creator->id]);

    $repo = new WorkOrderRepository;
    $request = Request::create('/', 'GET', ['filter_status' => 'ingreso', 'per_page' => 50]);

    $result = $repo->paginatedList($request);

    expect($result->total())->toBe(4);
});

it('retorna los filtros del request', function () {
    $repo = new WorkOrderRepository;
    $request = Request::create('/', 'GET', [
        'search' => 'ABC123',
        'filter_status' => 'en_reparacion',
        'sort_by' => 'id',
        'sort_dir' => 'asc',
        'per_page' => 20,
        'date_from' => '2025-01-01',
        'date_to' => '2025-12-31',
    ]);

    $filters = $repo->getFiltersFromRequest($request);

    expect($filters['search'])->toBe('ABC123');
    expect($filters['filter_status'])->toBe('en_reparacion');
    expect($filters['sort_by'])->toBe('id');
    expect($filters['per_page'])->toBe(20);
});
