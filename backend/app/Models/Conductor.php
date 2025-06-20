<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Conductor extends Model
{
    use HasFactory;

    protected $table = 'conductores';

    protected $fillable = ['user_id', 'licencia', 'estado_verificacion'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vehiculos()
    {
        return $this->hasMany(Vehiculo::class);
    }

    public function asociaciones()
    {
        return $this->belongsToMany(Asociacion::class, 'asociacion_conductores', 'conductor_id', 'asociacion_id');
    }

    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }

    public function seguimientos()
    {
        return $this->hasMany(Seguimiento::class);
    }
}