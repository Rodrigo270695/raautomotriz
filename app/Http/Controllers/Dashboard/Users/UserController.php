<?php

namespace App\Http\Controllers\Dashboard\Users;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Users\UserRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::query()
            ->withCount('roles')
            ->with('roles:id,name')
            ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'cliente'));

        $search = $request->input('search');
        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', '%'.$search.'%')
                    ->orWhere('last_name', 'like', '%'.$search.'%')
                    ->orWhere('username', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('document_number', 'like', '%'.$search.'%');
            });
        }

        $filterStatus = $request->input('filter_status', 'all');
        if ($filterStatus === 'active') {
            $query->where('status', 'active');
        } elseif ($filterStatus === 'inactive') {
            $query->where('status', 'inactive');
        }

        $sortBy = $request->input('sort_by', 'first_name');
        $sortDir = $request->input('sort_dir', 'asc');
        $allowedSort = ['first_name', 'last_name', 'username', 'email', 'status', 'roles_count'];
        if (in_array($sortBy, $allowedSort, true) && in_array($sortDir, ['asc', 'desc'], true)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('first_name');
        }

        $users = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $baseQuery = User::query()->whereDoesntHave('roles', fn ($q) => $q->where('name', 'cliente'));
        $lastUpdated = (clone $baseQuery)->latest('updated_at')->value('updated_at');
        $lastUpdatedFormatted = $lastUpdated ? Carbon::parse($lastUpdated)->diffForHumans() : null;

        $rolesForSelect = Role::query()
            ->where('guard_name', 'web')
            ->where('name', '!=', 'cliente')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Role $r) => ['id' => $r->id, 'name' => $r->name]);

        $usersIndexPath = parse_url(route('dashboard.users.index'), PHP_URL_PATH) ?: '/dashboard/users';

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $rolesForSelect,
            'filters' => [
                'search' => $search,
                'per_page' => $request->input('per_page', 10),
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
                'filter_status' => $filterStatus,
            ],
            'usersIndexPath' => $usersIndexPath,
            'stats' => [
                'total_users' => (clone $baseQuery)->count(),
                'active_users' => (clone $baseQuery)->where('status', 'active')->count(),
                'last_updated' => $lastUpdatedFormatted,
            ],
            'can' => [
                'create' => $request->user()?->can('users.create'),
                'update' => $request->user()?->can('users.update'),
                'delete' => $request->user()?->can('users.delete'),
            ],
        ]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $user = User::create([
            'first_name' => $request->validated('first_name'),
            'last_name' => $request->validated('last_name'),
            'document_type' => $request->validated('document_type'),
            'document_number' => $request->validated('document_number'),
            'username' => $request->validated('username'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'status' => $request->validated('status'),
            'password' => $request->validated('password'),
        ]);

        if ($request->filled('role_id')) {
            $role = Role::find($request->validated('role_id'));
            if ($role) {
                $user->assignRole($role);
            }
        }

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Usuario creado correctamente.']);
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        if ($user->hasRole('superadmin')) {
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => 'No se puede editar el usuario superadmin.']);
        }

        $data = [
            'first_name' => $request->validated('first_name'),
            'last_name' => $request->validated('last_name'),
            'document_type' => $request->validated('document_type'),
            'document_number' => $request->validated('document_number'),
            'username' => $request->validated('username'),
            'email' => $request->validated('email'),
            'phone' => $request->validated('phone'),
            'status' => $request->validated('status'),
        ];
        if ($request->filled('password')) {
            $data['password'] = $request->validated('password');
        }
        $user->update($data);

        if ($request->has('role_id')) {
            if ($request->filled('role_id')) {
                $role = Role::find($request->validated('role_id'));
                $user->syncRoles($role ? [$role->name] : []);
            } else {
                $user->syncRoles([]);
            }
        }

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Usuario actualizado correctamente.']);
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->hasRole('superadmin')) {
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => 'No se puede eliminar el usuario superadmin.']);
        }

        if ($user->id === $request->user()?->id) {
            return redirect()->back()
                ->with('flash', ['type' => 'error', 'message' => 'No puede eliminar su propio usuario.']);
        }

        $user->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Usuario eliminado correctamente.']);
    }
}
