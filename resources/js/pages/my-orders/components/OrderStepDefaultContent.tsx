type OrderStepDefaultContentProps = {
    stepLabel: string;
};

export function OrderStepDefaultContent({ stepLabel }: OrderStepDefaultContentProps) {
    return (
        <p className="text-sm text-slate-700">
            Aquí más adelante mostraremos el detalle específico de la etapa{' '}
            <span className="font-semibold text-red-600">{stepLabel}</span>: fotos,
            checklist, diagnósticos, servicios y pagos relacionados a esta orden.
        </p>
    );
}
