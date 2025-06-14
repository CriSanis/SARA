<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class RutaAsignada extends Notification
{
    use Queueable;

    protected $pedido;
    protected $ruta;

    public function __construct($pedido, $ruta)
    {
        $this->pedido = $pedido;
        $this->ruta = $ruta;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => "Se ha asignado la ruta {$this->ruta->nombre} al pedido #{$this->pedido->id}",
            'pedido_id' => $this->pedido->id,
            'ruta_id' => $this->ruta->id,
            'ruta_nombre' => $this->ruta->nombre
        ];
    }
} 