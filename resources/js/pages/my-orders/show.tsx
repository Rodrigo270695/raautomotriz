import { Head, Link } from '@inertiajs/react';
import * as React from 'react';
import AppLayout from '@/layouts/app-layout';
import { ClientOrderTimelineResponsive } from '@/components/work-orders/ClientOrderTimelineResponsive';
import { MY_ORDER_STEPS, mapStatusToStepId } from './constants.tsx';
import { OrderStepCard, OrderStepChecklistContent, OrderStepDefaultContent, OrderStepDiagnosticoContent, OrderStepEntregaContent, OrderStepEntregadoContent, OrderStepIngresoContent, OrderStepReparacionContent } from './components';
import type { MyOrderShowPageProps } from './types';

export default function MyOrderShow({ order, breadcrumbs }: MyOrderShowPageProps) {
    const vehicleLabel = [order.vehicle_plate, order.vehicle_display].filter(Boolean).join(' — ');
    const [activeStepId, setActiveStepId] = React.useState<string | null>(null);

    const currentStepId = mapStatusToStepId(order.status);
    const activeStep = activeStepId
        ? MY_ORDER_STEPS.find((step) => step.id === activeStepId) ?? null
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Orden #${order.id} · ${order.vehicle_plate ?? ''}`} />

            <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
                <header className="flex flex-col gap-2 max-w-3xl">
                    <Link
                        href="/dashboard/my-orders"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <span aria-hidden>←</span>
                        Volver a mis órdenes
                    </Link>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        {vehicleLabel || `Orden #${order.id}`}
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                        Sigue el estado de tu vehículo a través de las etapas del servicio. Haz clic en una etapa de la
                        línea de tiempo para ver el detalle.
                    </p>
                </header>

                <div className="mt-4 flex flex-col gap-5">
                    <section>
                        <ClientOrderTimelineResponsive
                            steps={MY_ORDER_STEPS}
                            currentStatusId={currentStepId}
                            activeStepId={activeStepId}
                            onStepChange={setActiveStepId}
                        />
                    </section>

                    <section className="space-y-4">
                        {activeStep && (
                            <OrderStepCard
                                key={activeStep.id}
                                stepNumber={MY_ORDER_STEPS.indexOf(activeStep) + 1}
                                stepLabel={activeStep.label}
                                stepDescription={activeStep.description ?? ''}
                            >
                                {activeStep.id === 'ingreso' ? (
                                    <OrderStepIngresoContent
                                        items={order.photos_by_type?.entry ?? []}
                                    />
                                ) : activeStep.id === 'checklist' ? (
                                    <OrderStepChecklistContent
                                        items={order.checklist_results ?? []}
                                    />
                                ) : activeStep.id === 'diagnostico' ? (
                                    <OrderStepDiagnosticoContent
                                        diagnoses={order.diagnoses ?? []}
                                        mediaItems={order.photos_by_type?.diagnosis ?? []}
                                    />
                                ) : activeStep.id === 'reparacion' ? (
                                    <OrderStepReparacionContent
                                        services={order.services ?? []}
                                        payments={order.payments ?? []}
                                        totalAmount={order.total_amount ?? null}
                                        mediaItems={order.photos_by_type?.process ?? []}
                                    />
                                ) : activeStep.id === 'listo_para_entregar' ? (
                                    <OrderStepEntregaContent
                                        items={order.photos_by_type?.delivery ?? []}
                                    />
                                ) : activeStep.id === 'entregado' ? (
                                    <OrderStepEntregadoContent
                                        items={order.next_maintenance ?? []}
                                    />
                                ) : (
                                    <OrderStepDefaultContent stepLabel={activeStep.label} />
                                )}
                            </OrderStepCard>
                        )}
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
