export type InventoryBrand = {
    id: number;
    inventory_type_id: number;
    name: string;
    description: string | null;
    status: string;
    inventory_type?: { id: number; name: string };
    created_at?: string;
    updated_at?: string;
};
