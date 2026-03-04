import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    CalendarClock,
    Car,
    CheckCircle2,
    ClipboardList,
    DollarSign,
    Package,
    TrendingUp,
    Users,
    Wallet,
    Wrench,
    XCircle,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';
import { index as dashboardRoute } from '@/routes/dashboard';
import { index as myOrdersRoute } from '@/routes/dashboard/my-orders';
import { index as myVehiclesRoute } from '@/routes/dashboard/my-vehicles';
import { index as workOrdersRoute } from '@/routes/dashboard/services/work-orders';
import { index as accountsReceivableRoute } from '@/routes/dashboard/services/accounts-receivable';
import { index as maintenanceSchedulesRoute } from '@/routes/dashboard/services/maintenance-schedules';
import { index as productsRoute } from '@/routes/dashboard/inventory/products';
import { formatCurrency, getWorkOrderStatusLabel } from '@/lib/workOrderUtils';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de control', href: dashboardRoute().url },
];

const STATUS_COLORS: Record<string, string> = {
    ingreso: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
    en_checklist: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
    diagnosticado: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
    en_reparacion: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
    listo_para_entregar: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    entregado: 'bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400',
    cancelado: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400',
};

function formatDate(date: string): string {
    if (!date) return '—';
    const [y, m, d] = date.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
    if (previous === 0) return null;
    const pct = Math.round(((current - previous) / previous) * 100);
    const isUp = pct >= 0;
    return (
        <span className={`flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(pct)}% vs mes anterior
        </span>
    );
}

function RevenueChangeBadge({ current, previous }: { current: number; previous: number }) {
    if (previous === 0) {
        return current > 0 ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3" /> Primer ingreso este mes
            </span>
        ) : (
            <span className="mt-2 text-xs text-muted-foreground">Sin ingresos en ambos meses</span>
        );
    }
    const pct = Math.round(((current - previous) / previous) * 100);
    const isUp = pct >= 0;
    return (
        <span
            className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${
                isUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
            }`}
        >
            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {isUp ? 'Subió' : 'Bajó'} {Math.abs(pct)}% vs mes anterior
        </span>
    );
}

type DailyComparisonDay = {
    day: number;
    current_month_count: number;
    previous_month_count: number;
};

type DashboardStats = {
    activeOrders: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    ordersThisMonth: number;
    ordersLastMonth: number;
    newClientsThisMonth: number;
    totalClients: number;
    totalVehicles: number;
    inventoryValue: number;
    statusDistribution: Array<{ status: string; label: string; count: number; active: boolean }>;
    lowStockProducts: Array<{ id: number; name: string; brand_name: string | null; stock: number }>;
    recentOrders: Array<{
        id: number;
        status: string;
        entry_date: string;
        total_amount: number;
        plate: string;
        client_name: string;
    }>;
    dailyComparison?: DailyComparisonDay[];
    dailyRevenueComparison?: DailyRevenueDay[];
    currentMonthLabel?: string;
    previousMonthLabel?: string;
    accountsReceivableTotal?: number;
    accountsReceivableOrdersCount?: number;
    ordersPaidThisMonth?: number;
    averageTicketThisMonth?: number;
    vehiclesRegisteredThisMonth?: number;
    ordersDeliveredThisMonth?: number;
    ordersCancelledThisMonth?: number;
    revenueYtd?: number;
    revenueYtdLastYear?: number;
    revenueByServiceTypeThisMonth?: Array<{ name: string; value: number }>;
    ordersByMonthLast12?: Array<{ month: number; year: number; label: string; count: number }>;
    revenueByMonthLast12?: Array<{ month: number; year: number; label: string; amount: number }>;
    vehiclesByMonthLast12?: Array<{ month: number; year: number; label: string; count: number }>;
};

type DailyRevenueDay = {
    day: number;
    current_month_amount: number;
    previous_month_amount: number;
};

type ClientStats = {
    activeOrders: number;
    vehiclesCount: number;
    statusDistribution: Array<{ status: string; label: string; count: number; active: boolean }>;
    recentOrders: Array<{
        id: number;
        status: string;
        entry_date: string;
        total_amount: number;
        plate: string;
        vehicle_display: string;
        show_url: string;
    }>;
};

type UpcomingVisit = {
    id: number;
    next_due_date: string;
    plate: string;
    vehicle_display: string;
    client_name: string;
    service_label: string;
};

type DashboardProps = {
    isClientDashboard?: boolean;
    stats?: DashboardStats;
    clientStats?: ClientStats;
    upcomingVisits?: UpcomingVisit[];
    can: {
        view_work_orders: boolean;
        view_clients: boolean;
        view_products: boolean;
        view_financial?: boolean;
        view_maintenance_schedules?: boolean;
        view_accounts_receivable?: boolean;
    };
};

export default function Dashboard({ isClientDashboard = false, stats, clientStats, upcomingVisits = [], can }: DashboardProps) {
    if (isClientDashboard && clientStats) {
        const getBarBg = (status: string, active: boolean) => {
            const map: Record<string, string> = {
                ingreso: 'bg-blue-500',
                en_checklist: 'bg-amber-500',
                diagnosticado: 'bg-purple-500',
                en_reparacion: 'bg-orange-500',
                listo_para_entregar: 'bg-emerald-500',
                entregado: 'bg-emerald-500',
                cancelado: 'bg-red-400',
            };
            return active ? (map[status] ?? 'bg-rose-500') : 'bg-muted-foreground/30';
        };

        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Panel de control" />
                <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6 bg-gradient-to-br from-rose-50/40 via-transparent to-indigo-50/30 dark:from-rose-950/20 dark:via-transparent dark:to-indigo-950/20">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-l-4 border-l-rose-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-foreground">Mis órdenes activas</CardTitle>
                                <div className="rounded-lg bg-rose-100 dark:bg-rose-950/60 p-1.5">
                                    <Wrench className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold tabular-nums ${clientStats.activeOrders > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
                                    {clientStats.activeOrders}
                                </div>
                                <Link
                                    href={myOrdersRoute().url}
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-semibold transition-colors"
                                >
                                    Ver mis órdenes →
                                </Link>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-sky-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-foreground">Vehículos a mi cargo</CardTitle>
                                <div className="rounded-lg bg-sky-100 dark:bg-sky-950/60 p-1.5">
                                    <Car className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold tabular-nums ${clientStats.vehiclesCount > 0 ? 'text-sky-600 dark:text-sky-400' : 'text-foreground'}`}>
                                    {clientStats.vehiclesCount}
                                </div>
                                <Link
                                    href={myVehiclesRoute().url}
                                    className="mt-2 inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-semibold transition-colors"
                                >
                                    Ver mis vehículos →
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Card className="border-l-4 border-l-indigo-500 border-content-border bg-card shadow-sm dark:shadow-none lg:col-span-1 overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="rounded-lg bg-indigo-100 dark:bg-indigo-950/60 p-1.5">
                                        <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    Estados de mis órdenes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {clientStats.statusDistribution.map((item) => (
                                    <div key={item.status} className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-foreground">{item.label}</span>
                                            <span className={`text-xs font-bold tabular-nums ${item.count > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`}>
                                                {item.count}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${getBarBg(item.status, item.count > 0)}`}
                                                style={{
                                                    width: `${Math.round((item.count / Math.max(...clientStats.statusDistribution.map((s) => s.count), 1)) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Link
                                    href={myOrdersRoute().url}
                                    className="block pt-2 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold transition-colors"
                                >
                                    Ver mis órdenes →
                                </Link>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-emerald-500 border-content-border bg-card shadow-sm dark:shadow-none lg:col-span-2 overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/60 p-1.5">
                                        <ClipboardList className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    Mis órdenes recientes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {clientStats.recentOrders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">No tienes órdenes registradas.</p>
                                ) : (
                                    <div className="divide-y divide-content-border">
                                        {clientStats.recentOrders.map((order) => (
                                            <Link
                                                key={order.id}
                                                href={order.show_url}
                                                className="flex items-center justify-between py-2.5 gap-2 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 -mx-2 px-2 rounded-lg transition-colors"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="rounded bg-rose-100/80 dark:bg-rose-950/40 p-1">
                                                            <Car className="h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-foreground truncate">
                                                            {order.plate}
                                                            {order.vehicle_display ? ` — ${order.vehicle_display}` : ''}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5 ml-7">{formatDate(order.entry_date)}</p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Badge className={`text-xs px-2 py-0.5 border-0 font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {getWorkOrderStatusLabel(order.status)}
                                                    </Badge>
                                                    <span className="text-sm font-bold text-foreground w-20 text-right tabular-nums">
                                                        {formatCurrency(order.total_amount)}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                <Link
                                    href={myOrdersRoute().url}
                                    className="mt-3 inline-block text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold transition-colors"
                                >
                                    Ver todas mis órdenes →
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!stats) return null;

    const maxStatusCount = Math.max(...stats.statusDistribution.map((s) => s.count), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel de control" />
            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6 bg-gradient-to-br from-slate-50/80 via-transparent to-indigo-50/50 dark:from-slate-950/30 dark:via-transparent dark:to-indigo-950/20">

                {/* Visitas al taller (próximos 7 días) — siempre visible para staff */}
                <Card className="border-l-4 border-l-amber-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <div className="rounded-lg bg-amber-100 dark:bg-amber-950/60 p-1.5">
                                <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            Visitas al taller (próximos 7 días)
                        </CardTitle>
                        {(can.view_maintenance_schedules ?? false) && (
                            <Link
                                href={maintenanceSchedulesRoute().url}
                                className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                            >
                                Ver calendario →
                            </Link>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!upcomingVisits || upcomingVisits.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">Ningún vehículo con visita programada en los próximos 7 días.</p>
                        ) : (
                            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                                {upcomingVisits.map((v) => (
                                    <div
                                        key={v.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-foreground">{v.plate}</span>
                                                {v.vehicle_display && (
                                                    <span className="text-xs text-muted-foreground truncate">{v.vehicle_display}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{v.client_name}</p>
                                            {v.service_label && (
                                                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{v.service_label}</p>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="shrink-0 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 font-medium">
                                            {formatDate(v.next_due_date)}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* KPI Cards — estadísticas visibles a todo el staff */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-l-4 border-l-rose-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Órdenes activas</CardTitle>
                            <div className="rounded-lg bg-rose-100 dark:bg-rose-950/60 p-1.5">
                                <Wrench className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground tabular-nums">{stats.activeOrders}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stats.ordersThisMonth} nuevas este mes</p>
                            <ChangeIndicator current={stats.ordersThisMonth} previous={stats.ordersLastMonth} />
                        </CardContent>
                    </Card>

                    {/* Cuentas por cobrar — visible para todos */}
                    <Card className="border-l-4 border-l-amber-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Cuentas por cobrar</CardTitle>
                            <div className="rounded-lg bg-amber-100 dark:bg-amber-950/60 p-1.5">
                                <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                                {formatCurrency(stats.accountsReceivableTotal ?? 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {(stats.accountsReceivableOrdersCount ?? 0)} orden(es) con saldo pendiente
                            </p>
                            {(can.view_accounts_receivable ?? false) && (
                                <Link
                                    href={accountsReceivableRoute().url}
                                    className="mt-2 inline-block text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                                >
                                    Ver detalle →
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    {/* Vehículos registrados — visible para todos */}
                    <Card className="border-l-4 border-l-slate-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Vehículos registrados</CardTitle>
                            <div className="rounded-lg bg-slate-100 dark:bg-slate-950/60 p-1.5">
                                <Car className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground tabular-nums">{stats.totalVehicles}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {(stats.vehiclesRegisteredThisMonth ?? 0) > 0
                                    ? `+${stats.vehiclesRegisteredThisMonth} este mes · en el sistema`
                                    : 'en el sistema'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Ingreso del mes vs mes anterior (subió/bajó) — solo con permiso datos estadísticos */}
                    {(can.view_financial ?? false) && (
                        <Card className="border-l-4 border-l-emerald-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-foreground">Ingreso mes actual vs anterior</CardTitle>
                                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/60 p-1.5">
                                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{formatCurrency(stats.revenueThisMonth)}</div>
                                <p className="text-xs text-muted-foreground mt-1">Mes anterior: {formatCurrency(stats.revenueLastMonth)}</p>
                                <RevenueChangeBadge current={stats.revenueThisMonth} previous={stats.revenueLastMonth} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Ticket promedio del mes — solo con permiso financiero */}
                    {(can.view_financial ?? false) && (
                        <Card className="border-l-4 border-l-cyan-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-foreground">Ticket promedio (mes)</CardTitle>
                                <div className="rounded-lg bg-cyan-100 dark:bg-cyan-950/60 p-1.5">
                                    <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">
                                    {formatCurrency(stats.averageTicketThisMonth ?? 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {(stats.ordersPaidThisMonth ?? 0)} orden(es) cobrada(s) este mes
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Ingresos YTD — solo con permiso financiero */}
                    {(can.view_financial ?? false) && (
                        <Card className="border-l-4 border-l-violet-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-foreground">Ingresos acumulados (año)</CardTitle>
                                <div className="rounded-lg bg-violet-100 dark:bg-violet-950/60 p-1.5">
                                    <DollarSign className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-violet-700 dark:text-violet-400 tabular-nums">
                                    {formatCurrency(stats.revenueYtd ?? 0)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Mismo periodo año anterior: {formatCurrency(stats.revenueYtdLastYear ?? 0)}
                                </p>
                                {(stats.revenueYtdLastYear ?? 0) !== 0 && (
                                    <ChangeIndicator
                                        current={stats.revenueYtd ?? 0}
                                        previous={stats.revenueYtdLastYear ?? 0}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Cierre del mes: entregadas / canceladas — operativo */}
                    <Card className="border-l-4 border-l-fuchsia-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-foreground">Cierre del mes</CardTitle>
                            <div className="rounded-lg bg-fuchsia-100 dark:bg-fuchsia-950/60 p-1.5 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <XCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-3">
                                <div>
                                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                        {stats.ordersDeliveredThisMonth ?? 0}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">entregadas</span>
                                </div>
                                <span className="text-muted-foreground">·</span>
                                <div>
                                    <span className="text-2xl font-bold text-red-500 dark:text-red-400 tabular-nums">
                                        {stats.ordersCancelledThisMonth ?? 0}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">canceladas</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Órdenes cerradas este mes</p>
                        </CardContent>
                    </Card>

                    {/* Detalle financiero (valor inventario) — solo con permiso */}
                    {(can.view_financial ?? false) && (
                        <Card className="border-l-4 border-l-sky-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <div className="rounded-lg bg-sky-100 dark:bg-sky-950/60 p-1.5">
                                        <DollarSign className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    Detalle financiero
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs font-medium text-muted-foreground">Valor inventario</p>
                                <p className="text-xl font-bold text-foreground tabular-nums">{formatCurrency(stats.inventoryValue)}</p>
                            </CardContent>
                        </Card>
                    )}

                    {(can.view_clients ?? false) && (
                        <Card className="border-l-4 border-l-indigo-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-foreground">Clientes</CardTitle>
                                <div className="rounded-lg bg-indigo-100 dark:bg-indigo-950/60 p-1.5">
                                    <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground tabular-nums">{stats.totalClients}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.newClientsThisMonth > 0
                                        ? `+${stats.newClientsThisMonth} este mes`
                                        : 'Sin nuevos este mes'}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                </div>

                {/* Middle row */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Status distribution */}
                    <Card className="border-l-4 border-l-violet-500 border-content-border bg-card shadow-sm dark:shadow-none lg:col-span-1 overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <div className="rounded-lg bg-violet-100 dark:bg-violet-950/60 p-1.5">
                                    <Activity className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                </div>
                                Estados de órdenes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {stats.statusDistribution.map((item) => (
                                <div key={item.status} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-foreground">{item.label}</span>
                                        <span className="text-xs font-semibold text-foreground tabular-nums">{item.count}</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${item.active ? 'bg-rose-500' : 'bg-muted-foreground/30'}`}
                                            style={{ width: `${Math.round((item.count / maxStatusCount) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {can.view_work_orders && (
                                <Link
                                    href={workOrdersRoute().url}
                                    className="block pt-2 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold transition-colors"
                                >
                                    Ver todas las órdenes →
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent orders */}
                    <Card className="border-l-4 border-l-sky-500 border-content-border bg-card shadow-sm dark:shadow-none lg:col-span-2 overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <div className="rounded-lg bg-sky-100 dark:bg-sky-950/60 p-1.5">
                                    <ClipboardList className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                </div>
                                Órdenes recientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.recentOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">No hay órdenes registradas.</p>
                            ) : (
                                <div className="divide-y divide-content-border">
                                    {stats.recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between py-2.5 gap-2 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded bg-sky-100/80 dark:bg-sky-950/40 p-1">
                                                        <Car className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-foreground truncate">{order.plate}</span>
                                                    <span className="text-xs text-muted-foreground truncate hidden sm:inline">— {order.client_name}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5 ml-7">{formatDate(order.entry_date)}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge className={`text-xs px-2 py-0.5 border-0 font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {getWorkOrderStatusLabel(order.status)}
                                                </Badge>
                                                <span className="text-sm font-semibold text-foreground w-20 text-right tabular-nums">
                                                    {formatCurrency(order.total_amount)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficos en una fila: ingresos al taller (vehículos) + ingresos económicos por día */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Evolutivo diario: vehículos ingresados por día (Peru) */}
                    {stats.dailyComparison && stats.dailyComparison.length > 0 && (
                        <Card className="border-l-4 border-l-teal-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="rounded-lg bg-teal-100 dark:bg-teal-950/60 p-1.5">
                                        <TrendingUp className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    Ingresos al taller por día (zona horaria Perú)
                                </CardTitle>
                                <p className="text-xs text-muted-foreground pt-0.5">
                                    Vehículos ingresados por día — comparación mes actual vs mes anterior
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[280px] min-h-[280px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart
                                            data={stats.dailyComparison}
                                            margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis
                                                dataKey="day"
                                                tick={{ fontSize: 11 }}
                                                tickFormatter={(v) => String(v)}
                                                className="text-muted-foreground"
                                            />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 11 }}
                                            className="text-muted-foreground"
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid hsl(var(--content-border))',
                                                fontSize: '12px',
                                            }}
                                            labelFormatter={(_, payload) =>
                                                payload?.[0] ? `Día ${payload[0].payload.day}` : ''
                                            }
                                            formatter={(value: number) => [value, 'Órdenes']}
                                        />
                                        <Legend
                                            wrapperStyle={{ fontSize: '12px' }}
                                            formatter={(value) =>
                                                value === 'previous_month_count'
                                                    ? (stats.previousMonthLabel ?? 'Mes anterior')
                                                    : (stats.currentMonthLabel ?? 'Mes actual')
                                            }
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="previous_month_count"
                                            name="previous_month_count"
                                            stroke="hsl(var(--muted-foreground))"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                            connectNulls
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="current_month_count"
                                            name="current_month_count"
                                            stroke="hsl(173 58% 39%)"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                            connectNulls
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    )}

                    {/* Ingresos por día (económicos) — solo con permiso */}
                    {(can.view_financial ?? false) && stats.dailyRevenueComparison && stats.dailyRevenueComparison.length > 0 && (
                        <Card className="border-l-4 border-l-emerald-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/60 p-1.5">
                                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    Ingresos por día (económicos)
                                </CardTitle>
                                <p className="text-xs text-muted-foreground pt-0.5">
                                    Cobros por día — comparación mes actual vs mes anterior (zona horaria Perú)
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[280px] min-h-[280px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height={280}>
                                        <LineChart
                                            data={stats.dailyRevenueComparison}
                                            margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis
                                                dataKey="day"
                                                tick={{ fontSize: 11 }}
                                                tickFormatter={(v) => String(v)}
                                                className="text-muted-foreground"
                                            />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            className="text-muted-foreground"
                                            tickFormatter={(v) => formatCurrency(v)}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid hsl(var(--content-border))',
                                                fontSize: '12px',
                                            }}
                                            labelFormatter={(_, payload) =>
                                                payload?.[0] ? `Día ${payload[0].payload.day}` : ''
                                            }
                                            formatter={(value: number) => [formatCurrency(value), 'Ingreso']}
                                        />
                                        <Legend
                                            wrapperStyle={{ fontSize: '12px' }}
                                            formatter={(value) =>
                                                value === 'previous_month_amount'
                                                    ? (stats.previousMonthLabel ?? 'Mes anterior')
                                                    : (stats.currentMonthLabel ?? 'Mes actual')
                                            }
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="previous_month_amount"
                                            name="previous_month_amount"
                                            stroke="hsl(var(--muted-foreground))"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                            connectNulls
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="current_month_amount"
                                            name="current_month_amount"
                                            stroke="hsl(142 71% 45%)"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                            connectNulls
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    )}
                </div>

                {/* Gráficos adicionales: órdenes/vehículos/ingresos por mes e ingresos por tipo de servicio */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Órdenes por mes (últimos 12 meses) */}
                    {stats.ordersByMonthLast12 && stats.ordersByMonthLast12.length > 0 && (
                        <Card className="border-l-4 border-l-rose-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                    Órdenes por mes (últimos 12 meses)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[260px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={stats.ordersByMonthLast12} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--content-border))', fontSize: '12px' }}
                                                formatter={(value: number) => [value, 'Órdenes']}
                                                labelFormatter={(_, payload) => (payload?.[0]?.payload?.label ? payload[0].payload.label : '')}
                                            />
                                            <Bar dataKey="count" name="Órdenes" fill="hsl(346 77% 50%)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Vehículos registrados por mes (últimos 12 meses) */}
                    {stats.vehiclesByMonthLast12 && stats.vehiclesByMonthLast12.length > 0 && (
                        <Card className="border-l-4 border-l-slate-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Car className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    Vehículos registrados por mes (últimos 12 meses)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[260px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={stats.vehiclesByMonthLast12} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--content-border))', fontSize: '12px' }}
                                                formatter={(value: number) => [value, 'Vehículos']}
                                                labelFormatter={(_, payload) => (payload?.[0]?.payload?.label ? payload[0].payload.label : '')}
                                            />
                                            <Bar dataKey="count" name="Vehículos" fill="hsl(215 16% 47%)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Ingresos por tipo de servicio (mes actual) — con permiso financiero */}
                    {(can.view_financial ?? false) && stats.revenueByServiceTypeThisMonth && stats.revenueByServiceTypeThisMonth.length > 0 && (
                        <Card className="border-l-4 border-l-cyan-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                    Ingresos por tipo de servicio (mes actual)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[260px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <Pie
                                                data={stats.revenueByServiceTypeThisMonth}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={90}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {stats.revenueByServiceTypeThisMonth.map((_, index) => {
                                                    const colors = ['hsl(189 94% 43%)', 'hsl(173 58% 39%)', 'hsl(199 89% 48%)', 'hsl(262 83% 58%)', 'hsl(346 77% 50%)', 'hsl(25 95% 53%)'];
                                                    return <Cell key={index} fill={colors[index % colors.length]} />;
                                                })}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--content-border))', fontSize: '12px' }}
                                                formatter={(value: number) => [formatCurrency(value), 'Subtotal']}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Ingresos por mes (últimos 12 meses) — con permiso financiero */}
                    {(can.view_financial ?? false) && stats.revenueByMonthLast12 && stats.revenueByMonthLast12.length > 0 && (
                        <Card className="border-l-4 border-l-emerald-500 border-content-border bg-card shadow-sm dark:shadow-none overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    Ingresos por mes (últimos 12 meses)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[260px] w-full min-w-0">
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={stats.revenueByMonthLast12} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="label" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                                            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" tickFormatter={(v) => formatCurrency(v)} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--content-border))', fontSize: '12px' }}
                                                formatter={(value: number) => [formatCurrency(value), 'Ingreso']}
                                                labelFormatter={(_, payload) => (payload?.[0]?.payload?.label ? payload[0].payload.label : '')}
                                            />
                                            <Bar dataKey="amount" name="Ingreso" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Low stock alert — solo si tiene permiso products.view */}
                {(can.view_products ?? false) && stats.lowStockProducts.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/10 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <CardHeader className="flex flex-row items-center gap-2 pb-3">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                                Stock bajo ({stats.lowStockProducts.length} producto{stats.lowStockProducts.length !== 1 ? 's' : ''})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                {stats.lowStockProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between rounded-lg border border-amber-200/60 dark:border-amber-900/40 bg-white/60 dark:bg-amber-950/10 px-3 py-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                                            {product.brand_name && (
                                                <p className="text-xs text-muted-foreground truncate">{product.brand_name}</p>
                                            )}
                                        </div>
                                        <span className={`ml-2 shrink-0 text-sm font-bold ${product.stock === 0 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            {product.stock}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {(can.view_products ?? false) && (
                                <Link
                                    href={productsRoute().url}
                                    className="mt-3 inline-block text-xs text-amber-700 dark:text-amber-400 hover:underline font-medium"
                                >
                                    Ir a inventario →
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
