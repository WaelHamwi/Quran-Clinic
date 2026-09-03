<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Queued so the SMTP round-trip (often seconds) never blocks the sign-in /
 * resend request — the response returns immediately and the queue worker
 * (mashfa-queue.service) delivers the code. Redis→database queue fallback in
 * AppServiceProvider keeps this working even when Redis is down.
 */
class OtpVerificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /** Retry transient SMTP failures instead of silently dropping the code. */
    public int $tries = 3;

    public function __construct(public string $otp) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'رمز التحقق — Quranic Clinic');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.otp-verification');
    }
}
