export type DocumentType = 'dni' | 'ce' | 'pasaporte' | 'ruc';

export const DOCUMENT_TYPES: Array<{ value: DocumentType; label: string }> = [
    { value: 'dni', label: 'DNI' },
    { value: 'ce', label: 'Carnet de Extranjería' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'ruc', label: 'RUC' },
];

/**
 * Convierte un número de documento a su formato normalizado (lowercase, sin espacios).
 * Usado como username para clientes.
 */
export function normalizeDocumentNumber(docNumber: string): string {
    return docNumber.trim().toLowerCase();
}
