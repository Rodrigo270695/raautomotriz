import { Head } from '@inertiajs/react';
import { Car, Palette, Calendar, Gauge } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { cn } from '@/lib/utils';

interface VehicleRow {
    id: number;
    plate: string;
    year: number | null;
    color: string | null;
    entry_mileage: number | null;
    exit_mileage: number | null;
    vehicle_display: string;
}

interface PageProps {
    vehicles: VehicleRow[];
    breadcrumbs: BreadcrumbItem[];
}

function DataItem({
    icon: Icon,
    label,
    value,
    className,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
                <Icon className="size-4 text-[#D9252A]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground tabular-nums">
                    {value ?? '—'}
                </p>
            </div>
        </div>
    );
}

function VehicleCard({ vehicle, index }: { vehicle: VehicleRow; index: number }) {
    return (
        <article
            className={cn(
                'group relative overflow-hidden rounded-2xl border border-content-border/50 bg-card',
                'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_4px_12px_-4px_rgba(0,0,0,0.04)]',
                'transition-all duration-300 ease-out hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.08),0_8px_16px_-8px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:border-[#D9252A]/20',
                'dark:border-content-border/40 dark:shadow-none dark:hover:shadow-xl dark:hover:shadow-black/15'
            )}
        >
            {/* Barra superior con gradiente */}
            <div
                className="h-1.5 w-full bg-gradient-to-r from-[#D9252A] via-[#e12a2d] to-[#c21f24]"
                aria-hidden
            />
            {/* Detalle esquina superior derecha */}
            <div
                className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-[#D9252A]/5"
                aria-hidden
            />

            <div className="p-5 sm:p-6">
                {/* Bloque placa: protagonista */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D9252A]/12 to-[#D9252A]/5 ring-1 ring-[#D9252A]/10">
                            <Car className="size-7 text-[#D9252A]" aria-hidden />
                        </div>
                        <div>
                            <span className="inline-block rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                Vehículo {index + 1}
                            </span>
                            <p className="mt-1.5 font-mono text-xl font-bold tracking-wide text-foreground sm:text-2xl">
                                {vehicle.plate}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Separador visual */}
                <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-content-border/50 to-transparent" aria-hidden />

                {/* Sección: Datos del vehículo */}
                <div className="space-y-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Datos del vehículo
                </div>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <DataItem
                        icon={Car}
                        label="Marca / Modelo"
                        value={vehicle.vehicle_display || '—'}
                    />
                    <DataItem icon={Calendar} label="Año" value={vehicle.year ?? '—'} />
                    <DataItem
                        icon={Palette}
                        label="Color"
                        value={vehicle.color ?? '—'}
                        className="sm:col-span-2"
                    />
                </div>

                {/* Separador */}
                <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-content-border/50 to-transparent" aria-hidden />

                {/* Sección: Kilometraje */}
                <div className="space-y-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Kilometraje
                </div>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <DataItem
                        icon={Gauge}
                        label="Km al ingreso"
                        value={
                            vehicle.entry_mileage != null
                                ? `${Number(vehicle.entry_mileage).toLocaleString('es-PE')} km`
                                : '—'
                        }
                    />
                    <DataItem
                        icon={Gauge}
                        label="Km al salir"
                        value={
                            vehicle.exit_mileage != null
                                ? `${Number(vehicle.exit_mileage).toLocaleString('es-PE')} km`
                                : '—'
                        }
                    />
                </div>
            </div>
        </article>
    );
}

export default function MyVehiclesIndex({ vehicles, breadcrumbs }: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Vehículos" />

            <div className="flex flex-1 flex-col gap-8 p-4 md:p-6 lg:p-8">
                {/* Header con fondo sutil y acento */}
                <header className="relative overflow-hidden rounded-2xl border border-content-border/40 bg-gradient-to-br from-muted/30 via-muted/10 to-transparent px-6 py-6 md:px-8 md:py-7">
                    <div className="absolute right-0 top-0 h-32 w-48 bg-[#D9252A]/5 rounded-bl-[100px]" aria-hidden />
                    <div className="relative">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-[#D9252A]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#D9252A]">
                            <Car className="size-3.5" />
                            Flota
                        </div>
                        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            Mis Vehículos
                        </h1>
                        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                            Vehículos registrados a tu nombre en el taller.
                        </p>
                    </div>
                </header>

                {/* Contenido: tarjetas o estado vacío */}
                {vehicles.length === 0 ? (
                    <div
                        className={cn(
                            'flex flex-col items-center justify-center gap-5 rounded-3xl border border-dashed border-content-border/50',
                            'bg-muted/10 py-20 px-6'
                        )}
                    >
                        <div className="flex size-20 items-center justify-center rounded-2xl bg-[#D9252A]/10 ring-1 ring-[#D9252A]/10">
                            <Car className="size-10 text-[#D9252A]/60" aria-hidden />
                        </div>
                        <div className="text-center">
                            <p className="text-base font-semibold text-foreground">
                                Sin vehículos registrados
                            </p>
                            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                Cuando tengas un vehículo registrado en el taller, aparecerá aquí.
                            </p>
                        </div>
                    </div>
                ) : (
                    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {vehicles.map((vehicle, index) => (
                            <li key={vehicle.id}>
                                <VehicleCard vehicle={vehicle} index={index} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}
