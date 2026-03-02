# RA Automotriz — Sistema de Gestión de Taller

Sistema web para la gestión integral de un taller automotriz. Cubre el ciclo completo desde el registro de clientes y vehículos hasta la generación de órdenes de trabajo, control de inventario, cobros y notificaciones.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | React 19, TypeScript, Inertia.js 2 |
| Estilos | Tailwind CSS 4, Radix UI, Framer Motion |
| Autenticación | Laravel Fortify (2FA incluido) |
| Autorización | Spatie Laravel Permission |
| Base de datos | MySQL (producción), SQLite (tests) |
| Colas | Laravel Queues (driver: database) |
| Exports | Maatwebsite Excel, DomPDF |
| Testing | Pest PHP 4 |
| Rutas tipadas | Laravel Wayfinder |

---

## Requisitos

- PHP 8.2 o superior
- Composer 2
- Node.js 20+ y npm
- MySQL 8+ (producción) o SQLite (desarrollo/tests)
- Extensiones PHP: `pdo_mysql`, `pdo_sqlite`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `zip`

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio> raautomotriz
cd raautomotriz
```

### 2. Instalación automática (recomendado)

```bash
composer run setup
```

Este comando ejecuta en secuencia:
1. `composer install`
2. Copia `.env.example` → `.env` (si no existe)
3. Genera la `APP_KEY`
4. Ejecuta las migraciones
5. `npm install`
6. `npm run build`

### 3. Instalación manual paso a paso

```bash
# Dependencias PHP
composer install

# Variables de entorno
cp .env.example .env
php artisan key:generate

# Base de datos (ver sección configuración)
php artisan migrate

# Seed inicial: roles, permisos y usuario superadmin
php artisan db:seed

# Dependencias JS
npm install
npm run build
```

---

## Configuración

### Base de datos (MySQL)

En `.env`, descomentar y completar:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=raautomotriz
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

### Correo electrónico

El sistema envía notificaciones (bienvenida, checklist) por SMTP:

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.raautomotriz.com
MAIL_PORT=465
MAIL_USERNAME=notificaciones@raautomotriz.com
MAIL_PASSWORD=tu_contraseña
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="notificaciones@raautomotriz.com"
MAIL_FROM_NAME="RA Automotriz"
```

> Si la contraseña contiene caracteres especiales (`[ ] # &`), escríbela entre comillas dobles: `MAIL_PASSWORD="mi#contraseña"`.

### WhatsApp (Ultramsg)

Para notificaciones por WhatsApp:

```env
ULTRAMSG_INSTANCE_ID=tu_instance_id
ULTRAMSG_TOKEN=tu_token
```

Crear instancia en [user.ultramsg.com](https://user.ultramsg.com/) y escanear el QR.

### Contraseña del superadmin

Por defecto es `password`. Para cambiarla antes del seed:

```env
SUPERADMIN_PASSWORD=MiContraseñaSegura123!
```

---

## Desarrollo

### Iniciar el entorno de desarrollo

```bash
composer run dev
```

Levanta en paralelo:
- `php artisan serve` — Servidor Laravel en `http://localhost:8000`
- `php artisan queue:listen --tries=1` — Worker de colas
- `npm run dev` — Vite con HMR

### Comandos disponibles

```bash
# Desarrollo
composer run dev           # Servidor + cola + Vite (paralelo)
composer run dev:ssr       # Modo SSR con logs

# Calidad de código
composer run lint          # Formatear con Laravel Pint
composer run test:lint     # Verificar formato sin modificar

# Tests
composer run test          # lint + php artisan test
php artisan test           # Solo tests
php artisan test --filter NombreDelTest   # Test específico

# Frontend
npm run dev                # Vite en modo desarrollo
npm run build              # Build de producción
npm run build:ssr          # Build con SSR
npm run lint               # ESLint
npm run format             # Prettier
npm run types              # Verificar tipos TypeScript
```

---

## Usuario por Defecto

Tras ejecutar `php artisan db:seed`:

| Campo | Valor |
|---|---|
| Username | `superadmin` |
| Contraseña | `password` (o `SUPERADMIN_PASSWORD` en `.env`) |
| Email | `superadmin@raautomotriz.local` |
| Rol | `superadmin` (acceso total) |

---

## Módulos del Sistema

| Módulo | Descripción |
|---|---|
| **Dashboard** | Estadísticas y resumen general del taller |
| **Usuarios** | Gestión de empleados con roles y permisos |
| **Clientes** | Registro de clientes con datos de contacto |
| **Vehículos** | Marcas, modelos y vehículos asignados a clientes |
| **Inventario** | Tipos, marcas y productos con control de stock |
| **Checklists** | Listas de verificación de inspección vehicular |
| **Tipos de Servicio** | Catálogo de servicios que ofrece el taller |
| **Paquetes de Servicio** | Agrupación de servicios para presupuestos rápidos |
| **Órdenes de Trabajo** | Ciclo completo: ingreso → diagnóstico → servicios → pago |
| **Configuración** | Perfil, contraseña, 2FA y apariencia |

---

## Estructura del Proyecto

```
raautomotriz/
├── app/
│   ├── Actions/Fortify/       # Lógica de autenticación personalizada
│   ├── Concerns/              # Traits reutilizables (reglas de validación)
│   ├── Exports/               # Clases de exportación Excel/PDF
│   ├── Http/
│   │   ├── Controllers/       # Controladores organizados por dominio
│   │   └── Requests/          # Form Requests (validación por endpoint)
│   ├── Jobs/                  # Jobs para colas (notificaciones)
│   ├── Models/                # 20 modelos Eloquent
│   ├── Providers/             # AppServiceProvider, FortifyServiceProvider
│   ├── Repositories/          # Patrón repositorio (WorkOrder, Product)
│   └── Services/              # Servicios de aplicación (NotificationService)
├── database/
│   ├── factories/             # 15 factories para tests
│   ├── migrations/            # 40 migraciones
│   └── seeders/               # Roles, permisos y usuario superadmin
├── resources/js/
│   ├── components/            # Componentes React reutilizables
│   ├── pages/                 # Páginas Inertia.js
│   ├── hooks/                 # Custom hooks
│   ├── layouts/               # Layouts de la aplicación
│   └── types/                 # Tipos TypeScript
├── routes/
│   ├── web.php                # Rutas públicas + dashboard
│   └── settings.php           # Rutas de configuración de usuario
├── tests/
│   ├── Feature/               # Tests de integración por módulo
│   └── Unit/                  # Tests unitarios de modelos y repositorios
└── docs/
    ├── architecture.md        # Arquitectura detallada del sistema
    ├── routes.md              # Referencia completa de rutas
    └── development.md         # Guía de desarrollo y testing
```

---

## Documentación Adicional

- [Arquitectura del Sistema](docs/architecture.md)
- [Referencia de Rutas](docs/routes.md)
- [Guía de Desarrollo y Tests](docs/development.md)
