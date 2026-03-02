# Guía de Desarrollo y Tests — RA Automotriz

## Entorno de Desarrollo

### Requisitos previos

- PHP 8.2+ con extensiones: `pdo_mysql`, `pdo_sqlite`, `mbstring`, `openssl`, `zip`, `fileinfo`
- Composer 2
- Node.js 20+ y npm
- MySQL 8+ para desarrollo local

### Primer arranque

```bash
# Instalar dependencias y configurar
composer run setup

# Sembrar datos iniciales (roles, permisos, superadmin)
php artisan db:seed

# Iniciar todos los servicios en paralelo
composer run dev
```

El comando `dev` levanta:
- **Puerto 8000** — Servidor Laravel (`php artisan serve`)
- **Background** — Worker de colas (`php artisan queue:listen --tries=1`)
- **Puerto 5173** — Vite con HMR para React (`npm run dev`)

---

## Estructura de Tests

```
tests/
├── Pest.php                          # Configuración global de Pest
├── TestCase.php                      # Clase base (extiende de Laravel TestCase)
├── Helpers/
│   └── UserHelper.php                # Helpers para crear usuarios con roles
├── Feature/
│   ├── Auth/
│   │   ├── AuthenticationTest.php    # Login, logout, rate limiting
│   │   ├── EmailVerificationTest.php # Verificación de email
│   │   ├── PasswordConfirmationTest.php
│   │   ├── PasswordResetTest.php     # Recuperación de contraseña
│   │   ├── RegistrationTest.php      # Registro de clientes
│   │   ├── TwoFactorChallengeTest.php
│   │   └── VerificationNotificationTest.php
│   ├── Settings/
│   │   ├── PasswordUpdateTest.php
│   │   ├── ProfileUpdateTest.php
│   │   └── TwoFactorAuthenticationTest.php
│   ├── DashboardTest.php
│   ├── Dashboard/
│   │   └── DashboardStatsTest.php
│   ├── Clients/
│   │   └── ClientCrudTest.php
│   ├── Roles/
│   │   └── RoleCrudTest.php
│   ├── Users/
│   │   └── UserCrudTest.php
│   ├── Vehicles/
│   │   ├── BrandVehicleModelTest.php
│   │   └── VehicleCrudTest.php
│   ├── Inventory/
│   │   ├── InventoryTypeBrandTest.php
│   │   └── ProductCrudTest.php
│   ├── Services/
│   │   ├── ServiceChecklistTest.php
│   │   └── ServicePackageTest.php
│   └── WorkOrder/
│       ├── WorkOrderStoreTest.php
│       ├── WorkOrderIndexTest.php
│       ├── WorkOrderShowTest.php
│       ├── WorkOrderUpdateDestroyTest.php
│       ├── WorkOrderSearchTest.php
│       ├── WorkOrderChecklistTest.php
│       ├── WorkOrderDiagnosisTest.php
│       ├── WorkOrderServiceTest.php
│       └── WorkOrderPaymentTest.php
└── Unit/
    ├── Models/
    │   ├── WorkOrderModelTest.php
    │   └── NotificationLogModelTest.php
    └── Repositories/
        ├── WorkOrderRepositoryTest.php
        └── ProductRepositoryTest.php
```

---

## Ejecutar Tests

```bash
# Suite completa (con lint previo)
composer run test

# Solo tests, sin lint
php artisan test

# Test específico por nombre de clase
php artisan test --filter WorkOrderStoreTest

# Test específico por nombre de método
php artisan test --filter "test_crea_orden_con_adelanto"

# Grupo de tests (por carpeta)
php artisan test tests/Feature/WorkOrder

# Con cobertura (requiere Xdebug o PCOV)
php artisan test --coverage
```

---

## Configuración de la Base de Datos de Tests

Los tests usan **SQLite en memoria** para aislamiento y velocidad. Esta configuración está en `phpunit.xml`:

```xml
<env name="DB_CONNECTION" value="sqlite"/>
<env name="DB_DATABASE" value=":memory:"/>
```

Cada test que usa el trait `RefreshDatabase` recrea el esquema completo antes de ejecutarse.

> Los objetos de base de datos MySQL (triggers, eventos) no se replican en SQLite. Los tests validan la lógica de la capa de aplicación; la integridad de triggers se asume verificada manualmente en MySQL.

---

## Factories

Las factories permiten generar datos de prueba de forma fluida. Todas están en `database/factories/`.

### Uso básico

```php
// Crear un usuario
$user = User::factory()->create();

// Crear con atributos específicos
$admin = User::factory()->create(['email' => 'admin@test.com']);

// Crear sin persistir
$user = User::factory()->make();

// Crear varios
$products = Product::factory(5)->create();
```

### Factories disponibles

| Factory | Modelo | Estados especiales |
|---|---|---|
| `UserFactory` | `User` | `->unverified()` |
| `BrandFactory` | `Brand` | — |
| `VehicleModelFactory` | `VehicleModel` | Requiere `Brand` |
| `VehicleFactory` | `Vehicle` | Requiere `VehicleModel` + `User` (cliente) |
| `InventoryTypeFactory` | `InventoryType` | — |
| `InventoryBrandFactory` | `InventoryBrand` | Requiere `InventoryType` |
| `ProductFactory` | `Product` | Requiere `InventoryBrand` |
| `ServiceTypeFactory` | `ServiceType` | — |
| `ServiceChecklistFactory` | `ServiceChecklist` | `order_number` único |
| `ServicePackageFactory` | `ServicePackage` | — |
| `WorkOrderFactory` | `WorkOrder` | `->forClient(User $client)` |
| `WorkOrderDiagnosisFactory` | `WorkOrderDiagnosis` | Requiere `WorkOrder` |
| `WorkOrderPaymentFactory` | `WorkOrderPayment` | Requiere `WorkOrder` |
| `WorkOrderPhotoFactory` | `WorkOrderPhoto` | Requiere `WorkOrder` |
| `WorkOrderServiceFactory` | `WorkOrderService` | Requiere `WorkOrder` + `ServiceType` |

### Estado `forClient` de WorkOrderFactory

```php
// Crea una OT con vehículo y cliente relacionados correctamente
$workOrder = WorkOrder::factory()->forClient($clientUser)->create();
```

---

## Helpers de Tests

### `UserHelper`

Ubicado en `tests/Helpers/UserHelper.php`. Provee métodos estáticos para crear usuarios con roles predefinidos:

```php
use Tests\Helpers\UserHelper;

// Usuario superadmin (acceso total via Gate::before)
$superadmin = UserHelper::makeSuperadmin();

// Usuario con rol específico
$mechanic = UserHelper::makeUserWithRole('mecanico');
```

El rol `superadmin` tiene un bypass en `AppServiceProvider` via `Gate::before`, por lo que no necesita permisos asignados explícitamente en los tests.

---

## Cómo Escribir un Test de Feature

### Patrón general

```php
<?php

namespace Tests\Feature\MiModulo;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Helpers\UserHelper;

class MiModuloTest extends \Tests\TestCase
{
    use RefreshDatabase;

    public function test_usuario_puede_ver_listado(): void
    {
        $admin = UserHelper::makeSuperadmin();

        $response = $this->actingAs($admin)
            ->get(route('dashboard.mi_modulo.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('mi_modulo/index')
        );
    }

    public function test_usuario_sin_permiso_es_rechazado(): void
    {
        $user = User::factory()->create(); // sin roles

        $response = $this->actingAs($user)
            ->get(route('dashboard.mi_modulo.index'));

        $response->assertForbidden();
    }

    public function test_crear_registro(): void
    {
        $admin = UserHelper::makeSuperadmin();

        $response = $this->actingAs($admin)
            ->post(route('dashboard.mi_modulo.store'), [
                'nombre' => 'Nuevo Registro',
                // ...campos requeridos
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('mi_tabla', ['nombre' => 'Nuevo Registro']);
    }
}
```

### Tests con Inertia

```php
use Inertia\Testing\AssertableInertia as Assert;

$response->assertInertia(fn (Assert $page) =>
    $page->component('services/work-orders/index')
         ->has('workOrders')
         ->has('workOrders.data', 3)
         ->where('workOrders.data.0.status', 'pending')
);
```

---

## Cómo Agregar un Nuevo Módulo

### 1. Migración

```bash
php artisan make:migration create_mi_tabla_table
```

### 2. Modelo

```bash
php artisan make:model MiModelo
```

Añadir `HasFactory` y definir `$fillable`.

### 3. Factory

```bash
php artisan make:factory MiModeloFactory --model=MiModelo
```

### 4. Form Request

```bash
php artisan make:request Dashboard/MiModulo/MiModeloRequest
```

### 5. Controlador

```bash
php artisan make:controller Dashboard/MiModulo/MiModeloController
```

### 6. Ruta en `routes/web.php`

```php
Route::get('mi-modulo', [MiModeloController::class, 'index'])
    ->middleware('permission:mi_modulo.view')
    ->name('mi_modulo.index');
```

### 7. Permiso en `RolesPermissionSeeder`

Agregar el permiso al array `PERMISSIONS` y ejecutar:

```bash
php artisan db:seed --class=RolesPermissionSeeder
```

### 8. Tests

Crear `tests/Feature/MiModulo/MiModuloCrudTest.php` siguiendo el patrón de la sección anterior.

### 9. Regenerar Wayfinder

```bash
php artisan wayfinder:generate
```

Esto actualiza los tipos TypeScript en `resources/js/actions/` y `resources/js/routes/`.

---

## Calidad de Código

### PHP — Laravel Pint

```bash
# Formatear todos los archivos PHP
composer run lint

# Solo verificar sin modificar
composer run test:lint
```

La configuración de Pint está en `pint.json` (si existe) o usa el preset `laravel` por defecto.

### TypeScript / JavaScript — ESLint + Prettier

```bash
# ESLint con auto-fix
npm run lint

# Prettier en resources/
npm run format

# Solo verificar sin modificar
npm run format:check

# Verificar tipos TypeScript
npm run types
```

---

## Migraciones

### Crear nueva migración

```bash
php artisan make:migration add_campo_to_mi_tabla_table
```

### Ejecutar migraciones

```bash
php artisan migrate               # Solo las pendientes
php artisan migrate:fresh         # Eliminar todo y recrear (¡destructivo!)
php artisan migrate:fresh --seed  # Recrear + seeders (desarrollo)
```

### Rollback

```bash
php artisan migrate:rollback        # Revertir último batch
php artisan migrate:rollback --step=3  # Revertir últimos 3 batches
```

> En producción, nunca usar `migrate:fresh`. Solo `migrate`.

---

## Seeders

```bash
# Ejecutar todos los seeders (DatabaseSeeder)
php artisan db:seed

# Seeder específico
php artisan db:seed --class=RolesPermissionSeeder
php artisan db:seed --class=SuperadminUserSeeder
```

### Orden de seeders

1. `RoleSeeder` — Crea los roles base (`superadmin`, `admin`, `mecanico`, `cliente`)
2. `RolesPermissionSeeder` — Crea todos los permisos y los asigna a `superadmin`
3. `SuperadminUserSeeder` — Crea el usuario superadmin

---

## Variables de Entorno Clave

| Variable | Descripción | Valor de desarrollo |
|---|---|---|
| `APP_ENV` | Entorno | `local` |
| `APP_DEBUG` | Debug activado | `true` |
| `DB_CONNECTION` | Driver de BD | `mysql` |
| `QUEUE_CONNECTION` | Driver de colas | `database` |
| `CACHE_STORE` | Driver de caché | `database` |
| `MAIL_MAILER` | Driver de email | `log` (en dev, para no enviar) |
| `SUPERADMIN_PASSWORD` | Contraseña del seeder | `password` |
| `ULTRAMSG_INSTANCE_ID` | ID instancia WhatsApp | (vacío en dev) |
| `ULTRAMSG_TOKEN` | Token de Ultramsg | (vacío en dev) |

Para desarrollo, cambiar `MAIL_MAILER=log` evita enviar emails reales. Los emails quedarán registrados en `storage/logs/laravel.log`.

---

## Comandos Artisan Útiles

```bash
# Ver todas las rutas
php artisan route:list
php artisan route:list --name=dashboard  # Filtrar por nombre

# Limpiar caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan optimize:clear  # Limpia todo

# Optimizar para producción
php artisan optimize

# Tinker (REPL interactivo)
php artisan tinker

# Ver logs en tiempo real
php artisan pail

# Colas
php artisan queue:work                    # Worker (producción)
php artisan queue:listen --tries=1        # Listener (desarrollo)
php artisan queue:failed                  # Ver jobs fallidos
php artisan queue:retry all               # Reintentar todos los fallidos
php artisan queue:flush                   # Eliminar jobs fallidos
```

---

## Producción

### Build de assets

```bash
npm run build
```

### Optimización de Laravel

```bash
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Worker de colas (supervisor recomendado)

```ini
# /etc/supervisor/conf.d/raautomotriz-worker.conf
[program:raautomotriz-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /ruta/al/proyecto/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
numprocs=2
redirect_stderr=true
stdout_logfile=/ruta/al/proyecto/storage/logs/worker.log
```

### Variables de entorno de producción

```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=mysql
QUEUE_CONNECTION=database
CACHE_STORE=database   # O redis para mejor rendimiento
```
