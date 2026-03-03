<?php

namespace App\Http\Controllers\Dashboard\Marketing;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\PromotionSend;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PromotionController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request): Response
    {
        $this->authorize('promotions.view');

        $query = Promotion::with('creator:id,first_name,last_name')
            ->withCount('sends')
            ->latest();

        if ($search = $request->input('search')) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        if ($status = $request->input('filter_status')) {
            if ($status === 'active')   $query->where('is_active', true);
            if ($status === 'inactive') $query->where('is_active', false);
        }

        $promotions = $query->paginate($request->input('per_page', 10))->withQueryString();

        $totalActiveClients = User::role('cliente')->where('status', 'active')->count();

        $stats = [
            'total'          => Promotion::count(),
            'active'         => Promotion::where('is_active', true)->count(),
            'active_clients' => $totalActiveClients,
        ];

        return Inertia::render('marketing/promotions/index', [
            'promotions' => $promotions,
            'stats'      => $stats,
            'filters'    => [
                'search'        => $request->input('search'),
                'per_page'      => $request->input('per_page', 10),
                'filter_status' => $request->input('filter_status'),
            ],
            'can'        => [
                'create'            => $request->user()?->can('promotions.create'),
                'update'            => $request->user()?->can('promotions.update'),
                'delete'            => $request->user()?->can('promotions.delete'),
                'toggle'            => $request->user()?->can('promotions.update'),
                'send_notification' => $request->user()?->can('promotions.send_notification'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('promotions.create');

        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'is_active'   => 'boolean',
            'starts_at'   => 'nullable|date',
            'ends_at'     => 'nullable|date|after_or_equal:starts_at',
        ]);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('promotions', 'public');
        }

        unset($data['image']);
        $data['created_by'] = $request->user()?->id;

        Promotion::create($data);

        return redirect()->back()->with('flash', ['type' => 'success', 'message' => 'Promoción creada correctamente.']);
    }

    public function update(Request $request, Promotion $promotion): RedirectResponse
    {
        $this->authorize('promotions.update');

        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'is_active'   => 'boolean',
            'starts_at'   => 'nullable|date',
            'ends_at'     => 'nullable|date|after_or_equal:starts_at',
        ]);

        if ($request->hasFile('image')) {
            if ($promotion->image_path) {
                Storage::disk('public')->delete($promotion->image_path);
            }
            $data['image_path'] = $request->file('image')->store('promotions', 'public');
        }

        unset($data['image']);
        $promotion->update($data);

        return redirect()->back()->with('flash', ['type' => 'success', 'message' => 'Promoción actualizada correctamente.']);
    }

    public function destroy(Promotion $promotion): RedirectResponse
    {
        $this->authorize('promotions.delete');

        if ($promotion->image_path) {
            Storage::disk('public')->delete($promotion->image_path);
        }

        $promotion->delete();

        return redirect()->back()->with('flash', ['type' => 'success', 'message' => 'Promoción eliminada correctamente.']);
    }

    public function toggleActive(Promotion $promotion): RedirectResponse
    {
        $this->authorize('promotions.update');

        // Desactiva todas las demás si se va a activar esta
        if (! $promotion->is_active) {
            Promotion::where('id', '!=', $promotion->id)->update(['is_active' => false]);
        }

        $promotion->update(['is_active' => ! $promotion->is_active]);

        $msg = $promotion->is_active ? 'Promoción activada en la web.' : 'Promoción desactivada.';

        return redirect()->back()->with('flash', ['type' => 'success', 'message' => $msg]);
    }

    public function sendNotification(Request $request, Promotion $promotion): RedirectResponse
    {
        $this->authorize('promotions.send_notification');

        // Solo clientes activos que tengan teléfono o email
        $clients = User::role('cliente')
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNotNull('phone')->orWhereNotNull('email');
            })
            ->get();

        $notificationService = app(NotificationService::class);
        $sent                = 0;
        $now                 = now();

        // Ruta física de la imagen (si tiene)
        $imagePath = $promotion->image_path
            ? Storage::disk('public')->path($promotion->image_path)
            : null;

        foreach ($clients as $client) {
            $name    = trim(($client->first_name ?? '') . ' ' . ($client->last_name ?? ''));
            $message = "🎉 *¡Hola {$name}!*\n\n"
                . "🚗 *RA Automotriz* tiene una promoción especial para ti:\n\n"
                . "📢 *{$promotion->title}*\n"
                . ($promotion->description ? "\n{$promotion->description}\n" : '')
                . "\n✅ Visítanos o llámanos para más información.\n"
                . "📍 *RA Automotriz - Taller de confianza*\n"
                . "🗺️ _Av. el Ayllu 267 - La Victoria - Chiclayo_";

            $sentWhatsapp = false;
            $sentEmail    = false;

            if ($client->phone) {
                // Si hay imagen, la enviamos como imagen + caption; si no, solo texto
                if ($imagePath && is_file($imagePath)) {
                    $notificationService->sendWhatsAppImage($client, $imagePath, $message);
                } else {
                    $notificationService->sendWhatsApp($client, $message);
                }
                $sentWhatsapp = true;
            }

            if ($client->email) {
                $attachments = $imagePath && is_file($imagePath) ? [$promotion->image_path] : [];
                $notificationService->sendEmail(
                    $client,
                    "🎉 {$promotion->title} — RA Automotriz",
                    $message,
                    null,
                    $attachments,
                );
                $sentEmail = true;
            }

            // Registrar envío individual (upsert para evitar duplicados)
            PromotionSend::updateOrCreate(
                ['promotion_id' => $promotion->id, 'user_id' => $client->id],
                ['sent_whatsapp' => $sentWhatsapp, 'sent_email' => $sentEmail, 'sent_at' => $now],
            );

            $sent++;
        }

        $promotion->update([
            'notifications_sent'    => true,
            'notifications_sent_at' => $now,
        ]);

        return redirect()->back()->with('flash', [
            'type'    => 'success',
            'message' => "Notificación enviada a {$sent} cliente(s) activo(s) correctamente.",
        ]);
    }

    public function sendStream(Request $request, Promotion $promotion): StreamedResponse
    {
        $this->authorize('promotions.send_notification');

        $clients = User::role('cliente')
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNotNull('phone')->orWhereNotNull('email');
            })
            ->get();

        return response()->stream(function () use ($promotion, $clients) {
            $notificationService = app(NotificationService::class);
            $total               = $clients->count();
            $now                 = now();

            $imagePath = $promotion->image_path
                ? Storage::disk('public')->path($promotion->image_path)
                : null;

            $this->sseEvent(['type' => 'start', 'total' => $total]);

            foreach ($clients as $index => $client) {
                $name = trim(($client->first_name ?? '') . ' ' . ($client->last_name ?? ''));

                $this->sseEvent([
                    'type'    => 'sending',
                    'index'   => $index,
                    'current' => $index + 1,
                    'total'   => $total,
                    'name'    => $name,
                    'email'   => $client->email,
                    'phone'   => $client->phone,
                ]);

                $message = "🎉 *¡Hola {$name}!*\n\n"
                    . "🚗 *RA Automotriz* tiene una promoción especial para ti:\n\n"
                    . "📢 *{$promotion->title}*\n"
                    . ($promotion->description ? "\n{$promotion->description}\n" : '')
                    . "\n✅ Visítanos o llámanos para más información.\n"
                    . "📍 *RA Automotriz - Taller de confianza*\n"
                    . "🗺️ _Av. el Ayllu 267 - La Victoria - Chiclayo_";

                $sentWhatsapp = false;
                $sentEmail    = false;

                try {
                    if ($client->phone) {
                        if ($imagePath && is_file($imagePath)) {
                            $notificationService->sendWhatsAppImage($client, $imagePath, $message);
                        } else {
                            $notificationService->sendWhatsApp($client, $message);
                        }
                        $sentWhatsapp = true;
                    }

                    if ($client->email) {
                        $attachments = $imagePath && is_file($imagePath) ? [$promotion->image_path] : [];
                        $notificationService->sendEmail(
                            $client,
                            "🎉 {$promotion->title} — RA Automotriz",
                            $message,
                            null,
                            $attachments,
                        );
                        $sentEmail = true;
                    }

                    PromotionSend::updateOrCreate(
                        ['promotion_id' => $promotion->id, 'user_id' => $client->id],
                        ['sent_whatsapp' => $sentWhatsapp, 'sent_email' => $sentEmail, 'sent_at' => $now],
                    );

                    $this->sseEvent([
                        'type'          => 'sent',
                        'index'         => $index,
                        'name'          => $name,
                        'sent_whatsapp' => $sentWhatsapp,
                        'sent_email'    => $sentEmail,
                    ]);
                } catch (\Throwable $e) {
                    $this->sseEvent([
                        'type'  => 'error',
                        'index' => $index,
                        'name'  => $name,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            $promotion->update([
                'notifications_sent'    => true,
                'notifications_sent_at' => $now,
            ]);

            $this->sseEvent(['type' => 'done', 'total' => $total]);
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    private function sseEvent(array $data): void
    {
        echo 'data: ' . json_encode($data) . "\n\n";
        if (ob_get_level() > 0) ob_flush();
        flush();
    }

    public function sends(Promotion $promotion): JsonResponse
    {
        $this->authorize('promotions.view');

        $sends = $promotion->sends()
            ->with('user:id,first_name,last_name,email,phone')
            ->orderByDesc('sent_at')
            ->get()
            ->map(fn ($s) => [
                'id'            => $s->id,
                'sent_at'       => $s->sent_at,
                'sent_whatsapp' => $s->sent_whatsapp,
                'sent_email'    => $s->sent_email,
                'user'          => $s->user ? [
                    'id'         => $s->user->id,
                    'name'       => trim(($s->user->first_name ?? '') . ' ' . ($s->user->last_name ?? '')),
                    'email'      => $s->user->email,
                    'phone'      => $s->user->phone,
                ] : null,
            ]);

        return response()->json($sends);
    }
}
