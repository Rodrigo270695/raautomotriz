export type ServicePackage = {
    id: number;
    name: string;
    description: string | null;
    service_type_id: number;
    status: string;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
    service_type?: { id: number; name: string };
    // URL relativa a la vista de ítems si el backend la incluye (opcional).
    items_path?: string;
    total_amount?: number;
};
