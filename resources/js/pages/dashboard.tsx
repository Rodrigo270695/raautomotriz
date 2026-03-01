import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as dashboardRoute } from '@/routes/dashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel de control',
        href: dashboardRoute().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel de control" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-ra-navy/10 dark:stroke-white/10" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-ra-navy/10 dark:stroke-white/10" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] dark:shadow-none">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-ra-navy/10 dark:stroke-white/10" />
                    </div>
                </div>
                <div className="relative min-h-[200px] flex-1 overflow-hidden rounded-xl border border-content-border bg-card shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] md:min-h-[320px] dark:shadow-none">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-ra-navy/10 dark:stroke-white/10" />
                </div>
            </div>
        </AppLayout>
    );
}
