<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Conductor;
use Illuminate\Database\Eloquent\Factories\Factory;

class PedidoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'cliente_id' => User::factory()->create(['user_type' => 'client']),
            'conductor_id' => null,
            'origen' => $this->faker->city,
            'destino' => $this->faker->city,
            'descripcion' => $this->faker->sentence,
            'estado' => 'pendiente',
        ];
    }
}