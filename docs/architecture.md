# Arquitectura del Sistema — RA Automotriz

## Visión General

RA Automotriz es una aplicación monolítica full-stack construida sobre el patrón **Laravel + Inertia.js + React**. No existe una API REST separada: el servidor devuelve directamente componentes React hidratados con datos via Inertia, eliminando la necesidad de endpoints JSON explícitos para la UI.

```
Navegador (React + TypeScript)
        ↕ Inertia.js (XHR parcial / navegación completa)
Servidor Laravel (Controladores → Repositorios → Modelos → MySQL)
```

---

## Capas de la Aplicación

### 1. Presentación — React / Inertia.js

Los componentes viven en `resources/js/` y se organizan así:

```
resources/js/
├── pages/          # Una página por ruta (componente raíz de Inertia)
├── components/     # Componentes reutilizables (modales, dialogs, tablas)
├── layouts/        # AuthLayout, AppLayout (sidebar + header)
├── hooks/          # Custom hooks (useDebounce, useForm wrappers, etc.)
├── types/          # Interfaces TypeScript de los modelos Laravel
├── actions/        # Generado por Wayfinder: funciones tipadas para llamar acciones
└── routes/         # Generado por Wayfinder: helpers tipados para rutas con nombre
```

**Wayfinder** genera automáticamente tipos TypeScript a partir de las rutas y controladores de Laravel. Esto permite usar `route('dashboard.users.index')` desde TypeScript con autocompletado y detección de errores.

#### Gestión de Estado

No se usa Redux ni Zustand. El estado de la UI vive en componentes locales con `useState`/`useReducer`. Los datos del servidor se reciben via props de Inertia (inmutables por request) y las mutaciones se realizan con `useForm` de `@inertiajs/react`, que maneja automáticamente CSRF, loading states y errores de validación.

---

### 2. HTTP — Controladores y Form Requests

```
app/Http/
├── Controllers/
│   ├── Dashboard/
│   │   ├── Clients/       ClientController
│   │   ├── Inventory/     InventoryTypeController, InventoryBrandController, ProductController
│   │   ├── Roles/         RoleController
│   │   ├── Services/      ServiceChecklistController, ServiceTypeController,
│   │   │                  ServicePackageController, ServicePackageItemController,
│   │   │                  WorkOrderController, WorkOrderDiagnosisController,
│   │   │                  WorkOrderPhotoController, WorkOrderServiceController,
│   │   │                  WorkOrderPaymentController
│   │   ├── Users/         UserController
│   │   ├── Vehicles/      BrandController, VehicleModelController, VehicleController
│   │   └── DashboardController
│   └── Settings/          ProfileController, PasswordController,
│                          TwoFactorAuthenticationController
└── Requests/              Un FormRequest por acción de escritura
```

Los controladores son delgados: reciben la request validada, delegan al repositorio o al modelo y devuelven una respuesta Inertia o un redirect.

---

### 3. Validación — Form Requests

Cada operación de escritura tiene su propio `FormRequest`. Esto garantiza que la lógica de validación no esté dispersa en los controladores.

| Request | Responsabilidad |
|---|---|
| `UserRequest` | Validación de usuarios internos (username, roles, contraseña) |
| `ClientRequest` | Validación de clientes (DNI/CE/RUC, teléfono 9 dígitos) |
| `VehicleRequest` | Placa, año, color, relación marca-modelo |
| `ProductRequest` | Código, precio, stock mínimo, relación tipo-marca |
| `WorkOrderRequest` | Vehículo, cliente, estado, adelanto inicial |
| `WorkOrderServiceRequest` | Tipo de servicio, mano de obra, piezas asociadas |
| `WorkOrderPaymentRequest` | Monto, método de pago, fecha |
| `ServiceChecklistRequest` | Nombre, estado, número de orden (cuando activo) |
| `ServicePackageRequest` | Nombre, precio, servicios incluidos |

Los traits `ProfileValidationRules` y `PasswordValidationRules` en `app/Concerns/` centralizan reglas compartidas entre distintos requests.

---

### 4. Lógica de Negocio — Repositorios y Servicios

#### Repositorios (`app/Repositories/`)

Abstraen las consultas Eloquent complejas. Los controladores interactúan con repositorios en lugar de con los modelos directamente cuando la lógica de consulta es no trivial.

- **`WorkOrderRepository`** — Búsquedas con filtros múltiples (estado, fechas, cliente, vehículo), eager loading optimizado, paginación.
- **`ProductRepository`** — Búsqueda por nombre/código/marca con filtros de stock.

#### Servicios (`app/Services/`)

- **`NotificationService`** — Centraliza el envío de notificaciones. Decide si enviar por email, WhatsApp (Ultramsg) o ambos según configuración. Registra cada envío en `notification_logs`.

---

### 5. Modelos Eloquent

Los 20 modelos reflejan el dominio del taller:

```
Usuario/Acceso
  User ──────────────── tiene roles (Spatie)

Vehículos
  Brand ──┬── VehicleModel ──── Vehicle ──── User (cliente)

Inventario
  InventoryType ──── InventoryBrand ──── Product

Servicios
  ServiceChecklist          (ítems de inspección)
  ServiceType               (catálogo de servicios)
  ServicePackage ──────── ServicePackageItem

Órdenes de Trabajo
  WorkOrder ─────┬── WorkOrderPhoto
                 ├── WorkOrderDiagnosis
                 ├── WorkOrderChecklistResult
                 ├── WorkOrderService ──── Product (repuestos)
                 ├── WorkOrderPayment
                 └── WorkOrderTicket

Notificaciones
  NotificationLog
```

#### Recálculo automático de totales

`WorkOrder` tiene un método `recalcTotal()` que suma los servicios registrados y actualiza los campos `total`, `paid` y `balance` en la base de datos. Este método es invocado por los controladores de servicios y pagos tras cada modificación.

La base de datos también tiene **triggers y eventos MySQL** (ver migraciones `_000019` a `_000021`) que mantienen el stock de productos y los balances de clientes consistentes a nivel de base de datos, independientemente de la capa de aplicación.

---

### 6. Autenticación — Laravel Fortify

Fortify gestiona el ciclo de autenticación completo:

- **Login**: campo `username` (no email). El `FortifyServiceProvider` registra un `authenticateUsing` personalizado que busca al usuario por `username` o `document_number`, permitiendo que los clientes inicien sesión con su número de DNI/documento.
- **Registro público**: crea usuarios con rol `cliente`. Requiere nombre, apellido, tipo de documento, número de documento, email, teléfono y contraseña.
- **2FA**: TOTP (Google Authenticator compatible) con códigos de recuperación. Activación protegida por confirmación de contraseña.
- **Rate limiting**: 5 intentos de login por minuto por username + IP.

```php
// FortifyServiceProvider — lógica de login personalizada
Fortify::authenticateUsing(function (Request $request) {
    $login = $request->input(Fortify::username()); // 'username'
    $user = User::where('username', $login)
                ->orWhere('document_number', $login)
                ->first();
    if ($user && Hash::check($request->password, $user->password)) {
        return $user;
    }
    return null;
});
```

---

### 7. Autorización — Spatie Laravel Permission

Cada ruta del dashboard tiene un middleware `permission:nombre.accion`. El `AppServiceProvider` registra un `Gate::before` que otorga acceso total al rol `superadmin` sin necesidad de verificar permisos individuales:

```php
// AppServiceProvider::configureSuperadminGate()
Gate::before(function (User $user, string $ability) {
    return $user->hasRole('superadmin') ? true : null;
});
```

#### Permisos disponibles

| Módulo | Permisos |
|---|---|
| Dashboard | `dashboard.view` |
| Roles | `roles.view/create/update/delete` |
| Usuarios | `users.view/create/update/delete` |
| Clientes | `clients.view/create/update/delete/add_vehicle/export` |
| Marcas | `brands.view/create/update/delete` |
| Modelos de vehículo | `vehicle_models.view/create/update/delete` |
| Vehículos | `vehicles.view/create/update/delete/export/view_audit` |
| Tipos de inventario | `inventory_types.view/create/update/delete` |
| Marcas de inventario | `inventory_brands.view/create/update/delete` |
| Productos | `products.view/create/update/delete/export/view_audit` |
| Checklists | `service_checklists.view/create/update/delete/reorder` |
| Tipos de servicio | `service_types.view/create/update/delete` |
| Paquetes de servicio | `service_packages.view/create/update/delete` |
| Ítems de paquete | `service_package_items.view/create/update/delete` |
| Órdenes de trabajo | `work_orders.view/create/update/delete` |
| Fotos de OT | `work_order_photos.view/create/delete` |
| Checklist de OT | `work_order_checklist_results.view/update` |
| Diagnósticos | `work_order_diagnoses.view/create/update/delete` |
| Servicios de OT | `work_order_services.view/create/update/delete` |
| Pagos de OT | `work_order_payments.view/create/delete/print_ticket` |
| Tickets | `work_order_tickets.print` |
| Permisos | `permissions.view` |

---

### 8. Jobs y Colas

Las notificaciones se procesan de forma asíncrona para no bloquear la respuesta HTTP:

- **`SendWelcomeNotificationJob`** — Se dispara al registrar un nuevo usuario/cliente. Envía email de bienvenida y/o WhatsApp.
- **`SendChecklistNotificationJob`** — Se dispara al completar el checklist de una orden de trabajo. Notifica al cliente sobre el estado de su vehículo.

Ambos jobs usan `NotificationService` internamente y registran el resultado en `notification_logs`.

#### Configuración de colas

```env
QUEUE_CONNECTION=database   # Driver por defecto (tabla: jobs)
```

El worker se inicia con:
```bash
php artisan queue:listen --tries=1
# o en producción:
php artisan queue:work --daemon --tries=3 --sleep=3
```

---

### 9. Caché

Se usa `Cache` de Laravel para ahorrar consultas repetidas en:

- **Checklists de servicio** — La lista ordenada de ítems activos se cachea y se invalida automáticamente al crear, actualizar, eliminar o reordenar un checklist.
- **Paquetes de servicio** — La lista completa se cachea y se invalida al modificar cualquier paquete.
- **Tipos y marcas de inventario** — Listas de referencia que cambian infrecuentemente.

```env
CACHE_STORE=database    # Driver por defecto
```

Para mayor rendimiento en producción, cambiar a `redis`:
```env
CACHE_STORE=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

---

### 10. Exports

Los exports de datos usan **Maatwebsite/Excel** para archivos `.xlsx` y **DomPDF** para tickets en PDF:

| Export | Ruta | Formato |
|---|---|---|
| Clientes | `GET /dashboard/users/clients/export` | Excel |
| Vehículos | `GET /dashboard/vehicles/vehicles/export` | Excel |
| Productos | `GET /dashboard/inventory/products/export` | Excel |
| Ticket de pago | `GET /dashboard/services/work-orders/{id}/payments/{id}/print` | PDF |
| Ticket de OT | `GET /dashboard/services/work-orders/{id}/tickets/{id}/print` | PDF |

---

### 11. Base de Datos Avanzada

Las migraciones `_000019` a `_000022` crean objetos de base de datos MySQL que garantizan consistencia sin depender de la capa de aplicación:

- **Triggers** en `work_order_services`: deducen stock de productos al agregar/eliminar servicios de una OT.
- **Trigger** `stock_deducted_at`: registra cuándo se descontó el stock.
- **Evento MySQL** `recalc_client_balances`: recalcula periódicamente los balances de clientes basándose en pagos recibidos vs. total de órdenes.

> Estos objetos solo funcionan en MySQL. Las pruebas usan SQLite (sin triggers/eventos) y validan la lógica a través de la capa de aplicación.
