<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
class NewExamNotification extends Notification
{
    public $exam;

    public function __construct($exam)
    {
        $this->exam = $exam;
    }

    public function via($notifiable)
    {
        return ['database', 'mail', 'broadcast'];
    }

    // 💾 DB
    public function toDatabase($notifiable)
    {
        return [
            'title' => 'امتحان جديد',
            'message' => 'تم إضافة امتحان: ' . $this->exam->title,
            'exam_id' => $this->exam->id,
        ];
    }

    // 📧 Email
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('امتحان جديد 🎉')
            ->line('تم إضافة امتحان جديد: ' . $this->exam->title)
            ->action('اذهب للامتحان', url('/exams/' . $this->exam->id));
    }

    // ⚡ Real-time
    public function toBroadcast($notifiable)
    {
        return [
            'title' => 'امتحان جديد',
            'message' => 'تم إضافة امتحان: ' . $this->exam->title,
        ];
    }
}