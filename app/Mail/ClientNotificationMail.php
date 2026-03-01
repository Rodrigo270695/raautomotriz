<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClientNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $subjectLine;

    public string $body;

    /** @var array<int, string> */
    public array $attachmentPaths;

    public function __construct(string $subjectLine, string $body, array $attachmentPaths = [])
    {
        $this->subjectLine = $subjectLine;
        $this->body = $body;
        $this->attachmentPaths = $attachmentPaths;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.client-notification',
        );
    }

    /** @return array<int, Attachment> */
    public function attachments(): array
    {
        $out = [];
        foreach ($this->attachmentPaths as $path) {
            $fullPath = storage_path('app/public/'.$path);
            if (is_file($fullPath)) {
                $out[] = Attachment::fromPath($fullPath)->as(basename($path));
            }
        }
        return $out;
    }
}
