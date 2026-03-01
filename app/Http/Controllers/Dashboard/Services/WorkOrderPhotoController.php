<?php

namespace App\Http\Controllers\Dashboard\Services;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dashboard\Services\WorkOrderPhotoRequest;
use App\Models\WorkOrder;
use App\Models\WorkOrderPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class WorkOrderPhotoController extends Controller
{
    public function index(Request $request, WorkOrder $work_order): Response
    {
        $work_order->load(['vehicle:id,plate,vehicle_model_id', 'vehicle.vehicleModel:id,name', 'client:id,first_name,last_name']);
        $photos = $work_order->photos()->orderBy('type')->orderBy('created_at')->get();

        $workOrdersIndexPath = parse_url(route('dashboard.services.work-orders.index'), PHP_URL_PATH) ?: '/dashboard/services/work-orders';
        $photosIndexPath = parse_url(route('dashboard.services.work-orders.photos.index', ['work_order' => $work_order->id]), PHP_URL_PATH);

        $typeLabels = WorkOrderPhoto::$types;
        $stats = [
            'total' => $photos->count(),
            'by_type' => [
                'entry' => $photos->where('type', 'entry')->count(),
                'diagnosis' => $photos->where('type', 'diagnosis')->count(),
                'process' => $photos->where('type', 'process')->count(),
                'delivery' => $photos->where('type', 'delivery')->count(),
            ],
        ];

        return Inertia::render('services/work-orders/photos', [
            'workOrder' => $work_order,
            'photos' => $photos->map(fn (WorkOrderPhoto $p) => [
                'id' => $p->id,
                'type' => $p->type,
                'path' => $p->path,
                'url' => $p->url,
                'caption' => $p->caption,
                'created_at' => $p->created_at?->toIso8601String(),
            ]),
            'typeLabels' => $typeLabels,
            'workOrdersIndexPath' => $workOrdersIndexPath,
            'photosIndexPath' => $photosIndexPath,
            'stats' => $stats,
            'can' => [
                'create' => $request->user()?->can('work_order_photos.create'),
                'delete' => $request->user()?->can('work_order_photos.delete'),
            ],
        ]);
    }

    public function store(WorkOrderPhotoRequest $request, WorkOrder $work_order): RedirectResponse
    {
        $type = $request->validated('type');
        $caption = $request->validated('caption');

        $stored = [];
        foreach ($request->file('photos') as $file) {
            $path = $file->store('work_order_photos/'.$work_order->id, 'public');
            $work_order->photos()->create([
                'type' => $type,
                'path' => $path,
                'caption' => $caption,
            ]);
            $stored[] = $path;
        }

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => count($stored).' foto(s) subida(s) correctamente.']);
    }

    public function destroy(Request $request, WorkOrder $work_order, WorkOrderPhoto $photo): RedirectResponse
    {
        if ($photo->work_order_id !== (int) $work_order->id) {
            abort(404);
        }
        if ($photo->path && Storage::disk('public')->exists($photo->path)) {
            Storage::disk('public')->delete($photo->path);
        }
        $photo->delete();

        return redirect()->back()
            ->with('flash', ['type' => 'success', 'message' => 'Foto eliminada correctamente.']);
    }
}
