import type { WorkOrderStatus } from '@/types/models/WorkOrder';
import type { BreadcrumbItem } from '@/types';

export type EntryMediaItem = {
    id: number;
    url: string;
    caption: string | null;
    created_at: string | null;
};

export type ChecklistResultItem = {
    id: number;
    name: string;
    order_number: number | null;
    checked: boolean;
    note: string;
    completed_at: string | null;
};

export type DiagnosisItem = {
    id: number;
    diagnosis_text: string;
    diagnosed_at: string | null;
    diagnosed_by_name: string | null;
};

export type OrderServiceItem = {
    id: number;
    service_package_name: string | null;
    product_name: string | null;
    product_brand_name: string | null;
    description: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
};

export type OrderPaymentItem = {
    id: number;
    type: string;
    amount: number;
    payment_method: string | null;
    paid_at: string | null;
    reference: string | null;
    print_url: string;
    receipt_pdf_url: string;
};

export type NextMaintenanceItem = {
    service_package_name: string;
    next_due_date: string | null;
    next_due_km: number | null;
    interval_days: number | null;
    interval_km: number | null;
    last_service_at: string | null;
    last_service_mileage: number | null;
};

export type OrderPayload = {
    id: number;
    status: WorkOrderStatus;
    entry_date: string | null;
    entry_time: string | null;
    vehicle_plate: string | null;
    vehicle_display: string;
    photos_by_type?: {
        entry?: EntryMediaItem[];
        diagnosis?: EntryMediaItem[];
        process?: EntryMediaItem[];
        delivery?: EntryMediaItem[];
    };
    checklist_results?: ChecklistResultItem[];
    diagnoses?: DiagnosisItem[];
    services?: OrderServiceItem[];
    payments?: OrderPaymentItem[];
    total_amount: number | null;
    next_maintenance?: NextMaintenanceItem[];
};

export type MyOrderShowPageProps = {
    order: OrderPayload;
    breadcrumbs: BreadcrumbItem[];
};
