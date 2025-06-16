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
            'distancia' => $this->faker->randomFloat(2, 10, 500),
            'duracion' => $this->faker->numberBetween(30, 600),
            'estado' => 'active',
            'coordenadas' => json_encode([
                'type' => 'LineString',
                'coordinates' => [
                    [$this->faker->longitude(-68.2, -68.1), $this->faker->latitude(-16.6, -16.5)],
                    [$this->faker->longitude(-68.2, -68.1), $this->faker->latitude(-16.6, -16.5)]
                ]
            ])
        ];
    }
}