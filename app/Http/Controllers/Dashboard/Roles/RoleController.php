<?php

namespace App\Http\Controllers\Dashboard\Roles;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Roles\RoleRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Role::query()->withCount('permissions');

        $search = $request->input('search');
        if ($search !== null && $search !== '') {
            $query->where('name', 'like', '%'.$search.'%');
        }

        $filterPermissions = $request->input('filter_permissions', 'all');
        if ($filterPermissions === 'with') {
            $query->having('permissions_count', '>', 0);
        } elseif ($filterPermissions === 'without') {
            $query->having('permissions_count', '=', 0);
        }

        $sortBy = $request->input('sort_by', 'name');
        $sortDir = $request->input('sort_dir', 'asc');
        if (in_array($sortBy, ['name', 'permissions_count'], true) && in_array($sortDir, ['asc', 'desc'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('name');
        }

        $roles = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $rolesWithoutPermissions = Role::query()
            ->withCount('permissions')
            ->having('permissions_count', '=', 0)
            ->count();

        $lastUpdated = Role::query()->latest('updated_at')->value('updated_at');
        $lastUpdatedFormatted = $lastUpdated ? Carbon::parse($lastUpdated)->diffForHumans() : null;

        $permissionsGrouped = [];
        if ($request->user()?->can('roles.update') || $request->user()?->can('permissions.view')) {
            $permissionsGrouped = self::buildPermissionsGrouped();
        }

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'per_page' => $request->input('per_page', 10),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
                'filter_permissions' => $filterPermissions,
            ],
            'rolesIndexPath' => parse_url(route('dashboard.roles.index'), PHP_URL_PATH) ?: '/dashboard/users/roles',
            'stats' => [
                'total_roles' => Role::count(),
                'total_permissions' => Permission::count(),
                'roles_without_permissions' => $rolesWithoutPermissions,
                'last_updated' => $lastUpdatedFormatted,
            ],
            'permissionsGrouped' => $permissionsGrouped,
            'can' => [
                'create' => $request->user()?->can('roles.create'),
                'update' => $request->user()?->can('roles.update'),
                'delete' => $request->user()?->can('roles.delete'),
                'view_permissions' => $request->user()?->can('permissions.view'),
                'assign_permissions' => $request->user()?->can('roles.update'),
            ],
        ]);
    }

    public function store(RoleRequest $request): RedirectResponse
    {
        Role::create([
            'name' => $request->validated('name'),
            'guard_name' => $request->validated('guard_name', 'web'),
        ]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Rol creado correctamente.']);
    }

    public function update(RoleRequest $request, Role $role): RedirectResponse
    {
        $role->update(['name' => $request->validated('name')]);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Rol actualizado correctamente.']);
    }

    public function destroy(Role $role): RedirectResponse
    {
        $role->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Rol eliminado correctamente.']);
    }

    /**
     * GET role permissions (grouped list + role's current permission names). For assign-permissions modal.
     */
    public function permissions(Role $role): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'permissions_grouped' => self::buildPermissionsGrouped(),
            'role_permission_names' => $role->getPermissionNames()->toArray(),
        ]);
    }

    /**
     * PUT sync permissions for a role.
     */
    public function updatePermissions(Request $request, Role $role): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'string',
        ]);
        $role->syncPermissions($request->input('permissions', []));

        if ($request->expectsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Permisos actualizados correctamente.']);
    }

    private static function buildPermissionsGrouped(): array
    {
        $permissionsGrouped = [];
        $all = Permission::query()->where('guard_name', 'web')->orderBy('name')->pluck('name');
        $excludePermissions = ['work_order_payments.update'];
        foreach ($all as $name) {
            if (in_array($name, $excludePermissions, true)) {
                continue;
            }
            $parts = explode('.', (string) $name, 2);
            $resource = $parts[0] ?? 'other';
            $action = $parts[1] ?? $name;
            if (! isset($permissionsGrouped[$resource])) {
                $permissionsGrouped[$resource] = [];
            }
            if (! in_array($action, $permissionsGrouped[$resource], true)) {
                $permissionsGrouped[$resource][] = $action;
            }
        }
        foreach (array_keys($permissionsGrouped) as $resource) {
            sort($permissionsGrouped[$resource]);
        }

        return $permissionsGrouped;
    }
}
