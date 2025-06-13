<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use App\Models\Pedido;
use App\Models\Conductor;

class ConductorAsignado extends Mailable
{
    use Queueable, SerializesModels;

    public $pedido;
    public $conductor;

    public function __construct(Pedido $pedido, Conductor $conductor)
    {
        $this->pedido = $pedido;
        $this->conductor = $conductor;
    }

    public function build()
    {
        return $this->subject('Conductor Asignado a tu Pedido')
                    ->view('emails.conductor-asignado')
                    ->with([
                        'pedido' => $this->pedido,
                        'conductor' => $this->conductor,
                    ]);
    }
} 