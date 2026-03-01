import { router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DEBOUNCE_MS = 400;

type SearchInputProps = {
    name?: string;
    placeholder?: string;
    defaultValue?: string;
    className?: string;
    /** Clases adicionales para el input (ej. anillo de foco con color primary). */
    inputClassName?: string;
    /** Si no se pasa, se usa el nombre del input para el query param (ej: "search"). */
    queryKey?: string;
};

export function SearchInput({
    name = 'search',
    placeholder = 'Buscar…',
    defaultValue = '',
    className,
    inputClassName,
    queryKey,
}: SearchInputProps) {
    const key = queryKey ?? name;
    const { data, setData, processing } = useForm<Record<string, string>>({
        [key]: defaultValue,
    });
    const isFirstRun = useRef(true);

    const applySearch = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set(key, value);
            params.set('page', '1');
        } else {
            params.delete(key);
            // Mantener page y per_page al limpiar búsqueda (evita segunda petición a página 1)
        }
        const query = params.toString();
        const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
        const currentUrl = window.location.pathname + (window.location.search || '');
        if (url === currentUrl) return;
        router.get(url, {}, { preserveState: true });
    };

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        const value = (data[key] ?? '').trim();
        const timer = setTimeout(() => {
            applySearch(value);
        }, DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [data[key]]);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applySearch((data[key] ?? '').trim());
    };

    const hasValue = ((data[key] ?? '') as string).trim() !== '';

    return (
        <form
            onSubmit={submitSearch}
            className={cn('relative', className)}
        >
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
                name={key}
                placeholder={placeholder}
                value={data[key] ?? ''}
                onChange={(e) => setData(key, e.target.value)}
                className={cn('pl-9', hasValue && 'pr-8', inputClassName)}
                disabled={processing}
            />
            {hasValue && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Limpiar búsqueda"
                    onClick={() => {
                        setData(key, '');
                        applySearch('');
                    }}
                >
                    <X className="size-4" />
                </Button>
            )}
        </form>
    );
}
