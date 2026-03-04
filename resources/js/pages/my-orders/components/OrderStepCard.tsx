import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type OrderStepCardProps = {
    stepNumber: number;
    stepLabel: string;
    stepDescription: string;
    children: React.ReactNode;
};

export function OrderStepCard({
    stepNumber,
    stepLabel,
    stepDescription,
    children,
}: OrderStepCardProps) {
    return (
        <Card className="border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.12)] animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <CardHeader className="border-b border-slate-100 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <span className="inline-flex size-7 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white shadow">
                        {stepNumber}
                    </span>
                    <span>{stepLabel}</span>
                </CardTitle>
                <CardDescription className="mt-1 text-[13px] text-slate-600">
                    {stepDescription}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">{children}</CardContent>
        </Card>
    );
}
