/**
 * Utilidades compartidas para la vista show/config de órdenes de trabajo.
 */

import type { BreadcrumbItem } from '@/types';

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|ogg)(\?|$)/i;

export function isVideoUrl(urlOrPath: string): boolean {
    return VIDEO_EXTENSIONS.test(urlOrPath);
}

export function formatEntryDateTime(entryDate: string, entryTime?: string | null): string {
    if (!entryDate) return '—';
    const dateStr = entryDate.slice(0, 10);
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return entryDate;
    const f = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    if (!entryTime || entryTime.trim() === '') return f;
    return `${f} ${entryTime.slice(0, 5)}`;
}

export function formatDiagnosisDateTime(iso: string | null | undefined): string {
    if (!iso) return '—';
    try {
        const d = new Date(iso);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
        return iso;
    }
}

export function getBreadcrumbs(indexPath: string, showPath: string): BreadcrumbItem[] {
    return [
        { title: 'Panel de control', href: '/dashboard' },
        { title: 'Servicio', href: '#' },
        { title: 'Órdenes de trabajo', href: indexPath },
        { title: 'Orden', href: showPath },
    ];
}
