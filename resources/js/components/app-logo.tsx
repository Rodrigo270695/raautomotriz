import { useSidebar } from '@/components/ui/sidebar';

/** Sidebar: ralogo.png (RA) cuando está colapsado; logonav.png (logo completo) cuando está expandido. */
export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <img
            src={isCollapsed ? '/ralogo.png' : '/logonav.png'}
            alt="RA Automotriz"
            className={isCollapsed ? 'size-8 shrink-0 object-contain' : 'h-9 w-auto max-w-[180px] shrink-0 object-contain object-left'}
            width={isCollapsed ? 32 : 180}
            height={isCollapsed ? 32 : 36}
        />
    );
}
