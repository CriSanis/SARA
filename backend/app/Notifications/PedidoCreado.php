<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PedidoCreado extends Notification
{
    use Queueable;

    protected $pedido;

    public function __construct($pedido)
    {
        $this->pedido = $pedido;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => "Se ha creado un nuevo pedido #{$this->pedido->id}",
            'pedido_id' => $this->pedido->id,
            'origen' => $this->pedido->origen,
            'destino' => $this->pedido->destino,
            'distancia_estimada_km' => $this->pedido->distancia_estimada_km,
            'duracion_estimada_min' => $this->pedido->duracion_estimada_min
        ];
    }
} 