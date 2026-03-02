<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'users.view',   'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'users.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'users.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'users.delete', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'empleado', 'guard_name' => 'web']);
});

it('muestra el índice de usuarios', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->get(route('dashboard.users.index'))
        ->assertOk();
});

it('redirige invitados al índice de usuarios', function () {
    $this->get(route('dashboard.users.index'))
        ->assertRedirect(route('login'));
});

it('crea un usuario con rol correctamente', function () {
    $admin    = UserHelper::makeSuperadmin();
    $empleado = Role::where('name', 'empleado')->first();

    $this->actingAs($admin)
        ->post(route('dashboard.users.store'), [
            'first_name'            => 'Juan',
            'last_name'             => 'Mecánico',
            'document_type'         => 'dni',
            'document_number'       => '55667788',
            'username'              => 'juan.mecanico',
            'phone'                 => '912345678',
            'status'                => 'active',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role_id'               => $empleado->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'first_name'      => 'Juan',
        'document_number' => '55667788',
    ]);
});

it('actualiza un usuario correctamente', function () {
    $admin    = UserHelper::makeSuperadmin();
    $empleado = Role::where('name', 'empleado')->first();
    $target   = User::factory()->create([
        'first_name'      => 'Pedro',
        'document_type'   => 'dni',
        'document_number' => '33445566',
        'username'        => 'pedro.test',
    ]);
    $target->assignRole($empleado);

    $this->actingAs($admin)
        ->put(route('dashboard.users.update', $target), [
            'first_name'      => 'Pablo',
            'last_name'       => $target->last_name,
            'document_type'   => 'dni',
            'document_number' => '33445566',
            'username'        => 'pablo.test',
            'phone'           => '987654321',
            'status'          => 'active',
            'role_id'         => $empleado->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', ['id' => $target->id, 'first_name' => 'Pablo']);
});

it('elimina un usuario correctamente', function () {
    $admin  = UserHelper::makeSuperadmin();
    $target = User::factory()->create();

    $this->actingAs($admin)
        ->delete(route('dashboard.users.destroy', $target))
        ->assertRedirect();

    $this->assertDatabaseMissing('users', ['id' => $target->id]);
});

it('no puede eliminarse a sí mismo', function () {
    $admin = UserHelper::makeSuperadmin();

    $this->actingAs($admin)
        ->delete(route('dashboard.users.destroy', $admin))
        ->assertRedirect();

    $this->assertDatabaseHas('users', ['id' => $admin->id]);
});

it('rechaza crear usuario sin permiso', function () {
    $user = UserHelper::makeUserWithPermissions(['users.view']);

    $this->actingAs($user)
        ->post(route('dashboard.users.store'), [
            'first_name' => 'Nuevo',
        ])
        ->assertForbidden();
});
