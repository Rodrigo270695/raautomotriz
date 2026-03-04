<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * @param Request $request
     */
    public function toResponse($request)
    {
        $user = $request->user();

        // Por defecto, panel de control
        $home = '/dashboard';

        // Si el usuario es cliente, redirigir a la página principal pública
        if ($user && $user->hasRole('cliente')) {
            $home = '/';
        }

        return $request->wantsJson()
            ? response()->json(['two_factor' => false, 'redirect' => $home])
            : redirect()->intended($home);
    }
}

