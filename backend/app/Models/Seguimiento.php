<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seguimiento extends Model
{
    use HasFactory;

    protected $fillable = [
        'pedido_id', 'ubicacion_actual',
    ];

    protected $casts = [
        'ubicacion_actual' => 'array',
    ];

    public function pedido()
    {
        return $this->belongsTo(Pedido::class);
    }
}