export type Product = {
    id: number;
    name: string;
    description: string | null;
    sale_price: string | number;
    purchase_price: string | number;
    stock: number;
    image: string | null;
    image_url?: string | null;
    inventory_brand_id: number;
    status: string;
    keywords?: { id: number; name: string }[];
    inventory_brand?: { id: number; name: string; inventory_type_id?: number; inventory_type?: { id: number; name: string } };
    created_at?: string;
    updated_at?: string;
    /** Presente si el backend incluyó auditoría (createdBy/updatedBy). */
    created_by_name?: string | null;
    updated_by_name?: string | null;
    /** "Creado por / Modificado por" en una sola cadena. */
    audit_display?: string;
};
