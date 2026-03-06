# Supervisor: worker de cola (queue:work) para RA Automotriz

Configuración para que el worker de Laravel (`php artisan queue:work`) se ejecute en segundo plano en el VPS y se reinicie automáticamente si se cae o tras un reinicio del servidor.

---

## 1. Instalar Supervisor

En el VPS:

```bash
sudo apt update
sudo apt install supervisor -y
```

---

## 2. Copiar el archivo de configuración

El archivo `supervisor-raautomotriz-worker.conf` debe estar en `/etc/supervisor/conf.d/`.

**Opción A – Crear el archivo directamente en el VPS:**

```bash
sudo nano /etc/supervisor/conf.d/raautomotriz-worker.conf
```

Pega el contenido de `deploy/supervisor-raautomotriz-worker.conf`, guarda (Ctrl+O, Enter) y cierra (Ctrl+X).

**Opción B – Copiar desde el proyecto** (si ya está en el servidor, por ejemplo en `/var/www/raautomotriz`):

```bash
sudo cp /var/www/raautomotriz/deploy/supervisor-raautomotriz-worker.conf /etc/supervisor/conf.d/raautomotriz-worker.conf
```

---

## 3. Crear el archivo de log y permisos

Para que el worker pueda escribir el log sin errores de permisos:

```bash
touch /var/www/raautomotriz/storage/logs/worker.log
chown www-data:www-data /var/www/raautomotriz/storage/logs/worker.log
```

---

## 4. Cargar y arrancar el worker

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start raautomotriz-worker
```

---

## 5. Comprobar que está corriendo

```bash
sudo supervisorctl status
```

Deberías ver algo como:

```
raautomotriz-worker:raautomotriz-worker_00   RUNNING   pid 12345, uptime 0:00:05
```

---

## Comandos útiles

| Acción | Comando |
|--------|--------|
| Ver estado del worker | `sudo supervisorctl status` |
| Parar el worker | `sudo supervisorctl stop raautomotriz-worker` |
| Arrancar el worker | `sudo supervisorctl start raautomotriz-worker` |
| Reiniciar (tras actualizar código) | `sudo supervisorctl restart raautomotriz-worker` |
| Ver últimas líneas del log del worker | `tail -f /var/www/raautomotriz/storage/logs/worker.log` |

---

## Reinicio del servidor

Supervisor se inicia con el sistema. Si reinicias el VPS, el worker `raautomotriz-worker` volverá a arrancar solo (gracias a `autostart=true` en la configuración).
