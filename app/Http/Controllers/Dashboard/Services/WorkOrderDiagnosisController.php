<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Services\WorkOrderDiagnosisRequest;
use App\Models\WorkOrder;
use App\Models\WorkOrderDiagnosis;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WorkOrderDiagnosisController extends Controller
{
    public function store(WorkOrderDiagnosisRequest $request, WorkOrder $work_order): RedirectResponse
    {
        $isFirstDiagnosis = ! $work_order->diagnoses()->exists();

        $diagnosis = $work_order->diagnoses()->create([
            'diagnosis_text' => $request->validated('diagnosis_text'),
            'diagnosed_by' => $request->user()?->id,
            'diagnosed_at' => $request->validated('diagnosed_at'),
            'internal_notes' => $request->validated('internal_notes'),
        ]);

        if ($isFirstDiagnosis) {
            $work_order->update(['status' => 'diagnosticado']);
        }

        $this->sendDiagnosisNotification($work_order, $diagnosis);

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Diagnóstico registrado correctamente.']);
    }

    public function update(WorkOrderDiagnosisRequest $request, WorkOrder $work_order, WorkOrderDiagnosis $diagnosis): RedirectResponse
    {
        if ($diagnosis->work_order_id !== (int) $work_order->id) {
            abort(404);
        }

        $user = $request->user();
        if (! $user || ((int) $user->id !== (int) $diagnosis->diagnosed_by && ! $user->hasRole('superadmin'))) {
            abort(403);
        }

        $diagnosis->update([
            'diagnosis_text' => $request->validated('diagnosis_text'),
            'diagnosed_by' => $request->user()?->id,
            'diagnosed_at' => $request->validated('diagnosed_at'),
            'internal_notes' => $request->validated('internal_notes'),
        ]);

        $this->sendDiagnosisNotification($work_order, $diagnosis->fresh());

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Diagnóstico actualizado correctamente.']);
    }

    public function destroy(Request $request, WorkOrder $work_order, WorkOrderDiagnosis $diagnosis): RedirectResponse
    {
        if ($diagnosis->work_order_id !== (int) $work_order->id) {
            abort(404);
        }
        $user = $request->user();
        if (! $user?->can('work_order_diagnoses.delete')) {
            abort(403);
        }
        if ((int) $user->id !== (int) $diagnosis->diagnosed_by && ! $user->hasRole('superadmin')) {
            abort(403);
        }
        $diagnosis->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Diagnóstico eliminado correctamente.']);
    }

    /**
     * Envía al cliente por email y WhatsApp el diagnóstico, con saludo del técnico, datos del cliente, auto y fecha/hora (Perú).
     */
    private function sendDiagnosisNotification(WorkOrder $work_order, WorkOrderDiagnosis $diagnosis): void
    {
        $work_order->load(['vehicle.vehicleModel.brand', 'client']);
        $diagnosis->load('diagnosedByUser');
        $client = $work_order->client;
        if (! $client) {
            return;
        }

        $tecnico = $diagnosis->diagnosedByUser;
        $nombreTecnico = $tecnico ? trim($tecnico->first_name . ' ' . $tecnico->last_name) : 'nuestro técnico';

        $clienteNombre = trim($client->first_name . ' ' . $client->last_name) ?: 'Cliente';

        $vehicle = $work_order->vehicle;
        $marca = $vehicle?->vehicleModel?->brand?->name ?? '—';
        $modelo = $vehicle?->vehicleModel?->name ?? '—';
        $placa = $vehicle?->plate ?? '—';
        $anio = $vehicle?->year ? (string) $vehicle->year : '—';
        $vehiculoLinea = trim("{$marca} {$modelo}");
        if ($vehiculoLinea === '' || $vehiculoLinea === ' ') {
            $vehiculoLinea = '—';
        }

        // En BD se guarda la hora de Perú sin zona; Laravel la interpreta como UTC. Reinterpretamos como Lima.
        $fechaHora = $diagnosis->diagnosed_at
            ? Carbon::createFromFormat('Y-m-d H:i:s', $diagnosis->diagnosed_at->format('Y-m-d H:i:s'), 'America/Lima')
            : Carbon::now('America/Lima');
        $fechaHoraTexto = $fechaHora->format('d/m/Y') . ' a las ' . $fechaHora->format('H:i') . ' (hora Perú)';

        $textoDiagnostico = trim($diagnosis->diagnosis_text) ?: 'Sin detalle adicional.';

        $empresa = config('app.company_name', 'RA Automotriz S.A.C.');
        $saludo  = "Estimado/a {$clienteNombre},";

        $mensajeWhatsApp = "{$empresa}\n\n"
            . "🔍 *Diagnóstico de su vehículo listo*\n\n"
            . "{$saludo}\n\n"
            . "Le informamos que *{$nombreTecnico}* ha registrado el diagnóstico de su vehículo.\n\n"
            . "🚗 *Datos del vehículo:*\n"
            . "• Vehículo: {$vehiculoLinea}\n"
            . "• Placa: *{$placa}*\n"
            . "• Año: {$anio}\n\n"
            . "📋 *Diagnóstico:*\n"
            . "{$textoDiagnostico}\n\n"
            . "🕐 *Fecha y hora:* {$fechaHoraTexto}\n\n"
            . "Nos pondremos en contacto con usted para coordinar el servicio a realizar.\n"
            . "¡Gracias por confiar en nosotros!";

        $mensajeEmail = "{$saludo}\n\n"
            . "Le comunicamos que *{$nombreTecnico}* ha completado el diagnóstico de su vehículo.\n\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n"
            . "Vehículo  : {$vehiculoLinea}\n"
            . "Placa     : {$placa}\n"
            . "Año       : {$anio}\n"
            . "Técnico   : {$nombreTecnico}\n"
            . "Fecha/Hora: {$fechaHoraTexto}\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            . "DIAGNÓSTICO:\n"
            . "{$textoDiagnostico}\n\n"
            . "━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            . "Nos comunicaremos con usted para coordinar los siguientes pasos.\n"
            . "Ante cualquier consulta, estamos a su disposición. ¡Gracias por confiar en nosotros!";

        $asunto = "Diagnóstico listo – Orden #{$work_order->id} | {$empresa}";

        $notificationService = app(NotificationService::class);
        $notificationService->sendEmail($client, $asunto, $mensajeEmail, $work_order);
        $notificationService->sendWhatsApp($client, $mensajeWhatsApp, $work_order);
    }
}
