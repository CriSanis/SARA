<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'cliente_id',
        'conductor_id',
        'estado',
        'fecha_entrega',
        'direccion_origen',
        'direccion_destino',
        'descripcion',
        'peso',
        'imagenes',
        'valor_asegurado',
        'origen_lat',
        'origen_lng',
        'destino_lat',
        'destino_lng',
        'created_at'
    ];

    protected $casts = [
        'fecha_entrega' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'peso' => 'float',
        'valor_asegurado' => 'float',
        'imagenes' => 'array',
        'origen_lat' => 'decimal:8',
        'origen_lng' => 'decimal:8',
        'destino_lat' => 'decimal:8',
        'destino_lng' => 'decimal:8'
    ];

    public function cliente()
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function conductor()
    {
        return $this->belongsTo(Conductor::class);
    }

    public function seguimientos()
    {
        return $this->hasMany(Seguimiento::class);
    }
}