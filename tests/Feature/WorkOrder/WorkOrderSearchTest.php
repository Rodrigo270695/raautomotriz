<?php

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'work_orders.view', 'guard_name' => 'web']);
});

function makeSearchClientUser(string $firstName, string $lastName, string $doc): User
{
    $clientRole = Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);
    $user = User::factory()->create([
        'first_name'      => $firstName,
        'last_name'       => $lastName,
        'document_number' => $doc,
    ]);
    $user->assignRole($clientRole);

    return $user;
}

it('busca clientes por nombre', function () {
    $user = UserHelper::makeSuperadmin();
    makeSearchClientUser('Juan', 'Pérez', '12345678');
    makeSearchClientUser('María', 'López', '87654321');

    $response = $this->actingAs($user)
        ->getJson(route('dashboard.services.work-orders.search-clients', ['q' => 'Juan']))
        ->assertOk()
        ->assertJsonCount(1);

    expect($response->json('0.first_name'))->toBe('Juan');
});

it('retorna todos los clientes sin query', function () {
    $user = UserHelper::makeSuperadmin();
    makeSearchClientUser('Cliente', 'Uno', '11111111');
    makeSearchClientUser('Cliente', 'Dos', '22222222');
    makeSearchClientUser('Cliente', 'Tres', '33333333');

    $this->actingAs($user)
        ->getJson(route('dashboard.services.work-orders.search-clients'))
        ->assertOk()
        ->assertJsonCount(3);
});

it('busca vehículos por placa', function () {
    $user = UserHelper::makeSuperadmin();
    Vehicle::factory()->create(['plate' => 'ABC-123']);
    Vehicle::factory()->create(['plate' => 'XYZ-999']);

    $this->actingAs($user)
        ->getJson(route('dashboard.services.work-orders.search-vehicles', ['q' => 'ABC']))
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonFragment(['plate' => 'ABC-123']);
});

it('filtra vehículos por client_id', function () {
    $user    = UserHelper::makeSuperadmin();
    $client  = User::factory()->create();
    $vehicle = Vehicle::factory()->create(['client_id' => $client->id]);
    Vehicle::factory()->create();

    $this->actingAs($user)
        ->getJson(route('dashboard.services.work-orders.search-vehicles', ['client_id' => $client->id]))
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonFragment(['plate' => $vehicle->plate]);
});

it('requiere autenticación para buscar clientes', function () {
    $this->getJson(route('dashboard.services.work-orders.search-clients'))
        ->assertUnauthorized();
});
