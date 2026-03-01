/**
 * Rol (Spatie Permission). Coincide con el modelo Eloquent y respuestas API.
 */
export type Role = {
    id: number;
    name: string;
    guard_name: string;
    permissions_count?: number;
    created_at?: string;
    updated_at?: string;
};

/** Rol mínimo para formularios (crear/editar). */
export type RoleFormData = Pick<Role, 'name'> & Partial<Pick<Role, 'guard_name'>>;
