export type VehicleModel = {
    id: number;
    brand_id: number;
    name: string;
    description: string | null;
    status: string;
    brand?: { id: number; name: string };
    created_at?: string;
    updated_at?: string;
};
