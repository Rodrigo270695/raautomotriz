<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesPermissionSeeder extends Seeder
{
    /** Permisos: dashboard (ver), roles, users, clients, brands (marca), vista de permisos. Todos asignados a superadmin. */
    private const PERMISSIONS = [
        'dashboard.view', // Ver / acceder al Panel de control
        'dashboard.view_financial', // Ver resumen financiero (ingresos, valor inventario) — no lo ve el técnico
        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',
        'users.view',
        'users.create',
        'users.update',
        'users.delete',
        'clients.view',
        'clients.create',
        'clients.update',
        'clients.delete',
        'clients.add_vehicle',
        'clients.export',
        'brands.view',
        'brands.create',
        'brands.update',
        'brands.delete',
        'vehicle_models.view',
        'vehicle_models.create',
        'vehicle_models.update',
        'vehicle_models.delete',
        'vehicles.view',
        'vehicles.create',
        'vehicles.update',
        'vehicles.delete',
        'vehicles.export',
        'vehicles.view_audit',
        'inventory_types.view',
        'inventory_types.create',
        'inventory_types.update',
        'inventory_types.delete',
        'inventory_brands.view',
        'inventory_brands.create',
        'inventory_brands.update',
        'inventory_brands.delete',
        'products.view',
        'products.create',
        'products.update',
        'products.delete',
        'products.export',
        'products.view_audit',
        'service_checklists.view',
        'service_checklists.create',
        'service_checklists.update',
        'service_checklists.delete',
        'service_checklists.reorder',
        'service_types.view',
        'service_types.create',
        'service_types.update',
        'service_types.delete',
        'service_packages.view',
        'service_packages.create',
        'service_packages.update',
        'service_packages.delete',
        'service_package_items.view',
        'service_package_items.create',
        'service_package_items.update',
        'service_package_items.delete',
        'work_order_services.view',
        'work_order_services.create',
        'work_order_services.update',
        'work_order_services.delete',
        'work_order_payments.view',
        'work_order_payments.create',
        'work_order_payments.delete',
        'work_order_payments.print_ticket',
        'work_order_payments.resend_notification',
        'work_order_tickets.print',
        'accounts_receivable.view',
        'accounts_receivable.export',
        'maintenance_schedules.view',
        'maintenance_schedules.resend_notification',
        'work_orders.view',
        'work_orders.create',
        'work_orders.update',
        'work_orders.delete',
        'work_orders.export',
        'work_orders.view_summary',
        'work_orders.print_summary',
        'work_orders.mark_delivered',
        'work_order_photos.view',
        'work_order_photos.create',
        'work_order_photos.delete',
        'work_order_checklist_results.view',
        'work_order_checklist_results.update',
        'work_order_diagnoses.view',
        'work_order_diagnoses.create',
        'work_order_diagnoses.update',
        'work_order_diagnoses.delete',
        'permissions.view',
        'promotions.view',
        'promotions.create',
        'promotions.update',
        'promotions.delete',
        'promotions.send_notification',
        'sora_conversations.view',
        'sora_appointments.view',
        'my_orders.view',
        'my_vehicles.view',
        'my_orders_history.view',
    ];

    /** Permisos que el rol admin puede ejercer (todo excepto gestión de roles y superadmin). */
    private const ADMIN_PERMISSIONS = [
        'dashboard.view',
        'dashboard.view_financial',
        'users.view', 'users.create', 'users.update', 'users.delete',
        'clients.view', 'clients.create', 'clients.update', 'clients.delete', 'clients.add_vehicle', 'clients.export',
        'brands.view', 'brands.create', 'brands.update', 'brands.delete',
        'vehicle_models.view', 'vehicle_models.create', 'vehicle_models.update', 'vehicle_models.delete',
        'vehicles.view', 'vehicles.create', 'vehicles.update', 'vehicles.delete', 'vehicles.export', 'vehicles.view_audit',
        'inventory_types.view', 'inventory_types.create', 'inventory_types.update', 'inventory_types.delete',
        'inventory_brands.view', 'inventory_brands.create', 'inventory_brands.update', 'inventory_brands.delete',
        'products.view', 'products.create', 'products.update', 'products.delete', 'products.export', 'products.view_audit',
        'service_checklists.view', 'service_checklists.create', 'service_checklists.update', 'service_checklists.delete', 'service_checklists.reorder',
        'service_types.view', 'service_types.create', 'service_types.update', 'service_types.delete',
        'service_packages.view', 'service_packages.create', 'service_packages.update', 'service_packages.delete',
        'service_package_items.view', 'service_package_items.create', 'service_package_items.update', 'service_package_items.delete',
        'accounts_receivable.view', 'accounts_receivable.export',
        'maintenance_schedules.view', 'maintenance_schedules.resend_notification',
        'work_orders.view', 'work_orders.create', 'work_orders.update', 'work_orders.delete', 'work_orders.export', 'work_orders.view_summary', 'work_orders.print_summary', 'work_orders.mark_delivered',
        'work_order_services.view', 'work_order_services.create', 'work_order_services.update', 'work_order_services.delete',
        'work_order_payments.view', 'work_order_payments.create', 'work_order_payments.delete', 'work_order_payments.print_ticket', 'work_order_payments.resend_notification',
        'work_order_tickets.print',
        'work_order_photos.view', 'work_order_photos.create', 'work_order_photos.delete',
        'work_order_checklist_results.view', 'work_order_checklist_results.update',
        'work_order_diagnoses.view', 'work_order_diagnoses.create', 'work_order_diagnoses.update', 'work_order_diagnoses.delete',
        'promotions.view', 'promotions.create', 'promotions.update', 'promotions.delete', 'promotions.send_notification',
        'sora_conversations.view', 'sora_appointments.view',
        'my_orders.view', 'my_vehicles.view', 'my_orders_history.view',
    ];

    /** Permisos del técnico: operaciones de taller. */
    private const TECNICO_PERMISSIONS = [
        'dashboard.view',
        'vehicles.view',
        'products.view',
        'work_orders.view', 'work_orders.create', 'work_orders.update',
        'work_order_services.view', 'work_order_services.create', 'work_order_services.update', 'work_order_services.delete',
        'work_order_photos.view', 'work_order_photos.create', 'work_order_photos.delete',
        'work_order_checklist_results.view', 'work_order_checklist_results.update',
        'work_order_diagnoses.view', 'work_order_diagnoses.create', 'work_order_diagnoses.update', 'work_order_diagnoses.delete',
        'work_order_tickets.print',
        'sora_conversations.view',
    ];

    /** Permisos del rol cliente: solo panel con sus datos y mis órdenes. */
    private const CLIENTE_PERMISSIONS = [
        'dashboard.view',
        'my_orders.view',
        'my_vehicles.view',
        'my_orders_history.view',
    ];

    /** Permisos del recepcionista: creación de órdenes y atención al cliente. */
    private const RECEPCIONISTA_PERMISSIONS = [
        'dashboard.view',
        'clients.view', 'clients.create', 'clients.update', 'clients.add_vehicle',
        'vehicles.view', 'vehicles.create', 'vehicles.update',
        'work_orders.view', 'work_orders.create', 'work_orders.update', 'work_orders.mark_delivered',
        'work_order_payments.view', 'work_order_payments.create', 'work_order_payments.print_ticket', 'work_order_payments.resend_notification',
        'work_order_tickets.print',
        'work_order_photos.view', 'work_order_photos.create',
        'work_order_checklist_results.view',
        'maintenance_schedules.view', 'maintenance_schedules.resend_notification',
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        $superadmin = Role::findByName('superadmin', 'web');
        if ($superadmin) {
            $superadmin->syncPermissions(self::PERMISSIONS);
        }

        $admin = Role::findByName('admin', 'web');
        if ($admin) {
            $admin->syncPermissions(self::ADMIN_PERMISSIONS);
        }

        $tecnico = Role::findByName('tecnico', 'web');
        if ($tecnico) {
            $tecnico->syncPermissions(self::TECNICO_PERMISSIONS);
        }

        $recepcionista = Role::findByName('recepcionista', 'web');
        if ($recepcionista) {
            $recepcionista->syncPermissions(self::RECEPCIONISTA_PERMISSIONS);
        }

        $cliente = Role::findByName('cliente', 'web');
        if ($cliente) {
            $cliente->syncPermissions(self::CLIENTE_PERMISSIONS);
        }
    }
}
