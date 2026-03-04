import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Eye, Inbox, LayoutGrid } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/data-table';
import { DataTableCard } from '@/components/data-table/DataTableCard';
import { Button } from '@/components/ui/button';
import { getWorkOrderStatusLabel } from '@/lib/workOrderUtils';

interface WorkOrderRow {
    id: number;
    entry_date: string;
    entry_time: string | null;
    status: string;
    vehicle_plate: string | null;
    vehicle_display: string;
    show_url: string;
}

interface PageProps {
    workOrders: {
        data: WorkOrderRow[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    indexPath: string;
    title: string;
    breadcrumbs: BreadcrumbItem[];
}

function formatEntryDate(dateStr: string, timeStr: string | null): string {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const dateFormatted = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    if (!timeStr || timeStr.trim() === '') return dateFormatted;
    const timePart = String(timeStr).slice(0, 5);
    return `${dateFormatted} ${timePart}`;
}

function vehicleColumn(row: WorkOrderRow): string {
    const plate = row.vehicle_plate ?? '';
    const model = row.vehicle_display?.trim() ?? '';
    if (!plate && !model) return '—';
    if (!model) return plate;
    return `${plate} — ${model}`;
}

export default function MyOrdersIndex({ workOrders, title, breadcrumbs }: PageProps) {
    const columns = [
        { key: 'entry_date', label: 'Fecha ingreso', render: (row: WorkOrderRow) => formatEntryDate(row.entry_date, row.entry_time) },
        { key: 'vehicle', label: 'Vehículo', render: (row: WorkOrderRow) => vehicleColumn(row) },
        { key: 'vehicle_plate', label: 'Placa', render: (row: WorkOrderRow) => row.vehicle_plate ?? '—' },
        { key: 'status', label: 'Estado', render: (row: WorkOrderRow) => getWorkOrderStatusLabel(row.status) },
        {
            key: 'actions',
            label: '',
            render: (row: WorkOrderRow) => (
                <Link
                    href={row.show_url}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700 dark:text-cyan-400 dark:hover:bg-cyan-900/40"
                    aria-label="Ver detalle de la orden"
                >
                    <Eye className="size-4" />
                </Link>
            ),
        },
    ];

    const emptyContent = (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Inbox className="size-12 text-muted-foreground/60" aria-hidden />
            <span className="text-muted-foreground text-sm">No tienes órdenes en curso.</span>
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <div>
                    <h1 className="relative inline-block font-semibold text-foreground text-xl tracking-tight pb-1">
                        Mis Órdenes
                        <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                    </h1>
                    <p className="mt-1 text-muted-foreground text-sm">
                        Tus órdenes de trabajo en curso. Haz clic en &quot;Ver detalle&quot; para ver el avance.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 dark:bg-blue-950/40">
                        <ClipboardList className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-muted-foreground">Órdenes</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{workOrders.total}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/40">
                        <LayoutGrid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-muted-foreground">En pantalla</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{workOrders.data.length}</span>
                    </span>
                </div>
                <div className="border-t border-content-border pt-4" />

                <div className="overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                    <div className="border-b border-content-border px-3 py-3 sm:px-4 sm:py-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-foreground">
                                    Listado
                                </h2>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Haz clic en &quot;Ver detalle&quot; para ver el timeline y el avance de cada orden.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        {workOrders.data.length === 0 ? (
                            emptyContent
                        ) : (
                            <DataTable<WorkOrderRow>
                                columns={columns}
                                data={workOrders.data}
                                keyExtractor={(r) => r.id}
                                embedded
                                striped
                            />
                        )}
                    </div>

                    <div className="block md:hidden">
                        {workOrders.data.length === 0 ? (
                            <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
                                {emptyContent}
                            </div>
                        ) : (
                            <ul className="flex flex-col gap-3 p-3 sm:p-4">
                                {workOrders.data.map((row) => (
                                    <li key={row.id}>
                                        <DataTableCard
                                            title={vehicleColumn(row)}
                                            actions={(
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="cursor-pointer shrink-0 border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800 dark:border-cyan-800 dark:text-cyan-400 dark:hover:bg-cyan-950/40"
                                                    asChild
                                                >
                                                    <Link href={row.show_url}>
                                                        <Eye className="size-3.5 mr-1" />
                                                        Ver detalle
                                                    </Link>
                                                </Button>
                                            )}
                                            fields={[
                                                {
                                                    label: 'Fecha ingreso',
                                                    value: formatEntryDate(row.entry_date, row.entry_time),
                                                },
                                                {
                                                    label: 'Vehículo',
                                                    value: vehicleColumn(row),
                                                },
                                                {
                                                    label: 'Placa',
                                                    value: row.vehicle_plate ?? '—',
                                                },
                                                {
                                                    label: 'Estado',
                                                    value: getWorkOrderStatusLabel(row.status),
                                                },
                                            ]}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
