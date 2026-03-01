export type ServicePackageItem = {
    id: number;
    type: string;
    product_id: number | null;
    product_name?: string | null;
    product_brand_name?: string | null;
    quantity: number;
    unit_price: number;
    notes: string | null;
};

