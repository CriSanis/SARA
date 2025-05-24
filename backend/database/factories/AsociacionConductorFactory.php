<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Conductor;
use App\Models\Asociacion;

class AsociacionConductorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'conductor_id' => Conductor::factory(),
            'asociacion_id' => Asociacion::factory(),
        ];
    }
}