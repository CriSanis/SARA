<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Conductor;

class VehiculoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'conductor_id' => Conductor::factory(),
            'marca' => $this->faker->randomElement(['Toyota', 'Nissan', 'Ford', 'Chevrolet']),
            'modelo' => $this->faker->word(),
            'placa' => $this->faker->unique()->regexify('[A-Z]{3}-[0-9]{3}'),
            'capacidad' => $this->faker->randomFloat(2, 1, 10),
        ];
    }
}