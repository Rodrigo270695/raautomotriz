/**
 * Estilos compartidos para formularios de autenticación RA (login, registro, recuperar contraseña).
 * Diseño: azul marino + rojo, responsive y accesible.
 */
/** Clase para el asterisco de obligatorio (solo en registro). */
export const raRequiredAsterisk = 'text-[#e12a2d]';

export const raAuthStyles = {
    input:
        'min-h-[44px] border-[#334155] bg-[#1e293b]/80 text-[#f8fafc] placeholder:text-slate-500 focus-visible:border-[#2d4a6f] focus-visible:ring-[#2d4a6f]/50 sm:min-h-10 rounded-lg px-3 py-2.5 text-base sm:text-sm',
    label: 'text-[#f8fafc] font-medium text-sm',
    button:
        'min-h-[48px] w-full cursor-pointer rounded-lg bg-[#e12a2d] text-white font-semibold shadow-lg hover:bg-[#c92427] focus-visible:ring-[#e12a2d]/50 border-0 sm:min-h-11 text-base sm:text-sm',
    linkAccent:
        'text-[#e12a2d] font-medium underline-offset-4 hover:text-[#ff4757] hover:underline transition-colors',
    checkbox:
        'size-5 shrink-0 rounded-[4px] border-2 border-[#64748b] bg-[#1e293b]/60 data-[state=checked]:bg-[#e12a2d] data-[state=checked]:border-[#e12a2d] data-[state=checked]:text-white focus-visible:ring-2 focus-visible:ring-[#e12a2d]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a2332] sm:size-5',
    inputError: 'text-red-400 text-sm',
    /** Select tipo documento (registro): trigger y dropdown al estilo auth RA */
    selectTrigger:
        'min-h-[44px] border-[#334155] bg-[#1e293b]/80 text-[#f8fafc] data-[placeholder]:text-slate-500 focus-visible:border-[#2d4a6f] focus-visible:ring-[#2d4a6f]/50 sm:min-h-10 rounded-lg px-3 py-2.5 text-base sm:text-sm flex w-full items-center justify-between gap-2 outline-none focus-visible:ring-2',
    selectContent:
        'z-50 max-h-[var(--radix-select-content-available-height)] min-w-[8rem] overflow-hidden rounded-lg border border-[#334155] bg-[#1e293b] text-[#f8fafc] shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[side=bottom]:translate-y-1',
    selectItem:
        'relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-3 pr-8 text-sm outline-none focus:bg-[#334155] focus:text-[#f8fafc] data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
} as const;
