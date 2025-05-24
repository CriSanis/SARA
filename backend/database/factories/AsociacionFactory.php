<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AsociacionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->unique()->company(),
            'descripcion' => $this->faker->sentence(),
        ];
    }
}