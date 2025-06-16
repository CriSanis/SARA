<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Asociacion extends Model
{
    use HasFactory;

    protected $table = 'asociaciones'; // Especificar el nombre exacto de la tabla

    protected $fillable = ['nombre', 'descripcion', 'direccion', 'telefono', 'email'];

    public function conductores()
    {
        return $this->belongsToMany(Conductor::class, 'asociacion_conductores', 'asociacion_id', 'conductor_id');
    }
}