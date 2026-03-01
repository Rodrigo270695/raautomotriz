import { router } from '@inertiajs/react';
import * as React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { PaginationLink } from '@/types';
import { Pagination } from './Pagination';
import { cn } from '@/lib/utils';

const DEFAULT_PER_PAGE_OPTIONS = [10, 15, 25, 50];

type TablePaginationProps = {
    from: number | null;
    to: number | null;
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    links: PaginationLink[];
    indexPath: string;
    search?: string;
    /** Parámetros extra a incluir en cada petición (sort_by, sort_dir, filter_permissions, etc.) */
    extraParams?: Record<string, string | number | undefined>;
    perPageOptions?: number[];
    className?: string;
};

function mergeParams(
    base: Record<string, string | number | undefined>,
    extra?: Record<string, string | number | undefined>
): Record<string, string | number | undefined> {
    if (!extra) return base;
    const out = { ...base };
    for (const [k, v] of Object.entries(extra)) {
        if (v !== undefined && v !== '') out[k] = v;
    }
    return out;
}

export function TablePagination({
    from,
    to,
    total,
    perPage,
    currentPage,
    lastPage,
    links,
    indexPath,
    search,
    extraParams,
    perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
    className,
}: TablePaginationProps) {
    const text =
        total === 0
            ? 'Mostrando 0 de 0 registros'
            : `Mostrando ${from ?? 0} a ${to ?? 0} de ${total} registros`;

    const baseParams = {
        per_page: perPage,
        ...(search != null && search !== '' ? { search } : {}),
        ...extraParams,
    };

    const pageQueryParams = (page: number): Record<string, string | number | undefined> =>
        mergeParams({ ...baseParams, page }, extraParams);

    const handlePerPageChange = (value: string) => {
        router.get(indexPath, { ...baseParams, per_page: Number(value), page: 1 }, { preserveState: false });
    };

    const [goToPage, setGoToPage] = React.useState('');
    const handleGoToPage = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(goToPage, 10);
        if (Number.isFinite(num) && num >= 1 && num <= lastPage) {
            router.get(indexPath, pageQueryParams(num), { preserveState: false });
            setGoToPage('');
        }
    };

    const hasPages = links.length > 1;

    return (
        <div
            className={cn(
                'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
                className
            )}
        >
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-muted-foreground text-sm">
                    {text}
                    {lastPage > 0 && (
                        <span className="ml-1 text-muted-foreground/80">
                            (página {currentPage} de {lastPage})
                        </span>
                    )}
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm whitespace-nowrap">
                        Mostrar:
                    </span>
                    <Select
                        value={String(perPage)}
                        onValueChange={handlePerPageChange}
                    >
                        <SelectTrigger className="h-8 w-18 border-content-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {perPageOptions.map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {hasPages && lastPage > 1 && (
                    <form onSubmit={handleGoToPage} className="flex items-center gap-1">
                        <span className="text-muted-foreground text-sm whitespace-nowrap">
                            Ir a:
                        </span>
                        <input
                            type="number"
                            min={1}
                            max={lastPage}
                            value={goToPage}
                            onChange={(e) => setGoToPage(e.target.value)}
                            className="h-8 w-14 rounded-md border border-content-border bg-transparent px-2 text-center text-sm"
                            aria-label="Número de página"
                        />
                        <Button type="submit" variant="outline" size="sm" className="h-8">
                            Ir
                        </Button>
                    </form>
                )}
            </div>
            {hasPages && (
                <Pagination
                    links={links}
                    currentPage={currentPage}
                    lastPage={lastPage}
                    indexPath={indexPath}
                    pageQueryParams={pageQueryParams}
                />
            )}
        </div>
    );
}
