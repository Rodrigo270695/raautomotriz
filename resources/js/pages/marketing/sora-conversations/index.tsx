import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    Bot,
    Calendar,
    Car,
    CheckCircle2,
    Clock,
    Cpu,
    FileText,
    LayoutGrid,
    MessageSquare,
    User,
    UserCheck,
    UserX,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/data-table';
import { DataTableCard } from '@/components/data-table/DataTableCard';
import { TablePagination } from '@/components/pagination/TablePagination';
import { SearchInput } from '@/components/search';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginatedResponse } from '@/types';

const INDEX_PATH = '/dashboard/marketing/sora-conversations';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Marketing', href: '#' },
    { title: 'Conversaciones SORA', href: INDEX_PATH },
];

/* ─────────────────── Types ─────────────────── */

interface SoraMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    tokens_used: number | null;
    created_at: string;
}

interface SoraConversation {
    id: number;
    user_id: number | null;
    session_id: string | null;
    vehicle_plate: string | null;
    status: 'active' | 'closed' | 'escalated';
    created_at: string;
    user: { id: number; first_name: string; last_name: string; email: string } | null;
    messages: SoraMessage[];
}

interface Stats {
    total: number;
    registered: number;
    guests: number;
    with_plate: number;
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
    conversations: PaginatedResponse<SoraConversation>;
    filters: Filters;
    stats: Stats;
}

/* ─────────────────── Status config ─────────────────── */

const STATUS_CONFIG = {
    active:    { label: 'Activa',   icon: Clock,         cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    closed:    { label: 'Cerrada',  icon: CheckCircle2,  cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
    escalated: { label: 'Derivada', icon: AlertTriangle, cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
};

const STATUS_OPTIONS = [
    { value: 'all',       label: 'Todos los estados' },
    { value: 'active',    label: 'Activa' },
    { value: 'closed',    label: 'Cerrada' },
    { value: 'escalated', label: 'Derivada al taller' },
];

const TYPE_OPTIONS = [
    { value: 'all',        label: 'Todos' },
    { value: 'registered', label: 'Registrados' },
    { value: 'guest',      label: 'Invitados' },
];

/* ─────────────────── Helpers ─────────────────── */

function userName(conv: SoraConversation): string {
    return conv.user ? `${conv.user.first_name} ${conv.user.last_name}`.trim() : 'Invitado';
}

function fmtDate(iso: string): string {
    return new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

function fmtTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

/* ─────────────────── StatusBadge ─────────────────── */

function StatusBadge({ status }: { status: SoraConversation['status'] }) {
    const { label, icon: Icon, cls } = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
            <Icon className="size-2.5" />
            {label}
        </span>
    );
}

/* ─────────────────── Conversation Modal ─────────────────── */

function MessageBubble({ msg }: { msg: SoraMessage }) {
    const isUser = msg.role === 'user';
    return (
        <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${isUser ? 'bg-[#D9252A]/15' : 'bg-muted dark:bg-[#1E2D4A]'}`}>
                {isUser
                    ? <User className="size-3.5 text-[#D9252A]" />
                    : <Bot className="size-3.5 text-cyan-500 dark:text-cyan-400" />
                }
            </div>
            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isUser ? 'rounded-br-sm bg-[#D9252A]/10 text-foreground' : 'rounded-bl-sm bg-muted text-foreground'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="mt-1 text-[10px] opacity-40">
                    {fmtTime(msg.created_at)}
                    {msg.tokens_used ? ` · ${msg.tokens_used} tok` : ''}
                </p>
            </div>
        </div>
    );
}

function ConversationModal({ conv, onClose }: { conv: SoraConversation; onClose: () => void }) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
                style={{ maxHeight: '88vh' }}
                initial={{ scale: 0.95, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 24 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4 dark:bg-[#0d1929]">
                    <div className="flex items-center gap-3">
                        <div className="relative flex size-10 items-center justify-center rounded-xl bg-[#D9252A]/10">
                            <Bot className="size-5 text-[#D9252A]" />
                            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-card bg-cyan-400 dark:border-[#0d1929]" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{userName(conv)}</p>
                            <p className="text-xs text-muted-foreground">
                                {conv.user?.email ?? `Sesión anónima · ${conv.session_id?.slice(0, 10)}…`}
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <X className="size-4" />
                    </button>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-5 py-2.5 dark:bg-[#0d1929]/70">
                    <StatusBadge status={conv.status} />
                    {conv.vehicle_plate && (
                        <span className="flex items-center gap-1 rounded-lg border border-cyan-500/20 bg-cyan-50 px-2 py-0.5 font-mono text-xs font-bold text-cyan-700 dark:bg-white/5 dark:text-cyan-300">
                            <Car className="size-3" /> {conv.vehicle_plate}
                        </span>
                    )}
                    <span className="text-xs text-muted-foreground">{fmtDate(conv.created_at)}</span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="size-3" />
                        {conv.messages.length} mensaje{conv.messages.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Messages */}
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-background px-5 py-4 dark:bg-[#07101f]">
                    {conv.messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
                    {conv.messages.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">Sin mensajes registrados</p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─────────────────── Main page ─────────────────── */

export default function SoraConversationsIndex({ conversations, filters, stats }: PageProps) {
    const [selected, setSelected] = useState<SoraConversation | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const off1 = router.on('start',  () => setIsNavigating(true));
        const off2 = router.on('finish', () => setIsNavigating(false));
        return () => { off1(); off2(); };
    }, []);

    const applyFilter = (extra: Record<string, string | number | undefined>) => {
        router.get(INDEX_PATH, { ...filters, page: undefined, ...extra }, { preserveState: true, replace: true });
    };

    const clearDates = () => {
        router.get(INDEX_PATH, { ...filters, date_from: undefined, date_to: undefined, page: undefined }, { preserveState: true });
    };

    const columns = [
        {
            key: 'created_at',
            label: 'Fecha',
            render: (c: SoraConversation) => (
                <span className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                    {fmtDate(c.created_at)}
                </span>
            ),
        },
        {
            key: 'user',
            label: 'Cliente',
            render: (c: SoraConversation) => (
                <div className="flex items-center gap-2">
                    <div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${c.user ? 'bg-cyan-500/10' : 'bg-muted'}`}>
                        {c.user
                            ? <UserCheck className="size-3.5 text-cyan-400" />
                            : <UserX className="size-3.5 text-muted-foreground" />
                        }
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{userName(c)}</p>
                        <p className="truncate text-xs text-muted-foreground">
                            {c.user?.email ?? `ID: ${c.session_id?.slice(0, 14)}…`}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'vehicle_plate',
            label: 'Placa',
            render: (c: SoraConversation) =>
                c.vehicle_plate ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 font-mono text-xs font-bold text-cyan-400 dark:text-cyan-300">
                        <Car className="size-3 opacity-60" />
                        {c.vehicle_plate}
                    </span>
                ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                ),
        },
        {
            key: 'messages',
            label: 'Chat',
            render: (c: SoraConversation) => (
                <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                    <MessageSquare className="size-3.5 text-muted-foreground/50" />
                    {c.messages.length}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            render: (c: SoraConversation) => <StatusBadge status={c.status} />,
        },
        {
            key: 'actions',
            label: '',
            className: 'w-24 text-right',
            render: (c: SoraConversation) => (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="cursor-pointer gap-1.5 text-xs text-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                            onClick={() => setSelected(c)}
                        >
                            <MessageSquare className="size-3.5" />
                            Ver chat
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ver conversación completa</TooltipContent>
                </Tooltip>
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#D9252A]/8">
                <Bot className="size-7 text-[#D9252A]/50" />
            </div>
            <div className="text-center">
                <p className="text-sm font-medium text-foreground">Sin conversaciones</p>
                <p className="mt-0.5 text-xs text-muted-foreground">No hay chats registrados en este período.</p>
            </div>
        </div>
    );

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Conversaciones SORA" />

            <div className="relative flex flex-1 flex-col gap-4 p-4 md:p-6">

                {/* Navigation progress bar */}
                {isNavigating && (
                    <div className="absolute left-0 right-0 top-0 z-10 h-0.5 animate-pulse rounded-b bg-cyan-500/70" role="progressbar" aria-label="Cargando" />
                )}

                {/* ── Page header ── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="relative inline-block pb-1 text-xl font-semibold tracking-tight text-foreground">
                            Conversaciones SORA
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-[#D9252A]" aria-hidden />
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Historial de chats con el asistente virtual — los técnicos pueden preparar el diagnóstico antes de que llegue el cliente.
                        </p>
                    </div>
                    {/* AI badge */}
                    <div className="flex shrink-0 items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
                        <div className="relative flex size-8 items-center justify-center rounded-lg bg-[#D9252A]/10">
                            <Bot className="size-4 text-[#D9252A]" />
                            <span className="absolute -right-0.5 -top-0.5 size-2 animate-pulse rounded-full bg-cyan-400" />
                        </div>
                        <div className="text-xs">
                            <p className="font-semibold text-foreground">SORA AI</p>
                            <p className="text-muted-foreground">En línea</p>
                        </div>
                    </div>
                </div>

                {/* ── Stats pills ── */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Activity className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Conversaciones</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.total}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 dark:bg-cyan-950/40">
                        <UserCheck className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span className="text-muted-foreground">Registrados</span>
                        <span className="font-semibold text-cyan-600 dark:text-cyan-400">{stats.registered}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <UserX className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">Invitados</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">{stats.guests}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <Car className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Con placa</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.with_plate}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <LayoutGrid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">Página</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {conversations.current_page}
                            <span className="font-normal text-muted-foreground"> / {conversations.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 dark:bg-rose-950/40">
                        <FileText className="size-3.5 text-rose-600 dark:text-rose-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{conversations.data.length}</span>
                    </span>
                </div>

                <div className="border-t border-content-border pt-0" />

                {/* ── Table card ── */}
                <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">

                    {/* Toolbar */}
                    <div className="border-b border-content-border p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                            <SearchInput
                                queryKey="search"
                                defaultValue={filters.search ?? ''}
                                placeholder="Buscar por cliente o placa…"
                                className="w-full sm:w-64"
                                inputClassName="focus-visible:border-cyan-500/50 focus-visible:ring-cyan-500/20"
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

                            {/* Status filter */}
                            <Select value={filters.status ?? 'all'} onValueChange={(v) => applyFilter({ status: v === 'all' ? undefined : v })}>
                                <SelectTrigger className="h-9 w-full border-content-border sm:w-44">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            {/* Type filter */}
                            <Select value={filters.type ?? 'all'} onValueChange={(v) => applyFilter({ type: v })}>
                                <SelectTrigger className="h-9 w-full border-content-border sm:w-36">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* ── Futuristic table wrapper ── */}
                    <div className="relative">
                        {/* Desktop */}
                        <div className="hidden md:block">
                            {/* Subtle top scanner line */}
                            <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />

                            <DataTable<SoraConversation>
                                columns={columns}
                                data={conversations.data}
                                keyExtractor={(c) => c.id}
                                emptyContent={emptyContent}
                                embedded
                                striped
                            />

                            {/* Gradient fade at the bottom — futuristic effect */}
                            {conversations.data.length > 5 && (
                                <div
                                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-card via-card/70 to-transparent"
                                    aria-hidden
                                />
                            )}
                        </div>

                        {/* Mobile */}
                        <div className="block md:hidden">
                            {conversations.data.length === 0 ? (
                                <div className="flex flex-col items-center gap-3 px-4 py-10">{emptyContent}</div>
                            ) : (
                                <ul className="flex flex-col gap-3 p-3">
                                    {conversations.data.map((c) => (
                                        <li key={c.id}>
                                            <DataTableCard
                                                title={
                                                    <span className="flex items-center gap-2">
                                                        <span>{userName(c)}</span>
                                                        <StatusBadge status={c.status} />
                                                    </span>
                                                }
                                                actions={
                                                    <Button variant="outline" size="sm" className="cursor-pointer gap-1.5 text-xs text-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400" onClick={() => setSelected(c)}>
                                                        <MessageSquare className="size-3.5" />
                                                        Ver chat
                                                    </Button>
                                                }
                                                fields={[
                                                    { label: 'Fecha',    value: fmtDate(c.created_at) },
                                                    { label: 'Placa',    value: c.vehicle_plate ?? '—' },
                                                    { label: 'Mensajes', value: c.messages.length },
                                                    { label: 'Tipo',     value: c.user ? 'Registrado' : 'Invitado' },
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
                            from={conversations.from}
                            to={conversations.to}
                            total={conversations.total}
                            perPage={conversations.per_page}
                            currentPage={conversations.current_page}
                            lastPage={conversations.last_page}
                            links={conversations.links}
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

                {/* Watermark — futuristic branding */}
                <div className="flex items-center justify-center gap-2 py-1 opacity-25">
                    <Cpu className="size-3.5 text-muted-foreground" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        SORA · RA Automotriz AI Engine · Últimos 7 días por defecto
                    </span>
                    <Cpu className="size-3.5 text-muted-foreground" />
                </div>
            </div>

            {/* Conversation detail modal */}
            <AnimatePresence>
                {selected && (
                    <ConversationModal key={selected.id} conv={selected} onClose={() => setSelected(null)} />
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
