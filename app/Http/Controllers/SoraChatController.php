<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\SoraAppointment;
use App\Models\SoraConversation;
use App\Models\SoraMessage;
use App\Models\Vehicle;
use App\Models\VehicleMaintenanceSchedule;
use App\Models\WorkOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SoraChatController extends Controller
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
Eres SORA, el asistente virtual inteligente de RA AUTOMOTRIZ, el taller mecánico de confianza en Chiclayo, Perú.

Tu misión es ayudar a los clientes con información útil, clara y amable sobre:
- Servicios disponibles: Reparación de motores, Suspensión, Dirección, Frenos, Sistema eléctrico, Scanner automotriz (OBD2), Cambio de aceite, Planchado y pintura, Alineamiento y balanceo, Instalación de GLP.
- Horario: Lunes a Sábado de 8:30 a 18:30 horas. Domingo: cerrado. Las citas solo pueden agendarse dentro de este horario.
- Dirección: El Ayllu 267, La Victoria, Chiclayo, Lambayeque, Perú.
- Precios: orientar que los precios dependen del diagnóstico y del vehículo, e invitar a venir al taller para un presupuesto sin compromiso.
- Proceso: recepción → diagnóstico → presupuesto → reparación → entrega con garantía.

Información práctica (úsala cuando pregunten):
- Cómo llegar: El Ayllu 267, La Victoria, Chiclayo. Puedes compartir el enlace para ver en mapa: https://www.google.com/maps/search/El+Ayllu+267+La+Victoria+Chiclayo (o Waze/Google Maps buscando "RA AUTOMOTRIZ" o la dirección).
- Formas de pago: Aceptamos efectivo, tarjetas (débito/crédito), Yape, Plin y transferencia. Consulta en recepción por promociones de pago.
- Qué llevar el día de la cita: SOAT vigente, DNI, llaves del vehículo. Si tienes facturas de repuestos anteriores o historial de otro taller, tráelos para mejor diagnóstico.
- Garantía: Nuestras reparaciones incluyen garantía en mano de obra (consulta el tiempo según el servicio). Los repuestos pueden tener garantía del fabricante; infórmate al recibir el presupuesto.
- Tiempos orientativos (solo referencia): cambio de aceite 30-45 min; alineamiento y balanceo 1-1,5 h; diagnóstico con scanner 20-40 min; reparaciones mayores según diagnóstico. Siempre confirma en recepción.
- Servicios adicionales: Si lo necesitas, pregúntanos por opciones de grúa o recojo/entrega; también hacemos revisión pre-compra para autos que vas a comprar.
- Luces del tablero: Si al cliente se le encendió una luz (naranja, roja, etc.), explícale que puede ser aceite, frenos, temperatura, batería o motor según el ícono; recomienda no ignorarla y ofrécele agendar diagnóstico con scanner (OBD2) para saber exactamente qué es.
- Antes de llegar: Si el auto no enciende, recomienda revisar batería y que no intente forzar. Si hay humo o olor fuerte, que no mueva el vehículo y que nos llame; podemos orientar o coordinar grúa.
- Estado de la orden / seguimiento: Cuando pregunten por el estado de su orden, "cómo va mi orden", "en qué está mi auto", etc., NUNCA digas que no tienes acceso. Indícales que pueden ver el estado y el seguimiento en su panel de control: que hagan clic en su nombre (arriba a la derecha) y seleccionen "Ir al panel"; ahí verán el estado de su orden. Si además te hemos pasado en contexto el estado de sus órdenes abiertas, puedes resumirlo brevemente y luego recordarles que en el panel tienen el detalle completo.

Reglas importantes de tono:
- Responde SIEMPRE en español.
- Sé amable, profesional y conciso (máximo 3-4 líneas por respuesta).
- En cada respuesta, cuando sea natural, incluye UNA frase breve tipo "Si quieres, también puedo mostrarte tus citas, agendar una nueva, reprogramar o cancelar alguna" (o similar, variando la redacción). Así el cliente sabe qué puede hacer sin que suene repetitivo.
- Para cotizaciones exactas o citas, invita al cliente a escribir por WhatsApp: https://wa.me/51999999999
- No inventes precios exactos, solo rangos orientativos si el cliente insiste.
- Si te preguntan algo fuera del ámbito automotriz, redirige amablemente al tema del taller.
- Nunca reveles que eres un modelo de ninguna marca; eres SORA de RA AUTOMOTRIZ.
- Si el cliente menciona síntomas de su vehículo (ruidos, fallas, vibraciones, etc.), intenta orientarle con posibles causas y recomiéndale venir al taller para un diagnóstico preciso.

Reglas sobre datos del cliente y del vehículo:
- Si el usuario NO está registrado (invitado), tan pronto como sea natural pídeles:
  - Nombre completo.
  - Número de celular (WhatsApp, incluyendo código de país si es posible).
  - Marca y modelo del vehículo.
  - Placa (solo si la tiene a la mano, no insistas).
- Si el usuario SÍ está registrado, asume que ya tenemos su nombre y celular; solo pide:
  - Marca y modelo del vehículo.
  - Placa opcionalmente.
- Cuando consigas estos datos con suficiente claridad, AL FINAL de tu respuesta agrega en una LÍNEA NUEVA oculto para el usuario un marcador en este formato EXACTO (sin texto extra):
  [[DATOS]]{"name":"Nombre completo","phone":"+51...","brand":"Marca","model":"Modelo","plate":"ABC-123"}
- Si no conoces algún campo, simplemente omítelo del JSON (no pongas valores vacíos ni null).

Reglas sobre agendar citas:
- Horario del taller: de 8:30 a 18:30 (Lunes a Sábado). NUNCA agendes citas fuera de ese horario. Si el usuario pide una hora antes de 8:30 o después de 18:30 (por ejemplo 8:00, 19:00, 20:00), indícale amablemente que el taller atiende de 8:30 a 18:30 y ofrécele el horario más cercano dentro de ese rango.
- Para poder agendar una cita DEBES tener siempre: (1) Nombre completo del cliente, (2) Número de celular (para que el técnico pueda llamar). Si es invitado y aún no te ha dado nombre o celular, pídelos antes de confirmar la cita. Si es usuario registrado, ya los tenemos; solo asegúrate de tener marca/modelo/placa del vehículo.
- Si por el tipo de problema lo consideras razonable, ofrece de forma natural: "Si deseas, puedo ayudarte a agendar una cita en nuestro taller".
- Si el usuario acepta agendar una cita (por ejemplo responde que sí, o te da directamente día y hora), hazle preguntas cortas solo si falta algún dato clave (nombre, celular, marca/modelo, día/hora dentro de 8:30-18:30).
- Debes obtener SIEMPRE, de la forma más clara posible:
  - Día y hora aproximada en que puede traer el vehículo (hora entre 8:30 y 18:30).
  - Opcionalmente alguna nota breve (por ejemplo, si viene en grúa, si vive lejos, etc.).
- ATENCIÓN IMPORTANTE (NO LO OLVIDES):
  - Para una NUEVA cita: cuando confirmes en tu respuesta, agrega al final en una LÍNEA NUEVA el marcador: [[CITA]]{"date":"AAAA-MM-DD","time":"HH:MM","brand":"Marca","model":"Modelo","plate":"ABC-123","notes":"Texto opcional"}
  - Para ACTUALIZAR o CAMBIAR una cita existente (cuando el usuario diga "cambia mi cita", "actualiza la cita", "reprogramar", etc.): NO uses [[CITA]]. Usa en su lugar: [[CITA_ACTUALIZAR]]{"id":Y,"date":"AAAA-MM-DD","time":"HH:MM","notes":"opcional"} donde Y es el id de la cita que te pasamos en la lista de citas del cliente. Así se actualiza esa cita y no se crea otra.
  - Para CANCELAR o ELIMINAR una cita (cuando el usuario diga "cancela mi cita", "elimina la cita", "ya no puedo ir", etc.): usa [[CITA_ELIMINAR]]{"id":Y} donde Y es el id de la cita de la lista (solo las de hoy en adelante). Confirma al usuario que la cita quedó cancelada.
- Usa siempre formato de 24 horas para la hora (por ejemplo 15:30).
- No expliques nunca al usuario la existencia de estos marcadores [[DATOS]], [[CITA]], [[CITA_ACTUALIZAR]] o [[CITA_ELIMINAR]].

Ejemplo de confirmación de cita (SOLO como guía, no lo repitas literal):

Gracias por la información. Tu cita está confirmada para el 2026-03-05 a las 11:00 a.m. para revisar tu Toyota Corolla. Te esperamos en El Ayllu 267, La Victoria, Chiclayo.

[[CITA]]{"date":"2026-03-05","time":"11:00","brand":"Toyota","model":"Corolla","plate":"ABC-123","notes":"Cita creada por SORA"}

Regla sobre registro:
- Si el usuario lleva 3 o más mensajes en la conversación y NO está registrado, recuérdale UNA SOLA VEZ de forma natural que registrarse en nuestra plataforma permite guardar su historial de consultas, de modo que cuando llegue al taller nuestros técnicos ya tendrán contexto de su caso.
PROMPT;

    private const MAX_HISTORY = 10;

    /* ─────────────────── GET /api/sora/session ─────────────────── */

    /**
     * Devuelve la conversación activa de HOY para este dispositivo
     * (identificado por session_id o IP). El frontend lo llama al montar
     * el FAB para restaurar el historial sin crear un nuevo registro.
     */
    public function session(Request $request): JsonResponse
    {
        $sessionId = $request->string('session_id')->trim()->value() ?: null;
        $ip        = $request->ip();
        $today     = now()->toDateString();

        $conversation = $this->findTodayConversation($sessionId, $ip, $today);

        if (!$conversation) {
            return response()->json(['conversation' => null]);
        }

        $messages = $conversation->messages()
            ->orderBy('created_at')
            ->get(['role', 'content', 'created_at'])
            ->map(fn ($m) => [
                'role'        => $m->role,
                'content'     => $m->content,
                'created_at'  => $m->created_at?->toIso8601String(),
            ])
            ->values();

        return response()->json([
            'conversation' => [
                'id'       => $conversation->id,
                'messages' => $messages,
            ],
        ]);
    }

    /* ─────────────────── POST /api/sora/chat ─────────────────── */

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'messages'           => ['required', 'array', 'min:1', 'max:20'],
            'messages.*.role'    => ['required', 'string', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string', 'max:1000'],
            'session_id'         => ['nullable', 'string', 'max:64'],
            'conversation_id'    => ['nullable', 'integer'],
            'is_guest'           => ['nullable', 'boolean'],
        ]);

        $history   = array_slice($validated['messages'], -self::MAX_HISTORY);
        $userId    = $request->user()?->id;
        $sessionId = $validated['session_id'] ?? null;
        $ip        = $request->ip();
        $isGuest   = $validated['is_guest'] ?? true;
        $today     = now()->toDateString();

        $systemPrompt = self::SYSTEM_PROMPT;

        // Fecha y hora actual en Perú para que la IA interprete bien "hoy", "mañana", etc. (no se muestra al cliente)
        $peruTz   = config('app.local_timezone', 'America/Lima');
        $nowPeru  = now($peruTz);
        $dateRef  = $nowPeru->format('Y-m-d');   // 2026-03-04
        $timeRef  = $nowPeru->format('H:i');     // 17:30
        $dayName  = $nowPeru->translatedFormat('l'); // lunes, martes...
        $systemPrompt .= "\n\n[REFERENCIA INTERNA - no la menciones nunca al usuario] Fecha y hora actual en Perú: {$dateRef} {$timeRef}. Día de la semana: {$dayName}. Usa SIEMPRE esta fecha y este año para interpretar 'hoy', 'mañana', 'pasado mañana', 'el lunes', etc. Al generar [[CITA]] usa date en formato AAAA-MM-DD y time en formato 24h (HH:MM) según esta referencia.";

        if (!$isGuest) {
            $systemPrompt .= "\n- El usuario está REGISTRADO en la plataforma. Su historial queda guardado.";
        }

        // ── Buscar conversación existente de hoy (evita duplicados) ──
        $conversation = null;

        // 1) Por conversation_id explícito (si el frontend ya lo conoce)
        if (!empty($validated['conversation_id'])) {
            $conversation = SoraConversation::find((int) $validated['conversation_id']);
        }

        // 2) Por session_id o IP del mismo día (maneja recargas de página)
        if (!$conversation) {
            $conversation = $this->findTodayConversation($sessionId, $ip, $today);
        }

        // 3) Crear nueva si no existe ninguna de hoy
        if (!$conversation) {
            $conversation = SoraConversation::create([
                'user_id'    => $userId,
                'session_id' => $sessionId,
                'ip_address' => $ip,
                'status'     => 'active',
            ]);
        } else {
            // Vincular usuario si acaba de hacer login
            if (!$conversation->user_id && $userId) {
                $conversation->update(['user_id' => $userId]);
            }
        }

        // ── Citas del cliente (solo hoy en adelante, pendientes o confirmadas) para listar, actualizar o cancelar ──
        $todayStart = now($peruTz)->startOfDay();
        $upcomingAppointments = SoraAppointment::where('conversation_id', $conversation->id)
            ->where('scheduled_at', '>=', $todayStart)
            ->whereIn('status', ['pending', 'confirmed'])
            ->orderBy('scheduled_at')
            ->get(['id', 'scheduled_at', 'vehicle_brand', 'vehicle_model']);
        $appointmentsLine = $upcomingAppointments->isEmpty()
            ? 'Este cliente no tiene citas programadas desde hoy en adelante.'
            : $upcomingAppointments->map(fn ($a) => sprintf(
                'id=%d, %s %s, %s %s',
                $a->id,
                $a->scheduled_at->timezone($peruTz)->format('Y-m-d'),
                $a->scheduled_at->timezone($peruTz)->format('H:i'),
                $a->vehicle_brand ?? '',
                $a->vehicle_model ?? '',
            ))->implode('; ');
        $systemPrompt .= "\n\n[REFERENCIA INTERNA] Citas de este cliente (solo hoy en adelante): {$appointmentsLine}. Cuando pregunten cuáles son sus citas, responde SOLO con esta lista (no inventes ni menciones citas pasadas). Para ACTUALIZAR una cita usa [[CITA_ACTUALIZAR]] con el id; para CANCELAR/ELIMINAR una cita usa [[CITA_ELIMINAR]]{\"id\":Y}; para una cita NUEVA usa [[CITA]].";

        // ── Estado de órdenes de trabajo, mantenimiento, historial y promociones (para respuestas contextuales) ──
        $contextLines = [];
        if ($userId) {
            $openStatuses = ['ingreso', 'en_checklist', 'diagnosticado', 'en_reparacion', 'listo_para_entregar'];
            $openWOs = WorkOrder::where('client_id', $userId)
                ->whereIn('status', $openStatuses)
                ->with('vehicle.vehicleModel.brand')
                ->orderBy('updated_at', 'desc')
                ->get();
            $statusLabel = [
                'ingreso' => 'en recepción',
                'en_checklist' => 'en revisión inicial',
                'diagnosticado' => 'diagnosticado (presupuesto en elaboración o listo)',
                'en_reparacion' => 'en reparación',
                'listo_para_entregar' => 'listo para entrega',
            ];
            if ($openWOs->isNotEmpty()) {
                $woParts = $openWOs->map(fn ($wo) => sprintf(
                    'Orden %s: vehículo %s %s (placa %s), estado: %s',
                    $wo->id,
                    $wo->vehicle?->vehicleModel?->brand?->name ?? 'N/A',
                    $wo->vehicle?->vehicleModel?->name ?? '',
                    $wo->vehicle?->plate ?? 'N/A',
                    $statusLabel[$wo->status] ?? $wo->status,
                ))->implode('; ');
                $contextLines[] = "Órdenes de trabajo abiertas de este cliente: {$woParts}. Cuando pregunten 'en qué está mi auto' o 'estado de mi orden', responde con este estado y recuérdales que pueden ver el detalle en su panel (menú > Ir al panel).";
            }
            $pastWoCount = WorkOrder::where('client_id', $userId)->where('status', 'entregado')->count();
            if ($pastWoCount > 0) {
                $contextLines[] = "Este cliente tiene {$pastWoCount} reparación(es) anterior(es) en el taller (historial). Puedes mencionarlo si preguntan por historial o qué le han hecho al auto.";
            }
            $vehicleIds = Vehicle::where('client_id', $userId)->pluck('id');
            if ($vehicleIds->isNotEmpty()) {
                $nextMaintenance = VehicleMaintenanceSchedule::whereIn('vehicle_id', $vehicleIds)
                    ->whereNotNull('next_due_date')
                    ->where('next_due_date', '>=', $todayStart)
                    ->with(['vehicle', 'serviceType'])
                    ->orderBy('next_due_date')
                    ->first();
                if ($nextMaintenance) {
                    $due = $nextMaintenance->next_due_date->format('d/m/Y');
                    $svc = $nextMaintenance->serviceType?->name ?? 'mantenimiento';
                    $contextLines[] = "Próximo mantenimiento programado: {$svc} para el {$due} (vehículo placa {$nextMaintenance->vehicle?->plate}). Si preguntan cuándo les toca mantenimiento o cambio de aceite, usa esta fecha y sugiere agendar cita.";
                }
            }
        }
        $promos = Promotion::currentlyActive()->get(['title', 'description']);
        if ($promos->isNotEmpty()) {
            $promoText = $promos->map(fn ($p) => $p->title . ($p->description ? ': ' . \Illuminate\Support\Str::limit($p->description, 80) : ''))->implode(' | ');
            $contextLines[] = "Promociones vigentes (menciona cuando pregunten por ofertas o promos): {$promoText}.";
        }
        if ($contextLines !== []) {
            $systemPrompt .= "\n\n[REFERENCIA INTERNA] " . implode(' ', $contextLines);
        }

        // ── Detectar placa del vehículo ──
        $lastUserMsg = collect($validated['messages'])->last(fn ($m) => $m['role'] === 'user');
        if ($lastUserMsg && !$conversation->vehicle_plate) {
            preg_match('/\b[A-Z]{3}[-\s]?\d{3}\b/i', $lastUserMsg['content'], $plateMatch);
            if ($plateMatch) {
                $conversation->update([
                    'vehicle_plate' => strtoupper(str_replace(' ', '-', $plateMatch[0])),
                ]);
            }
        }

        // ── Guardar mensaje del usuario ──
        SoraMessage::create([
            'conversation_id' => $conversation->id,
            'role'            => 'user',
            'content'         => $lastUserMsg['content'],
        ]);

        // ── Llamar al proveedor de IA (OpenAI / ChatGPT) ──
        [$reply, $tokensUsed] = $this->callOpenAI($history, $systemPrompt);

        if ($reply === null) {
            return response()->json(
                ['reply' => 'Lo siento, en este momento no puedo responder. Por favor escríbenos por WhatsApp.'],
                200,
            );
        }

        // Log para depuración de citas/datos estructurados
        Log::info('SORA raw reply', [
            'conversation_id' => $conversation->id,
            'reply'           => $reply,
        ]);

        // ── Procesar marcadores ocultos [[DATOS]] y [[CITA]] en la respuesta ──
        $reply = $this->handleStructuredMarkers($reply, $conversation, $userId);

        // ── Guardar respuesta de SORA ──
        SoraMessage::create([
            'conversation_id' => $conversation->id,
            'role'            => 'assistant',
            'content'         => $reply,
            'tokens_used'     => $tokensUsed,
        ]);

        return response()->json([
            'reply'           => $reply,
            'conversation_id' => $conversation->id,
        ]);
    }

    /* ─────────────────── Helpers ─────────────────── */

    /**
     * Busca una conversación activa de hoy para el mismo dispositivo
     * usando session_id (localStorage) o IP como identificadores.
     */
    private function findTodayConversation(?string $sessionId, string $ip, string $today): ?SoraConversation
    {
        return SoraConversation::where('status', 'active')
            ->whereDate('created_at', $today)
            ->where(function ($q) use ($sessionId, $ip) {
                if ($sessionId) {
                    $q->where('session_id', $sessionId);
                }
                $q->orWhere('ip_address', $ip);
            })
            ->latest()
            ->first();
    }

    /**
     * Procesa los marcadores especiales añadidos por SORA en la respuesta:
     *  - [[DATOS]]{...} para datos de contacto / vehículo
     *  - [[CITA]]{...}  para solicitud de creación de cita
     *
     * Actualiza la conversación y crea la cita si corresponde, y devuelve
     * el texto limpio que verá el usuario (sin los marcadores).
     */
    private function handleStructuredMarkers(string $reply, SoraConversation $conversation, ?int $userId): string
    {
        // [[DATOS]] JSON
        if (preg_match('/^\s*\[\[DATOS\]\](.+)$/m', $reply, $match)) {
            $json = trim($match[1]);
            $data = json_decode($json, true);

            if (is_array($data)) {
                $update = [];

                if (!empty($data['name']) && !$conversation->guest_name && !$conversation->user_id) {
                    $update['guest_name'] = $data['name'];
                }

                if (!empty($data['phone']) && !$conversation->guest_phone && !$conversation->user_id) {
                    $update['guest_phone'] = $data['phone'];
                }

                if (!empty($data['brand']) && !$conversation->vehicle_brand) {
                    $update['vehicle_brand'] = $data['brand'];
                }

                if (!empty($data['model']) && !$conversation->vehicle_model) {
                    $update['vehicle_model'] = $data['model'];
                }

                if (!empty($data['plate']) && !$conversation->vehicle_plate) {
                    $update['vehicle_plate'] = strtoupper(str_replace(' ', '-', $data['plate']));
                }

                if ($update !== []) {
                    $conversation->update($update);
                }
            }

            // eliminar la línea completa del marcador
            $reply = str_replace($match[0], '', $reply);
        }

        // [[CITA_ACTUALIZAR]] JSON — actualizar cita existente (no crear nueva)
        if (preg_match('/^\s*\[\[CITA_ACTUALIZAR\]\](.+)$/m', $reply, $match)) {
            $json = trim($match[1]);
            $data = json_decode($json, true);

            if (is_array($data) && !empty($data['id']) && !empty($data['date']) && !empty($data['time'])) {
                $appointment = SoraAppointment::where('id', (int) $data['id'])
                    ->where('conversation_id', $conversation->id)
                    ->first();
                if ($appointment) {
                    try {
                        $localTz    = config('app.local_timezone', 'America/Lima');
                        $dateTime   = sprintf('%s %s', $data['date'], $data['time']);
                        $scheduledAt = \Carbon\Carbon::createFromFormat('Y-m-d H:i', $dateTime, $localTz)
                            ->setTimezone(config('app.timezone', $localTz));
                        $appointment->update([
                            'scheduled_at' => $scheduledAt,
                            'notes'        => $data['notes'] ?? $appointment->notes,
                        ]);
                    } catch (\Throwable $e) {
                        Log::error('SORA appointment update failed', [
                            'error' => $e->getMessage(),
                            'data'  => $data,
                        ]);
                    }
                }
            }
            $reply = str_replace($match[0], '', $reply);
        }

        // [[CITA_ELIMINAR]] JSON — cancelar cita (solo las de hoy en adelante, ya filtradas en la lista que ve la IA)
        if (preg_match('/^\s*\[\[CITA_ELIMINAR\]\](.+)$/m', $reply, $match)) {
            $json = trim($match[1]);
            $data = json_decode($json, true);

            if (is_array($data) && !empty($data['id'])) {
                $appointment = SoraAppointment::where('id', (int) $data['id'])
                    ->where('conversation_id', $conversation->id)
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->first();
                if ($appointment) {
                    $appointment->update(['status' => 'cancelled']);
                }
            }
            $reply = str_replace($match[0], '', $reply);
        }

        // [[CITA]] JSON — crear NUEVA cita (horario válido: 8:30–18:30)
        if (preg_match('/^\s*\[\[CITA\]\](.+)$/m', $reply, $match)) {
            $json = trim($match[1]);
            $data = json_decode($json, true);

            if (is_array($data) && !empty($data['date']) && !empty($data['time'])) {
                try {
                    $localTz    = config('app.local_timezone', 'America/Lima');
                    $dateTime   = sprintf('%s %s', $data['date'], $data['time']);
                    $scheduledAt = \Carbon\Carbon::createFromFormat('Y-m-d H:i', $dateTime, $localTz)
                        ->setTimezone(config('app.timezone', $localTz));

                    $dayStart = $scheduledAt->copy()->startOfDay();
                    $open  = $dayStart->copy()->setTime(8, 30);
                    $close = $dayStart->copy()->setTime(18, 30);
                    if ($scheduledAt->lt($open)) {
                        $scheduledAt = $open;
                    } elseif ($scheduledAt->gt($close)) {
                        $scheduledAt = $close;
                    }

                    SoraAppointment::create([
                        'conversation_id' => $conversation->id,
                        'user_id'         => $userId ?? $conversation->user_id,
                        'guest_name'      => $conversation->guest_name ?? ($data['name'] ?? null),
                        'guest_phone'     => $conversation->guest_phone ?? ($data['phone'] ?? null),
                        'vehicle_brand'   => $conversation->vehicle_brand ?? ($data['brand'] ?? null),
                        'vehicle_model'   => $conversation->vehicle_model ?? ($data['model'] ?? null),
                        'vehicle_plate'   => $conversation->vehicle_plate ?? ($data['plate'] ?? null),
                        'scheduled_at'    => $scheduledAt,
                        'status'          => 'pending',
                        'notes'           => $data['notes'] ?? null,
                    ]);
                } catch (\Throwable $e) {
                    Log::error('SORA appointment creation failed', [
                        'error' => $e->getMessage(),
                        'data'  => $data,
                    ]);
                }
            }

            // eliminar la línea completa del marcador
            $reply = str_replace($match[0], '', $reply);
        }

        // Limpiar saltos de línea sobrantes
        $reply = preg_replace("/\n{3,}/", "\n\n", $reply ?? '') ?? '';

        return trim($reply);
    }

    /* ─────────────────── OpenAI ─────────────────── */

    /** @param array<array{role:string,content:string}> $history */
    private function callOpenAI(array $history, string $systemPrompt): array
    {
        $key = config('services.openai.key');

        $response = Http::withToken($key)
            ->timeout(20)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model'       => 'gpt-4o-mini',
                'max_tokens'  => 400,
                'temperature' => 0.7,
                'messages'    => array_merge(
                    [['role' => 'system', 'content' => $systemPrompt]],
                    $history,
                ),
            ]);

        if ($response->failed()) {
            Log::error('SORA OpenAI error', [
                'status'  => $response->status(),
                'body'    => $response->body(),
                'key_set' => !empty($key),
            ]);
            return [null, null];
        }

        $reply      = $response->json('choices.0.message.content');
        $tokensUsed = $response->json('usage.completion_tokens');

        return [trim($reply ?? ''), $tokensUsed];
    }
}
