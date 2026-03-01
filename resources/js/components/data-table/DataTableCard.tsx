import { cn } from '@/lib/utils';

export type DataTableCardField = {
    label: string;
    value: React.ReactNode;
};

type DataTableCardProps = {
    /** Título o identificador principal (ej. nombre del rol). */
    title: React.ReactNode;
    /** Botones de acción (editar, eliminar, etc.). */
    actions?: React.ReactNode;
    /** Lista de campos en formato etiqueta–valor. Escala bien a muchos campos. */
    fields: DataTableCardField[];
    className?: string;
};

/**
 * Card para vista móvil de listados. Diseño escalable:
 * - Cabecera: solo título (puede ser largo)
 * - Cuerpo: lista de pares etiqueta–valor
 * - Pie: botones de acción en fila propia (no se salen del card)
 */
export function DataTableCard({
    title,
    actions,
    fields,
    className,
}: DataTableCardProps) {
    return (
        <article
            className={cn(
                'rounded-lg border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none',
                className
            )}
        >
            <header className="px-4 pt-4">
                <h3 className="min-w-0 font-semibold text-foreground break-words">
                    {title}
                </h3>
            </header>
            <dl className="mt-3 grid gap-2 px-4 sm:grid-cols-2">
                {fields.map(({ label, value }, i) => (
                    <div
                        key={i}
                        className="flex flex-col gap-0.5 sm:odd:col-span-1 sm:even:col-span-1"
                    >
                        <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                            {label}
                        </dt>
                        <dd className="text-foreground text-sm">{value}</dd>
                    </div>
                ))}
            </dl>
            {actions != null && (
                <footer className="mt-3 flex justify-end border-t border-content-border px-4 py-3">
                    {actions}
                </footer>
            )}
        </article>
    );
}
