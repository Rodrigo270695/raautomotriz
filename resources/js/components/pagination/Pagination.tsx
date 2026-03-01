import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationLink } from '@/types';
import { cn } from '@/lib/utils';

type PaginationProps = {
    links: PaginationLink[];
    currentPage: number;
    lastPage: number;
    indexPath: string;
    pageQueryParams: (page: number) => Record<string, string | number | undefined>;
    className?: string;
};

export function Pagination({
    links,
    currentPage,
    lastPage,
    indexPath,
    pageQueryParams,
    className,
}: PaginationProps) {
    const prev = links.find((l) => l.label === '&laquo; Anterior');
    const next = links.find((l) => l.label === 'Siguiente &raquo;');
    const pages = links.filter(
        (l) => l.label !== '&laquo; Anterior' && l.label !== 'Siguiente &raquo;'
    );

    const prevParams = currentPage > 1 ? pageQueryParams(currentPage - 1) : null;
    const nextParams = currentPage < lastPage ? pageQueryParams(currentPage + 1) : null;

    return (
        <nav
            role="navigation"
            aria-label="Paginación"
            className={cn('flex flex-wrap items-center justify-center gap-1', className)}
        >
            {prev && (
                <PaginationLinkItem
                    indexPath={indexPath}
                    params={prevParams}
                    active={prev.active}
                    ariaLabel="Página anterior"
                >
                    <ChevronLeft className="size-4" />
                </PaginationLinkItem>
            )}
            {pages.map((link, i) => {
                const labelClean = link.label.replace(/&[^;]+;/g, '');
                const pageNum = parseInt(labelClean, 10);
                const isNumeric = !Number.isNaN(pageNum);
                const params = link.active ? null : (isNumeric ? pageQueryParams(pageNum) : null);
                const fallbackUrl = !isNumeric ? link.url : null;
                return (
                    <PaginationLinkItem
                        key={i}
                        indexPath={indexPath}
                        params={params}
                        fallbackUrl={fallbackUrl}
                        active={link.active}
                        ariaLabel={labelClean ? `Página ${labelClean}` : 'Más páginas'}
                    >
                        {labelClean || '…'}
                    </PaginationLinkItem>
                );
            })}
            {next && (
                <PaginationLinkItem
                    indexPath={indexPath}
                    params={nextParams}
                    active={next.active}
                    ariaLabel="Página siguiente"
                >
                    <ChevronRight className="size-4" />
                </PaginationLinkItem>
            )}
        </nav>
    );
}

function PaginationLinkItem({
    indexPath,
    params,
    fallbackUrl,
    active,
    ariaLabel,
    children,
}: {
    indexPath: string;
    params: Record<string, string | number | undefined> | null;
    fallbackUrl?: string | null;
    active: boolean;
    ariaLabel: string;
    children: React.ReactNode;
}) {
    const base =
        'inline-flex min-w-9 items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium transition-colors';

    const hasAction = active ? false : (params !== null || (fallbackUrl != null && fallbackUrl !== ''));

    if (!hasAction) {
        return (
            <span
                aria-current={active ? 'page' : undefined}
                className={cn(
                    base,
                    active
                        ? 'border border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                        : 'text-muted-foreground cursor-not-allowed'
                )}
            >
                {children}
            </span>
        );
    }

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (params !== null) {
            const query = { ...params };
            if (query.search === undefined || query.search === '') delete query.search;
            router.get(indexPath, query, { preserveScroll: true, preserveState: false });
        } else if (fallbackUrl) {
            router.get(fallbackUrl, {}, { preserveScroll: true, preserveState: false });
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                base,
                'cursor-pointer text-foreground hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/30 dark:hover:border-blue-700 border border-content-border'
            )}
            aria-label={ariaLabel}
        >
            {children}
        </button>
    );
}
