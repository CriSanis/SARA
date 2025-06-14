<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'cliente_id', 'conductor_id', 'origen', 'origen_coordenadas', 'destino', 'destino_coordenadas',
        'distancia_estimada_km', 'duracion_estimada_min', 'descripcion', 'estado',
    ];

    protected $casts = [
        'origen_coordenadas' => 'array',
        'destino_coordenadas' => 'array',
        'distancia_estimada_km' => 'float',
        'duracion_estimada_min' => 'integer',
    ];

    public function cliente()
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function conductor()
    {
        return $this->belongsTo(Conductor::class);
    }

    public function rutas()
    {
        return $this->belongsToMany(Ruta::class, 'pedido_ruta');
    }
}