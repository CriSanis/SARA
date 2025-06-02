<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Conductor;
use App\Models\Vehiculo;
use Spatie\Permission\Models\Role;

class VehiculoManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $token;
    protected $conductor;

    public function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');

        $this->admin = User::factory()->create(['user_type' => 'admin']);
        $this->admin->assignRole('admin');
        $this->token = $this->admin->createToken('auth_token')->plainTextToken;

        $driver = User::factory()->create(['user_type' => 'driver']);
        $driver->assignRole('driver');
        $this->conductor = Conductor::factory()->create(['user_id' => $driver->id]);
    }

     /** @test */
public function admin_can_list_vehiculos()
{
    $response = $this->withHeader('Authorization', "Bearer $this->token")
                ->getJson('/api/vehiculos');

    $response->assertStatus(200)
             ->assertJsonCount(10); // 10 vehículos creados por el seeder
}   

    /** @test */
    public function admin_can_create_vehiculo()
    {
        $data = [
            'conductor_id' => $this->conductor->id,
            'marca' => 'Toyota',
            'modelo' => 'Hilux',
            'placa' => 'ABC-123',
            'capacidad' => 2.5,
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->postJson('/api/vehiculos', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('vehiculos', ['placa' => 'ABC-123']);
    }

    /** @test */
    public function admin_can_update_vehiculo()
    {
        $vehiculo = Vehiculo::factory()->create(['conductor_id' => $this->conductor->id]);

        $data = [
            'conductor_id' => $this->conductor->id,
            'marca' => 'Nissan',
            'modelo' => 'Frontier',
            'placa' => 'XYZ-789',
            'capacidad' => 3.0,
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->putJson("/api/vehiculos/{$vehiculo->id}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('vehiculos', ['placa' => 'XYZ-789']);
    }

    /** @test */
    public function admin_can_delete_vehiculo()
    {
        $vehiculo = Vehiculo::factory()->create(['conductor_id' => $this->conductor->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->deleteJson("/api/vehiculos/{$vehiculo->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('vehiculos', ['id' => $vehiculo->id]);
    }

    /** @test */
    public function non_admin_cannot_manage_vehiculos()
    {
        $client = User::factory()->create(['user_type' => 'client']);
        $client->assignRole('client');
        $clientToken = $client->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $clientToken")
                    ->getJson('/api/vehiculos');

        $response->assertStatus(403);
    }
}