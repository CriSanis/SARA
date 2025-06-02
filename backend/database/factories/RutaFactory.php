<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class RutaFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->unique()->word . '_ruta',
            'origen' => $this->faker->city,
            'destino' => $this->faker->city,
            'distancia_km' => $this->faker->randomFloat(2, 10, 500),
            'duracion_estimada_min' => $this->faker->numberBetween(30, 600),
        ];
    }
}