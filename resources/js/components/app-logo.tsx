import { useSidebar } from '@/components/ui/sidebar';

/** Icono RA (ralogo.png) cuando el sidebar está colapsado; logo completo (logorasf.png) cuando está expandido. */
export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <>
            {isCollapsed ? (
                <img
                    src="/ralogo.png"
                    alt="RA Automotriz"
                    className="size-8 shrink-0 object-contain"
                    width={32}
                    height={32}
                />
            ) : (
                <img
                    src="/logorasf.png"
                    alt="RA Automotriz - Taller especializado"
                    className="h-9 w-auto max-w-[180px] shrink-0 object-contain object-left"
                    width={180}
                    height={36}
                />
            )}
        </>
    );
}
