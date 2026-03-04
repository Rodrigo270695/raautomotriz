import * as React from 'react';
import { FileDown, X } from 'lucide-react';
import type { EntryMediaItem, OrderPaymentItem, OrderServiceItem } from '../types';

function isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
    }).format(amount);
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatMediaDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const PAYMENT_TYPE_LABELS: Record<string, string> = {
    advance: 'Adelanto',
    partial: 'Abono',
    final: 'Pago final',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    yape: 'Yape',
    plim: 'Plim',
    tarjeta: 'Tarjeta',
    efectivo: 'Efectivo',
    otros: 'Otros',
};

type OrderStepReparacionContentProps = {
    services: OrderServiceItem[];
    payments: OrderPaymentItem[];
    totalAmount: number | null;
    mediaItems: EntryMediaItem[];
};

export function OrderStepReparacionContent({
    services,
    payments,
    totalAmount,
    mediaItems,
}: OrderStepReparacionContentProps) {
    const [selected, setSelected] = React.useState<{
        url: string;
        caption: string | null;
        isVideo: boolean;
    } | null>(null);

    const servicesSubtotal = services.reduce((sum, s) => sum + s.subtotal, 0);
    const total = totalAmount ?? servicesSubtotal;
    const subtotalBase = total > 0 ? Math.round((total / 1.18) * 100) / 100 : 0;
    const igv = Math.round((total - subtotalBase) * 100) / 100;

    const hasServices = services.length > 0;
    const hasPayments = payments.length > 0;
    const hasMedia = mediaItems.length > 0;

    if (!hasServices && !hasPayments && !hasMedia) {
        return (
            <p className="text-sm text-slate-600">
                Aún no hay servicios, pagos ni fotos/videos de avance para esta orden.
            </p>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {hasServices && (
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">
                            Servicios y productos de la orden
                        </h3>
                        {/* Vista tipo tarjeta en pantallas pequeñas */}
                        <div className="space-y-3 sm:hidden">
                            {services.map((s) => (
                                <div
                                    key={s.id}
                                    className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs"
                                >
                                    <p className="font-medium text-slate-800">
                                        {s.service_package_name ?? '—'}
                                    </p>
                                    <p className="mt-0.5 text-slate-700">
                                        {s.product_name ?? s.description ?? '—'}
                                    </p>
                                    <p className="mt-2 flex justify-between text-slate-600">
                                        <span>
                                            Cant. {String(s.quantity)} × {formatCurrency(s.unit_price)}
                                        </span>
                                        <span className="font-medium text-slate-800">
                                            {formatCurrency(s.subtotal)}
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                        {/* Tabla desde sm */}
                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full min-w-[400px] border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-left">
                                        <th className="py-2 pr-2 font-medium text-slate-700">Paquete</th>
                                        <th className="py-2 pr-2 font-medium text-slate-700">Producto / servicio</th>
                                        <th className="w-14 py-2 px-1 text-right font-medium text-slate-700">Cant.</th>
                                        <th className="w-20 py-2 px-1 text-right font-medium text-slate-700">P. unit.</th>
                                        <th className="w-20 py-2 px-1 text-right font-medium text-slate-700">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((s) => (
                                        <tr key={s.id} className="border-b border-slate-100 text-slate-800">
                                            <td className="py-2 pr-2">{s.service_package_name ?? '—'}</td>
                                            <td className="py-2 pr-2">{s.product_name ?? s.description ?? '—'}</td>
                                            <td className="py-2 px-1 text-right">{String(s.quantity)}</td>
                                            <td className="py-2 px-1 text-right">{formatCurrency(s.unit_price)}</td>
                                            <td className="py-2 px-1 text-right">{formatCurrency(s.subtotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-3 flex flex-col gap-0.5 border-t border-slate-200 pt-3 text-right text-xs sm:text-sm">
                            <p className="text-slate-600">
                                Subtotal (base): <span className="font-medium text-slate-800">{formatCurrency(subtotalBase)}</span>
                            </p>
                            <p className="text-slate-600">
                                IGV (18%): <span className="font-medium text-slate-800">{formatCurrency(igv)}</span>
                            </p>
                            <p className="text-slate-800 font-semibold">
                                Total servicios: {formatCurrency(total)}
                            </p>
                        </div>
                    </section>
                )}

                {hasPayments && (
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">
                            Pagos de la orden
                        </h3>
                        {/* Vista tipo tarjeta en pantallas pequeñas */}
                        <div className="space-y-3 sm:hidden">
                            {payments.map((p) => (
                                <div
                                    key={p.id}
                                    className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="font-medium text-slate-800">
                                            {PAYMENT_TYPE_LABELS[p.type] ?? p.type}
                                        </span>
                                        <span className="font-semibold text-slate-800">
                                            {formatCurrency(p.amount)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-slate-600">
                                        {p.payment_method ? (PAYMENT_METHOD_LABELS[p.payment_method] ?? p.payment_method) : '—'}
                                        {' · '}
                                        {formatDate(p.paid_at)}
                                    </p>
                                    <a
                                        href={p.receipt_pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-red-600 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                    >
                                        <FileDown className="size-3.5 shrink-0" />
                                        Ver comprobante
                                    </a>
                                </div>
                            ))}
                        </div>
                        {/* Tabla desde sm */}
                        <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full min-w-[320px] border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-left">
                                        <th className="py-2 pr-2 font-medium text-slate-700">Tipo</th>
                                        <th className="w-24 py-2 px-1 text-right font-medium text-slate-700">Monto</th>
                                        <th className="py-2 px-1 font-medium text-slate-700">Método</th>
                                        <th className="py-2 px-1 font-medium text-slate-700">Fecha</th>
                                        <th className="w-28 py-2 pl-1 text-center font-medium text-slate-700">Comprobante</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p) => (
                                        <tr key={p.id} className="border-b border-slate-100 text-slate-800">
                                            <td className="py-2 pr-2">
                                                {PAYMENT_TYPE_LABELS[p.type] ?? p.type}
                                            </td>
                                            <td className="py-2 px-1 text-right font-medium">
                                                {formatCurrency(p.amount)}
                                            </td>
                                            <td className="py-2 px-1">
                                                {p.payment_method ? (PAYMENT_METHOD_LABELS[p.payment_method] ?? p.payment_method) : '—'}
                                            </td>
                                            <td className="py-2 px-1 text-slate-600">
                                                {formatDate(p.paid_at)}
                                            </td>
                                            <td className="py-2 pl-1 text-center">
                                                <a
                                                    href={p.receipt_pdf_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                                >
                                                    <FileDown className="size-3.5" />
                                                    Ver comprobante
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 text-right text-xs font-medium text-slate-800 sm:text-sm">
                            Total pagado: {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                        </p>
                    </section>
                )}

                {hasMedia && (
                    <section>
                        <h3 className="mb-3 text-sm font-semibold text-slate-800">
                            Fotos y videos de avance / reparación
                        </h3>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                            {mediaItems.map((item) => {
                                const isVideoItem = isVideo(item.url);
                                return (
                                    <figure
                                        key={item.id}
                                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelected({
                                                    url: item.url,
                                                    caption: item.caption,
                                                    isVideo: isVideoItem,
                                                })
                                            }
                                            className="relative block w-full cursor-pointer overflow-hidden rounded-t-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                        >
                                            {isVideoItem ? (
                                                <video
                                                    src={item.url}
                                                    controls
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                                />
                                            ) : (
                                                <img
                                                    src={item.url}
                                                    alt={item.caption ?? 'Foto de avance'}
                                                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            )}
                                        </button>
                                        {(item.caption || item.created_at) && (
                                            <figcaption className="border-t border-slate-200 bg-white px-3 py-2.5">
                                                {item.caption && (
                                                    <p className="line-clamp-2 text-sm font-medium text-slate-800">
                                                        {item.caption}
                                                    </p>
                                                )}
                                                {item.created_at && (
                                                    <p className="mt-1 text-xs text-slate-600">
                                                        {formatMediaDate(item.created_at)}
                                                    </p>
                                                )}
                                            </figcaption>
                                        )}
                                    </figure>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>

            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Ver en tamaño real"
                >
                    <button
                        type="button"
                        className="absolute inset-0 z-0"
                        onClick={() => setSelected(null)}
                        aria-label="Cerrar"
                    />
                    <div
                        className="relative z-1 max-h-[90vh] max-w-[90vw] shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelected(null)}
                            className="absolute -right-2 -top-2 z-10 flex size-8 items-center justify-center rounded-full bg-slate-800 text-white shadow-md transition-colors hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            aria-label="Cerrar"
                        >
                            <X className="size-4" />
                        </button>
                        {selected.isVideo ? (
                            <video
                                src={selected.url}
                                controls
                                autoPlay
                                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                            />
                        ) : (
                            <img
                                src={selected.url}
                                alt={selected.caption ?? 'Foto de avance'}
                                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-xl"
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
