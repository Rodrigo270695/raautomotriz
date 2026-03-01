'use client';

import * as React from 'react';
import { ChevronDownIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type SearchableSelectOption = {
    id: number;
    name: string;
    /** Texto adicional para la búsqueda (ej. número de documento). */
    document_number?: string;
};

function getSearchText(option: SearchableSelectOption): string {
    const doc = (option.document_number ?? '').trim();
    return `${option.name} ${doc}`.trim().toLowerCase();
}

function filterOptions(options: SearchableSelectOption[], query: string): SearchableSelectOption[] {
    if (!query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((opt) => getSearchText(opt).includes(q));
}

type SearchableSelectProps = {
    value: string;
    onValueChange: (value: string) => void;
    options: SearchableSelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    id?: string;
    className?: string;
    triggerClassName?: string;
};

export function SearchableSelect({
    value,
    onValueChange,
    options,
    placeholder = 'Seleccione…',
    searchPlaceholder = 'Buscar por nombre o documento…',
    disabled = false,
    id,
    className,
    triggerClassName,
}: SearchableSelectProps) {
    const DROPDOWN_MAX_HEIGHT = 280;
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [dropdownRect, setDropdownRect] = React.useState<{
        top: number;
        left: number;
        width: number;
        openUpward?: boolean;
    } | null>(null);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const selectedOption = React.useMemo(
        () => options.find((o) => String(o.id) === value),
        [options, value]
    );
    const filteredOptions = React.useMemo(
        () => filterOptions(options, searchQuery),
        [options, searchQuery]
    );

    React.useEffect(() => {
        if (open) {
            setSearchQuery('');
            const t = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(t);
        } else {
            setDropdownRect(null);
        }
    }, [open]);

    React.useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const inTrigger = triggerRef.current?.contains(target);
            const inDropdown = target.closest('[data-searchable-select-dropdown]') != null;
            if (!inTrigger && !inDropdown) setOpen(false);
        };
        const t = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 0);
        return () => {
            clearTimeout(t);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    const handleTriggerClick = () => {
        if (open) {
            setOpen(false);
            return;
        }
        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect) {
            const spaceBelow = window.innerHeight - rect.bottom;
            const openUpward = spaceBelow < DROPDOWN_MAX_HEIGHT && rect.top > spaceBelow;
            setDropdownRect({
                top: openUpward ? rect.top - DROPDOWN_MAX_HEIGHT - 4 : rect.bottom + 4,
                left: rect.left,
                width: rect.width,
                openUpward,
            });
        }
        setOpen(true);
    };

    const handleSelect = (option: SearchableSelectOption) => {
        const id = option?.id != null ? String(option.id) : '';
        onValueChange(id);
        // Devolver foco al trigger antes de cerrar para que el Dialog no pierda el foco (pantalla en blanco)
        triggerRef.current?.focus();
        setTimeout(() => setOpen(false), 0);
    };

    const dropdownContent = open && dropdownRect && (
        <div
            ref={dropdownRef}
            data-searchable-select-dropdown
            role="listbox"
            className="bg-popover text-popover-foreground overflow-hidden rounded-md border shadow-lg"
            style={{
                position: 'fixed',
                top: dropdownRect.top,
                left: dropdownRect.left,
                width: dropdownRect.width,
                maxHeight: DROPDOWN_MAX_HEIGHT,
                zIndex: 10050,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="border-b p-2 shrink-0">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-8 pl-8 border-content-border"
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setOpen(false);
                                (e.target as HTMLInputElement).blur();
                            }
                        }}
                    />
                </div>
            </div>
            <ul className="max-h-52 overflow-auto overflow-x-hidden p-1" style={{ minHeight: 80 }}>
                {filteredOptions.length === 0 ? (
                    <li className="py-4 text-center text-sm text-muted-foreground">
                        No hay coincidencias
                    </li>
                ) : (
                    filteredOptions.map((option) => (
                        <li key={option.id}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={value === String(option.id)}
                                className={cn(
                                    'flex w-full cursor-pointer flex-col items-start gap-0.5 rounded-sm px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                                    value === String(option.id) && 'bg-accent/80 font-medium'
                                )}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSelect(option);
                                }}
                            >
                                <span>{option.name}</span>
                                {option.document_number != null &&
                                    option.document_number !== '' && (
                                        <span className="text-muted-foreground text-xs">
                                            Doc: {option.document_number}
                                        </span>
                                    )}
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );

    return (
        <div className={cn('relative', className)}>
            <Button
                ref={triggerRef}
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-label={placeholder}
                disabled={disabled}
                id={id}
                className={cn(
                    'border-input data-placeholder:text-muted-foreground h-9 w-full justify-between rounded-md border bg-transparent px-3 py-2 text-sm font-normal shadow-xs transition-[color,box-shadow] hover:bg-transparent focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:size-4',
                    triggerClassName
                )}
                onClick={handleTriggerClick}
            >
                <span className="truncate text-left">
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDownIcon
                    className={cn('ml-2 shrink-0 opacity-50', open && 'rotate-180')}
                />
            </Button>
            {dropdownContent}
        </div>
    );
}
