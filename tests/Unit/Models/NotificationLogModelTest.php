<?php

use App\Models\NotificationLog;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('marca el log como enviado', function () {
    $log = NotificationLog::create([
        'user_id'    => User::factory()->create()->id,
        'channel'    => NotificationLog::CHANNEL_EMAIL,
        'subject'    => 'Test subject',
        'message'    => 'Test message',
        'status'     => NotificationLog::STATUS_PENDING,
        'sent_at'    => null,
    ]);

    $log->markAsSent();

    expect($log->fresh()->status)->toBe(NotificationLog::STATUS_SENT);
    expect($log->fresh()->sent_at)->not->toBeNull();
});

it('marca el log como fallido con mensaje de error', function () {
    $log = NotificationLog::create([
        'user_id' => User::factory()->create()->id,
        'channel' => NotificationLog::CHANNEL_WHATSAPP,
        'subject' => null,
        'message' => 'Test',
        'status'  => NotificationLog::STATUS_PENDING,
    ]);

    $log->markAsFailed('Connection timeout');

    expect($log->fresh()->status)->toBe(NotificationLog::STATUS_FAILED);
    expect($log->fresh()->error_message)->toBe('Connection timeout');
});

it('marca el log como fallido sin mensaje de error', function () {
    $log = NotificationLog::create([
        'user_id' => User::factory()->create()->id,
        'channel' => NotificationLog::CHANNEL_EMAIL,
        'message' => 'Test',
        'status'  => NotificationLog::STATUS_PENDING,
    ]);

    $log->markAsFailed(null);

    expect($log->fresh()->status)->toBe(NotificationLog::STATUS_FAILED);
    expect($log->fresh()->error_message)->toBeNull();
});

it('tiene las constantes de canal definidas correctamente', function () {
    expect(NotificationLog::CHANNEL_EMAIL)->toBe('email');
    expect(NotificationLog::CHANNEL_WHATSAPP)->toBe('whatsapp');
});

it('tiene las constantes de estado definidas correctamente', function () {
    expect(NotificationLog::STATUS_PENDING)->toBe('pending');
    expect(NotificationLog::STATUS_SENT)->toBe('sent');
    expect(NotificationLog::STATUS_FAILED)->toBe('failed');
});

it('castea attachments como array', function () {
    $user = User::factory()->create();
    $log  = NotificationLog::create([
        'user_id'     => $user->id,
        'channel'     => NotificationLog::CHANNEL_EMAIL,
        'message'     => 'Test',
        'status'      => NotificationLog::STATUS_PENDING,
        'attachments' => ['file1.pdf', 'file2.pdf'],
    ]);

    expect($log->fresh()->attachments)->toBeArray();
    expect($log->fresh()->attachments)->toContain('file1.pdf');
});
