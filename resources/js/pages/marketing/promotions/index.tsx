import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import {
    Calendar,
    CheckCircle2,
    Eye,
    EyeOff,
    FileText,
    ImagePlus,
    LayoutGrid,
    Loader2,
    Mail,
    Megaphone,
    MessageCircle,
    Pencil,
    Plus,
    Send,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de control', href: '/dashboard' },
    { title: 'Marketing', href: '#' },
    { title: 'Promociones', href: '/dashboard/marketing/promotions' },
];

const INDEX_PATH = '/dashboard/marketing/promotions';

const STATUS_OPTIONS = [
    { value: 'all',      label: 'Todos' },
    { value: 'active',   label: 'Activas' },
    { value: 'inactive', label: 'Inactivas' },
];

type Promotion = {
    id: number;
    title: string;
    description: string | null;
    image_path: string | null;
    is_active: boolean;
    notifications_sent: boolean;
    notifications_sent_at: string | null;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
    sends_count: number;
    creator?: { id: number; first_name?: string; last_name?: string } | null;
};

type PromotionsIndexProps = {
    promotions: PaginatedResponse<Promotion>;
    stats: { total: number; active: number; active_clients: number };
    filters: { search?: string; per_page?: number; filter_status?: string };
    can: {
        create?: boolean;
        update?: boolean;
        delete?: boolean;
        toggle?: boolean;
        send_notification?: boolean;
    };
};

const EMPTY_FORM = { title: '', description: '', is_active: false, starts_at: '', ends_at: '' };

function imageUrl(path: string | null): string | null {
    if (!path) return null;
    return `/storage/${path}`;
}

function formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PromotionsIndex({ promotions, stats, filters, can }: PromotionsIndexProps) {
    const [isNavigating, setIsNavigating]   = useState(false);
    const [formOpen, setFormOpen]           = useState(false);
    const [editing, setEditing]             = useState<Promotion | null>(null);
    const [deleting, setDeleting]           = useState<Promotion | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [toggling, setToggling]   = useState<number | null>(null);
    const [saving, setSaving]       = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // ── Modal envío en tiempo real ──────────────────────────────────────────
    type StreamClient = {
        index: number;
        name: string;
        email?: string | null;
        phone?: string | null;
        sent_whatsapp?: boolean;
        sent_email?: boolean;
        status: 'pending' | 'sending' | 'sent' | 'error';
        error?: string;
    };
    const [streamOpen, setStreamOpen]       = useState(false);
    const [streamPromo, setStreamPromo]     = useState<Promotion | null>(null);
    const [streamClients, setStreamClients] = useState<StreamClient[]>([]);
    const [streamTotal, setStreamTotal]     = useState(0);
    const [streamDone, setStreamDone]       = useState(false);
    const [streamSent, setStreamSent]       = useState(0);
    const streamListRef = useRef<HTMLUListElement>(null);

    const handleSend = (p: Promotion) => {
        setStreamPromo(p);
        setStreamClients([]);
        setStreamTotal(0);
        setStreamDone(false);
        setStreamSent(0);
        setStreamOpen(true);

        const evtSource = new EventSource(`/dashboard/marketing/promotions/${p.id}/send-stream`);

        evtSource.onmessage = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === 'start') {
                setStreamTotal(data.total);
                return;
            }
            if (data.type === 'sending') {
                setStreamClients((prev) => [
                    ...prev,
                    { index: data.index, name: data.name, email: data.email, phone: data.phone, status: 'sending' },
                ]);
                // auto-scroll al último
                setTimeout(() => {
                    streamListRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 50);
                return;
            }
            if (data.type === 'sent') {
                setStreamClients((prev) =>
                    prev.map((c) =>
                        c.index === data.index
                            ? { ...c, status: 'sent', sent_whatsapp: data.sent_whatsapp, sent_email: data.sent_email }
                            : c,
                    ),
                );
                setStreamSent((n) => n + 1);
                return;
            }
            if (data.type === 'error') {
                setStreamClients((prev) =>
                    prev.map((c) =>
                        c.index === data.index
                            ? { ...c, status: 'error', error: data.error }
                            : c,
                    ),
                );
                return;
            }
            if (data.type === 'done') {
                setStreamDone(true);
                evtSource.close();
                router.reload({ only: ['promotions', 'stats'] });
                return;
            }
        };

        evtSource.onerror = () => {
            setStreamDone(true);
            evtSource.close();
        };
    };

    // ── Modal lista de envíos anteriores ───────────────────────────────────
    type SendRecord = {
        id: number;
        sent_at: string;
        sent_whatsapp: boolean;
        sent_email: boolean;
        user: { id: number; name: string; email: string | null; phone: string | null } | null;
    };
    const [sendsPromotion, setSendsPromotion] = useState<Promotion | null>(null);
    const [sendsList, setSendsList]           = useState<SendRecord[]>([]);
    const [sendsLoading, setSendsLoading]     = useState(false);

    const openSendsList = async (p: Promotion) => {
        setSendsPromotion(p);
        setSendsList([]);
        setSendsLoading(true);
        try {
            const res = await fetch(`/dashboard/marketing/promotions/${p.id}/sends`, {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await res.json();
            setSendsList(data);
        } finally {
            setSendsLoading(false);
        }
    };

    const [form, setForm]                   = useState(EMPTY_FORM);
    const [imageFile, setImageFile]         = useState<File | null>(null);
    const [imagePreview, setImagePreview]   = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const offStart  = router.on('start',  () => setIsNavigating(true));
        const offFinish = router.on('finish', () => setIsNavigating(false));
        return () => { offStart(); offFinish(); };
    }, []);

    const onFilterStatus = (value: string) =>
        router.get(INDEX_PATH, { ...filters, filter_status: value === 'all' ? undefined : value, page: undefined }, { preserveState: true });

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setImageFile(null);
        setImagePreview(null);
        setFormOpen(true);
    };

    const openEdit = (p: Promotion) => {
        setEditing(p);
        setForm({
            title:       p.title,
            description: p.description ?? '',
            is_active:   p.is_active,
            starts_at:   p.starts_at ? p.starts_at.slice(0, 10) : '',
            ends_at:     p.ends_at   ? p.ends_at.slice(0, 10)   : '',
        });
        setImageFile(null);
        setImagePreview(p.image_path ? imageUrl(p.image_path) : null);
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!form.title.trim()) return;
        setSaving(true);
        const formData = new FormData();
        formData.append('title',       form.title);
        formData.append('description', form.description);
        formData.append('is_active',   form.is_active ? '1' : '0');
        if (form.starts_at) formData.append('starts_at', form.starts_at);
        if (form.ends_at)   formData.append('ends_at',   form.ends_at);
        if (imageFile)      formData.append('image',     imageFile);
        const url = editing
            ? `/dashboard/marketing/promotions/${editing.id}`
            : '/dashboard/marketing/promotions';
        router.post(url, formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => { setSaving(false); closeForm(); },
        });
    };

    const handleToggle = (p: Promotion) => {
        setToggling(p.id);
        router.post(`/dashboard/marketing/promotions/${p.id}/toggle-active`, {}, {
            preserveScroll: true,
            onFinish: () => setToggling(null),
        });
    };

    const handleDelete = () => {
        if (!deleting) return;
        router.delete(`/dashboard/marketing/promotions/${deleting.id}`, {
            preserveScroll: true,
            onFinish: () => { setDeleting(null); setConfirmDelete(false); },
        });
    };

    const columns = [
        {
            key: 'image',
            label: '',
            className: 'w-20',
            render: (p: Promotion) => (
                p.image_path
                    ? (
                        <div
                            className="cursor-pointer group relative size-14 overflow-hidden rounded-lg border border-content-border shadow-sm"
                            onClick={() => setPreviewImage(imageUrl(p.image_path))}
                            title="Ver imagen completa"
                        >
                            <img
                                src={imageUrl(p.image_path)!}
                                alt={p.title}
                                className="size-full object-cover transition-transform duration-200 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <Eye className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                            </div>
                        </div>
                    )
                    : (
                        <div className="size-14 rounded-lg bg-content-muted/40 flex items-center justify-center border border-content-border">
                            <Megaphone className="size-5 text-muted-foreground/50" />
                        </div>
                    )
            ),
        },
        {
            key: 'title',
            label: 'Título / Descripción',
            render: (p: Promotion) => (
                <div>
                    <p className="font-medium text-sm text-foreground">{p.title}</p>
                    {p.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            render: (p: Promotion) => (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                    p.is_active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                        : 'bg-content-muted/60 text-muted-foreground'
                }`}>
                    {p.is_active ? 'Activa' : 'Inactiva'}
                </span>
            ),
        },
        {
            key: 'notifications',
            label: 'Notificación',
            render: (p: Promotion) => (
                p.notifications_sent
                    ? (
                        <div>
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 block">
                                {formatDate(p.notifications_sent_at)}
                            </span>
                            <button
                                type="button"
                                onClick={() => openSendsList(p)}
                                className="cursor-pointer text-[10px] text-violet-600 dark:text-violet-400 flex items-center gap-1 mt-0.5 hover:underline"
                            >
                                <Users className="size-3" />
                                {p.sends_count} cliente{p.sends_count !== 1 ? 's' : ''}
                            </button>
                        </div>
                    )
                    : <span className="text-xs text-muted-foreground">No enviado</span>
            ),
        },
        {
            key: 'vigencia',
            label: 'Vigencia',
            render: (p: Promotion) => (
                <span className="text-xs text-muted-foreground tabular-nums">
                    {p.starts_at ? formatDate(p.starts_at) : '—'} → {p.ends_at ? formatDate(p.ends_at) : 'Sin fin'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Acciones',
            className: 'w-[160px] text-right',
            render: (p: Promotion) => (
                <div className="flex items-center justify-end gap-1">
                    {can.send_notification && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon"
                                    className="cursor-pointer shrink-0 text-violet-600 hover:bg-violet-50 hover:text-violet-700 dark:text-violet-400 dark:hover:bg-violet-950/30"
                                    onClick={() => handleSend(p)}
                                >
                                    <Send className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Enviar a todos los clientes</TooltipContent>
                        </Tooltip>
                    )}
                    {can.toggle && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon"
                                    className={`cursor-pointer shrink-0 ${p.is_active
                                        ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30'
                                        : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
                                    }`}
                                    disabled={toggling === p.id}
                                    onClick={() => handleToggle(p)}
                                >
                                    {p.is_active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{p.is_active ? 'Desactivar de la web' : 'Activar en la web'}</TooltipContent>
                        </Tooltip>
                    )}
                    {can.update && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon"
                                    className="cursor-pointer shrink-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
                                    onClick={() => openEdit(p)}
                                >
                                    <Pencil className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                        </Tooltip>
                    )}
                    {can.delete && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon"
                                    className="cursor-pointer shrink-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:text-rose-400/80 dark:hover:bg-rose-900/20"
                                    onClick={() => { setDeleting(p); setConfirmDelete(true); }}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-4">
            <Megaphone className="size-10 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No hay promociones creadas aún.</span>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Promociones" />

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
                            Promociones
                            <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-rose-500" aria-hidden />
                        </h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Gestiona las promociones que se muestran en la web y se envían a clientes.
                        </p>
                    </div>
                    {can.create && (
                        <Button
                            onClick={openCreate}
                            className="cursor-pointer shrink-0 bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                        >
                            <Plus className="size-4" />
                            Nueva promoción
                        </Button>
                    )}
                </div>

                {/* Stats pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <Megaphone className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.total}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <Eye className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">Activa en web</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.active}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 dark:bg-violet-950/40">
                        <Users className="size-3.5 text-violet-600 dark:text-violet-400" />
                        <span className="text-muted-foreground">Clientes activos</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">{stats.active_clients}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 dark:bg-amber-950/40">
                        <FileText className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-muted-foreground">Página</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {promotions.current_page}
                            <span className="font-normal text-muted-foreground"> / {promotions.last_page}</span>
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <LayoutGrid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{promotions.data.length}</span>
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
                                placeholder="Buscar por título…"
                                className="w-full sm:w-72"
                                inputClassName="focus-visible:border-primary/50 focus-visible:ring-primary/30"
                            />
                            <Select value={filters.filter_status ?? 'all'} onValueChange={onFilterStatus}>
                                <SelectTrigger className="w-full sm:w-44 border-content-border">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {filters.search != null && filters.search !== '' && (
                            <p className="mt-2 text-muted-foreground text-sm">
                                <span className="font-medium text-foreground">{promotions.total}</span>{' '}
                                resultado{promotions.total !== 1 ? 's' : ''} para «{filters.search}»
                            </p>
                        )}
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <DataTable<Promotion>
                            columns={columns}
                            data={promotions.data}
                            keyExtractor={(p) => p.id}
                            emptyMessage="No hay promociones creadas aún."
                            emptyContent={emptyContent}
                            embedded
                            striped
                        />
                    </div>

                    {/* Mobile */}
                    <div className="block md:hidden">
                        {promotions.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">{emptyContent}</div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {promotions.data.map((item) => (
                                    <li key={item.id}>
                                        <DataTableCard
                                            title={item.title}
                                            actions={
                                                <div className="flex flex-wrap items-center gap-2">
                                    {can.send_notification && (
                                        <Button variant="outline" size="sm"
                                            className="cursor-pointer shrink-0 border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400"
                                            onClick={() => handleSend(item)}
                                        >
                                            <Send className="size-3.5 mr-1" />
                                            Enviar
                                        </Button>
                                    )}
                                                    {can.toggle && (
                                                        <Button variant="outline" size="sm"
                                                            className={`cursor-pointer shrink-0 ${item.is_active
                                                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400'
                                                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400'
                                                            }`}
                                                            onClick={() => handleToggle(item)}
                                                        >
                                                            {item.is_active ? <><EyeOff className="size-3.5 mr-1" />Desactivar</> : <><Eye className="size-3.5 mr-1" />Activar</>}
                                                        </Button>
                                                    )}
                                                    {can.update && (
                                                        <Button variant="outline" size="sm"
                                                            className="cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400"
                                                            onClick={() => openEdit(item)}
                                                        >
                                                            <Pencil className="size-3.5 mr-1" />Editar
                                                        </Button>
                                                    )}
                                                    {can.delete && (
                                                        <Button variant="outline" size="sm"
                                                            className="cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
                                                            onClick={() => { setDeleting(item); setConfirmDelete(true); }}
                                                        >
                                                            <Trash2 className="size-3.5 mr-1" />Eliminar
                                                        </Button>
                                                    )}
                                                </div>
                                            }
                                            fields={[
                                                { label: 'Estado', value: item.is_active ? 'Activa' : 'Inactiva' },
                                                {
                                                    label: 'Notificación',
                                                    value: item.notifications_sent
                                                        ? `${formatDate(item.notifications_sent_at)} · ${item.sends_count} cliente${item.sends_count !== 1 ? 's' : ''}`
                                                        : 'No enviado',
                                                },
                                                { label: 'Vigencia', value: `${item.starts_at ? formatDate(item.starts_at) : '—'} → ${item.ends_at ? formatDate(item.ends_at) : 'Sin fin'}` },
                                            ]}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Paginación */}
                    <div className="border-t border-content-border px-3 py-3 sm:px-4">
                        <TablePagination
                            from={promotions.from}
                            to={promotions.to}
                            total={promotions.total}
                            perPage={promotions.per_page}
                            currentPage={promotions.current_page}
                            lastPage={promotions.last_page}
                            links={promotions.links}
                            indexPath={INDEX_PATH}
                            search={filters.search}
                            extraParams={{ filter_status: filters.filter_status }}
                        />
                    </div>
                </div>
            </div>

            {/* Modal crear/editar */}
            <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Megaphone className="size-4 text-rose-500" />
                            {editing ? 'Editar promoción' : 'Nueva promoción'}
                        </DialogTitle>
                        <DialogDescription>
                            {editing ? 'Actualiza los datos de la promoción.' : 'Completa los datos para crear la promoción.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Separator className="bg-content-border" />

                    <div className="flex flex-col gap-4">
                        {/* Imagen */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground">Imagen</label>
                            <div
                                className="relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-content-border hover:border-rose-400 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="preview" className="size-full object-contain" />
                                        <button
                                            type="button"
                                            className="absolute top-1 right-1 rounded-full bg-white/80 p-0.5 text-rose-500 hover:bg-white dark:bg-black/60"
                                            onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <ImagePlus className="size-8 text-rose-400" />
                                        <span className="text-xs">Haz clic para subir imagen</span>
                                        <span className="text-[10px]">JPG, PNG, WEBP — máx. 5 MB</span>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </div>

                        {/* Título */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground">
                                Título <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                placeholder="Ej. 30% en cambio de aceite"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="h-9"
                            />
                        </div>

                        {/* Descripción */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground">
                                Descripción <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Detalles de la promoción..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                            />
                        </div>

                        {/* Fechas de vigencia */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    <Calendar className="size-3.5 text-muted-foreground" />
                                    Inicio <span className="text-xs font-normal text-muted-foreground">(opc.)</span>
                                </label>
                                <Input type="date" className="h-9" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                    <Calendar className="size-3.5 text-muted-foreground" />
                                    Fin <span className="text-xs font-normal text-muted-foreground">(opc.)</span>
                                </label>
                                <Input type="date" className="h-9" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
                            </div>
                        </div>

                        {/* Activar en web */}
                        <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-lg border border-content-border px-3 py-2.5 hover:bg-content-muted/30 transition-colors">
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                className="size-4 rounded border-content-border accent-rose-500"
                            />
                            <div>
                                <p className="text-sm font-medium text-foreground">Mostrar en la web</p>
                                <p className="text-xs text-muted-foreground">Aparecerá como modal al entrar a la página</p>
                            </div>
                        </label>
                    </div>

                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="outline" className="cursor-pointer w-full sm:w-auto" onClick={closeForm} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button
                            className="cursor-pointer w-full sm:w-auto bg-rose-500/85 hover:bg-rose-600 text-white"
                            onClick={handleSubmit}
                            disabled={saving || !form.title.trim()}
                        >
                            {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear promoción'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal ver imagen completa */}
            <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="sm:max-w-2xl p-2 bg-black/90 border-white/10">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Vista previa de imagen</DialogTitle>
                    </DialogHeader>
                    <div className="relative flex items-center justify-center min-h-[300px] max-h-[80vh]">
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Vista previa"
                                className="max-h-[78vh] max-w-full rounded-md object-contain"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog eliminar */}
            <Dialog open={confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(false)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <Trash2 className="size-4" />
                            Eliminar promoción
                        </DialogTitle>
                        <DialogDescription>
                            ¿Seguro que deseas eliminar <strong>{deleting?.title}</strong>? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <Button variant="outline" className="cursor-pointer w-full sm:w-auto" onClick={() => setConfirmDelete(false)}>
                            Cancelar
                        </Button>
                        <Button
                            className="cursor-pointer w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white"
                            onClick={handleDelete}
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* ── Modal envío en tiempo real ─────────────────────────────────── */}
            <Dialog open={streamOpen} onOpenChange={(open) => { if (!open && streamDone) setStreamOpen(false); }}>
                <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Enviando promoción</DialogTitle>
                        <DialogDescription>Progreso del envío de notificaciones a clientes</DialogDescription>
                    </DialogHeader>
                    {/* Header visual */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-content-border">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950/60">
                            {streamDone
                                ? <CheckCircle2 className="size-5 text-emerald-500" />
                                : <Send className="size-4 text-violet-600 dark:text-violet-400 animate-pulse" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {streamDone ? 'Envío completado' : 'Enviando promoción…'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{streamPromo?.title}</p>
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-violet-600 dark:text-violet-400 shrink-0">
                            {streamSent}/{streamTotal}
                        </span>
                    </div>

                    {/* Barra de progreso */}
                    <div className="h-1.5 bg-content-muted/40 w-full">
                        <div
                            className={`h-full transition-all duration-500 rounded-r-full ${streamDone ? 'bg-emerald-500' : 'bg-violet-500'}`}
                            style={{ width: streamTotal > 0 ? `${Math.round((streamSent / streamTotal) * 100)}%` : '0%' }}
                        />
                    </div>

                    {/* Lista de clientes */}
                    <ul
                        ref={streamListRef}
                        className="flex-1 overflow-y-auto divide-y divide-content-border/60 px-2 py-1"
                        style={{ minHeight: 120, maxHeight: 'min(50vh, 360px)' }}
                    >
                        {streamClients.length === 0 && !streamDone && (
                            <li className="flex items-center justify-center gap-2 py-8 text-muted-foreground text-xs">
                                <Loader2 className="size-4 animate-spin" />
                                Preparando envíos…
                            </li>
                        )}
                        {streamClients.map((c) => (
                            <li key={c.index} className="flex items-center gap-3 py-2.5 px-1">
                                {/* Avatar inicial */}
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-950/40 text-[11px] font-bold text-violet-600 dark:text-violet-400">
                                    {c.name.charAt(0).toUpperCase()}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {c.email && (
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 truncate">
                                                <Mail className="size-2.5 shrink-0" />{c.email}
                                            </span>
                                        )}
                                        {c.phone && (
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                                                <MessageCircle className="size-2.5" />{c.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Estado */}
                                <div className="shrink-0 flex items-center gap-1">
                                    {c.status === 'sending' && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 text-[9px] font-medium text-violet-600 dark:text-violet-400">
                                            <Loader2 className="size-2.5 animate-spin" /> Enviando
                                        </span>
                                    )}
                                    {c.status === 'sent' && (
                                        <div className="flex items-center gap-1">
                                            {c.sent_whatsapp && (
                                                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                                                    <MessageCircle className="size-2.5" /> WA
                                                </span>
                                            )}
                                            {c.sent_email && (
                                                <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 text-[9px] font-medium text-blue-700 dark:text-blue-400 flex items-center gap-0.5">
                                                    <Mail className="size-2.5" /> Email
                                                </span>
                                            )}
                                            <CheckCircle2 className="size-3.5 text-emerald-500 ml-0.5" />
                                        </div>
                                    )}
                                    {c.status === 'error' && (
                                        <span className="rounded-full bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 text-[9px] font-medium text-rose-600 dark:text-rose-400">
                                            Error
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Footer */}
                    <div className="border-t border-content-border px-5 py-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                            {streamDone
                                ? `✅ ${streamSent} cliente${streamSent !== 1 ? 's' : ''} notificado${streamSent !== 1 ? 's' : ''} correctamente`
                                : 'No cierres esta ventana hasta que finalice'
                            }
                        </p>
                        {streamDone && (
                            <Button size="sm" variant="outline" className="cursor-pointer shrink-0" onClick={() => setStreamOpen(false)}>
                                Cerrar
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal lista de clientes notificados */}
            <Dialog open={!!sendsPromotion} onOpenChange={(open) => !open && setSendsPromotion(null)}>
                <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="size-4 text-violet-500" />
                            Clientes notificados
                        </DialogTitle>
                        <DialogDescription>
                            {sendsPromotion?.title} — lista de envíos individuales
                        </DialogDescription>
                    </DialogHeader>
                    <Separator className="bg-content-border" />

                    <div className="flex-1 overflow-y-auto">
                        {sendsLoading ? (
                            <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground text-sm">
                                <Loader2 className="size-4 animate-spin" />
                                Cargando...
                            </div>
                        ) : sendsList.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground text-sm">
                                <Users className="size-8 opacity-30" />
                                Sin registros de envío
                            </div>
                        ) : (
                            <ul className="divide-y divide-content-border">
                                {sendsList.map((s) => (
                                    <li key={s.id} className="flex items-center gap-3 px-1 py-2.5">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-950/40">
                                            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                                                {(s.user?.name ?? '?').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{s.user?.name ?? '—'}</p>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                                {s.user?.email && (
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                        <Mail className="size-2.5" />{s.user.email}
                                                    </span>
                                                )}
                                                {s.user?.phone && (
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                        <MessageCircle className="size-2.5" />{s.user.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span title="WhatsApp" className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${s.sent_whatsapp ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-content-muted/40 text-muted-foreground'}`}>
                                                <MessageCircle className="size-2.5" /> WA
                                            </span>
                                            <span title="Email" className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${s.sent_email ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' : 'bg-content-muted/40 text-muted-foreground'}`}>
                                                <Mail className="size-2.5" /> Email
                                            </span>
                                        </div>
                                        <div className="shrink-0 ml-1">
                                            <CheckCircle2 className="size-4 text-emerald-500" />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Separator className="bg-content-border" />
                    <DialogFooter>
                        <p className="text-xs text-muted-foreground flex-1">
                            {sendsList.length} registro{sendsList.length !== 1 ? 's' : ''} en total
                        </p>
                        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setSendsPromotion(null)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
