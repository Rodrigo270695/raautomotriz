import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type OrderMoveButtonsProps = {
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    /** Si true, muestra "Subir" y "Bajar" como texto además del icono (útil en móvil). */
    showLabels?: boolean;
    /** Si true, los botones se apilan en vertical (uno debajo del otro). */
    vertical?: boolean;
    className?: string;
};

export function OrderMoveButtons({
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
    showLabels = false,
    vertical = false,
    className,
}: OrderMoveButtonsProps) {
    return (
        <div
            className={cn(
                'flex shrink-0',
                vertical ? 'flex-col items-center gap-0.5' : 'items-center gap-1',
                className
            )}
        >
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size={showLabels ? 'sm' : 'icon'}
                        className={cn(
                            'cursor-pointer shrink-0 text-muted-foreground hover:bg-content-muted/50 hover:text-foreground disabled:opacity-40',
                            vertical && !showLabels && 'size-7'
                        )}
                        onClick={onMoveUp}
                        disabled={!canMoveUp}
                        aria-label="Subir"
                    >
                        {showLabels ? (
                            <>
                                <ChevronUp className="size-4 mr-1" />
                                Subir
                            </>
                        ) : (
                            <ChevronUp className="size-3.5" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Subir</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size={showLabels ? 'sm' : 'icon'}
                        className={cn(
                            'cursor-pointer shrink-0 text-muted-foreground hover:bg-content-muted/50 hover:text-foreground disabled:opacity-40',
                            vertical && !showLabels && 'size-7'
                        )}
                        onClick={onMoveDown}
                        disabled={!canMoveDown}
                        aria-label="Bajar"
                    >
                        {showLabels ? (
                            <>
                                <ChevronDown className="size-4 mr-1" />
                                Bajar
                            </>
                        ) : (
                            <ChevronDown className="size-3.5" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Bajar</TooltipContent>
            </Tooltip>
        </div>
    );
}
