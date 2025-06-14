<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class PedidoEstadoActualizado extends Notification
{
    use Queueable;

    protected $pedido;
    protected $estadoAnterior;

    public function __construct($pedido, $estadoAnterior)
    {
        $this->pedido = $pedido;
        $this->estadoAnterior = $estadoAnterior;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => "El estado del pedido #{$this->pedido->id} ha cambiado de {$this->estadoAnterior} a {$this->pedido->estado}",
            'pedido_id' => $this->pedido->id,
            'estado_anterior' => $this->estadoAnterior,
            'estado_nuevo' => $this->pedido->estado
        ];
    }
} 