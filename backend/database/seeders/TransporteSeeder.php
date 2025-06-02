<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Conductor;
use App\Models\Vehiculo;
use App\Models\Asociacion;
use App\Models\AsociacionConductor;
use App\Models\User;

class TransporteSeeder extends Seeder
{
    public function run(): void
    {
        // Crear usuarios con roles
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@sara.com',
            'user_type' => 'admin',
        ]);
        $admin->assignRole('admin');

        $client = User::factory()->create([
            'name' => 'Cliente',
            'email' => 'cliente@sara.com',
            'user_type' => 'client',
        ]);
        $client->assignRole('client');

        // Crear 2 asociaciones (reducido de 5)
        $asociaciones = Asociacion::factory()->count(2)->create();

        // Crear 3 conductores con usuarios (reducido de 10)
        $conductores = Conductor::factory()->count(3)->create();

        foreach ($conductores as $conductor) {
            $conductor->user->assignRole('driver');
            Vehiculo::factory()->count(1)->create(['conductor_id' => $conductor->id]);
            AsociacionConductor::factory()->create([
                'conductor_id' => $conductor->id,
                'asociacion_id' => $asociaciones->random()->id,
            ]);
        }
    }
}