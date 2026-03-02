export type WorkOrder = {
    id: number;
    vehicle_id: number;
    client_id: number;
    created_by: number | null;
    entry_date: string;
    entry_time: string;
    entry_mileage: number | null;
    exit_mileage: number | null;
    client_observation: string | null;
    diagnosis: string | null;
    status: WorkOrderStatus;
    advance_payment_amount: string;
    total_amount: string;
    /** Total abonado (suma de pagos). Solo en listado. */
    total_paid?: number;
    notes: string | null;
    created_at?: string;
    updated_at?: string;
    vehicle?: {
        id: number;
        plate: string;
        vehicle_model_id: number | null;
        vehicle_model?: { id: number; name: string };
    };
    client?: {
        id: number;
        first_name: string;
        last_name: string;
        document_number?: string | null;
    };
    /** Si el usuario actual puede editar esta orden (creador o superadmin + permiso). */
    can_edit?: boolean;
    /** Si el usuario actual puede eliminar esta orden (creador o superadmin + permiso). */
    can_delete?: boolean;
};

export type WorkOrderStatus =
    | 'ingreso'
    | 'en_checklist'
    | 'diagnosticado'
    | 'en_reparacion'
    | 'listo_para_entregar'
    | 'entregado'
    | 'cancelado';
