<?php

namespace App\Services;

use App\Mail\ClientNotificationMail;
use App\Models\NotificationLog;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Envía un correo al usuario y registra el envío en notification_logs.
     *
     * @param  array<int, string>  $attachmentPaths  Rutas en storage (ej. 'tickets/orden_123.pdf')
     */
    public function sendEmail(
        User $user,
        string $subject,
        string $message,
        ?WorkOrder $workOrder = null,
        array $attachmentPaths = []
    ): NotificationLog {
        $log = NotificationLog::create([
            'work_order_id' => $workOrder?->id,
            'user_id' => $user->id,
            'channel' => NotificationLog::CHANNEL_EMAIL,
            'subject' => $subject,
            'message' => $message,
            'attachments' => $attachmentPaths ?: null,
            'status' => NotificationLog::STATUS_PENDING,
        ]);

        if (empty($user->email)) {
            $log->markAsFailed('El usuario no tiene email registrado.');

            return $log;
        }

        try {
            Mail::to($user->email)->send(new ClientNotificationMail($subject, $message, $attachmentPaths));
            $log->markAsSent();
        } catch (\Throwable $e) {
            Log::error('NotificationService sendEmail failed', [
                'log_id' => $log->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            $log->markAsFailed($e->getMessage());
        }

        return $log;
    }

    /**
     * Envía un mensaje por WhatsApp (Ultramsg) y registra el envío en notification_logs.
     * El teléfono del usuario debe estar en formato internacional (ej. 51987654321).
     *
     * @param  array<int, string>  $attachmentPaths  Rutas en storage para imágenes/PDF (opcional; envío posterior si se implementa).
     */
    public function sendWhatsApp(
        User $user,
        string $message,
        ?WorkOrder $workOrder = null,
        array $attachmentPaths = []
    ): NotificationLog {
        $log = NotificationLog::create([
            'work_order_id' => $workOrder?->id,
            'user_id' => $user->id,
            'channel' => NotificationLog::CHANNEL_WHATSAPP,
            'message' => $message,
            'attachments' => $attachmentPaths ?: null,
            'status' => NotificationLog::STATUS_PENDING,
        ]);

        $phone = $this->normalizePhone($user->phone ?? '');
        if ($phone === '') {
            $log->markAsFailed('El usuario no tiene teléfono registrado o formato inválido.');

            return $log;
        }

        $instanceId = config('services.ultramsg.instance_id');
        $token = config('services.ultramsg.token');
        if (empty($instanceId) || empty($token)) {
            $log->markAsFailed('Ultramsg no configurado (ULTRAMSG_INSTANCE_ID / ULTRAMSG_TOKEN).');

            return $log;
        }

        $url = "https://api.ultramsg.com/{$instanceId}/messages/chat";

        try {
            $response = Http::asForm()
                ->timeout(15)
                ->post($url, [
                    'token' => $token,
                    'to' => $phone,
                    'body' => $message,
                ]);

            if ($response->successful()) {
                $body = $response->json();
                if (isset($body['error'])) {
                    $log->markAsFailed($body['error']);
                } else {
                    $log->markAsSent();
                }
            } else {
                $log->markAsFailed('HTTP '.$response->status().': '.$response->body());
            }
        } catch (\Throwable $e) {
            Log::error('NotificationService sendWhatsApp failed', [
                'log_id' => $log->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            $log->markAsFailed($e->getMessage());
        }

        return $log;
    }

    /**
     * Envía un documento (PDF) por WhatsApp (Ultramsg) desde ruta local. Usa Base64.
     * Registra el envío en notification_logs. Máx. ~6.5 MB (límite Base64 Ultramsg).
     */
    public function sendWhatsAppDocument(
        User $user,
        string $localFilePath,
        string $filename,
        string $caption = '',
        ?WorkOrder $workOrder = null
    ): NotificationLog {
        $log = NotificationLog::create([
            'work_order_id' => $workOrder?->id,
            'user_id'       => $user->id,
            'channel'       => NotificationLog::CHANNEL_WHATSAPP,
            'subject'       => $filename,
            'message'       => $caption,
            'status'        => NotificationLog::STATUS_PENDING,
        ]);

        if (! is_file($localFilePath)) {
            Log::warning('NotificationService sendWhatsAppDocument: file not found', ['path' => $localFilePath]);
            $log->markAsFailed('Archivo no encontrado: '.$localFilePath);
            return $log;
        }

        $phone = $this->normalizePhone($user->phone ?? '');
        if ($phone === '') {
            $log->markAsFailed('El usuario no tiene teléfono registrado o formato inválido.');
            return $log;
        }

        $instanceId = config('services.ultramsg.instance_id');
        $token = config('services.ultramsg.token');
        if (empty($instanceId) || empty($token)) {
            $log->markAsFailed('Ultramsg no configurado (ULTRAMSG_INSTANCE_ID / ULTRAMSG_TOKEN).');
            return $log;
        }

        $content = file_get_contents($localFilePath);
        if ($content === false) {
            $log->markAsFailed('No se pudo leer el archivo: '.$localFilePath);
            return $log;
        }
        $base64 = base64_encode($content);
        if (strlen($base64) > 10_000_000) {
            Log::warning('NotificationService sendWhatsAppDocument: file too large for base64', ['path' => $localFilePath]);
            $log->markAsFailed('Archivo demasiado grande para envío Base64.');
            return $log;
        }

        $url = "https://api.ultramsg.com/{$instanceId}/messages/document";

        try {
            $response = Http::asForm()
                ->timeout(60)
                ->post($url, [
                    'token'    => $token,
                    'to'       => $phone,
                    'document' => $base64,
                    'filename' => $filename,
                    'caption'  => $caption,
                ]);

            if (! $response->successful()) {
                $error = 'HTTP '.$response->status().': '.$response->body();
                Log::warning('NotificationService sendWhatsAppDocument failed', ['path' => $localFilePath, 'status' => $response->status()]);
                $log->markAsFailed($error);
                return $log;
            }
            $body = $response->json();
            if (! empty($body['error'])) {
                Log::warning('NotificationService sendWhatsAppDocument API error', ['error' => $body['error']]);
                $log->markAsFailed($body['error']);
                return $log;
            }
            $log->markAsSent();
            return $log;
        } catch (\Throwable $e) {
            Log::warning('NotificationService sendWhatsAppDocument failed', ['path' => $localFilePath, 'error' => $e->getMessage()]);
            $log->markAsFailed($e->getMessage());
            return $log;
        }
    }

    /**
     * Envía una imagen por WhatsApp (Ultramsg) desde ruta local. Usa Base64.
     * Registra el envío en notification_logs. Máx. ~6.5 MB.
     */
    public function sendWhatsAppImage(
        User $user,
        string $localFilePath,
        string $caption = '',
        ?WorkOrder $workOrder = null
    ): NotificationLog {
        $log = NotificationLog::create([
            'work_order_id' => $workOrder?->id,
            'user_id'       => $user->id,
            'channel'       => NotificationLog::CHANNEL_WHATSAPP,
            'message'       => $caption,
            'status'        => NotificationLog::STATUS_PENDING,
        ]);

        if (! is_file($localFilePath)) {
            Log::warning('NotificationService sendWhatsAppImage: file not found', ['path' => $localFilePath]);
            $log->markAsFailed('Archivo no encontrado: '.$localFilePath);
            return $log;
        }

        $phone = $this->normalizePhone($user->phone ?? '');
        if ($phone === '') {
            $log->markAsFailed('El usuario no tiene teléfono registrado o formato inválido.');
            return $log;
        }

        $instanceId = config('services.ultramsg.instance_id');
        $token = config('services.ultramsg.token');
        if (empty($instanceId) || empty($token)) {
            $log->markAsFailed('Ultramsg no configurado (ULTRAMSG_INSTANCE_ID / ULTRAMSG_TOKEN).');
            return $log;
        }

        $content = file_get_contents($localFilePath);
        if ($content === false) {
            $log->markAsFailed('No se pudo leer el archivo: '.$localFilePath);
            return $log;
        }
        $base64 = base64_encode($content);
        if (strlen($base64) > 10_000_000) {
            Log::warning('NotificationService sendWhatsAppImage: file too large', ['path' => $localFilePath]);
            $log->markAsFailed('Archivo demasiado grande para envío Base64.');
            return $log;
        }

        $url = "https://api.ultramsg.com/{$instanceId}/messages/image";
        try {
            $response = Http::asForm()
                ->timeout(45)
                ->post($url, [
                    'token'   => $token,
                    'to'      => $phone,
                    'image'   => $base64,
                    'caption' => $caption,
                ]);
            if (! $response->successful()) {
                $error = 'HTTP '.$response->status().': '.$response->body();
                Log::warning('NotificationService sendWhatsAppImage failed', ['path' => $localFilePath, 'status' => $response->status()]);
                $log->markAsFailed($error);
                return $log;
            }
            $body = $response->json();
            if (! empty($body['error'])) {
                Log::warning('NotificationService sendWhatsAppImage API error', ['error' => $body['error']]);
                $log->markAsFailed($body['error']);
                return $log;
            }
            $log->markAsSent();
            return $log;
        } catch (\Throwable $e) {
            Log::warning('NotificationService sendWhatsAppImage failed', ['path' => $localFilePath, 'error' => $e->getMessage()]);
            $log->markAsFailed($e->getMessage());
            return $log;
        }
    }

    /**
     * Normaliza el teléfono a formato Ultramsg: solo dígitos, sin + ni espacios.
     */
    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        return $digits !== '' ? $digits : '';
    }
}
