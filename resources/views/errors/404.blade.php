<!DOCTYPE html>
<html lang="es" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 — Página no encontrada | RA Automotriz</title>
    @vite('resources/css/app.css')
</head>
<body class="h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
    <div class="min-h-screen flex flex-col items-center justify-center px-4">
        <div class="flex flex-col items-center gap-6 max-w-lg text-center">
            <img src="/logorasf.png" alt="RA Automotriz" class="h-20 w-auto drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]">

            <div class="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 border border-slate-700/70 text-xs font-semibold tracking-wide uppercase text-slate-300">
                <span class="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Código de error 404</span>
            </div>

            <div class="space-y-2">
                <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight">
                    Parece que esta ruta está <span class="text-rose-400">fuera de servicio</span>.
                </h1>
                <p class="text-sm sm:text-base text-slate-300/80">
                    La página que buscas no existe, fue movida o nunca estuvo disponible.
                    Vuelve al panel o al inicio del taller para seguir trabajando.
                </p>
            </div>

            <div class="flex flex-wrap items-center justify-center gap-3 mt-2">
                <a href="{{ route('dashboard.index') ?? url('/dashboard') }}"
                   class="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-900/40 hover:bg-rose-500 transition-colors">
                    <span>Ir al panel de control</span>
                </a>
                <a href="{{ url('/') }}"
                   class="inline-flex items-center gap-2 rounded-full border border-slate-600/80 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80 transition-colors">
                    Ir al inicio del sitio
                </a>
            </div>

            <div class="mt-8 grid gap-3 text-left text-xs sm:text-sm text-slate-400/80">
                <p class="flex items-center gap-2">
                    <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 border border-slate-700/70 text-[0.7rem] font-semibold text-slate-200">
                        01
                    </span>
                    Verifica que la URL esté bien escrita.
                </p>
                <p class="flex items-center gap-2">
                    <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/80 border border-slate-700/70 text-[0.7rem] font-semibold text-slate-200">
                        02
                    </span>
                    Si llegaste desde un enlace dentro del sistema, coméntalo al administrador para revisar la ruta.
                </p>
            </div>

            <p class="mt-6 text-[0.7rem] uppercase tracking-[0.2em] text-slate-500">
                RA Automotriz · Taller especializado
            </p>
        </div>
    </div>
</body>
</html>

