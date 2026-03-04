import { Activity, Camera, CheckCircle2, ClipboardList, PackageCheck, Wrench } from 'lucide-react';
import type { WorkOrderStatus } from '@/types/models/WorkOrder';
import type { TimelineStep } from '@/components/work-orders/ClientOrderTimelineResponsive';

export const MY_ORDER_STEPS: TimelineStep[] = [
    {
        id: 'ingreso',
        label: 'Ingreso',
        description: 'Registro inicial del vehículo en el taller.',
        icon: <Camera className="size-4" />,
    },
    {
        id: 'checklist',
        label: 'Checklist',
        description: 'Revisión rápida de puntos clave y seguridad.',
        icon: <ClipboardList className="size-4" />,
    },
    {
        id: 'diagnostico',
        label: 'Diagnóstico',
        description: 'Análisis detallado y confirmación de fallas.',
        icon: <Activity className="size-4" />,
    },
    {
        id: 'reparacion',
        label: 'Reparación',
        description: 'Ejecución de los trabajos aprobados.',
        icon: <Wrench className="size-4" />,
    },
    {
        id: 'listo_para_entregar',
        label: 'Listo para entregar',
        description: 'Control de calidad y validaciones finales.',
        icon: <CheckCircle2 className="size-4" />,
    },
    {
        id: 'entregado',
        label: 'Entregado',
        description: 'Cierre de orden y próximos mantenimientos.',
        icon: <PackageCheck className="size-4" />,
    },
];

export function mapStatusToStepId(status: WorkOrderStatus): string {
    switch (status) {
        case 'ingreso':
            return 'ingreso';
        case 'en_checklist':
            return 'checklist';
        case 'diagnosticado':
            return 'diagnostico';
        case 'en_reparacion':
            return 'reparacion';
        case 'listo_para_entregar':
            return 'listo_para_entregar';
        case 'entregado':
            return 'entregado';
        case 'cancelado':
        default:
            return 'ingreso';
    }
}
