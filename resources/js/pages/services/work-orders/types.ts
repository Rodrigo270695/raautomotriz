/**
 * Tipos compartidos para la vista show/config de órdenes de trabajo.
 * Centralizados para uso en show.tsx y en los componentes de cada tab.
 */

export type PhotoType = 'entry' | 'diagnosis' | 'process' | 'delivery';

export type WorkOrderPhotoItem = {
    id: number;
    type: string;
    path: string;
    url: string;
    caption: string | null;
    created_at: string | null;
};

export type ChecklistResultItem = {
    id: number;
    service_checklist_id: number;
    checklist_name: string | null;
    checklist_order_number: number | null;
    checked: boolean;
    note: string | null;
    completed_at: string | null;
};

export type ServiceChecklistItem = {
    id: number;
    name: string;
    order_number: number | null;
};

export type WorkOrderDiagnosisItem = {
    id: number;
    diagnosis_text: string;
    diagnosed_by: number | null;
    diagnosed_at: string | null;
    internal_notes: string | null;
    diagnosed_by_name: string | null;
    can_edit?: boolean;
    can_delete?: boolean;
};

export type TechnicianItem = {
    id: number;
    first_name: string;
    last_name: string;
};

export type Vehicle = {
    id: number;
    plate: string;
    vehicle_model_id: number | null;
    vehicle_model?: { id: number; name: string };
};

export type Client = {
    id: number;
    first_name: string;
    last_name: string;
};

export type WorkOrderServiceItem = {
    id: number;
    service_package_id: number | null;
    service_package_name?: string | null;
    service_package_item_id: number | null;
    product_id: number | null;
    type?: 'product' | 'service' | null;
    product_name?: string | null;
    product_brand_name?: string | null;
    description: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
};

export type WorkOrderPackageOption = {
    id: number;
    name: string;
    service_type_name?: string | null;
    total_amount: number;
};

export type WorkOrder = {
    id: number;
    vehicle_id: number;
    client_id: number;
    entry_date: string;
    entry_time: string | null;
    entry_mileage: number | null;
    exit_mileage: number | null;
    client_observation: string | null;
    diagnosis: string | null;
    status: string;
    advance_payment_amount: string | number;
    total_amount: string | number;
    notes: string | null;
    vehicle?: Vehicle;
    client?: Client;
};

export const STATUS_LABELS: Record<string, string> = {
    ingreso: 'Ingreso',
    en_checklist: 'En checklist',
    diagnosticado: 'Diagnosticado',
    en_reparacion: 'En reparación',
    listo_para_entregar: 'Listo para entregar',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
};

/** Valor usado en Select para "ninguno" (Radix no permite value vacío). */
export const SELECT_NONE_VALUE = '__none__';

export type WorkOrderPaymentItem = {
    id: number;
    type: string;
    amount: number;
    payment_method: string | null;
    paid_at: string | null;
    reference: string | null;
    notes: string | null;
};

export type WorkOrderShowCan = {
    update: boolean;
    delete: boolean;
    photos_create: boolean;
    photos_delete: boolean;
    checklist_results_view?: boolean;
    checklist_results_update?: boolean;
    diagnoses_view?: boolean;
    diagnoses_create?: boolean;
    diagnoses_update?: boolean;
    diagnoses_delete?: boolean;
    services_view?: boolean;
    services_create?: boolean;
    services_update?: boolean;
    services_delete?: boolean;
    payments_view?: boolean;
    payments_create?: boolean;
    payments_delete?: boolean;
    payments_print_ticket?: boolean;
    tickets_print?: boolean;
};
