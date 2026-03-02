# Referencia de Rutas — RA Automotriz

Todas las rutas son **web** (sesión + CSRF). No existe API REST separada. Los datos se transportan via **Inertia.js**: las peticiones GET devuelven componentes React hidratados con props, y las mutaciones (POST/PUT/DELETE) devuelven redirects o respuestas Inertia parciales.

---

## Rutas Públicas

| Método | URI | Nombre | Descripción |
|---|---|---|---|
| GET | `/` | `home` | Página de inicio del taller |
| GET | `/sobre-nosotros` | `sobre-nosotros` | Página "Sobre nosotros" |
| GET | `/servicios` | `servicios` | Página de servicios ofrecidos |
| GET | `/contacto` | `contacto` | Página de contacto |

---

## Autenticación (Laravel Fortify)

| Método | URI | Nombre | Descripción |
|---|---|---|---|
| GET | `/login` | `login` | Formulario de login |
| POST | `/login` | `login.store` | Procesar login (campo: `username`) |
| POST | `/logout` | `logout` | Cerrar sesión |
| GET | `/register` | `register` | Formulario de registro |
| POST | `/register` | `register.store` | Crear cuenta de cliente |
| GET | `/forgot-password` | `password.request` | Formulario de recuperación |
| POST | `/forgot-password` | `password.email` | Enviar email de recuperación |
| GET | `/reset-password/{token}` | `password.reset` | Formulario de nueva contraseña |
| POST | `/reset-password` | `password.update` | Guardar nueva contraseña |
| GET | `/two-factor-challenge` | `two-factor.login` | Pantalla de código 2FA |
| POST | `/two-factor-challenge` | `two-factor.login.store` | Verificar código 2FA |
| GET | `/email/verify` | `verification.notice` | Aviso de verificación de email |
| GET | `/email/verify/{id}/{hash}` | `verification.verify` | Confirmar email |
| POST | `/email/verification-notification` | `verification.send` | Reenviar email de verificación |

### Campos del formulario de login

```json
{
  "username": "string (username o número de documento)",
  "password": "string"
}
```

### Campos del formulario de registro (clientes)

```json
{
  "first_name": "string, máx. 120",
  "last_name": "string, máx. 120",
  "document_type": "dni | ce | pasaporte | ruc",
  "document_number": "8 dígitos (DNI) | 11 dígitos (RUC) | alfanumérico (otros)",
  "email": "email único",
  "phone": "9 dígitos, inicia con 9 (ej: 987654321)",
  "password": "mín. 8 caracteres",
  "password_confirmation": "igual a password"
}
```

---

## Configuración de Usuario

Todas requieren `auth`. Las marcadas con `verified` también requieren email verificado.

| Método | URI | Nombre | Auth | Descripción |
|---|---|---|---|---|
| GET | `/settings/profile` | `profile.edit` | auth | Ver perfil |
| PATCH | `/settings/profile` | `profile.update` | auth | Actualizar nombre y email |
| DELETE | `/settings/profile` | `profile.destroy` | auth+verified | Eliminar cuenta |
| GET | `/settings/password` | `user-password.edit` | auth+verified | Formulario de contraseña |
| PUT | `/settings/password` | `user-password.update` | auth+verified | Cambiar contraseña (throttle: 6/min) |
| GET | `/settings/appearance` | `appearance.edit` | auth+verified | Preferencias de apariencia |
| GET | `/settings/two-factor` | `two-factor.show` | auth+verified | Gestionar 2FA |

---

## Dashboard

Todas las rutas del dashboard requieren `auth + verified`. El prefijo de URL es `/dashboard/` y el prefijo de nombre es `dashboard.`.

### Inicio

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard` | `dashboard.index` | `dashboard.view` | Estadísticas generales |

---

### Usuarios (`/dashboard/users/`)

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/users` | `dashboard.users.index` | `users.view` | Listado de usuarios |
| POST | `/dashboard/users` | `dashboard.users.store` | `users.create` | Crear usuario |
| PUT | `/dashboard/users/{user}` | `dashboard.users.update` | `users.update` | Actualizar usuario |
| DELETE | `/dashboard/users/{user}` | `dashboard.users.destroy` | `users.delete` | Eliminar usuario |

#### Campos de usuario

```json
{
  "first_name": "string",
  "last_name": "string",
  "username": "string único, solo letras/números/guion bajo",
  "email": "email único",
  "document_type": "dni | ce | pasaporte | ruc",
  "document_number": "string único",
  "phone": "9 dígitos",
  "status": "active | inactive",
  "password": "mín. 8 caracteres (solo en creación o si se quiere cambiar)",
  "password_confirmation": "igual a password",
  "roles": ["array de nombres de rol"]
}
```

---

### Clientes (`/dashboard/users/clients/`)

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/users/clients` | `dashboard.clients.index` | `clients.view` | Listado de clientes |
| GET | `/dashboard/users/clients/export` | `dashboard.clients.export` | `clients.export` | Exportar a Excel |
| POST | `/dashboard/users/clients` | `dashboard.clients.store` | `clients.create` | Crear cliente |
| PUT | `/dashboard/users/clients/{user}` | `dashboard.clients.update` | `clients.update` | Actualizar cliente |
| DELETE | `/dashboard/users/clients/{user}` | `dashboard.clients.destroy` | `clients.delete` | Eliminar cliente |

---

### Roles (`/dashboard/users/roles/`)

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/users/roles` | `dashboard.roles.index` | `roles.view` | Listado de roles |
| POST | `/dashboard/users/roles` | `dashboard.roles.store` | `roles.create` | Crear rol |
| PUT | `/dashboard/users/roles/{role}` | `dashboard.roles.update` | `roles.update` | Renombrar rol |
| DELETE | `/dashboard/users/roles/{role}` | `dashboard.roles.destroy` | `roles.delete` | Eliminar rol |
| GET | `/dashboard/users/roles/{role}/permissions` | `dashboard.roles.permissions` | — | Ver permisos del rol |
| PUT | `/dashboard/users/roles/{role}/permissions` | `dashboard.roles.permissions.update` | `roles.update` | Actualizar permisos del rol |

---

### Marcas y Modelos de Vehículo (`/dashboard/vehicles/`)

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/vehicles/brands` | `dashboard.vehicles.brands.index` | `brands.view` | Listado de marcas |
| POST | `/dashboard/vehicles/brands` | `dashboard.vehicles.brands.store` | `brands.create` | Crear marca |
| PUT | `/dashboard/vehicles/brands/{brand}` | `dashboard.vehicles.brands.update` | `brands.update` | Actualizar marca |
| DELETE | `/dashboard/vehicles/brands/{brand}` | `dashboard.vehicles.brands.destroy` | `brands.delete` | Eliminar marca |
| POST | `/dashboard/vehicles/brands/{brand}/models` | `dashboard.vehicles.brands.models.store` | `vehicle_models.create` | Agregar modelo a marca |
| PUT | `/dashboard/vehicles/models/{vehicle_model}` | `dashboard.vehicles.models.update` | `vehicle_models.update` | Actualizar modelo |
| DELETE | `/dashboard/vehicles/models/{vehicle_model}` | `dashboard.vehicles.models.destroy` | `vehicle_models.delete` | Eliminar modelo |

---

### Vehículos (`/dashboard/vehicles/vehicles/`)

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/vehicles/vehicles` | `dashboard.vehicles.vehicles.index` | `vehicles.view` | Listado de vehículos |
| GET | `/dashboard/vehicles/vehicles/export` | `dashboard.vehicles.vehicles.export` | `vehicles.export` | Exportar a Excel |
| POST | `/dashboard/vehicles/vehicles` | `dashboard.vehicles.vehicles.store` | `vehicles.create` | Registrar vehículo |
| PUT | `/dashboard/vehicles/vehicles/{vehicle}` | `dashboard.vehicles.vehicles.update` | `vehicles.update` | Actualizar vehículo |
| DELETE | `/dashboard/vehicles/vehicles/{vehicle}` | `dashboard.vehicles.vehicles.destroy` | `vehicles.delete` | Eliminar vehículo |

---

### Inventario — Tipos y Marcas (`/dashboard/inventory/`)

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/inventory/types` | `dashboard.inventory.types.index` | `inventory_types.view` | Listado de tipos |
| POST | `/dashboard/inventory/types` | `dashboard.inventory.types.store` | `inventory_types.create` | Crear tipo |
| PUT | `/dashboard/inventory/types/{type}` | `dashboard.inventory.types.update` | `inventory_types.update` | Actualizar tipo |
| DELETE | `/dashboard/inventory/types/{type}` | `dashboard.inventory.types.destroy` | `inventory_types.delete` | Eliminar tipo |
| POST | `/dashboard/inventory/types/{type}/brands` | `dashboard.inventory.types.brands.store` | `inventory_brands.create` | Agregar marca a tipo |
| PUT | `/dashboard/inventory/brands/{inventory_brand}` | `dashboard.inventory.brands.update` | `inventory_brands.update` | Actualizar marca |
| DELETE | `/dashboard/inventory/brands/{inventory_brand}` | `dashboard.inventory.brands.destroy` | `inventory_brands.delete` | Eliminar marca |

---

### Productos (`/dashboard/inventory/products/`)

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/inventory/products` | `dashboard.inventory.products.index` | `products.view` | Listado de productos |
| GET | `/dashboard/inventory/products/export` | `dashboard.inventory.products.export` | `products.export` | Exportar a Excel |
| POST | `/dashboard/inventory/brands/{brand}/products` | `dashboard.inventory.brands.products.store` | `products.create` | Crear producto en marca |
| PUT | `/dashboard/inventory/products/{product}` | `dashboard.inventory.products.update` | `products.update` | Actualizar producto |
| DELETE | `/dashboard/inventory/products/{product}` | `dashboard.inventory.products.destroy` | `products.delete` | Eliminar producto |

---

### Checklists de Servicio (`/dashboard/services/checklists/`)

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/services/checklists` | `dashboard.services.checklists.index` | `service_checklists.view` | Listado de ítems del checklist |
| POST | `/dashboard/services/checklists` | `dashboard.services.checklists.store` | `service_checklists.create` | Crear ítem |
| PUT | `/dashboard/services/checklists/{checklist}` | `dashboard.services.checklists.update` | `service_checklists.update` | Actualizar ítem |
| DELETE | `/dashboard/services/checklists/{checklist}` | `dashboard.services.checklists.destroy` | `service_checklists.delete` | Eliminar ítem |
| PUT | `/dashboard/services/checklists/{checklist}/move-up` | `dashboard.services.checklists.move-up` | `service_checklists.reorder` | Subir posición |
| PUT | `/dashboard/services/checklists/{checklist}/move-down` | `dashboard.services.checklists.move-down` | `service_checklists.reorder` | Bajar posición |

---

### Tipos de Servicio (`/dashboard/services/types/`)

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/services/types` | `dashboard.services.types.index` | `service_types.view` | Catálogo de servicios |
| POST | `/dashboard/services/types` | `dashboard.services.types.store` | `service_types.create` | Crear tipo de servicio |
| PUT | `/dashboard/services/types/{type}` | `dashboard.services.types.update` | `service_types.update` | Actualizar tipo |
| DELETE | `/dashboard/services/types/{type}` | `dashboard.services.types.destroy` | `service_types.delete` | Eliminar tipo |

---

### Paquetes de Servicio (`/dashboard/services/packages/`)

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/services/packages` | `dashboard.services.packages.index` | `service_packages.view` | Listado de paquetes |
| POST | `/dashboard/services/packages` | `dashboard.services.packages.store` | `service_packages.create` | Crear paquete |
| PUT | `/dashboard/services/packages/{package}` | `dashboard.services.packages.update` | `service_packages.update` | Actualizar paquete |
| DELETE | `/dashboard/services/packages/{package}` | `dashboard.services.packages.destroy` | `service_packages.delete` | Eliminar paquete |
| GET | `/dashboard/services/packages/{package}/items` | `dashboard.services.packages.items.index` | `service_package_items.view` | Ver ítems del paquete |
| POST | `/dashboard/services/packages/{package}/items` | `dashboard.services.packages.items.store` | `service_package_items.create` | Agregar ítem al paquete |
| PUT | `/dashboard/services/packages/{package}/items/{item}` | `dashboard.services.packages.items.update` | `service_package_items.update` | Actualizar ítem |
| DELETE | `/dashboard/services/packages/{package}/items/{item}` | `dashboard.services.packages.items.destroy` | `service_package_items.delete` | Eliminar ítem |

---

### Órdenes de Trabajo (`/dashboard/services/work-orders/`)

#### Consultas

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/services/work-orders` | `dashboard.services.work-orders.index` | `work_orders.view` | Listado con filtros |
| GET | `/dashboard/services/work-orders/{work_order}` | `dashboard.services.work-orders.show` | `work_orders.view` | Detalle completo |
| GET | `/dashboard/services/work-orders/{work_order}/config` | `dashboard.services.work-orders.config` | `work_orders.view` | Datos de configuración para el formulario |
| GET | `/dashboard/services/work-orders/search-clients` | `dashboard.services.work-orders.search-clients` | `work_orders.view` | Buscar clientes (autocomplete) |
| GET | `/dashboard/services/work-orders/search-vehicles` | `dashboard.services.work-orders.search-vehicles` | `work_orders.view` | Buscar vehículos (autocomplete) |

#### CRUD principal

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| POST | `/dashboard/services/work-orders` | `dashboard.services.work-orders.store` | `work_orders.create` | Crear OT |
| PUT | `/dashboard/services/work-orders/{work_order}` | `dashboard.services.work-orders.update` | `work_orders.update` | Actualizar OT |
| DELETE | `/dashboard/services/work-orders/{work_order}` | `dashboard.services.work-orders.destroy` | `work_orders.delete` | Eliminar OT |
| POST | `/dashboard/services/work-orders/{work_order}/confirm-repair` | `dashboard.services.work-orders.confirm-repair` | `work_orders.update` | Confirmar reparación completada |

#### Checklist de inspección

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| PUT | `/dashboard/services/work-orders/{work_order}/checklist-results` | `dashboard.services.work-orders.checklist-results.update` | `work_order_checklist_results.update` | Guardar resultados del checklist |

#### Fotos

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/services/work-orders/{work_order}/photos` | `dashboard.services.work-orders.photos.index` | `work_order_photos.view` | Listar fotos |
| POST | `/dashboard/services/work-orders/{work_order}/photos` | `dashboard.services.work-orders.photos.store` | `work_order_photos.create` | Subir foto |
| DELETE | `/dashboard/services/work-orders/{work_order}/photos/{photo}` | `dashboard.services.work-orders.photos.destroy` | `work_order_photos.delete` | Eliminar foto |

#### Diagnósticos

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| POST | `/dashboard/services/work-orders/{work_order}/diagnoses` | `dashboard.services.work-orders.diagnoses.store` | `work_order_diagnoses.create` | Agregar diagnóstico |
| PUT | `/dashboard/services/work-orders/{work_order}/diagnoses/{diagnosis}` | `dashboard.services.work-orders.diagnoses.update` | `work_order_diagnoses.update` | Actualizar diagnóstico |
| DELETE | `/dashboard/services/work-orders/{work_order}/diagnoses/{diagnosis}` | `dashboard.services.work-orders.diagnoses.destroy` | `work_order_diagnoses.delete` | Eliminar diagnóstico |

#### Servicios realizados

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| POST | `/dashboard/services/work-orders/{work_order}/services` | `dashboard.services.work-orders.services.store` | `work_order_services.create` | Agregar servicio |
| PUT | `/dashboard/services/work-orders/{work_order}/services/{service}` | `dashboard.services.work-orders.services.update` | `work_order_services.update` | Actualizar servicio |
| DELETE | `/dashboard/services/work-orders/{work_order}/services/{service}` | `dashboard.services.work-orders.services.destroy` | `work_order_services.delete` | Eliminar servicio |
| POST | `/dashboard/services/work-orders/{work_order}/services/from-package` | `dashboard.services.work-orders.services.apply-package` | `work_order_services.create` | Aplicar paquete completo |

#### Pagos

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| POST | `/dashboard/services/work-orders/{work_order}/payments` | `dashboard.services.work-orders.payments.store` | `work_order_payments.create` | Registrar pago |
| PUT | `/dashboard/services/work-orders/{work_order}/payments/{payment}` | `dashboard.services.work-orders.payments.update` | `work_order_payments.update` | Actualizar pago |
| DELETE | `/dashboard/services/work-orders/{work_order}/payments/{payment}` | `dashboard.services.work-orders.payments.destroy` | `work_order_payments.delete` | Eliminar pago |
| GET | `/dashboard/services/work-orders/{work_order}/payments/{payment}/print` | `dashboard.services.work-orders.payments.print` | `work_order_payments.view` | Imprimir comprobante PDF |

#### Tickets

| Método | URI | Nombre | Permiso | Descripción |
|---|---|---|---|---|
| GET | `/dashboard/services/work-orders/{work_order}/tickets/{ticket}/print` | `dashboard.services.work-orders.tickets.print` | `work_order_tickets.print` | Imprimir ticket de OT PDF |

---

## Parámetros de Consulta Comunes

Los endpoints de listado aceptan parámetros GET para filtrar y paginar:

### Órdenes de Trabajo (`/dashboard/services/work-orders`)

| Parámetro | Tipo | Descripción |
|---|---|---|
| `search` | string | Busca en nombre del cliente, placa del vehículo |
| `status` | string | `pending \| in_progress \| completed \| cancelled` |
| `date_from` | date | Fecha de ingreso desde (Y-m-d) |
| `date_to` | date | Fecha de ingreso hasta (Y-m-d) |
| `client_id` | integer | Filtrar por cliente |
| `per_page` | integer | Resultados por página (default: 15) |
| `page` | integer | Página actual |

### Clientes y Usuarios

| Parámetro | Tipo | Descripción |
|---|---|---|
| `search` | string | Busca por nombre, apellido, username, email, documento |
| `status` | string | `active \| inactive` |
| `per_page` | integer | Resultados por página |

### Roles

| Parámetro | Tipo | Descripción |
|---|---|---|
| `search` | string | Nombre del rol |
| `filter_permissions` | string | `with` (tiene permisos) \| `without` (sin permisos) |

### Productos

| Parámetro | Tipo | Descripción |
|---|---|---|
| `search` | string | Nombre o código del producto |
| `type_id` | integer | Filtrar por tipo de inventario |
| `brand_id` | integer | Filtrar por marca de inventario |
| `low_stock` | boolean | Solo productos con stock bajo el mínimo |
