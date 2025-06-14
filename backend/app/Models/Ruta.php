<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ruta extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre', 'origen', 'destino', 'coordenadas', 'distancia_km', 'duracion_estimada_min',
    ];

    protected $casts = [
        'coordenadas' => 'array',
    ];

    public function pedidos()
    {
        return $this->belongsToMany(Pedido::class, 'pedido_ruta');
    }
}