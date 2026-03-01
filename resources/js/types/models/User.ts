/**
 * Usuario (modelo Eloquent). Coincide con fillable + appends.
 * Para props de autenticación (auth.user) se usa también este tipo.
 */
export type User = {
    id: number;
    first_name: string;
    last_name: string;
    document_type?: string;
    document_number?: string;
    username: string;
    email: string;
    phone?: string | null;
    status?: string;
    /** Appended: first_name + last_name */
    name: string;
    avatar?: string | null;
    email_verified_at?: string | null;
    two_factor_enabled?: boolean;
    created_at?: string;
    updated_at?: string;
    /** Conteo de roles (withCount). */
    roles_count?: number;
    /** Conteo de vehículos del cliente (withCount en vista clientes). */
    vehicles_count?: number;
    /** Roles del usuario (with('roles')). */
    roles?: Array<{ id: number; name: string }>;
    [key: string]: unknown;
};
