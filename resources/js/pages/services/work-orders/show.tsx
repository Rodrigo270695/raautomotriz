import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DeleteWorkOrderDialog } from '@/components/DeleteWorkOrderDialog';
import { WorkOrderFormModal } from '@/components/WorkOrderFormModal';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { DataTab, PhotosTab, ChecklistTab, DiagnosesTab, ServicesTab } from './tabs';
import type { WorkOrder, WorkOrderPhotoItem, WorkOrderServiceItem, WorkOrderPackageOption, WorkOrderShowCan } from './types';
import { STATUS_LABELS } from './types';
import { getBreadcrumbs } from './utils';

export type WorkOrderShowTabId = 'datos' | 'fotos' | 'checklist' | 'servicios' | 'diagnosticos';

type ShowPageProps = {
    workOrder: WorkOrder;
    workOrdersIndexPath: string;
    showPath: string;
    configPath?: string;
    photosIndexPath: string;
    photos: WorkOrderPhotoItem[];
    typeLabels: Record<'entry' | 'diagnosis' | 'process' | 'delivery', string>;
    photoStats: { total: number; by_type: { entry: number; diagnosis: number; process: number; delivery: number } };
    serviceChecklists: Array<{ id: number; name: string; order_number: number | null }>;
    checklistResults: Array<{
        id: number;
        service_checklist_id: number;
        checklist_name: string | null;
        checklist_order_number: number | null;
        checked: boolean;
        note: string | null;
        completed_at: string | null;
    }>;
    checklistResultsPath?: string;
    vehicles: Array<{ id: number; plate: string; vehicle_model_id: number | null; client_id: number; vehicle_model?: { id: number; name: string } }>;
    clients: Array<{ id: number; first_name: string; last_name: string; document_number?: string | null }>;
    services: WorkOrderServiceItem[];
    servicesTotal: number;
    servicesBasePath: string;
    applyPackagePath: string;
    packagesForSelect: WorkOrderPackageOption[];
    productsForSelect: Array<{ value: number; label: string; sale_price: number }>;
    payments?: Array<{
        id: number;
        type: string;
        amount: number;
        payment_method: string | null;
        paid_at: string | null;
        reference: string | null;
        notes: string | null;
    }>;
    paymentsTotalPaid?: number;
    paymentsBasePath?: string;
    showDataTab?: boolean;
    diagnoses?: Array<{
        id: number;
        diagnosis_text: string;
        diagnosed_by: number | null;
        diagnosed_at: string | null;
        internal_notes: string | null;
        diagnosed_by_name: string | null;
    }>;
    diagnosesBasePath?: string;
    technicians?: Array<{ id: number; first_name: string; last_name: string }>;
    can: WorkOrderShowCan;
    confirmRepairPath?: string;
    ticket_print_url?: string | null;
    lastTicketPrintUrl?: string | null;
    lastTicketServiceCount?: number | null;
};

export default function WorkOrderShowPage({
    workOrder,
    workOrdersIndexPath,
    showPath,
    configPath,
    photosIndexPath,
    photos,
    typeLabels,
    photoStats,
    serviceChecklists = [],
    checklistResults,
    checklistResultsPath,
    vehicles,
    clients,
    services,
    servicesTotal,
    servicesBasePath,
    applyPackagePath,
    packagesForSelect,
    productsForSelect,
    payments = [],
    paymentsTotalPaid = 0,
    paymentsBasePath = '',
    showDataTab = true,
    diagnoses = [],
    diagnosesBasePath = '',
    can,
    confirmRepairPath,
    ticket_print_url,
    lastTicketPrintUrl,
    lastTicketServiceCount,
}: ShowPageProps) {
    const page = usePage();
    const flashStockWarnings = (page.props as { flash_stock_warnings?: string[] }).flash_stock_warnings ?? [];
    const [activeTab, setActiveTab] = useState<WorkOrderShowTabId>(showDataTab ? 'datos' : 'fotos');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pendingPrintUrl, setPendingPrintUrl] = useState<string | null>(null);

    useEffect(() => {
        if (ticket_print_url) setPendingPrintUrl(ticket_print_url);
    }, [ticket_print_url]);
    const flashPaymentPrintUrl = (page.props as { flash_payment_print_url?: string | null }).flash_payment_print_url;
    useEffect(() => {
        if (flashPaymentPrintUrl) setPendingPrintUrl(flashPaymentPrintUrl);
    }, [flashPaymentPrintUrl]);

    const canConfirmRepair =
        !showDataTab &&
        confirmRepairPath &&
        can.update &&
        (can.tickets_print ?? true) &&
        ['ingreso', 'en_checklist', 'diagnosticado', 'en_reparacion'].includes(workOrder.status);

    // Flujo progresivo de tabs: Fotos y Checklist siempre habilitados; luego Diagnósticos; luego Servicios.
    const fotosDone = photoStats.total >= 1;
    const checklistDone = checklistResults.length > 0;
    const diagnosticosEnabled = checklistDone;
    const diagnosticosDone = diagnoses.length >= 1;
    const serviciosEnabled = diagnosticosDone;
    const servicesHasItems = services.length >= 1;
    const paymentComplete = servicesTotal > 0 && paymentsTotalPaid >= servicesTotal - 0.01;
    const serviciosDone = servicesHasItems && paymentComplete;
    const serviciosPendingPayment = servicesHasItems && !paymentComplete;

    const canReprintOnly =
        workOrder.status === 'en_reparacion' &&
        lastTicketPrintUrl != null &&
        lastTicketServiceCount != null &&
        services.length === lastTicketServiceCount;

    const confirmRepairButtonLabel = canReprintOnly
        ? 'Imprimir ticket'
        : workOrder.status === 'en_reparacion'
          ? 'Guardar e imprimir ticket'
          : 'Guardar e iniciar reparación';

    const handleConfirmRepair = () => {
        if (canReprintOnly && lastTicketPrintUrl) {
            setPendingPrintUrl(lastTicketPrintUrl);
            return;
        }
        if (!confirmRepairPath) return;
        router.post(confirmRepairPath);
    };

    const [printStep, setPrintStep] = useState<'ask' | 'iframe'>('ask');
    const ticketIframeRef = React.useRef<HTMLIFrameElement>(null);

    const handlePrintTicket = () => {
        if (pendingPrintUrl) {
            setPrintStep('iframe');
        }
    };

    const handlePrintFromIframe = () => {
        try {
            ticketIframeRef.current?.contentWindow?.print();
        } catch {
            // fallback si el iframe no está listo
        }
    };

    const handleClosePrintModal = (open: boolean) => {
        if (!open) {
            setPendingPrintUrl(null);
            setPrintStep('ask');
        }
    };

    const vehicleLabel = workOrder.vehicle
        ? [workOrder.vehicle.plate, workOrder.vehicle.vehicle_model?.name].filter(Boolean).join(' · ')
        : '—';
    const clientLabel = workOrder.client
        ? `${workOrder.client.first_name} ${workOrder.client.last_name}`.trim()
        : '—';

    const breadcrumbs = getBreadcrumbs(workOrdersIndexPath, showDataTab ? showPath : (configPath ?? showPath));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={showDataTab ? `Orden ${vehicleLabel}` : `Configuración · ${vehicleLabel}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <header className="flex flex-col gap-2">
                    <Link
                        href={workOrdersIndexPath}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" />
                        Volver a órdenes
                    </Link>
                    <h1 className="relative inline-block font-semibold text-foreground text-xl tracking-tight pb-1">
                        {showDataTab ? vehicleLabel : `Configuración · ${vehicleLabel}`}
                        <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden />
                    </h1>
                    <p className="text-muted-foreground text-sm">{clientLabel}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-muted-foreground text-xs">Estado:</span>
                        <span
                            className={cn(
                                'rounded-full px-2 py-0.5 text-xs font-medium',
                                workOrder.status === 'entregado' || workOrder.status === 'cancelado'
                                    ? 'bg-content-muted/60 text-muted-foreground'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
                            )}
                        >
                            {STATUS_LABELS[workOrder.status] ?? workOrder.status}
                        </span>
                        {(paymentsTotalPaid ?? 0) > 0 && (
                            <span className="text-muted-foreground text-xs">
                                Abonado: S/ {Number(paymentsTotalPaid).toFixed(2)}
                            </span>
                        )}
                    </div>
                </header>

                {flashStockWarnings.length > 0 && (
                    <div
                        role="alert"
                        className="rounded-lg border border-amber-500/50 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200"
                    >
                        <p className="font-medium">Alerta de stock</p>
                        <p className="mt-1 text-amber-700 dark:text-amber-300">
                            Los siguientes productos no tienen stock suficiente (otras órdenes pueden tenerlos reservados):{' '}
                            {flashStockWarnings.join(', ')}. Se permitió agregar; al guardar el ticket el stock puede quedar en rojo o negativo.
                        </p>
                    </div>
                )}

                <div className="flex gap-1 rounded-lg border border-content-border bg-content-muted/30 p-1" role="tablist" aria-label="Secciones de la orden">
                    {showDataTab && (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'datos'}
                            onClick={() => setActiveTab('datos')}
                            className={cn(
                                'cursor-pointer flex-1 rounded-md py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4',
                                activeTab === 'datos' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <span className="hidden sm:inline">Datos de la orden</span>
                            <span className="sm:hidden">Datos</span>
                        </button>
                    )}
                    <button
                        type="button"
                        role="tab"
                        aria-selected={activeTab === 'fotos'}
                        onClick={() => setActiveTab('fotos')}
                        className={cn(
                            'cursor-pointer flex-1 rounded-md py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4',
                            activeTab === 'fotos' && 'bg-card text-foreground shadow-sm',
                            activeTab !== 'fotos' && !fotosDone && 'text-muted-foreground hover:text-foreground',
                            activeTab !== 'fotos' && fotosDone && 'text-emerald-700 dark:text-emerald-400 hover:text-foreground',
                            fotosDone && activeTab !== 'fotos' && 'bg-emerald-50 dark:bg-emerald-950/40',
                        )}
                    >
                        Fotos {photoStats.total > 0 && `(${photoStats.total})`}
                    </button>
                    {(can.checklist_results_view ?? true) && (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'checklist'}
                            onClick={() => setActiveTab('checklist')}
                            className={cn(
                                'cursor-pointer flex-1 rounded-md py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4',
                                activeTab === 'checklist' && 'bg-card text-foreground shadow-sm',
                                activeTab !== 'checklist' && !checklistDone && 'text-muted-foreground hover:text-foreground',
                                activeTab !== 'checklist' && checklistDone && 'text-emerald-700 dark:text-emerald-400 hover:text-foreground',
                                checklistDone && activeTab !== 'checklist' && 'bg-emerald-50 dark:bg-emerald-950/40',
                            )}
                        >
                            Checklist
                        </button>
                    )}
                    {(can.diagnoses_view ?? true) && (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'diagnosticos'}
                            aria-disabled={!diagnosticosEnabled}
                            onClick={() => diagnosticosEnabled && setActiveTab('diagnosticos')}
                            className={cn(
                                'flex-1 rounded-md py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4',
                                !diagnosticosEnabled && 'cursor-not-allowed opacity-60',
                                diagnosticosEnabled && 'cursor-pointer',
                                activeTab === 'diagnosticos' && 'bg-card text-foreground shadow-sm',
                                activeTab !== 'diagnosticos' && diagnosticosEnabled && !diagnosticosDone && 'text-muted-foreground hover:text-foreground',
                                activeTab !== 'diagnosticos' && diagnosticosEnabled && diagnosticosDone && 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
                                activeTab !== 'diagnosticos' && !diagnosticosEnabled && 'text-muted-foreground',
                            )}
                        >
                            Diagnósticos {diagnoses.length > 0 && `(${diagnoses.length})`}
                        </button>
                    )}
                    {(can.services_view ?? true) && (
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'servicios'}
                            aria-disabled={!serviciosEnabled}
                            onClick={() => serviciosEnabled && setActiveTab('servicios')}
                            className={cn(
                                'flex-1 rounded-md py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4',
                                !serviciosEnabled && 'cursor-not-allowed opacity-60',
                                serviciosEnabled && 'cursor-pointer',
                                activeTab === 'servicios' && 'bg-card text-foreground shadow-sm',
                                activeTab !== 'servicios' && serviciosEnabled && serviciosPendingPayment && 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40',
                                activeTab !== 'servicios' && serviciosEnabled && serviciosDone && 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
                                activeTab !== 'servicios' && serviciosEnabled && !servicesHasItems && 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            Servicios
                        </button>
                    )}
                </div>

                {showDataTab && activeTab === 'datos' && (
                    <DataTab
                        workOrder={workOrder}
                        can={can}
                        onEdit={() => setEditModalOpen(true)}
                        onDelete={() => setDeleteDialogOpen(true)}
                    />
                )}
                {activeTab === 'fotos' && (
                    <PhotosTab
                        photos={photos}
                        typeLabels={typeLabels}
                        photoStats={photoStats}
                        photosIndexPath={photosIndexPath}
                        can={can}
                    />
                )}
                {(can.checklist_results_view ?? true) && activeTab === 'checklist' && (
                    <ChecklistTab
                        serviceChecklists={serviceChecklists}
                        checklistResults={checklistResults}
                        checklistResultsPath={checklistResultsPath}
                        can={can}
                    />
                )}
                {(can.services_view ?? true) && activeTab === 'servicios' && (
                    <ServicesTab
                        services={services}
                        servicesTotal={servicesTotal}
                        servicesBasePath={servicesBasePath}
                        applyPackagePath={applyPackagePath}
                        packagesForSelect={packagesForSelect}
                        productsForSelect={productsForSelect}
                        payments={payments}
                        paymentsTotalPaid={paymentsTotalPaid}
                        paymentsBasePath={paymentsBasePath}
                        can={can}
                        workOrderStatus={workOrder.status}
                        lastTicketServiceCount={lastTicketServiceCount}
                        canConfirmRepair={canConfirmRepair}
                        confirmRepairButtonLabel={confirmRepairButtonLabel}
                        onConfirmRepair={handleConfirmRepair}
                        onOpenPrintModal={setPendingPrintUrl}
                    />
                )}
                {(can.diagnoses_view ?? true) && activeTab === 'diagnosticos' && (
                    <DiagnosesTab
                        diagnoses={diagnoses}
                        diagnosesBasePath={diagnosesBasePath}
                        can={can}
                    />
                )}
            </div>

            <WorkOrderFormModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                workOrder={workOrder as Parameters<typeof WorkOrderFormModal>[0]['workOrder']}
                workOrdersIndexPath={workOrdersIndexPath}
                vehicles={vehicles}
                clients={clients}
            />

            <DeleteWorkOrderDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                workOrder={workOrder as Parameters<typeof DeleteWorkOrderDialog>[0]['workOrder']}
                workOrdersIndexPath={workOrdersIndexPath}
            />

            <Dialog open={pendingPrintUrl !== null} onOpenChange={handleClosePrintModal}>
                <DialogContent className="cursor-pointer border-content-border bg-card w-[calc(100%-1rem)] max-w-md sm:max-w-lg">
                    {printStep === 'ask' ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-foreground">Ticket generado</DialogTitle>
                                <DialogDescription className="sr-only">¿Desea imprimir el ticket ahora?</DialogDescription>
                            </DialogHeader>
                            <Separator className="bg-content-border" />
                            <p className="text-muted-foreground text-sm">¿Desea imprimir el ticket ahora?</p>
                            <DialogFooter className="flex flex-wrap gap-2 sm:justify-end sm:gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleClosePrintModal(false)}
                                    className="cursor-pointer border-content-border min-w-0 flex-1 sm:flex-none"
                                >
                                    Ahora no
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handlePrintTicket}
                                    className="cursor-pointer min-w-0 flex-1 sm:flex-none bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                                >
                                    <Printer className="mr-2 size-4" />
                                    Imprimir
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-foreground">Vista previa del ticket</DialogTitle>
                                <DialogDescription className="sr-only">Imprima desde aquí. No se abrirá otra página.</DialogDescription>
                            </DialogHeader>
                            <Separator className="bg-content-border" />
                            <p className="text-muted-foreground text-sm">Imprima desde aquí. No se abrirá otra página.</p>
                            <div className="flex flex-col gap-3">
                                <iframe
                                    ref={ticketIframeRef}
                                    src={pendingPrintUrl ?? ''}
                                    title="Ticket"
                                    className="h-[420px] w-full max-w-[320px] self-center rounded border border-content-border bg-white"
                                />
                                <DialogFooter className="flex flex-wrap gap-2 sm:justify-end sm:gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleClosePrintModal(false)}
                                        className="cursor-pointer border-content-border min-w-0 flex-1 sm:flex-none"
                                    >
                                        Cerrar
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handlePrintFromIframe}
                                        className="cursor-pointer min-w-0 flex-1 sm:flex-none bg-rose-500/85 text-white hover:bg-rose-600 dark:bg-rose-600/90 dark:hover:bg-rose-700"
                                    >
                                        <Printer className="mr-2 size-4" />
                                        Imprimir ticket
                                    </Button>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
