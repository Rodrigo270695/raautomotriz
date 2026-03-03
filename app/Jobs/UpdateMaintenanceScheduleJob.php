<?php

namespace App\Jobs;

use App\Models\VehicleMaintenanceSchedule;
use App\Models\WorkOrder;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Se dispara cuando una orden cambia a estado "entregado".
 * Para cada servicio de la orden que tenga un paquete con interval_km o interval_days,
 * crea o actualiza el registro en vehicle_maintenance_schedules.
 */
class UpdateMaintenanceScheduleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $workOrderId,
        public readonly ?int $nextDueDays = null,
    ) {}

    public function handle(): void
    {
        $workOrder = WorkOrder::with([
            'vehicle',
            'services.servicePackage',
        ])->find($this->workOrderId);

        if (! $workOrder || ! $workOrder->vehicle) {
            return;
        }

        $vehicle      = $workOrder->vehicle;
        $exitMileage  = $workOrder->exit_mileage;
        $deliveredAt  = now();

        // Obtenemos los paquetes únicos de la orden que tienen intervalo configurado
        $packagesProcessed = [];

        foreach ($workOrder->services as $service) {
            $package = $service->servicePackage;

            if (! $package) {
                continue;
            }
            if (isset($packagesProcessed[$package->id])) {
                continue;
            }
            if (! $package->interval_km && ! $package->interval_days) {
                continue;
            }

            $packagesProcessed[$package->id] = true;

            $nextDueKm = $exitMileage && $package->interval_km
                ? $exitMileage + $package->interval_km
                : null;

            // Prioridad: días indicados por el técnico al entregar > días del paquete
            $daysToUse   = $this->nextDueDays ?? $package->interval_days;
            $nextDueDate = $daysToUse
                ? Carbon::parse($deliveredAt)->addDays($daysToUse)->toDateString()
                : null;

            VehicleMaintenanceSchedule::updateOrCreate(
                [
                    'vehicle_id'         => $vehicle->id,
                    'service_package_id' => $package->id,
                ],
                [
                    'service_type_id'      => $package->service_type_id,
                    'interval_km'          => $package->interval_km,
                    // Si el técnico indicó días específicos, prevalece sobre el paquete
                    'interval_days'        => $this->nextDueDays ?? $package->interval_days,
                    'last_work_order_id'   => $workOrder->id,
                    'last_service_at'      => $deliveredAt,
                    'last_service_mileage' => $exitMileage,
                    'next_due_km'          => $nextDueKm,
                    'next_due_date'        => $nextDueDate,
                ]
            );

            Log::info('MaintenanceSchedule updated', [
                'vehicle_id'   => $vehicle->id,
                'package_id'   => $package->id,
                'next_due_km'  => $nextDueKm,
                'next_due_date'=> $nextDueDate,
            ]);
        }
    }
}
