import type { InertiaLinkProps } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { toUrl } from '@/lib/utils';

export type IsCurrentUrlFn = (
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    currentUrl?: string,
) => boolean;

export type WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
    urlToCheck: NonNullable<InertiaLinkProps['href']>,
    ifTrue: TIfTrue,
    ifFalse?: TIfFalse,
) => TIfTrue | TIfFalse;

export type UseCurrentUrlReturn = {
    currentUrl: string;
    isCurrentUrl: IsCurrentUrlFn;
    whenCurrentUrl: WhenCurrentUrlFn;
};

export function useCurrentUrl(): UseCurrentUrlReturn {
    const page = usePage();
    const currentUrlPath = new URL(page.url, window?.location.origin).pathname;

    const isCurrentUrl: IsCurrentUrlFn = (
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        currentUrl?: string,
    ) => {
        const urlToCompare = currentUrl ?? currentUrlPath;
        const urlString = toUrl(urlToCheck);

        // Rutas internas: permitir que los ítems de menú continúen activos
        // cuando estamos en una vista de detalle hija (ej. /dashboard/my-orders/6).
        if (!urlString.startsWith('http')) {
            if (urlString === urlToCompare) return true;

            // Considerar "activo" cuando la URL actual es un hijo numérico del recurso base.
            // Ejemplos:
            // - base: /dashboard/my-orders  current: /dashboard/my-orders/6         -> true
            // - base: /dashboard/services/work-orders  current: /dashboard/services/work-orders/123/config -> true
            // - base: /dashboard/my-orders  current: /dashboard/my-orders/history   -> false
            const base = urlString.endsWith('/') ? urlString.slice(0, -1) : urlString;
            const current = urlToCompare;

            if (current.startsWith(`${base}/`)) {
                const rest = current.slice(base.length + 1); // quitar "base/"
                if (/^\d+(\/|$)/.test(rest)) {
                    return true;
                }
            }

            return false;
        }

        // Rutas absolutas externas
        try {
            const absoluteUrl = new URL(urlString);
            return absoluteUrl.pathname === urlToCompare;
        } catch {
            return false;
        }
    };

    const whenCurrentUrl: WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
        urlToCheck: NonNullable<InertiaLinkProps['href']>,
        ifTrue: TIfTrue,
        ifFalse: TIfFalse = null as TIfFalse,
    ): TIfTrue | TIfFalse => {
        return isCurrentUrl(urlToCheck) ? ifTrue : ifFalse;
    };

    return {
        currentUrl: currentUrlPath,
        isCurrentUrl,
        whenCurrentUrl,
    };
}
