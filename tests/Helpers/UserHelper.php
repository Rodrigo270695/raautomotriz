<?php

namespace Tests\Helpers;

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserHelper
{
    /**
     * Crea un usuario superadmin con todos los permisos del sistema.
     */
    public static function makeSuperadmin(array $attributes = []): User
    {
        $role = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        return $user;
    }

    /**
     * Crea un usuario con los permisos específicos indicados.
     *
     * @param  string[]  $permissions
     */
    public static function makeUserWithPermissions(array $permissions, array $attributes = []): User
    {
        $role = Role::firstOrCreate(['name' => 'empleado_test_'.uniqid(), 'guard_name' => 'web']);
        foreach ($permissions as $permission) {
            $perm = Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
            $role->givePermissionTo($perm);
        }

        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        return $user;
    }
}
