<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Conductor;
use App\Models\Vehiculo;
use App\Models\Asociacion;
use App\Models\AsociacionConductor;

class TransporteSeeder extends Seeder
{
    public function run(): void
    {
        // Crear 5 asociaciones
        $asociaciones = Asociacion::factory()->count(5)->create();

        // Crear 10 conductores con usuarios
        $conductores = Conductor::factory()->count(10)->create();

        // Asignar vehículos a cada conductor
        foreach ($conductores as $conductor) {
            Vehiculo::factory()->create(['conductor_id' => $conductor->id]);
        }

        // Asignar conductores a asociaciones
        foreach ($conductores as $conductor) {
            AsociacionConductor::factory()->create([
                'conductor_id' => $conductor->id,
                'asociacion_id' => $asociaciones->random()->id,
            ]);
        }
    }
}