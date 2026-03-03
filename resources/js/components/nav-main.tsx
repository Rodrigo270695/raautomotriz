import { Link } from '@inertiajs/react';
import { ChevronDownIcon, UsersIcon } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

const NAVY = '#2d4a6f';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel className="font-semibold tracking-tight">
                Plataforma
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>
                    item.items?.length ? (
                        <Collapsible
                            key={item.title}
                            defaultOpen={item.items.some((sub) => isCurrentUrl(sub.href))}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={{ children: item.title }}
                                        className="nav-group-trigger transition-colors duration-200"
                                    >
                                        {item.icon ? (
                                            <item.icon className="size-4 shrink-0" />
                                        ) : (
                                            <UsersIcon className="size-4 shrink-0" />
                                        )}
                                        <span>{item.title}</span>
                                        <ChevronDownIcon className="ml-auto size-4 shrink-0 transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-180" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>

                                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                    <SidebarMenuSub>
                                        {item.items.map((sub) => {
                                            const active = isCurrentUrl(sub.href);
                                            return (
                                                <SidebarMenuSubItem key={sub.title}>
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        className={
                                                            active
                                                                ? 'nav-sub-active'
                                                                : 'nav-sub-inactive'
                                                        }
                                                    >
                                                        <Link href={sub.href} prefetch>
                                                            <span>{sub.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={{ children: item.title }}
                                className={
                                    isCurrentUrl(item.href)
                                        ? 'nav-item-active'
                                        : 'nav-item-inactive'
                                }
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon className="size-4 shrink-0" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ),
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
