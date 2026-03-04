<?php

namespace App\Providers;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureSuperadminGate();
    }

    /**
     * Abilities that superadmin does NOT bypass; they are checked against the role's assigned permissions.
     * Use this for sensitive permissions (e.g. financial) so revoking them for superadmin takes effect.
     */
    protected const SUPERADMIN_RESPECT_ABILITIES = [
        'dashboard.view_financial',
    ];

    /**
     * Superadmin bypasses all Gate/permission checks, except those in SUPERADMIN_RESPECT_ABILITIES.
     */
    protected function configureSuperadminGate(): void
    {
        Gate::before(function (User $user, string $ability) {
            if (! $user->hasRole('superadmin')) {
                return null;
            }
            if (in_array($ability, self::SUPERADMIN_RESPECT_ABILITIES, true)) {
                return null; // let Spatie check the role's actual permissions
            }
            return true;
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }
}
