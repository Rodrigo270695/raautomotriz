import * as React from 'react';
import { X } from 'lucide-react';
import type { DiagnosisItem, EntryMediaItem } from '../types';

function isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
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

type OrderStepDiagnosticoContentProps = {
    diagnoses: DiagnosisItem[];
    mediaItems: EntryMediaItem[];
};

export function OrderStepDiagnosticoContent({ diagnoses, mediaItems }: OrderStepDiagnosticoContentProps) {
    const [selected, setSelected] = React.useState<{
        url: string;
        caption: string | null;
        isVideo: boolean;
    } | null>(null);

    const hasDiagnoses = diagnoses.length > 0;
    const hasMedia = mediaItems.length > 0;

    if (!hasDiagnoses && !hasMedia) {
        return (
            <p className="text-sm text-slate-600">
                Aún no hay diagnósticos ni fotos/videos de diagnóstico para esta orden.
            </p>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {hasDiagnoses && (
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">
                            Diagnósticos registrados
                        </h3>
                        <ul className="space-y-3 border-b border-slate-200 pb-4">
                            {diagnoses.map((d) => (
                                <li
                                    key={d.id}
                                    className="flex flex-col gap-0.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                                >
                                    <p className="text-sm text-slate-800">{d.diagnosis_text}</p>
                                    <p className="text-xs text-slate-500">
                                        {formatDateTime(d.diagnosed_at)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {hasMedia && (
                    <section>
                        <h3 className="mb-3 text-sm font-semibold text-slate-800">
                            Fotos y videos de diagnóstico
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
                                                    alt={item.caption ?? 'Foto de diagnóstico'}
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
                                alt={selected.caption ?? 'Foto de diagnóstico'}
                                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-xl"
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
