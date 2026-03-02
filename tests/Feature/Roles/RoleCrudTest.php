<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\Helpers\UserHelper;

uses(RefreshDatabase::class);

beforeEach(function () {
    Permission::firstOrCreate(['name' => 'roles.view',   'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'roles.create', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'roles.update', 'guard_name' => 'web']);
    Permission::firstOrCreate(['name' => 'roles.delete', 'guard_name' => 'web']);
});

it('muestra el índice de roles', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->get(route('dashboard.roles.index'))
        ->assertOk();
});

it('crea un rol correctamente', function () {
    $user = UserHelper::makeSuperadmin();

    $this->actingAs($user)
        ->post(route('dashboard.roles.store'), [
            'name'       => 'técnico',
            'guard_name' => 'web',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('roles', ['name' => 'técnico']);
});

it('actualiza un rol correctamente', function () {
    $user = UserHelper::makeSuperadmin();
    $role = Role::create(['name' => 'rol_viejo', 'guard_name' => 'web']);

    $this->actingAs($user)
        ->put(route('dashboard.roles.update', $role), [
            'name'       => 'rol_nuevo',
            'guard_name' => 'web',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('roles', ['id' => $role->id, 'name' => 'rol_nuevo']);
});

it('elimina un rol correctamente', function () {
    $user = UserHelper::makeSuperadmin();
    $role = Role::create(['name' => 'rol_eliminar', 'guard_name' => 'web']);

    $this->actingAs($user)
        ->delete(route('dashboard.roles.destroy', $role))
        ->assertRedirect();

    $this->assertDatabaseMissing('roles', ['id' => $role->id]);
});

it('actualiza los permisos de un rol', function () {
    $user = UserHelper::makeSuperadmin();
    $role = Role::create(['name' => 'rol_permisos', 'guard_name' => 'web']);
    $perm = Permission::firstOrCreate(['name' => 'test.perm', 'guard_name' => 'web']);

    $this->actingAs($user)
        ->put(route('dashboard.roles.permissions.update', $role), [
            'permissions' => [$perm->name],
        ])
        ->assertRedirect();

    expect($role->fresh()->hasPermissionTo('test.perm'))->toBeTrue();
});

it('rechaza crear rol sin permiso', function () {
    $user = UserHelper::makeUserWithPermissions(['roles.view']);

    $this->actingAs($user)
        ->post(route('dashboard.roles.store'), [
            'name'       => 'nuevo_rol',
            'guard_name' => 'web',
        ])
        ->assertForbidden();
});
