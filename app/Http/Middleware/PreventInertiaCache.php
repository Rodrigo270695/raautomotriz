<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Evita que el navegador cachee respuestas de páginas Inertia,
 * para que al navegar (ej. de Marcas a Vehículos) siempre se obtengan datos actualizados
 * (marcas, modelos, clientes activos, etc.).
 */
class PreventInertiaCache
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->header('X-Inertia')) {
            $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
        }

        return $response;
    }
}
