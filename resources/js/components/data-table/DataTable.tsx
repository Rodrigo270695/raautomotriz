import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Column<T> = {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
    /** Clave para ordenar (ej. "name"). Si está definida y se pasa onSort, el encabezado será clicable. */
    sortKey?: string;
};

type DataTableProps<T> = {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (item: T) => string | number;
    emptyMessage?: string;
    /** Contenido cuando no hay datos (ej. icono + texto + botón). Si no se pasa, se usa emptyMessage. */
    emptyContent?: React.ReactNode;
    className?: string;
    /** Si true, no aplica borde/redondeado (para meter la tabla dentro de un bloque con buscador y footer). */
    embedded?: boolean;
    /** Filas alternas (striped). */
    striped?: boolean;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    onSort?: (key: string) => void;
    /** Si se define, la fila es clicable y se llama con el ítem. */
    onRowClick?: (item: T) => void;
    /** Clases adicionales por fila (ej. para resaltar la fila seleccionada). */
    getRowClassName?: (item: T) => string;
};

export function DataTable<T>({
    columns,
    data,
    keyExtractor,
    emptyMessage = 'No hay registros.',
    emptyContent,
    className,
    embedded = false,
    striped = false,
    sortBy,
    sortDir,
    onSort,
    onRowClick,
    getRowClassName,
}: DataTableProps<T>) {
    return (
        <div
            className={cn(
                !embedded &&
                    'overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none',
                embedded && 'overflow-x-auto',
                className
            )}
        >
            <div className="overflow-x-auto">
                <table className="w-full text-sm" role="grid">
                    <thead>
                        <tr className="border-b border-content-border bg-content-muted/50">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={cn(
                                        'px-4 py-3 text-left font-medium text-foreground',
                                        col.sortKey && onSort && 'cursor-pointer select-none',
                                        col.className
                                    )}
                                    onClick={
                                        col.sortKey && onSort
                                            ? () => onSort(col.sortKey!)
                                            : undefined
                                    }
                                >
                                    {col.sortKey && onSort ? (
                                        <span className="inline-flex items-center gap-1">
                                            {col.label}
                                            {sortBy === col.sortKey ? (
                                                sortDir === 'asc' ? (
                                                    <ArrowUp className="size-3.5" />
                                                ) : (
                                                    <ArrowDown className="size-3.5" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="size-3.5 opacity-50" />
                                            )}
                                        </span>
                                    ) : (
                                        col.label
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-10 text-center"
                                >
                                    {emptyContent ?? (
                                        <span className="text-muted-foreground text-sm">
                                            {emptyMessage}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => (
                                <tr
                                    key={keyExtractor(item)}
                                    className={cn(
                                        'border-b border-content-border last:border-0 transition-colors',
                                        onRowClick && 'cursor-pointer hover:bg-content-muted/30',
                                        striped && index % 2 === 1 && 'bg-content-muted/20',
                                        getRowClassName?.(item)
                                    )}
                                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                                    role={onRowClick ? 'button' : undefined}
                                    tabIndex={onRowClick ? 0 : undefined}
                                    onKeyDown={
                                        onRowClick
                                            ? (e) => {
                                                  if (e.key === 'Enter' || e.key === ' ') {
                                                      e.preventDefault();
                                                      onRowClick(item);
                                                  }
                                              }
                                            : undefined
                                    }
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={cn('px-4 py-3', col.className)}
                                        >
                                            {col.render
                                                ? col.render(item)
                                                : (item as Record<string, unknown>)[col.key] as React.ReactNode}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
