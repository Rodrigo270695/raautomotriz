export type Vehicle = {
    id: number;
    plate: string;
    year: number | null;
    color: string | null;
    entry_mileage: number | null;
    exit_mileage: number | null;
    vehicle_model_id: number;
    client_id: number;
    status: string;
    vehicle_model?: {
        id: number;
        name: string;
        brand?: { id: number; name: string };
    };
    client?: {
        id: number;
        first_name: string;
        last_name: string;
        name?: string;
    };
    created_at?: string;
    updated_at?: string;
    /** Presente si el backend incluyó auditoría (createdBy/updatedBy). */
    created_by_name?: string | null;
    updated_by_name?: string | null;
    /** "Creado por / Modificado por" en una sola cadena. */
    audit_display?: string;
};
