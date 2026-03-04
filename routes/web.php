<?php

use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\SoraChatController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/manifest.webmanifest', function () {
    $path = public_path('manifest.webmanifest');
    abort_unless(file_exists($path), 404);

    return response()->file($path, ['Content-Type' => 'application/manifest+json']);
})->name('manifest');

Route::get('/', function () {
    $activePromotion = \App\Models\Promotion::currentlyActive()
        ->select('id', 'title', 'description', 'image_path')
        ->latest()
        ->first();

    return Inertia::render('welcome', [
        'canRegister'     => Features::enabled(Features::registration()),
        'activePromotion' => $activePromotion,
    ]);
})->name('home');

Route::get('sobre-nosotros', function () {
    return Inertia::render('sobre-nosotros');
})->name('sobre-nosotros');

Route::get('servicios', function () {
    return Inertia::render('servicios');
})->name('servicios');

Route::get('contacto', function () {
    return Inertia::render('contacto');
})->name('contacto');

/* ── SORA Chat AI ─────────────────────────────────────────────────────────── */
Route::get('api/sora/session', [SoraChatController::class, 'session'])
    ->middleware('throttle:60,1')
    ->name('sora.session');
Route::post('api/sora/chat', [SoraChatController::class, 'chat'])
    ->middleware('throttle:30,1')
    ->name('sora.chat');

Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])
        ->middleware('permission:dashboard.view')
        ->name('index');

    // Mis órdenes (cliente: órdenes propias)
    Route::get('my-orders', [\App\Http\Controllers\Dashboard\MyOrdersController::class, 'index'])
        ->middleware('permission:my_orders.view')
        ->name('my-orders.index');
    Route::get('my-orders/history', [\App\Http\Controllers\Dashboard\MyOrdersController::class, 'history'])
        ->middleware('permission:my_orders_history.view')
        ->name('my-orders.history');
    Route::get('my-orders/{work_order}', [\App\Http\Controllers\Dashboard\MyOrdersController::class, 'show'])
        ->middleware('permission:my_orders.view')
        ->name('my-orders.show');
    Route::get('my-vehicles', [\App\Http\Controllers\Dashboard\MyVehiclesController::class, 'index'])
        ->middleware('permission:my_vehicles.view')
        ->name('my-vehicles.index');

    // Usuarios (listado): redirige al índice de users
    Route::get('usuarios', fn () => redirect()->route('dashboard.users.index'))->name('usuarios');

    // Users + Roles bajo prefijo /dashboard/users (permisos: users.* y roles.*)
    Route::prefix('users')->group(function () {
        // Users (permisos: users.view, users.create, users.update, users.delete)
        Route::get('/', [\App\Http\Controllers\Dashboard\Users\UserController::class, 'index'])->middleware('permission:users.view')->name('users.index');
        Route::post('/', [\App\Http\Controllers\Dashboard\Users\UserController::class, 'store'])->middleware('permission:users.create')->name('users.store');
        Route::put('{user}', [\App\Http\Controllers\Dashboard\Users\UserController::class, 'update'])->middleware('permission:users.update')->name('users.update');
        Route::delete('{user}', [\App\Http\Controllers\Dashboard\Users\UserController::class, 'destroy'])->middleware('permission:users.delete')->name('users.destroy');

        // Clients (permisos: clients.view, clients.create, clients.update, clients.delete)
        Route::get('clients', [\App\Http\Controllers\Dashboard\Clients\ClientController::class, 'index'])->middleware('permission:clients.view')->name('clients.index');
        Route::get('clients/export', [\App\Http\Controllers\Dashboard\Clients\ClientController::class, 'export'])->middleware('permission:clients.export')->name('clients.export');
        Route::post('clients', [\App\Http\Controllers\Dashboard\Clients\ClientController::class, 'store'])->middleware('permission:clients.create')->name('clients.store');
        Route::put('clients/{user}', [\App\Http\Controllers\Dashboard\Clients\ClientController::class, 'update'])->middleware('permission:clients.update')->name('clients.update');
        Route::delete('clients/{user}', [\App\Http\Controllers\Dashboard\Clients\ClientController::class, 'destroy'])->middleware('permission:clients.delete')->name('clients.destroy');

        // Roles (permisos: roles.view, roles.create, roles.update, roles.delete)
        Route::get('roles', [\App\Http\Controllers\Dashboard\Roles\RoleController::class, 'index'])->middleware('permission:roles.view')->name('roles.index');
        Route::post('roles', [\App\Http\Controllers\Dashboard\Roles\RoleController::class, 'store'])->middleware('permission:roles.create')->name('roles.store');
        Route::get('roles/{role}/permissions', [\App\Http\Controllers\Dashboard\Roles\RoleController::class, 'permissions'])->name('roles.permissions');
        Route::put('roles/{role}/permissions', [\App\Http\Controllers\Dashboard\Roles\RoleController::class, 'updatePermissions'])->middleware('permission:roles.update')->name('roles.permissions.update');
        Route::put('roles/{role}', [\App\Http\Controllers\Dashboard\Roles\RoleController::class, 'update'])->middleware('permission:roles.update')->name('roles.update');
        Route::delete('roles/{role}', [\App\Http\Controllers\Dashboard\Roles\RoleController::class, 'destroy'])->middleware('permission:roles.delete')->name('roles.destroy');
    });

    // Vehículos (menú: Vehículos > Marca)
    Route::prefix('vehicles')->name('vehicles.')->group(function () {
        Route::get('brands', [\App\Http\Controllers\Dashboard\Vehicles\BrandController::class, 'index'])
            ->middleware('permission:brands.view')
            ->name('brands.index');
        Route::post('brands', [\App\Http\Controllers\Dashboard\Vehicles\BrandController::class, 'store'])
            ->middleware('permission:brands.create')
            ->name('brands.store');
        Route::put('brands/{brand}', [\App\Http\Controllers\Dashboard\Vehicles\BrandController::class, 'update'])
            ->middleware('permission:brands.update')
            ->name('brands.update');
        Route::delete('brands/{brand}', [\App\Http\Controllers\Dashboard\Vehicles\BrandController::class, 'destroy'])
            ->middleware('permission:brands.delete')
            ->name('brands.destroy');

        Route::post('brands/{brand}/models', [\App\Http\Controllers\Dashboard\Vehicles\VehicleModelController::class, 'store'])
            ->middleware('permission:vehicle_models.create')
            ->name('brands.models.store');
        Route::put('models/{vehicle_model}', [\App\Http\Controllers\Dashboard\Vehicles\VehicleModelController::class, 'update'])
            ->middleware('permission:vehicle_models.update')
            ->name('models.update');
        Route::delete('models/{vehicle_model}', [\App\Http\Controllers\Dashboard\Vehicles\VehicleModelController::class, 'destroy'])
            ->middleware('permission:vehicle_models.delete')
            ->name('models.destroy');

        Route::get('vehicles', [\App\Http\Controllers\Dashboard\Vehicles\VehicleController::class, 'index'])
            ->middleware('permission:vehicles.view')
            ->name('vehicles.index');
        Route::get('vehicles/export', [\App\Http\Controllers\Dashboard\Vehicles\VehicleController::class, 'export'])
            ->middleware('permission:vehicles.export')
            ->name('vehicles.export');
        Route::post('vehicles', [\App\Http\Controllers\Dashboard\Vehicles\VehicleController::class, 'store'])
            ->middleware('permission:vehicles.create')
            ->name('vehicles.store');
        Route::put('vehicles/{vehicle}', [\App\Http\Controllers\Dashboard\Vehicles\VehicleController::class, 'update'])
            ->middleware('permission:vehicles.update')
            ->name('vehicles.update');
        Route::delete('vehicles/{vehicle}', [\App\Http\Controllers\Dashboard\Vehicles\VehicleController::class, 'destroy'])
            ->middleware('permission:vehicles.delete')
            ->name('vehicles.destroy');
    });

    // Inventario (Tipo > Marca, Producto)
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('types', [\App\Http\Controllers\Dashboard\Inventory\InventoryTypeController::class, 'index'])
            ->middleware('permission:inventory_types.view')
            ->name('types.index');
        Route::post('types', [\App\Http\Controllers\Dashboard\Inventory\InventoryTypeController::class, 'store'])
            ->middleware('permission:inventory_types.create')
            ->name('types.store');
        Route::put('types/{type}', [\App\Http\Controllers\Dashboard\Inventory\InventoryTypeController::class, 'update'])
            ->middleware('permission:inventory_types.update')
            ->name('types.update');
        Route::delete('types/{type}', [\App\Http\Controllers\Dashboard\Inventory\InventoryTypeController::class, 'destroy'])
            ->middleware('permission:inventory_types.delete')
            ->name('types.destroy');

        Route::post('types/{type}/brands', [\App\Http\Controllers\Dashboard\Inventory\InventoryBrandController::class, 'store'])
            ->middleware('permission:inventory_brands.create')
            ->name('types.brands.store');
        Route::put('brands/{inventory_brand}', [\App\Http\Controllers\Dashboard\Inventory\InventoryBrandController::class, 'update'])
            ->middleware('permission:inventory_brands.update')
            ->name('brands.update');
        Route::delete('brands/{inventory_brand}', [\App\Http\Controllers\Dashboard\Inventory\InventoryBrandController::class, 'destroy'])
            ->middleware('permission:inventory_brands.delete')
            ->name('brands.destroy');

        Route::get('products', [\App\Http\Controllers\Dashboard\Inventory\ProductController::class, 'index'])
            ->middleware('permission:products.view')
            ->name('products.index');
        Route::get('products/export', [\App\Http\Controllers\Dashboard\Inventory\ProductController::class, 'export'])
            ->middleware('permission:products.export')
            ->name('products.export');
        Route::post('brands/{inventory_brand}/products', [\App\Http\Controllers\Dashboard\Inventory\ProductController::class, 'store'])
            ->middleware('permission:products.create')
            ->name('brands.products.store');
        Route::put('products/{product}', [\App\Http\Controllers\Dashboard\Inventory\ProductController::class, 'update'])
            ->middleware('permission:products.update')
            ->name('products.update');
        Route::delete('products/{product}', [\App\Http\Controllers\Dashboard\Inventory\ProductController::class, 'destroy'])
            ->middleware('permission:products.delete')
            ->name('products.destroy');
    });

    // Servicio (Lista de chequeo, Tipo de servicio)
    Route::prefix('services')->name('services.')->group(function () {
        Route::get('checklists', [\App\Http\Controllers\Dashboard\Services\ServiceChecklistController::class, 'index'])
            ->middleware('permission:service_checklists.view')
            ->name('checklists.index');
        Route::post('checklists', [\App\Http\Controllers\Dashboard\Services\ServiceChecklistController::class, 'store'])
            ->middleware('permission:service_checklists.create')
            ->name('checklists.store');
        Route::put('checklists/{checklist}', [\App\Http\Controllers\Dashboard\Services\ServiceChecklistController::class, 'update'])
            ->middleware('permission:service_checklists.update')
            ->name('checklists.update');
        Route::put('checklists/{checklist}/move-up', [\App\Http\Controllers\Dashboard\Services\ServiceChecklistController::class, 'moveUp'])
            ->middleware('permission:service_checklists.reorder')
            ->name('checklists.move-up');
        Route::put('checklists/{checklist}/move-down', [\App\Http\Controllers\Dashboard\Services\ServiceChecklistController::class, 'moveDown'])
            ->middleware('permission:service_checklists.reorder')
            ->name('checklists.move-down');
        Route::delete('checklists/{checklist}', [\App\Http\Controllers\Dashboard\Services\ServiceChecklistController::class, 'destroy'])
            ->middleware('permission:service_checklists.delete')
            ->name('checklists.destroy');
        Route::get('types', [\App\Http\Controllers\Dashboard\Services\ServiceTypeController::class, 'index'])
            ->middleware('permission:service_types.view')
            ->name('types.index');
        Route::post('types', [\App\Http\Controllers\Dashboard\Services\ServiceTypeController::class, 'store'])
            ->middleware('permission:service_types.create')
            ->name('types.store');
        Route::put('types/{type}', [\App\Http\Controllers\Dashboard\Services\ServiceTypeController::class, 'update'])
            ->middleware('permission:service_types.update')
            ->name('types.update');
        Route::delete('types/{type}', [\App\Http\Controllers\Dashboard\Services\ServiceTypeController::class, 'destroy'])
            ->middleware('permission:service_types.delete')
            ->name('types.destroy');
        Route::get('packages', [\App\Http\Controllers\Dashboard\Services\ServicePackageController::class, 'index'])
            ->middleware('permission:service_packages.view')
            ->name('packages.index');
        Route::post('packages', [\App\Http\Controllers\Dashboard\Services\ServicePackageController::class, 'store'])
            ->middleware('permission:service_packages.create')
            ->name('packages.store');
        Route::put('packages/{package}', [\App\Http\Controllers\Dashboard\Services\ServicePackageController::class, 'update'])
            ->middleware('permission:service_packages.update')
            ->name('packages.update');
        Route::delete('packages/{package}', [\App\Http\Controllers\Dashboard\Services\ServicePackageController::class, 'destroy'])
            ->middleware('permission:service_packages.delete')
            ->name('packages.destroy');
        Route::get('packages/{service_package}/items', [\App\Http\Controllers\Dashboard\Services\ServicePackageItemController::class, 'index'])
            ->middleware('permission:service_package_items.view')
            ->name('packages.items.index');
        Route::post('packages/{service_package}/items', [\App\Http\Controllers\Dashboard\Services\ServicePackageItemController::class, 'store'])
            ->middleware('permission:service_package_items.create')
            ->name('packages.items.store');
        Route::put('packages/{service_package}/items/{item}', [\App\Http\Controllers\Dashboard\Services\ServicePackageItemController::class, 'update'])
            ->middleware('permission:service_package_items.update')
            ->name('packages.items.update');
        Route::delete('packages/{service_package}/items/{item}', [\App\Http\Controllers\Dashboard\Services\ServicePackageItemController::class, 'destroy'])
            ->middleware('permission:service_package_items.delete')
            ->name('packages.items.destroy');
        Route::get('maintenance-schedules', [\App\Http\Controllers\Dashboard\Services\MaintenanceSchedulesController::class, 'index'])
            ->middleware('permission:maintenance_schedules.view')
            ->name('maintenance-schedules.index');
        Route::post('maintenance-schedules/{schedule}/resend-notification', [\App\Http\Controllers\Dashboard\Services\MaintenanceSchedulesController::class, 'resendNotification'])
            ->middleware('permission:maintenance_schedules.resend_notification')
            ->name('maintenance-schedules.resend-notification');
        Route::get('accounts-receivable', [\App\Http\Controllers\Dashboard\Services\AccountsReceivableController::class, 'index'])
            ->middleware('permission:accounts_receivable.view')
            ->name('accounts-receivable.index');
        Route::get('accounts-receivable/export', [\App\Http\Controllers\Dashboard\Services\AccountsReceivableController::class, 'export'])
            ->middleware('permission:accounts_receivable.export')
            ->name('accounts-receivable.export');
        Route::get('work-orders/search-clients', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'searchClients'])
            ->middleware('permission:work_orders.view')
            ->name('work-orders.search-clients');
        Route::get('work-orders/search-vehicles', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'searchVehicles'])
            ->middleware('permission:work_orders.view')
            ->name('work-orders.search-vehicles');
        Route::get('work-orders/export', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'export'])
            ->middleware('permission:work_orders.export')
            ->name('work-orders.export');
        Route::get('work-orders', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'index'])
            ->middleware('permission:work_orders.view')
            ->name('work-orders.index');
        Route::get('work-orders/{work_order}', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'show'])
            ->middleware('permission:work_orders.view')
            ->name('work-orders.show');
        Route::get('work-orders/{work_order}/config', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'config'])
            ->middleware('permission:work_orders.view')
            ->name('work-orders.config');
        Route::put('work-orders/{work_order}/checklist-results', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'updateChecklistResults'])
            ->middleware('permission:work_order_checklist_results.update')
            ->name('work-orders.checklist-results.update');
        Route::post('work-orders', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'store'])
            ->middleware('permission:work_orders.create')
            ->name('work-orders.store');
        Route::put('work-orders/{work_order}', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'update'])
            ->middleware('permission:work_orders.update')
            ->name('work-orders.update');
        Route::delete('work-orders/{work_order}', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'destroy'])
            ->middleware('permission:work_orders.delete')
            ->name('work-orders.destroy');
        Route::get('work-orders/{work_order}/photos', [\App\Http\Controllers\Dashboard\Services\WorkOrderPhotoController::class, 'index'])
            ->middleware('permission:work_order_photos.view')
            ->name('work-orders.photos.index');
        Route::post('work-orders/{work_order}/photos', [\App\Http\Controllers\Dashboard\Services\WorkOrderPhotoController::class, 'store'])
            ->middleware('permission:work_order_photos.create')
            ->name('work-orders.photos.store');
        Route::delete('work-orders/{work_order}/photos/{photo}', [\App\Http\Controllers\Dashboard\Services\WorkOrderPhotoController::class, 'destroy'])
            ->middleware('permission:work_order_photos.delete')
            ->name('work-orders.photos.destroy');
        Route::post('work-orders/{work_order}/diagnoses', [\App\Http\Controllers\Dashboard\Services\WorkOrderDiagnosisController::class, 'store'])
            ->middleware('permission:work_order_diagnoses.create')
            ->name('work-orders.diagnoses.store');
        Route::put('work-orders/{work_order}/diagnoses/{diagnosis}', [\App\Http\Controllers\Dashboard\Services\WorkOrderDiagnosisController::class, 'update'])
            ->middleware('permission:work_order_diagnoses.update')
            ->name('work-orders.diagnoses.update');
        Route::delete('work-orders/{work_order}/diagnoses/{diagnosis}', [\App\Http\Controllers\Dashboard\Services\WorkOrderDiagnosisController::class, 'destroy'])
            ->middleware('permission:work_order_diagnoses.delete')
            ->name('work-orders.diagnoses.destroy');
        Route::post('work-orders/{work_order}/services', [\App\Http\Controllers\Dashboard\Services\WorkOrderServiceController::class, 'store'])
            ->middleware('permission:work_order_services.create')
            ->name('work-orders.services.store');
        Route::put('work-orders/{work_order}/services/{service}', [\App\Http\Controllers\Dashboard\Services\WorkOrderServiceController::class, 'update'])
            ->middleware('permission:work_order_services.update')
            ->name('work-orders.services.update');
        Route::delete('work-orders/{work_order}/services/{service}', [\App\Http\Controllers\Dashboard\Services\WorkOrderServiceController::class, 'destroy'])
            ->middleware('permission:work_order_services.delete')
            ->name('work-orders.services.destroy');
        Route::post('work-orders/{work_order}/services/from-package', [\App\Http\Controllers\Dashboard\Services\WorkOrderServiceController::class, 'applyPackage'])
            ->middleware('permission:work_order_services.create')
            ->name('work-orders.services.apply-package');
        Route::post('work-orders/{work_order}/payments', [\App\Http\Controllers\Dashboard\Services\WorkOrderPaymentController::class, 'store'])
            ->middleware('permission:work_order_payments.create')
            ->name('work-orders.payments.store');
        Route::put('work-orders/{work_order}/payments/{payment}', [\App\Http\Controllers\Dashboard\Services\WorkOrderPaymentController::class, 'update'])
            ->middleware('permission:work_order_payments.update')
            ->name('work-orders.payments.update');
        Route::delete('work-orders/{work_order}/payments/{payment}', [\App\Http\Controllers\Dashboard\Services\WorkOrderPaymentController::class, 'destroy'])
            ->middleware('permission:work_order_payments.delete')
            ->name('work-orders.payments.destroy');
        Route::get('work-orders/{work_order}/payments/{payment}/print', [\App\Http\Controllers\Dashboard\Services\WorkOrderPaymentController::class, 'printTicket'])
            ->name('work-orders.payments.print');
        Route::get('work-orders/{work_order}/payments/{payment}/receipt-pdf', [\App\Http\Controllers\Dashboard\Services\WorkOrderPaymentController::class, 'downloadReceiptPdf'])
            ->name('work-orders.payments.receipt-pdf');
        Route::post('work-orders/{work_order}/payments/{payment}/resend-notification', [\App\Http\Controllers\Dashboard\Services\WorkOrderPaymentController::class, 'resendNotification'])
            ->middleware('permission:work_order_payments.resend_notification')
            ->name('work-orders.payments.resend-notification');
        Route::post('work-orders/{work_order}/confirm-repair', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'confirmRepair'])
            ->middleware('permission:work_orders.update')
            ->name('work-orders.confirm-repair');
        Route::post('work-orders/{work_order}/mark-ready', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'markReadyToDeliver'])
            ->middleware('permission:work_orders.update')
            ->name('work-orders.mark-ready');
        Route::post('work-orders/{work_order}/mark-delivered', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'markDelivered'])
            ->middleware('permission:work_orders.mark_delivered')
            ->name('work-orders.mark-delivered');
        Route::get('work-orders/{work_order}/summary/pdf', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'printSummaryPdf'])
            ->name('work-orders.summary.pdf');
        Route::get('work-orders/{work_order}/tickets/{ticket}/print', [\App\Http\Controllers\Dashboard\Services\WorkOrderController::class, 'printTicket'])
            ->middleware('permission:work_order_tickets.print')
            ->name('work-orders.tickets.print');
    });

    // Marketing
    Route::prefix('marketing')->name('marketing.')->group(function () {
        Route::get('promotions', [\App\Http\Controllers\Dashboard\Marketing\PromotionController::class, 'index'])
            ->middleware('permission:promotions.view')
            ->name('promotions.index');
        Route::post('promotions', [\App\Http\Controllers\Dashboard\Marketing\PromotionController::class, 'store'])
            ->middleware('permission:promotions.create')
            ->name('promotions.store');
        Route::post('promotions/{promotion}', [\App\Http\Controllers\Dashboard\Marketing\PromotionController::class, 'update'])
            ->middleware('permission:promotions.update')
            ->name('promotions.update');
        Route::delete('promotions/{promotion}', [\App\Http\Controllers\Dashboard\Marketing\PromotionController::class, 'destroy'])
            ->middleware('permission:promotions.delete')
            ->name('promotions.destroy');
        Route::post('promotions/{promotion}/toggle-active', [\App\Http\Controllers\Dashboard\Marketing\PromotionController::class, 'toggleActive'])
            ->middleware('permission:promotions.update')
            ->name('promotions.toggle-active');
        Route::post('promotions/{promotion}/send-notification', [\App\Http\Controllers\Dashboard\Marketing\PromotionController::class, 'sendNotification'])
            ->middleware('permission:promotions.send_notification')
            ->name('promotions.send-notification');
        Route::get('promotions/{promotion}/sends', [\App\Http\Controllers\Dashboard\Marketing\PromotionController::class, 'sends'])
            ->middleware('permission:promotions.view')
            ->name('promotions.sends');
        Route::get('promotions/{promotion}/send-stream', [\App\Http\Controllers\Dashboard\Marketing\PromotionController::class, 'sendStream'])
            ->middleware('permission:promotions.send_notification')
            ->name('promotions.send-stream');

        Route::get('sora-conversations', [\App\Http\Controllers\Dashboard\Marketing\SoraConversationsController::class, 'index'])
            ->middleware('permission:sora_conversations.view')
            ->name('sora-conversations.index');
        Route::get('sora-appointments', [\App\Http\Controllers\Dashboard\Marketing\SoraAppointmentsController::class, 'index'])
            ->middleware('permission:sora_appointments.view')
            ->name('sora-appointments.index');
    });
});

require __DIR__.'/settings.php';
