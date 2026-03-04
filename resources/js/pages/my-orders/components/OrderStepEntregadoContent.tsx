import type { NextMaintenanceItem } from '../types';

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function daysFromToday(dateStr: string | null): number | null {
    if (!dateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
}

type OrderStepEntregadoContentProps = {
    items: NextMaintenanceItem[];
};

export function OrderStepEntregadoContent({ items }: OrderStepEntregadoContentProps) {
    if (!items.length) {
        return (
            <p className="text-sm text-slate-600">
                No hay recomendaciones de próximo mantenimiento para esta orden.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-700">
                Te recomendamos volver según la prevención de cada paquete de servicio:
            </p>
            <ul className="space-y-4">
                {items.map((m, index) => {
                    const daysUntil = daysFromToday(m.next_due_date);
                    return (
                        <li
                            key={index}
                            className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-sm"
                        >
                            <h4 className="font-semibold text-slate-800">
                                {m.service_package_name}
                            </h4>
                            <ul className="mt-2 space-y-1.5 text-slate-700">
                                {m.next_due_date && (
                                    <li>
                                        <span className="font-medium">Próxima visita por fecha: </span>
                                        {daysUntil !== null && daysUntil > 0 ? (
                                            <>ven en <strong>{daysUntil} {daysUntil === 1 ? 'día' : 'días'}</strong></>
                                        ) : daysUntil !== null && daysUntil <= 0 ? (
                                            <>ven <strong>cuando antes</strong></>
                                        ) : null}
                                        {' '}
                                        ({formatDate(m.next_due_date)})
                                    </li>
                                )}
                                {m.next_due_km != null && m.next_due_km > 0 && (
                                    <li>
                                        <span className="font-medium">Próxima visita por kilometraje: </span>
                                        ven cuando llegues a <strong>{m.next_due_km.toLocaleString('es-PE')} km</strong>
                                    </li>
                                )}
                                {(m.interval_days != null && m.interval_days > 0) || (m.interval_km != null && m.interval_km > 0) ? (
                                    <li>
                                        <span className="font-medium">Prevención del paquete: </span>
                                        {m.interval_days != null && m.interval_days > 0 && (
                                            <>cada <strong>{m.interval_days} {m.interval_days === 1 ? 'día' : 'días'}</strong></>
                                        )}
                                        {m.interval_days != null && m.interval_days > 0 && m.interval_km != null && m.interval_km > 0 && ' y '}
                                        {m.interval_km != null && m.interval_km > 0 && (
                                            <>cada <strong>{m.interval_km.toLocaleString('es-PE')} km</strong></>
                                        )}
                                    </li>
                                ) : null}
                            </ul>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
