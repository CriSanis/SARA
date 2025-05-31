<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use Spatie\Permission\Models\Role;

class ConductorFactory extends Factory
{
    public function definition(): array
    {
        $user = User::factory()->create(['user_type' => 'driver']);
        $user->assignRole('driver');

        return [
            'user_id' => $user->id,
            'licencia' => $this->faker->unique()->regexify('[A-Z0-9]{8}'),
            'estado_verificacion' => $this->faker->randomElement(['pendiente', 'verificado', 'rechazado']),
        ];
    }
}