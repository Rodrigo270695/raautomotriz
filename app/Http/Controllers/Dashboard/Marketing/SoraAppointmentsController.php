<?php

namespace App\Http\Controllers\Dashboard\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Marketing\ListSoraAppointmentsRequest;
use App\Models\SoraAppointment;
use Inertia\Inertia;
use Inertia\Response;

class SoraAppointmentsController extends Controller
{
    public function index(ListSoraAppointmentsRequest $request): Response
    {
        $f = $request->filters();

        $appointments = SoraAppointment::with([
            'user:id,first_name,last_name,email',
            'conversation:id,user_id,guest_name,guest_phone,vehicle_brand,vehicle_model,vehicle_plate,status',
        ])
            ->whereBetween('scheduled_at', [
                $f['date_from'] . ' 00:00:00',
                $f['date_to']   . ' 23:59:59',
            ])
            ->when($f['search'], function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('guest_name', 'like', "%{$search}%")
                        ->orWhere('guest_phone', 'like', "%{$search}%")
                        ->orWhere('vehicle_plate', 'like', "%{$search}%")
                        ->orWhere('vehicle_brand', 'like', "%{$search}%")
                        ->orWhere('vehicle_model', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($u) =>
                            $u->where('first_name', 'like', "%{$search}%")
                              ->orWhere('last_name',  'like', "%{$search}%")
                              ->orWhere('email',      'like', "%{$search}%")
                        );
                });
            })
            ->when($f['status'], fn ($q, $status) => $q->where('status', $status))
            ->when($f['type'] === 'registered', fn ($q) => $q->whereNotNull('user_id'))
            ->when($f['type'] === 'guest',      fn ($q) => $q->whereNull('user_id'))
            ->orderBy('scheduled_at')
            ->paginate($f['per_page'])
            ->withQueryString();

        // Stats for the whole window
        $statsBase = SoraAppointment::whereBetween('scheduled_at', [
            $f['date_from'] . ' 00:00:00',
            $f['date_to']   . ' 23:59:59',
        ]);

        $stats = [
            'total'     => (clone $statsBase)->count(),
            'pending'   => (clone $statsBase)->where('status', 'pending')->count(),
            'confirmed' => (clone $statsBase)->where('status', 'confirmed')->count(),
            'cancelled' => (clone $statsBase)->where('status', 'cancelled')->count(),
        ];

        return Inertia::render('marketing/sora-appointments/index', [
            'appointments' => $appointments,
            'filters'      => $f,
            'stats'        => $stats,
        ]);
    }
}

