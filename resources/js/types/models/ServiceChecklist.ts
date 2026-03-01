export type ServiceChecklist = {
    id: number;
    order_number: number | null; // null cuando está inactivo; activos tienen 1, 2, 3...
    name: string;
    description: string | null;
    status: string;
    created_at?: string;
    updated_at?: string;
};
