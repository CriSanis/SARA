<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Seguimiento;

class SeguimientoActualizado
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $seguimiento;

    public function __construct(Seguimiento $seguimiento)
    {
        $this->seguimiento = $seguimiento;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('pedido.' . $this->seguimiento->pedido_id);
    }

    public function broadcastAs()
    {
        return 'seguimiento.actualizado';
    }
}