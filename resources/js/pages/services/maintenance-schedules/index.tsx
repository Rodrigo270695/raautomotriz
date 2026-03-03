import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    AlertCircle,
    AlertTriangle,
    Bell,
    BellOff,
    CalendarClock,
    CheckCircle2,
    Clock,
    FileText,
    LayoutGrid,
    RefreshCw,
    Send,
    Wrench,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginatedResponse } from '@/types';
import { DataTable } from '@/components/data-table';
import { DataTableCard } from '@/components/data-table/DataTableCard';
import { SearchInput } from '@/components/search';
import { TablePagination } from '@/components/pagination/TablePagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Servicio', href: '#' },
    { title: 'Recordatorios de mantenimiento', href: '/dashboard/services/maintenance-schedules' },
];

const INDEX_PATH = '/dashboard/services/maintenance-schedules';

const STATUS_OPTIONS = [
    { value: 'all',         label: 'Todos los estados' },
    { value: 'ok',          label: 'Al día' },
    { value: 'approaching', label: 'Próximo a vencer' },
    { value: 'overdue',     label: 'Vencido' },
];

type ScheduleItem = {
    id: number;
    vehicle_id: number;
    service_package_id: number | null;
    service_type_id: number | null;
    interval_km: number | null;
    interval_days: number | null;
    last_service_at: string | null;
    last_service_mileage: number | null;
    next_due_km: number | null;
    next_due_date: string | null;
    computed_status: 'ok' | 'approaching' | 'overdue';
    days_left: number | null;
    last_alert_sent_at: string | null;
    last_alert_type: string | null;
    vehicle?: {
        id: number;
        plate: string;
        year?: number | null;
        vehicle_model?: { id: number; name: string; brand?: { id: number; name: string } } | null;
        client?: { id: number; first_name: string; last_name: string; phone?: string | null } | null;
    };
    service_package?: { id: number; name: string } | null;
    service_type?: { id: number; name: string } | null;
};

type MaintenanceSchedulesIndexProps = {
    schedules: PaginatedResponse<ScheduleItem>;
    filters: {
        search?: string;
        filter_status?: string;
        per_page?: number;
    };
    stats: {
        total: number;
        overdue: number;
        approaching: number;
        ok: number;
    };
    config: {
        days_before: number;
        km_before: number;
        alert_hour: string;
    };
    can: {
        resend_notification?: boolean;
    };
};

function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = iso.slice(0, 10).split('-');
    if (d.length < 3) return iso;
    return `${d[2]}/${d[1]}/${d[0]}`;
}

function formatDatetime(iso: string | null | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function statusConfig(status: string) {
    const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
        ok: {
            label: 'Al día',
            cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
            icon: <CheckCircle2 className="size-3" />,
        },
        approaching: {
            label: 'Próximo',
            cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
            icon: <Clock className="size-3" />,
        },
        overdue: {
            label: 'Vencido',
            cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
            icon: <AlertTriangle className="size-3" />,
        },
    };
    return map[status] ?? map.ok;
}

export default function MaintenanceSchedulesIndex({
    schedules,
    filters,
    stats,
    config,
    can,
}: MaintenanceSchedulesIndexProps) {
    const [isNavigating, setIsNavigating] = useState(false);
    const [sendingId, setSendingId] = useState<number | null>(null);

    useEffect(() => {
        const offStart  = router.on('start',  () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => { offStart(); offFinish(); };
    }, []);

    const onFilterStatus = (value: string) => {
        router.get(INDEX_PATH, { ...filters, filter_status: value === 'all' ? undefined : value, page: undefined }, { preserveState: true });
    };

    const handleResend = (schedule: ScheduleItem) => {
        if (sendingId !== null) return;
        setSendingId(schedule.id);
        router.post(
            `/dashboard/services/maintenance-schedules/${schedule.id}/resend-notification`,
            {},
            { preserveScroll: true, onFinish: () => setSendingId(null) },
        );
    };

    const vehicleLabel = (s: ScheduleItem) => {
        const v = s.vehicle;
        if (!v) return '—';
        const brand = v.vehicle_model?.brand?.name ?? '';
        const model = v.vehicle_model?.name ?? '';
        return [brand, model, v.plate].filter(Boolean).join(' · ');
    };

    const clientLabel = (s: ScheduleItem) => {
        const c = s.vehicle?.client;
        if (!c) return '—';
        return `${c.first_name} ${c.last_name}`.trim() || '—';
    };

    const serviceName = (s: ScheduleItem) =>
        s.service_package?.name ?? s.service_type?.name ?? '—';

    const daysLeftText = (s: ScheduleItem) => {
        if (s.days_left === null || s.days_left === undefined) return null;
        if (s.days_left > 0)   return `en ${s.days_left} día(s)`;
        if (s.days_left === 0) return 'hoy';
        return `hace ${Math.abs(s.days_left)} día(s)`;
    };

    const columns = [
        {
            key: 'vehicle',
            label: 'Vehículo / Placa',
            render: (s: ScheduleItem) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-foreground text-sm font-medium">{vehicleLabel(s)}</span>
                    {s.vehicle?.year && (
                        <span className="text-muted-foreground text-xs">Año {s.vehicle.year}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'client',
            label: 'Cliente',
            render: (s: ScheduleItem) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-muted-foreground">{clientLabel(s)}</span>
                    {s.vehicle?.client?.phone && (
                        <span className="text-xs text-muted-foreground/70">{s.vehicle.client.phone}</span>
                    )}
                </div>
            ),
        },
        {
            key: 'service',
            label: 'Servicio',
            render: (s: ScheduleItem) => (
                <span className="text-sm text-muted-foreground">{serviceName(s)}</span>
            ),
        },
        {
            key: 'next_due_date',
            label: 'Próx. fecha',
            render: (s: ScheduleItem) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm tabular-nums text-foreground">{formatDate(s.next_due_date)}</span>
                    {daysLeftText(s) && (
                        <span className={`text-xs ${s.computed_status === 'overdue' ? 'text-rose-500' : s.computed_status === 'approaching' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                            {daysLeftText(s)}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'next_due_km',
            label: 'Próx. km',
            render: (s: ScheduleItem) => (
                <span className="text-sm tabular-nums text-foreground">
                    {s.next_due_km ? `${s.next_due_km.toLocaleString()} km` : '—'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            render: (s: ScheduleItem) => {
                const cfg = statusConfig(s.computed_status);
                return (
                    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${cfg.cls}`}>
                        {cfg.icon} {cfg.label}
                    </span>
                );
            },
        },
        {
            key: 'notification',
            label: 'Último aviso',
            render: (s: ScheduleItem) => (
                <div className="flex flex-col gap-0.5">
                    {s.last_alert_sent_at ? (
                        <>
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-3" /> Enviado
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDatetime(s.last_alert_sent_at)}</span>
                        </>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <BellOff className="size-3" /> Sin avisos
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[80px] text-right',
            render: (s: ScheduleItem) =>
                can.resend_notification ? (
                    <div className="flex items-center justify-end">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="cursor-pointer shrink-0 text-sky-500 hover:bg-sky-50 hover:text-sky-600 dark:text-sky-400/80 dark:hover:bg-sky-900/20 dark:hover:text-sky-300"
                                    onClick={() => handleResend(s)}
                                    disabled={sendingId === s.id}
                                >
                                    {sendingId === s.id
                                        ? <RefreshCw className="size-4 animate-spin" />
                                        : <Send className="size-4" />
                                    }
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reenviar aviso al cliente</TooltipContent>
                        </Tooltip>
                    </div>
                ) : null,
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-4">
            <AlertCircle className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay calendarios de mantenimiento registrados.</span>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Recordatorios de mantenimiento" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 relative">
                {isNavigating && (
                    <div
                        className="absolute top-0 left-0 right-0 h-0.5 bg-primary/80 animate-pulse z-10 rounded-b"
                        role="progressbar"
                        aria-label="Cargando"
                    />
                )}

                {/* Encabezado */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="relative inline-block font-semibold text-foreground text-xl tracking-tight pb-1">
                            Recordatorios de mantenimiento
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-rose-500" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Vehículos próximos a su próximo servicio programado. Aviso automático a las{' '}
                            <strong>{config.alert_hour}</strong> (Lima), con{' '}
                            <strong>{config.days_before} días</strong> de anticipación.
                        </p>
                    </div>
                </div>

                {/* Stats pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 dark:bg-rose-950/40">
                        <Wrench className="size-3.5 text-rose-600 dark:text-rose-400" />
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{stats.total}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">Al día</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.ok}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <CalendarClock className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Próximos</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.approaching}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 dark:bg-rose-950/40">
                        <AlertTriangle className="size-3.5 text-rose-600 dark:text-rose-400" />
                        <span className="text-muted-foreground">Vencidos</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{stats.overdue}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Página</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {schedules.current_page}
                            <span className="font-normal text-muted-foreground"> / {schedules.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <LayoutGrid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{schedules.data.length}</span>
                    </span>
                </div>

                <div className="border-t border-content-border pt-4" />

                {/* Tabla */}
                <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                    {/* Filtros */}
                    <div className="border-b border-content-border p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                            <SearchInput
                                queryKey="search"
                                defaultValue={filters.search ?? ''}
                                placeholder="Buscar por cliente o placa…"
                                className="w-full sm:w-72"
                                inputClassName="focus-visible:border-primary/50 focus-visible:ring-primary/30"
                            />
                            <Select
                                value={filters.filter_status ?? 'all'}
                                onValueChange={onFilterStatus}
                            >
                                <SelectTrigger className="w-full sm:w-52 border-content-border">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {filters.search != null && filters.search !== '' && (
                            <p className="mt-2 text-muted-foreground text-sm">
                                <span className="font-medium text-foreground">{schedules.total}</span>{' '}
                                resultado{schedules.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<ScheduleItem>
                            columns={columns}
                            data={schedules.data}
                            keyExtractor={(s) => s.id}
                            emptyMessage="No hay calendarios de mantenimiento registrados."
                            emptyContent={emptyContent}
                            embedded
                            striped
                        />
                    </div>

                    {/* Mobile */}
                    <div className="block md:hidden">
                        {schedules.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {schedules.data.map((s) => {
                                    const cfg = statusConfig(s.computed_status);
                                    return (
                                        <li key={s.id}>
                                            <DataTableCard
                                                title={
                                                    <span className="flex items-center gap-2 text-foreground">
                                                        <span className="font-medium">{vehicleLabel(s)}</span>
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${cfg.cls}`}>
                                                            {cfg.icon} {cfg.label}
                                                        </span>
                                                    </span>
                                                }
                                                actions={
                                                    can.resend_notification ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="cursor-pointer shrink-0 border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-950/40"
                                                            onClick={() => handleResend(s)}
                                                            disabled={sendingId === s.id}
                                                        >
                                                            {sendingId === s.id
                                                                ? <RefreshCw className="size-3.5 animate-spin" />
                                                                : <Send className="size-3.5" />
                                                            }
                                                            <span className="ml-1">Reenviar aviso</span>
                                                        </Button>
                                                    ) : undefined
                                                }
                                                fields={[
                                                    { label: 'Cliente', value: clientLabel(s) },
                                                    { label: 'Servicio', value: serviceName(s) },
                                                    { label: 'Próx. fecha', value: formatDate(s.next_due_date) + (daysLeftText(s) ? ` (${daysLeftText(s)})` : '') },
                                                    { label: 'Próx. km', value: s.next_due_km ? `${s.next_due_km.toLocaleString()} km` : '—' },
                                                    {
                                                        label: 'Último aviso',
                                                        value: s.last_alert_sent_at
                                                            ? `✓ ${formatDatetime(s.last_alert_sent_at)}`
                                                            : 'Sin avisos',
                                                    },
                                                ]}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Paginación */}
                    <div className="border-t border-content-border px-3 py-3 sm:px-4">
                        <TablePagination
                            from={schedules.from}
                            to={schedules.to}
                            total={schedules.total}
                            perPage={schedules.per_page}
                            currentPage={schedules.current_page}
                            lastPage={schedules.last_page}
                            links={schedules.links}
                            indexPath={INDEX_PATH}
                            search={filters.search}
                            extraParams={{
                                filter_status: filters.filter_status,
                            }}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
