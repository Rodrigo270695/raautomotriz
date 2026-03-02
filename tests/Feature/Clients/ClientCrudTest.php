<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'clients.view',   'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'clients.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'clients.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'clients.delete', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'cliente', 'guard_name' => 'web']);
});

it('muestra el índice de clientes', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->get(route('dashboard.clients.index'))
        ->assertOk();
});

it('redirige invitados al índice de clientes', function () {
    $this->get(route('dashboard.clients.index'))
        ->assertRedirect(route('login'));
});

it('crea un cliente correctamente', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->post(route('dashboard.clients.store'), [
            'first_name'            => 'Carlos',
            'last_name'             => 'Gutiérrez',
            'document_type'         => 'dni',
            'document_number'       => '45678901',
            'email'                 => 'carlos.gutierrez@example.com',
            'phone'                 => '987654321',
            'status'                => 'active',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'first_name'      => 'Carlos',
        'last_name'       => 'Gutiérrez',
        'document_number' => '45678901',
    ]);
});

it('rechaza crear cliente con DNI inválido', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->post(route('dashboard.clients.store'), [
            'first_name'      => 'Test',
            'last_name'       => 'User',
            'document_type'   => 'dni',
            'document_number' => '123',
            'phone'           => '987654321',
            'status'          => 'active',
            'password'        => 'Password123!',
        ])
        ->assertSessionHasErrors('document_number');
});

it('rechaza crear cliente con teléfono inválido', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->post(route('dashboard.clients.store'), [
            'first_name'      => 'Test',
            'last_name'       => 'User',
            'document_type'   => 'dni',
            'document_number' => '12345678',
            'phone'           => '123456789',
            'status'          => 'active',
            'password'        => 'Password123!',
        ])
        ->assertSessionHasErrors('phone');
});

it('actualiza un cliente correctamente', function () {
    $user   = UserHelper::makeSuperadmin();
    $client = User::factory()->create([
        'first_name'      => 'Antiguo',
        'last_name'       => 'Nombre',
        'document_type'   => 'dni',
        'document_number' => '45678901',
        'email'           => 'cliente.original@example.com',
    ]);
    $clientRole = Role::where('name', 'cliente')->first();
    $client->assignRole($clientRole);

    $this->actingAs($user)
        ->put(route('dashboard.clients.update', $client), [
            'first_name'      => 'Nuevo',
            'last_name'       => 'Nombre',
            'document_type'   => 'dni',
            'document_number' => '45678901',
            'email'           => 'cliente.original@example.com',
            'phone'           => '987654321',
            'status'          => 'active',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id'         => $client->id,
        'first_name' => 'Nuevo',
    ]);
});

it('elimina un cliente correctamente', function () {
    $admin  = UserHelper::makeSuperadmin();
    $client = User::factory()->create();
    $clientRole = Role::where('name', 'cliente')->first();
    $client->assignRole($clientRole);

    $this->actingAs($admin)
        ->delete(route('dashboard.clients.destroy', $client))
        ->assertRedirect();

    $this->assertDatabaseMissing('users', ['id' => $client->id]);
});

it('rechaza crear cliente sin permiso', function () {
    $user = UserHelper::makeUserWithPermissions(['clients.view']);

    $this->actingAs($user)
        ->post(route('dashboard.clients.store'), [
            'first_name' => 'Test',
        ])
        ->assertForbidden();
});
