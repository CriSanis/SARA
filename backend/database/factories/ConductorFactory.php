<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class ConductorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->create(['user_type' => 'driver'])->id,
            'licencia' => $this->faker->unique()->regexify('[A-Z0-9]{8}'),
            'estado_verificacion' => $this->faker->randomElement(['pendiente', 'verificado', 'rechazado']),
        ];
    }
}