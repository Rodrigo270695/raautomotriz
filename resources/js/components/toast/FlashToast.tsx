import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';

type Flash = { type?: string; message?: string } | null;

const toastClassByType = {
    success:
        '!border-2 !border-emerald-500 !bg-emerald-50 !text-emerald-900 dark:!border-emerald-400 dark:!bg-emerald-950/70 dark:!text-emerald-100',
    error:
        '!border-2 !border-red-500 !bg-red-50 !text-red-900 dark:!border-red-400 dark:!bg-red-950/70 dark:!text-red-100',
    warning:
        '!border-2 !border-amber-500 !bg-amber-50 !text-amber-900 dark:!border-amber-400 dark:!bg-amber-950/70 dark:!text-amber-100',
    info: '!border-2 !border-blue-500 !bg-blue-50 !text-blue-900 dark:!border-blue-400 dark:!bg-blue-950/70 dark:!text-blue-100',
} as const;

function showFlashToast(flash: Flash) {
    if (!flash?.message) return;
    const type = (flash.type ?? 'success') as keyof typeof toastClassByType;
    const className = toastClassByType[type] ?? toastClassByType.success;
    switch (type) {
        case 'error':
            toast.error(flash.message, { className });
            break;
        case 'warning':
            toast.warning(flash.message, { className });
            break;
        case 'info':
            toast.info(flash.message, { className });
            break;
        default:
            toast.success(flash.message, { className });
    }
}

export function FlashToast() {
    useEffect(() => {
        const remove = router.on('success', (event) => {
            const flash = (event.detail?.page?.props?.flash as Flash) ?? null;
            showFlashToast(flash);
        });
        return remove;
    }, []);

    return (
        <Toaster
            position="top-right"
            expand={false}
            visibleToasts={5}
            gap={12}
            offset="1rem"
            richColors
            closeButton
            toastOptions={{
                className: 'shadow-lg',
            }}
        />
    );
}
