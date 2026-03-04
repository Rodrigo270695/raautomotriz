<?php

namespace App\Http\Controllers\Dashboard\Marketing;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Marketing\ListSoraConversationsRequest;
use App\Models\SoraConversation;
use Inertia\Inertia;
use Inertia\Response;

class SoraConversationsController extends Controller
{
    public function index(ListSoraConversationsRequest $request): Response
    {
        $f = $request->filters();

        $conversations = SoraConversation::with([
            'user:id,first_name,last_name,email',
            'messages' => fn ($q) => $q->orderBy('created_at'),
        ])
            ->whereBetween('created_at', [
                $f['date_from'] . ' 00:00:00',
                $f['date_to']   . ' 23:59:59',
            ])
            ->when($f['search'], function ($q, $search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('vehicle_plate', 'like', "%{$search}%")
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
            ->latest()
            ->paginate($f['per_page'])
            ->withQueryString();

        // Stats for the whole 7-day window (no pagination)
        $statsBase = SoraConversation::whereBetween('created_at', [
            $f['date_from'] . ' 00:00:00',
            $f['date_to']   . ' 23:59:59',
        ]);

        $stats = [
            'total'      => (clone $statsBase)->count(),
            'registered' => (clone $statsBase)->whereNotNull('user_id')->count(),
            'guests'     => (clone $statsBase)->whereNull('user_id')->count(),
            'with_plate' => (clone $statsBase)->whereNotNull('vehicle_plate')->count(),
        ];

        return Inertia::render('marketing/sora-conversations/index', [
            'conversations' => $conversations,
            'filters'       => $f,
            'stats'         => $stats,
        ]);
    }
}
