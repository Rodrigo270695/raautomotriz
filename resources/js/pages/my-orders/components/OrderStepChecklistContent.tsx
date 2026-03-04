import { CheckCircle2 } from 'lucide-react';
import type { ChecklistResultItem } from '../types';

type OrderStepChecklistContentProps = {
    items: ChecklistResultItem[];
};

export function OrderStepChecklistContent({ items }: OrderStepChecklistContentProps) {
    if (!items.length) {
        return (
            <p className="text-sm text-slate-600">
                Aún no hay resultados de checklist para esta orden.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />
                    <span>Verde = Bueno</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-red-500" aria-hidden />
                    <span>Rojo = Malo</span>
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[260px] border-collapse text-xs sm:text-sm">
                <thead>
                    <tr className="border-b border-slate-200 text-left">
                        <th className="py-2 pr-2 sm:py-2.5 sm:pr-3 font-medium text-slate-700">Ítem</th>
                        <th className="w-10 shrink-0 py-2 pl-2 text-center font-medium text-slate-600 sm:w-12 sm:py-2.5 sm:pl-3">
                            Estado
                        </th>
                        <th className="py-2 pl-2 sm:py-2.5 sm:pl-3 font-medium text-slate-700">Nota</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr
                            key={item.id}
                            className="border-b border-slate-100 text-slate-800"
                        >
                            <td className="py-2 pr-2 sm:py-2.5 sm:pr-3">
                                <span className="text-xs sm:text-sm">{item.name}</span>
                            </td>
                            <td className="w-10 shrink-0 py-2 pl-2 text-center sm:w-12 sm:py-2.5 sm:pl-3">
                                {item.checked ? (
                                    <CheckCircle2
                                        className="mx-auto size-5 text-emerald-600 sm:size-6"
                                        aria-label="Bueno"
                                    />
                                ) : (
                                    <CheckCircle2
                                        className="mx-auto size-5 text-red-500 sm:size-6"
                                        aria-label="Malo"
                                    />
                                )}
                            </td>
                            <td className="py-2 pl-2 text-slate-600 sm:py-2.5 sm:pl-3">
                                <span className="text-xs sm:text-sm">
                                    {item.note.trim() || '—'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}
