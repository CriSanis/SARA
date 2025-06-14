<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'user_type',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    public function conductor(){
        return $this->hasOne(Conductor::class); //se agregan estas lineas para incluir la relacion conductor
    }
}