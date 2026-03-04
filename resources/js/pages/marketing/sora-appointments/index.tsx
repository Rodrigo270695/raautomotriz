import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    LayoutGrid,
    Phone,
    User,
    UserCheck,
    UserX,
    Car,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginatedResponse } from '@/types';
import { SearchInput } from '@/components/search';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { DataTableCard } from '@/components/data-table/DataTableCard';
import { TablePagination } from '@/components/pagination/TablePagination';

const INDEX_PATH = '/dashboard/marketing/sora-appointments';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Marketing', href: '#' },
    { title: 'Citas SORA', href: INDEX_PATH },
];

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

interface AppointmentUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface AppointmentConversation {
    id: number;
    user_id: number | null;
    guest_name: string | null;
    guest_phone: string | null;
    vehicle_brand: string | null;
    vehicle_model: string | null;
    vehicle_plate: string | null;
    status: 'active' | 'closed' | 'escalated';
}

interface SoraAppointment {
    id: number;
    conversation_id: number;
    user_id: number | null;
    guest_name: string | null;
    guest_phone: string | null;
    vehicle_brand: string | null;
    vehicle_model: string | null;
    vehicle_plate: string | null;
    scheduled_at: string;
    status: AppointmentStatus;
    notes: string | null;
    user: AppointmentUser | null;
    conversation: AppointmentConversation | null;
}

interface Stats {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
}

interface Filters {
    search: string | null;
    status: string | null;
    type: string;
    date_from: string;
    date_to: string;
    per_page: number;
}

interface PageProps {
    appointments: PaginatedResponse<SoraAppointment>;
    filters: Filters;
    stats: Stats;
}

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; cls: string }> = {
    pending:   { label: 'Pendiente',  cls: 'bg-amber-500/10 text-amber-500 border border-amber-500/30' },
    confirmed: { label: 'Confirmada', cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
    cancelled: { label: 'Cancelada',  cls: 'bg-rose-500/10 text-rose-400 border border-rose-500/30' },
};

const STATUS_OPTIONS = [
    { value: 'all',       label: 'Todos los estados' },
    { value: 'pending',   label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'cancelled', label: 'Cancelada' },
];

const TYPE_OPTIONS = [
    { value: 'all',        label: 'Todos' },
    { value: 'registered', label: 'Registrados' },
    { value: 'guest',      label: 'Invitados' },
];

function clientName(a: SoraAppointment): string {
    if (a.user) return `${a.user.first_name} ${a.user.last_name}`.trim();
    return a.guest_name ?? a.conversation?.guest_name ?? 'Invitado';
}

function clientContact(a: SoraAppointment): string {
    if (a.user?.email) return a.user.email;
    return a.guest_phone ?? a.conversation?.guest_phone ?? '—';
}

function vehicleLabel(a: SoraAppointment): string {
    const brand = a.vehicle_brand ?? a.conversation?.vehicle_brand;
    const model = a.vehicle_model ?? a.conversation?.vehicle_model;
    const plate = a.vehicle_plate ?? a.conversation?.vehicle_plate;
    const base  = [brand, model].filter(Boolean).join(' ');
    if (plate && base) return `${base} · ${plate}`;
    if (plate) return plate;
    return base || '—';
}

function fmtDateTime(iso: string): string {
    return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

function fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function SoraAppointmentsIndex({ appointments, filters, stats }: PageProps) {
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const off1 = router.on('start', () => setIsNavigating(true));
        const off2 = router.on('finish', () => setIsNavigating(false));
        return () => {
            off1();
            off2();
        };
    }, []);

    const applyFilter = (extra: Record<string, string | number | undefined>) => {
        router.get(INDEX_PATH, { ...filters, page: undefined, ...extra }, { preserveState: true, replace: true });
    };

    const clearDates = () => {
        router.get(INDEX_PATH, { ...filters, date_from: undefined, date_to: undefined, page: undefined }, { preserveState: true });
    };

    const columns = [
        {
            key: 'scheduled_at',
            label: 'Fecha cita',
            render: (a: SoraAppointment) => (
                <span className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                    {fmtDateTime(a.scheduled_at)}
                </span>
            ),
        },
        {
            key: 'client',
            label: 'Cliente',
            render: (a: SoraAppointment) => (
                <div className="flex items-center gap-2">
                    <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${a.user ? 'bg-cyan-500/10' : 'bg-muted'}`}>
                        {a.user
                            ? <UserCheck className="size-3.5 text-cyan-400" />
                            : <UserX className="size-3.5 text-muted-foreground" />
                        }
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{clientName(a)}</p>
                        <p className="truncate text-xs text-muted-foreground">
                            {clientContact(a)}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'vehicle',
            label: 'Vehículo',
            render: (a: SoraAppointment) => (
                <span className="flex items-center gap-1 text-sm text-foreground">
                    <Car className="size-3.5 text-muted-foreground/70" />
                    <span className="truncate">{vehicleLabel(a)}</span>
                </span>
            ),
        },
        {
            key: 'type',
            label: 'Tipo',
            render: (a: SoraAppointment) => (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <User className="size-3" />
                    {a.user ? 'Registrado' : 'Invitado'}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            render: (a: SoraAppointment) => {
                const cfg = STATUS_CONFIG[a.status];
                return (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.cls}`}>
                        {a.status === 'confirmed' && <CheckCircle2 className="size-3" />}
                        {a.status === 'pending' && <Clock className="size-3" />}
                        {a.status === 'cancelled' && <FileText className="size-3" />}
                        {cfg.label}
                    </span>
                );
            },
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#D9252A]/8">
                <Calendar className="size-7 text-[#D9252A]/50" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-foreground">Sin citas agendadas</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Aún no hay citas registradas en este rango.</p>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Citas SORA" />

            <div className="relative flex flex-1 flex-col gap-4 p-4 md:p-6">
                {isNavigating && (
                    <div className="absolute left-0 right-0 top-0 z-10 h-0.5 animate-pulse rounded-b bg-primary/80" role="progressbar" aria-label="Cargando" />
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="relative inline-block pb-1 text-xl font-semibold tracking-tight text-foreground">
                            Citas SORA
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Agenda de citas generadas desde las conversaciones con SORA.
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
                            <Calendar className="size-4 text-primary" />
                        </div>
                        <div className="text-xs">
                            <p className="font-semibold text-foreground">Agenda inteligente</p>
                            <p className="text-muted-foreground">Integrada con SORA</p>
                        </div>
                    </div>
                </div>

                {/* Stats pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <LayoutGrid className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Citas</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.total}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Pendientes</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.pending}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">Confirmadas</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.confirmed}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 dark:bg-rose-950/40">
                        <FileText className="size-3.5 text-rose-600 dark:text-rose-400" />
                        <span className="text-muted-foreground">Canceladas</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{stats.cancelled}</span>
                    </span>
                </div>

                <div className="border-t border-content-border pt-0" />

                {/* Card */}
                <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                    {/* Toolbar */}
                    <div className="border-b border-content-border p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                            <SearchInput
                                queryKey="search"
                                defaultValue={filters.search ?? ''}
                                placeholder="Buscar por cliente, teléfono o placa…"
                                className="w-full sm:w-64"
                                inputClassName="focus-visible:border-primary/50 focus-visible:ring-primary/30"
                            />

                            {/* Date range */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Calendar className="size-4" />
                                    <span className="hidden sm:inline">Rango:</span>
                                </span>
                                <Input
                                    type="date"
                                    className="h-9 w-full border-content-border sm:w-36"
                                    value={filters.date_from ?? ''}
                                    onChange={(e) => applyFilter({ date_from: e.target.value })}
                                    aria-label="Desde"
                                />
                                <span className="text-muted-foreground">—</span>
                                <Input
                                    type="date"
                                    className="h-9 w-full border-content-border sm:w-36"
                                    value={filters.date_to ?? ''}
                                    onChange={(e) => applyFilter({ date_to: e.target.value })}
                                    aria-label="Hasta"
                                />
                                {(filters.date_from || filters.date_to) && (
                                    <Button type="button" variant="ghost" size="sm" className="h-9 text-muted-foreground hover:text-foreground" onClick={clearDates}>
                                        Limpiar
                                    </Button>
                                )}
                            </div>

                            {/* Status */}
                            <Select value={filters.status ?? 'all'} onValueChange={(v) => applyFilter({ status: v === 'all' ? undefined : v })}>
                                <SelectTrigger className="h-9 w-full border-content-border sm:w-44">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Type */}
                            <Select value={filters.type ?? 'all'} onValueChange={(v) => applyFilter({ type: v })}>
                                <SelectTrigger className="h-9 w-full border-content-border sm:w-36">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPE_OPTIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="relative">
                        {/* Desktop */}
                        <div className="hidden md:block">
                            <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent" />

                            <DataTable<SoraAppointment>
                                columns={columns}
                                data={appointments.data}
                                keyExtractor={(a) => a.id}
                                emptyContent={emptyContent}
                                embedded
                                striped
                            />

                            {appointments.data.length > 5 && (
                                <div
                                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-card via-card/70 to-transparent"
                                    aria-hidden
                                />
                            )}
                        </div>

                        {/* Mobile */}
                        <div className="block md:hidden">
                            {appointments.data.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 px-4 py-10">{emptyContent}</div>
                            ) : (
                                <ul className="flex flex-col gap-3 p-3">
                                    {appointments.data.map((a) => (
                                        <li key={a.id}>
                                            <DataTableCard
                                                title={clientName(a)}
                                                actions={
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                        <Phone className="size-3" />
                                                        {clientContact(a)}
                                                    </span>
                                                }
                                                fields={[
                                                    { label: 'Fecha cita', value: fmtDateTime(a.scheduled_at) },
                                                    { label: 'Vehículo', value: vehicleLabel(a) },
                                                    { label: 'Estado', value: STATUS_CONFIG[a.status].label },
                                                    { label: 'Tipo', value: a.user ? 'Registrado' : 'Invitado' },
                                                ]}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-content-border px-3 py-3 sm:px-4">
                        <TablePagination
                            from={appointments.from}
                            to={appointments.to}
                            total={appointments.total}
                            perPage={appointments.per_page}
                            currentPage={appointments.current_page}
                            lastPage={appointments.last_page}
                            links={appointments.links}
                            indexPath={INDEX_PATH}
                            search={filters.search ?? ''}
                            perPageOptions={[10, 20, 50]}
                            extraParams={{
                                status:    filters.status    ?? undefined,
                                type:      filters.type      !== 'all' ? filters.type : undefined,
                                date_from: filters.date_from ?? undefined,
                                date_to:   filters.date_to   ?? undefined,
                            }}
                        />
                    </div>
                </div>

                {/* Watermark */}
                <div className="flex items-center justify-center gap-2 py-1 opacity-25">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        SORA · Agenda de citas
                    </span>
                    <Calendar className="size-3.5 text-muted-foreground" />
                </div>
            </div>
        </AppLayout>
    );
}

