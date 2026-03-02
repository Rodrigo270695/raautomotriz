import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Car,
    ClipboardList,
    DollarSign,
    Package,
    Users,
    Wrench,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BreadcrumbItem } from '@/types';
import { index as dashboardRoute } from '@/routes/dashboard';
import { index as workOrdersRoute } from '@/routes/dashboard/services/work-orders';
import { index as productsRoute } from '@/routes/dashboard/inventory/products';
import { formatCurrency, getWorkOrderStatusLabel } from '@/lib/workOrderUtils';

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
};

type DashboardProps = {
    stats: DashboardStats;
    can: { view_work_orders: boolean; view_clients: boolean; view_products: boolean };
};

export default function Dashboard({ stats, can }: DashboardProps) {
    const maxStatusCount = Math.max(...stats.statusDistribution.map((s) => s.count), 1);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel de control" />
            <div className="flex flex-col gap-6 overflow-x-auto p-4 md:p-6">

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Órdenes activas</CardTitle>
                            <Wrench className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.activeOrders}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stats.ordersThisMonth} nuevas este mes</p>
                            <ChangeIndicator current={stats.ordersThisMonth} previous={stats.ordersLastMonth} />
                        </CardContent>
                    </Card>

                    <Card className="border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos del mes</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.revenueThisMonth)}</div>
                            <ChangeIndicator current={stats.revenueThisMonth} previous={stats.revenueLastMonth} />
                        </CardContent>
                    </Card>

                    <Card className="border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.totalClients}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.newClientsThisMonth > 0
                                    ? `+${stats.newClientsThisMonth} este mes`
                                    : 'Sin nuevos este mes'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Valor inventario</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.inventoryValue)}</div>
                            <p className="text-xs text-muted-foreground mt-1">{stats.totalVehicles} vehículos registrados</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Middle row */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Status distribution */}
                    <Card className="border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none lg:col-span-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                Estados de órdenes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {stats.statusDistribution.map((item) => (
                                <div key={item.status} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">{item.label}</span>
                                        <span className="text-xs font-semibold text-foreground">{item.count}</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${item.active ? 'bg-rose-500' : 'bg-muted-foreground/30'}`}
                                            style={{ width: `${Math.round((item.count / maxStatusCount) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {can.view_work_orders && (
                                <Link
                                    href={workOrdersRoute().url}
                                    className="block pt-2 text-xs text-rose-500 hover:text-rose-600 font-medium"
                                >
                                    Ver todas las órdenes →
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent orders */}
                    <Card className="border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                Órdenes recientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.recentOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">No hay órdenes registradas.</p>
                            ) : (
                                <div className="divide-y divide-content-border">
                                    {stats.recentOrders.map((order) => (
                                        <div key={order.id} className="flex items-center justify-between py-2.5 gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Car className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-foreground truncate">{order.plate}</span>
                                                    <span className="text-xs text-muted-foreground truncate hidden sm:block">— {order.client_name}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(order.entry_date)}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge className={`text-xs px-2 py-0.5 border-0 ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {getWorkOrderStatusLabel(order.status)}
                                                </Badge>
                                                <span className="text-xs font-medium text-foreground w-20 text-right">
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

                {/* Low stock alert */}
                {stats.lowStockProducts.length > 0 && (
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
                            {can.view_products && (
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
