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
            'cliente_id' => User::factory(),
            'conductor_id' => Conductor::factory(),
            'estado' => 'pending',
            'fecha_entrega' => now()->addDays(2),
            'direccion_origen' => $this->faker->address,
            'direccion_destino' => $this->faker->address,
            'descripcion' => $this->faker->sentence,
            'peso' => $this->faker->randomFloat(2, 1, 1000),
            'dimensiones' => '100x50x30',
            'valor_asegurado' => $this->faker->randomFloat(2, 100, 10000),
        ];
    }
}