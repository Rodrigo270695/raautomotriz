import { router } from '@inertiajs/react';
import { KeyRound, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type ActionButtonsProps = {
    editLabel?: string;
    deleteLabel?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onAssignPermissions?: () => void;
    deleteUrl?: string;
    canEdit?: boolean;
    canDelete?: boolean;
    canAssignPermissions?: boolean;
    /** Si true, muestra "Editar" y "Eliminar" como texto en lugar de solo iconos (útil en móvil). */
    showLabels?: boolean;
    className?: string;
};

export function ActionButtons({
    editLabel = 'Editar',
    deleteLabel = 'Eliminar',
    onEdit,
    onDelete,
    onAssignPermissions,
    deleteUrl,
    canEdit = true,
    canDelete = true,
    canAssignPermissions = false,
    showLabels = false,
    className,
}: ActionButtonsProps) {
    const handleDelete = () => {
        if (onDelete) {
            onDelete();
            return;
        }
        if (deleteUrl) {
            router.delete(deleteUrl, {
                preserveScroll: true,
            });
        }
    };

    const showEdit = canEdit && onEdit !== undefined;
    const showDelete = canDelete && (onDelete !== undefined || deleteUrl);
    const showAssignPermissions = canAssignPermissions && onAssignPermissions !== undefined;

    if (!showEdit && !showDelete && !showAssignPermissions) return null;

    const editTooltip = editLabel === 'Editar' ? 'Editar rol' : editLabel;
    const deleteTooltip = deleteLabel === 'Eliminar' ? 'Eliminar rol' : deleteLabel;

    return (
        <div className={cn('flex items-center justify-end gap-2', className)}>
            {showAssignPermissions && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size={showLabels ? 'sm' : 'icon'}
                            className="cursor-pointer shrink-0 text-violet-500 hover:bg-violet-50 hover:text-violet-600 dark:text-violet-400/80 dark:hover:bg-violet-900/20 dark:hover:text-violet-300"
                            onClick={onAssignPermissions}
                            aria-label="Asignar permisos"
                        >
                            {showLabels ? 'Permisos' : <KeyRound className="size-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Asignar permisos</TooltipContent>
                </Tooltip>
            )}
            {showEdit && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size={showLabels ? 'sm' : 'icon'}
                            className="cursor-pointer shrink-0 text-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:text-blue-400/70 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                            onClick={onEdit}
                            aria-label={editTooltip}
                        >
                            {showLabels ? editLabel : <Pencil className="size-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>{editTooltip}</TooltipContent>
                </Tooltip>
            )}
            {showDelete && (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size={showLabels ? 'sm' : 'icon'}
                            className="cursor-pointer shrink-0 text-red-400 hover:bg-red-50 hover:text-red-600 dark:text-red-400/70 dark:hover:bg-red-900/20 dark:hover:text-red-300 focus-visible:text-red-400"
                            onClick={handleDelete}
                            aria-label={deleteTooltip}
                        >
                            {showLabels ? deleteLabel : <Trash2 className="size-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent variant="destructive">{deleteTooltip}</TooltipContent>
                </Tooltip>
            )}
        </div>
    );
}
