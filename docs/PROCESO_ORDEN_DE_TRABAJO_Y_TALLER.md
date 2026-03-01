# Proceso principal: Orden de trabajo y flujo del taller

## 1. Visión general

Sistema de gestión de taller que cubre desde el **ingreso del vehículo** hasta la **entrega**, con **seguimiento en tiempo real** para el cliente, **paquetes de servicio** predefinidos, **historial por vehículo**, **alertas de mantenimiento** basadas en kilometraje, **cuentas por pagar (fiado)** y el **asistente SORA** con IA (ChatGPT) para recomendaciones personalizadas.

---

## 2. Flujo del proceso paso a paso

### Fase 1: Ingreso del vehículo

| Paso | Acción | Datos que se guardan |
|------|--------|------------------------|
| 1.1 | El vehículo llega al taller. Se crea la **orden de trabajo** (orden de servicio). | Fecha y hora de ingreso. |
| 1.2 | Se registra el **kilometraje** al ingreso. | Kilometraje de entrada (para historial y alertas futuras). |
| 1.3 | Se anota la **observación del cliente** (qué le pasa al carro, qué nota, ruidos, etc.). | Texto libre. |
| 1.4 | Se toman **fotos del vehículo** (exterior, interior, daños, placas). | Una o varias fotos asociadas a la orden, tipo “ingreso”. |

**Resultado:** Orden creada en estado “En ingreso” o “Ingresado”, con fotos y datos de entrada.

---

### Fase 2: Lista de chequeo

| Paso | Acción | Datos que se guardan |
|------|--------|------------------------|
| 2.1 | Se asigna o selecciona la **lista de chequeo** que aplica (ej. “Revisión pre-entrega”, “Revisión de luces”). | Relación orden ↔ lista de chequeo. |
| 2.2 | El técnico/recepcionista **marca cada ítem** de la lista (OK, falla, N/A, observación). | Por cada ítem: marcado/no, nota opcional. |

**Resultado:** Lista de chequeo completada y guardada para esa orden (auditoría y respaldo).

---

### Fase 3: Diagnóstico

| Paso | Acción | Datos que se guardan |
|------|--------|------------------------|
| 3.1 | El mecánico/técnico realiza el **diagnóstico**. | Texto o plantilla de diagnóstico, fecha, responsable. |
| 3.2 | Opcional: fotos o comentarios del diagnóstico (piezas dañadas, etc.). | Fotos/comentarios ligados a “diagnóstico”. |

**Resultado:** Diagnóstico registrado; la orden puede pasar a “En reparación” o “Cotización”.

---

### Fase 4: Paquetes de servicio y trabajo

| Paso | Acción | Datos que se guardan |
|------|--------|------------------------|
| 4.1 | Se elige el **paquete de servicio** (ej. “Preventivo – Cambio de aceite”, “Correctivo – Frenos”). | Orden vinculada al paquete. |
| 4.2 | El paquete ya trae definido: tipo de servicio, productos (aceite, filtros), mano de obra, precio base. **La definición del paquete no se edita:** es un catálogo fijo. | Al “jalar” el paquete a la orden se **copian** sus ítems a la orden (tabla work_order_services). |
| 4.3 | **Solo en ese momento**, cuando el paquete ya fue aplicado al servicio del vehículo, se puede **añadir o quitar productos** para **esa orden concreta**. El paquete en catálogo sigue igual; lo que se modifica son las líneas de esa orden. | Cambios solo en work_order_services de esa work_order (agregar línea, quitar línea, ajustar cantidad). |
| 4.4 | Si es **correctivo** y el vehículo se queda 2–3 días: se puede solicitar **adelanto**. | Monto de adelanto, fecha, forma de pago. |
| 4.5 | Mientras se trabaja: se suben **fotos y/o videos del proceso** (piezas, reparación, avance). | Fotos/videos con etiqueta “proceso” o “avance”, fecha, opcional descripción. |

**Resultado:** Orden con paquete(s) aplicados (y ajustes solo en la orden), adelanto (si aplica) y evidencias de avance.

---

### Fase 5: Seguimiento para el cliente

| Paso | Acción | Datos que se guardan |
|------|--------|------------------------|
| 5.1 | El **cliente** entra a su cuenta (portal cliente) y ve **su orden**: estado, fotos de ingreso, fotos/videos del proceso, diagnóstico (si se permite). | Lectura de orden + medios. |
| 5.2 | El **sistema envía mensajes automáticos por WhatsApp** (opcional por evento): “Su vehículo ingresó”, “Se realizó el cambio de aceite”, “Su vehículo está listo para retiro”. | Registro de mensaje enviado (orden, canal, texto, fecha, estado). |

**Resultado:** Cliente informado por pantalla y por WhatsApp.

---

### Fase 6: Listo para recoger y entrega

| Paso | Acción | Datos que se guardan |
|------|--------|------------------------|
| 6.1 | Se marca la orden como **“Listo para recoger”**. | Cambio de estado; puede disparar notificación WhatsApp/email. |
| 6.2 | Al llegar el cliente se **genera e imprime el ticket de entrega**: fecha/hora de ingreso, diagnóstico (resumen), trabajo realizado, kilometraje, recomendaciones. | Contenido del ticket (o plantilla) y fecha/hora de impresión. |
| 6.3 | Se registra la **entrega** (fecha/hora de salida, kilometraje de salida si se desea). | Orden en estado “Entregado”; cierre de la orden. |

**Resultado:** Orden cerrada y respaldo impreso para el cliente.

---

### Fase 6.4 Cuentas por pagar (fiado)

Al cliente se le puede **dar fiado**: no paga el total al entregar el vehículo y queda un saldo a favor del taller (cuenta por cobrar) / para el cliente es **cuenta por pagar**.

| Paso | Acción | Datos que se guardan |
|------|--------|------------------------|
| 6.4.1 | Al cerrar la orden, el **total** de la orden puede ser mayor que la **suma de pagos** (adelanto + pagos parciales). La diferencia es el **saldo pendiente** (fiado). | work_orders.total_amount vs suma de work_order_payments; saldo = total − pagado. |
| 6.4.2 | El taller lleva control de **cuentas por cobrar** por cliente: qué órdenes tienen saldo pendiente y cuánto debe en total cada cliente. | Se puede derivar de órdenes + pagos o mantener una tabla de resumen/balance por cliente. |
| 6.4.3 | Cuando el cliente paga a cuenta (abono), se registra un **nuevo pago** ligado a la orden (o a “cuenta corriente” del cliente, según el modelo elegido). | work_order_payments (type: partial o final) o pagos aplicados a órdenes con saldo. |

**Resultado:** Saldo pendiente por orden y por cliente; posibilidad de abonos posteriores hasta saldar.

---

### Fase 7: Historial y alertas (historial “clínico” del vehículo)

| Paso | Acción | Datos que se usan |
|------|--------|--------------------|
| 7.1 | Por cada **cliente** y cada **vehículo** se muestra el **historial**: todas las órdenes pasadas (fechas, kilometraje de ingreso, servicios, diagnóstico, paquetes). | Órdenes históricas del vehículo. |
| 7.2 | **Cálculo de kilometraje:** “Hace 3 meses ingresó con 45 000 km, hoy tiene 52 000 km → ya corresponde cambio de aceite cada 5 000 km”. | Último kilometraje en orden anterior + kilometraje actual (o último ingreso) + intervalo del paquete/servicio. |
| 7.3 | **Alertas administrativas:** el sistema calcula qué vehículos están por cumplir intervalo (km o tiempo) y permite **enviar notificaciones** (“Es hora de su mantenimiento preventivo”). | Tabla de “próximo mantenimiento” por vehículo/paquete y cola o registro de notificaciones. |

**Resultado:** Historial claro por vehículo y recordatorios proactivos.

---

### Fase 8: SORA – Asistente vehicular con IA (ChatGPT)

Objetivo: **diferenciar el servicio** con recomendaciones personalizadas (ej. cambio de aceite) usando el uso real del vehículo y la API de ChatGPT. La identidad del asistente es **SORA**.

| Paso | Acción | Datos que se guardan |
|------|--------|------------------------|
| 8.1 | El **técnico** (o recepción) le hace al cliente **preguntas de uso**: ¿cada cuánto usa el vehículo al día?, ¿cuál es su ruta aproximada (de dónde a dónde, km aprox.)?, ¿cuántos viajes hace al día?, tipo de uso (ciudad, carretera, mixto). | Respuestas guardadas por vehículo/cliente (tabla de “encuesta de uso” o perfil de uso). |
| 8.2 | Con el **kilometraje de ingreso** histórico y estas respuestas, el sistema (o un job) estima un **kilometraje diario/semanal aproximado**. Opcional: la **API de ChatGPT** recibe un resumen (último cambio de aceite, km actual, uso descrito, intervalo recomendado) y devuelve un **texto amigable** y una **fecha/km sugerido** para el próximo cambio. | Cálculo guardado (km/día aprox., próxima fecha/km sugerida); mensaje generado por IA guardado o regenerado al notificar. |
| 8.3 | La **notificación** (email o WhatsApp) al cliente no es genérica: el sistema envía un mensaje **personalizado** con la voz de SORA, por ejemplo: *“Soy SORA, tu asistente vehicular. Según tu uso (aprox. X km al día) y el kilometraje de tu vehículo, te sugiero programar ya el cambio de aceite.”* El texto puede ser generado o afinado con ChatGPT a partir de datos del vehículo y del uso. | notification_logs con el mensaje enviado; opcional tabla de “plantillas IA” o historial de mensajes SORA. |
| 8.4 | El cliente percibe un **servicio inteligente** y proactivo, lo que mejora fidelización. | — |

**Resultado:** Recomendaciones (ej. cambio de aceite) basadas en uso real + IA, y notificaciones diferenciadas con SORA.

---

## 3. Tablas sugeridas para este proceso

Se asume que ya existen tablas como **users**, **clients**, **vehicles**, **service_checklists** (y si aplica ítems de lista de chequeo), **service_types**, **products**, **inventory** (o equivalente).

### 3.1 Núcleo de la orden de trabajo

| Tabla | Propósito |
|-------|-----------|
| **work_orders** | Orden de trabajo. Campos típicos: `id`, `vehicle_id`, `client_id`, `created_by` (user), `entry_date`, `entry_time`, `entry_mileage`, `exit_mileage` (nullable), `client_observation` (texto), `diagnosis` (texto o FK a diagnóstico), `status` (ingreso, en_checklist, diagnosticado, en_reparacion, listo_para_entregar, entregado, cancelado), `advance_payment_amount`, `total_amount`, `notes`, `timestamps`. |
| **work_order_photos** | Fotos y videos de la orden. `id`, `work_order_id`, `type` (enum: entry, diagnosis, process, delivery), `path` o `url`, `caption` (opcional), `created_at`. |

### 3.2 Lista de chequeo aplicada a la orden

| Tabla | Propósito |
|-------|-----------|
| **service_checklist_items** | Si aún no existe: ítems de cada lista. `id`, `service_checklist_id`, `name`, `sort_order`. |
| **work_order_checklist_results** | Marcado de la lista por orden. `id`, `work_order_id`, `service_checklist_id`, `service_checklist_item_id` (si aplica), `checked` (boolean), `note`, `completed_at`, `completed_by`. |

(Si hoy solo tienes “lista” sin ítems, se puede simplificar a una tabla que relacione orden ↔ checklist y un JSON o tabla simple de ítems marcados.)

### 3.3 Diagnóstico

| Tabla | Propósito |
|-------|-----------|
| **work_order_diagnoses** | Diagnóstico formal por orden. `id`, `work_order_id`, `diagnosis_text`, `diagnosed_by` (user_id), `diagnosed_at`, opcional `internal_notes`. |

(O se puede llevar solo el campo `diagnosis` en `work_orders` si no necesitas historial de cambios de diagnóstico.)

### 3.4 Paquetes de servicio (definición fija, no editable)

| Tabla | Propósito |
|-------|-----------|
| **service_packages** | Definición del paquete. `id`, `name`, `description`, `service_type_id` (preventivo, correctivo, etc.), `status`, `sort_order`, `timestamps`. **Esta definición no se edita** en el día a día; es catálogo. |
| **service_package_items** | Qué lleva el paquete por defecto. `id`, `service_package_id`, `type` (service / product), `product_id` (nullable), `service_type_id` (nullable), `quantity`, `unit_price` o referencia a tarifa, `notes`. Un paquete “Preventivo – Aceite” tiene ítem tipo product = aceite, cantidad 1, etc. **Tampoco se modifica** al usar el paquete. |

### 3.5 Aplicación del paquete a la orden (aquí sí se puede añadir/quitar)

Al **jalar** un paquete a una orden de trabajo se **copian** sus ítems a **work_order_services**. A partir de ese momento **solo en esa orden** se puede añadir o quitar productos/líneas; el paquete en catálogo sigue igual.

| Tabla | Propósito |
|-------|-----------|
| **work_order_services** | Servicios/productos aplicados a **esta** orden. `id`, `work_order_id`, `service_package_id` (nullable, de qué paquete vino), `service_package_item_id` (nullable), `product_id` (nullable), `service_type_id` (nullable), `description`, `quantity`, `unit_price`, `subtotal`. Las líneas se copian del paquete al aplicar; luego el usuario puede **agregar** líneas nuevas o **quitar** líneas solo para esta orden. |

### 3.6 Pagos, fiado (cuentas por pagar) y ticket

| Tabla | Propósito |
|-------|-----------|
| **work_order_payments** | Pagos de la orden. `id`, `work_order_id`, `type` (advance, partial, final), `amount`, `payment_method`, `paid_at`, `reference`, `notes`. Si la suma de pagos &lt; total de la orden, el cliente queda **fiado** (saldo pendiente). |
| **client_balances** (opcional) | Resumen de cuentas por cobrar por cliente. `id`, `client_id`, `total_pending` (suma de saldos de órdenes no saldadas), `last_updated`. Se puede derivar de work_orders + work_order_payments en lugar de tabla aparte. |
| **work_order_tickets** | Ticket de entrega impreso. `id`, `work_order_id`, `printed_at`, `printed_by`, opcional `token` o `code` para verificación. El contenido (fecha/hora ingreso, diagnóstico, servicios) se puede generar desde `work_orders` + `work_order_services` + diagnóstico. |

**Cálculo de fiado:** Por orden: `saldo_orden = work_orders.total_amount - SUM(work_order_payments.amount)`. Por cliente: suma de saldos de todas sus órdenes con saldo &gt; 0. Los abonos posteriores se registran como nuevos `work_order_payments` (type partial/final) contra la misma orden.

### 3.7 Seguimiento y notificaciones

| Tabla | Propósito |
|-------|-----------|
| **work_order_updates** | Seguimiento visible para el cliente. `id`, `work_order_id`, `type` (text, photo, video), `content` (texto), `file_path` (nullable), `created_by`, `created_at`. |
| **notification_logs** | Mensajes enviados (WhatsApp, email, etc.). `id`, `work_order_id` (nullable), `client_id` o `user_id`, `channel` (whatsapp, email), `message`, `sent_at`, `status` (sent, failed, pending). |

### 3.8 Historial “clínico” y alertas de mantenimiento

| Tabla | Propósito |
|-------|-----------|
| **vehicle_maintenance_schedules** | Regla de mantenimiento por vehículo (o por tipo de vehículo/paquete). `id`, `vehicle_id`, `service_package_id` o `service_type_id`, `interval_km`, `interval_days`, `last_work_order_id` (nullable), `last_service_at`, `last_service_mileage`, `next_due_km`, `next_due_date`. Se actualiza al cerrar una orden que aplica ese paquete. |
| **maintenance_alerts** | Alertas generadas para enviar. `id`, `vehicle_id`, `client_id`, `service_package_id` o `service_type_id`, `type` (due_km, due_date), `scheduled_at`, `sent_at` (nullable), `notification_log_id` (nullable). Un cron/job revisa `vehicle_maintenance_schedules` y crea filas aquí para enviar WhatsApp/email. |

### 3.9 SORA – Asistente vehicular con IA (ChatGPT)

| Tabla | Propósito |
|-------|-----------|
| **vehicle_usage_surveys** | Respuestas del cliente al uso del vehículo (para SORA). `id`, `vehicle_id`, `client_id`, `work_order_id` (nullable, si se captura en una orden), `trips_per_day`, `daily_use_frequency` (texto o enum), `route_description` (ej. “Casa–oficina 20 km ida y vuelta”), `approx_km_per_day` o `approx_km_per_week`, `use_type` (ciudad, carretera, mixto), `surveyed_at`, `surveyed_by`. |
| **vehicle_usage_estimates** (opcional) | Resultado del cálculo/IA: estimado de km/día y próxima fecha/km sugerida. `id`, `vehicle_id`, `estimated_km_per_day`, `next_service_km`, `next_service_date`, `service_package_id` o `service_type_id`, `last_calculated_at`, `source` (manual, ai). |
| **sora_notification_logs** (opcional) | Registro de mensajes SORA enviados (personalizados con IA). `id`, `vehicle_id`, `client_id`, `maintenance_alert_id` (nullable), `channel` (whatsapp, email), `message_sent` (texto que recibió el cliente), `prompt_used` (opcional, para auditoría), `sent_at`, `status`. Puede reutilizar o extenderse desde **notification_logs** con un campo `sender_type` = 'sora'. |

**Flujo IA:** El backend envía a la API de ChatGPT un contexto (vehículo, último cambio de aceite, km actual, respuestas de uso, intervalo recomendado) y pide un mensaje corto y amigable en primera persona como “SORA, asistente vehicular”. La respuesta se usa en WhatsApp/email y se guarda en notification_logs o sora_notification_logs.

### Resumen de tablas nuevas/principales

- **work_orders** – Orden de trabajo (eje del proceso).
- **work_order_photos** – Fotos/videos ingreso y proceso.
- **work_order_checklist_results** – Lista de chequeo marcada (+ **service_checklist_items** si no existe).
- **work_order_diagnoses** – Diagnóstico por orden.
- **service_packages** – Paquete (ej. Preventivo – Aceite).
- **service_package_items** – Ítems del paquete (productos/servicios).
- **work_order_services** – Servicios/productos aplicados a la orden (copia del paquete al aplicarlo; solo aquí se puede añadir/quitar por orden).
- **work_order_payments** – Adelantos, abonos y pagos (fiado = total − suma de pagos).
- **client_balances** (opcional) – Resumen cuentas por cobrar por cliente.
- **work_order_tickets** – Ticket de entrega impreso.
- **work_order_updates** – Seguimiento (texto, foto, video) para el cliente.
- **notification_logs** – Envíos WhatsApp/email.
- **vehicle_maintenance_schedules** – Próximo mantenimiento por vehículo/paquete.
- **maintenance_alerts** – Cola de alertas para notificar.
- **vehicle_usage_surveys** – Encuesta de uso del vehículo (para SORA).
- **vehicle_usage_estimates** (opcional) – Estimado km/día y próxima fecha/km (IA o cálculo).
- **sora_notification_logs** (opcional) – Mensajes SORA personalizados con IA.

---

## 4. Sugerencias como analista de sistemas

### 4.1 Paquetes de servicio

- La **definición del paquete** (service_packages y service_package_items) **no se edita** en el día a día: es catálogo fijo. Así se evita que un cambio afecte órdenes pasadas o confunda al personal.
- **Solo al aplicar** el paquete a una orden (al “jalar” el paquete al servicio del vehículo) se **copian** los ítems a work_order_services. **Solo en ese momento y solo para esa orden** se puede añadir o quitar productos (editar líneas de work_order_services). El tipo de servicio y el paquete definido por defecto no cambian.
- Definir pocos paquetes claros (Preventivo básico, Preventivo completo, Correctivo frenos, etc.) con productos y cantidades fijas en service_package_items. Mantener precios o tarifas ahí para que al aplicar el paquete a la orden el cálculo sea automático.

### 4.2 Seguimiento al cliente

- **Portal cliente:** una vista “Mis órdenes” con estados, fotos de ingreso, fotos/videos del proceso y diagnóstico (si se autoriza). Evitar mostrar precios internos o notas técnicas si no aplica.
- **WhatsApp:** integrar con API oficial (WhatsApp Business) o proveedor (Twilio, etc.). Guardar siempre en `notification_logs` qué se envió y cuándo, para soporte y auditoría.

### 4.3 Historial y alertas

- **Historial:** derivar todo de `work_orders` por `vehicle_id`; no hace falta una “tabla de historial” aparte si cada orden ya tiene fecha, kilometraje, diagnóstico y servicios.
- **Cálculo “ya es hora”:** al cerrar una orden con un paquete preventivo, actualizar `vehicle_maintenance_schedules` (último servicio, km, próxima fecha/km). Un job periódico compara kilometraje actual (último ingreso o dato que el cliente/taller actualice) con `next_due_km` y dispara alertas.
- **Alertas:** que sean configurables (cada cuántos km o días avisar) y que el cliente pueda tener preferencia (sí/no WhatsApp, sí/no email).

### 4.4 Ticket de entrega

- Contenido sugerido: número de orden, placa, cliente, fecha/hora ingreso, diagnóstico resumido, lista de servicios/paquetes realizados, kilometraje entrada/salida, recomendaciones, fecha/hora de impresión. Se puede generar PDF o impresión directa desde el backend.

### 4.5 Seguridad y permisos

- Clientes solo ven **sus** vehículos y **sus** órdenes.
- Fotos y documentos en almacenamiento privado (S3, local con control de acceso) y URLs firmadas o bajo autenticación.
- Roles claros: recepción (ingreso, checklist), taller (diagnóstico, paquetes, fotos de proceso), caja (pagos, ticket), administración (alertas, reportes).

### 4.6 Cuentas por pagar (fiado)

- Calcular **saldo por orden** = total de la orden − suma de pagos de esa orden. Si saldo &gt; 0, el cliente debe (fiado).
- Por **cliente**: suma de saldos de todas sus órdenes con saldo pendiente. Mostrar en vista “Cuentas por cobrar” o “Clientes con fiado”.
- Los **abonos** se registran como nuevos registros en work_order_payments (type: partial o final); opcionalmente permitir indicar “a qué orden aplico este pago” si el cliente paga varias órdenes a la vez.

### 4.7 SORA y ChatGPT

- **Encuesta de uso** (vehicle_usage_surveys): pocas preguntas claras (frecuencia de uso, ruta aprox. en km, viajes/día, tipo de uso). El técnico las hace al cliente y las carga en el sistema.
- **Cálculo:** con kilometraje de ingreso histórico y respuestas, estimar km/día o km/semana; con intervalo del paquete (ej. cambio de aceite cada 5 000 km) calcular “próximo cambio aprox.”.
- **ChatGPT:** enviar a la API un prompt con contexto (vehículo, último servicio, km actual, uso estimado, intervalo) y pedir un mensaje corto en primera persona como “SORA, tu asistente vehicular”, sugeriendo el cambio de aceite u otro mantenimiento. Usar ese texto en WhatsApp/email para diferenciar el servicio.
- Guardar el mensaje enviado (y opcionalmente el prompt) para auditoría y para no regenerar innecesariamente. Considerar límites de uso/costo de la API.

### 4.8 Escalabilidad y mantenimiento

- **Fotos/videos:** compresión y tamaños máximos para no llenar disco; considerar CDN si crece el uso.
- **Notificaciones:** cola de jobs (Laravel Queue) para WhatsApp y emails para no bloquear la app y reintentar en fallos.
- **Historial:** si crece mucho el número de órdenes, indexar por `vehicle_id` + `created_at` y paginar en el historial del vehículo.

---

## 5. Orden sugerido de implementación

1. **work_orders** + **work_order_photos** (ingreso, kilometraje, observación, fotos).  
2. Integración con **listas de chequeo** (work_order_checklist_results y si aplica service_checklist_items).  
3. **Diagnóstico** (work_order_diagnoses o campo en work_orders).  
4. **service_packages** + **service_package_items** (definición fija); **work_order_services** (copia al aplicar paquete + posibilidad de añadir/quitar solo en la orden).  
5. **work_order_payments** (adelanto, abonos, pagos finales); cálculo de **fiado** (saldo por orden y por cliente).  
6. **work_order_updates** y vista cliente de seguimiento.  
7. **notification_logs** e integración WhatsApp.  
8. **work_order_tickets** (generación e impresión).  
9. **vehicle_maintenance_schedules** + **maintenance_alerts** + jobs de notificación.  
10. **vehicle_usage_surveys** (encuesta de uso) + **vehicle_usage_estimates** + integración **ChatGPT** para mensajes SORA (notificaciones personalizadas de cambio de aceite, etc.).  
11. Ajustes de historial “clínico” en portal cliente, alertas administrativas y vista de cuentas por cobrar (fiado).

---

*Documento de análisis para el proceso principal del taller. Las tablas y nombres pueden ajustarse a tu convención actual (singular/plural, prefijos) y a si ya tienes parte de esto implementado.*
