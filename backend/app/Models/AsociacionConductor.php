<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AsociacionConductor extends Model
{
    use HasFactory;

    protected $table = 'asociacion_conductores'; // Especificar explícitamente

    protected $fillable = ['conductor_id', 'asociacion_id'];
}