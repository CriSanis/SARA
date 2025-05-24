<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Vehiculo extends Model
{
    use HasFactory;

    protected $table = 'vehiculos'; // Especificar explícitamente

    protected $fillable = ['conductor_id', 'marca', 'modelo', 'placa', 'capacidad'];

    public function conductor()
    {
        return $this->belongsTo(Conductor::class);
    }
}