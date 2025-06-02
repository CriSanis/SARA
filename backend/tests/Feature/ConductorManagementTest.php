<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Conductor;
use Spatie\Permission\Models\Role;

class ConductorManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $token;

    public function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');

        $this->admin = User::factory()->create(['user_type' => 'admin']);
        $this->admin->assignRole('admin');
        $this->token = $this->admin->createToken('auth_token')->plainTextToken;
    }

    /** @test */
    public function admin_can_verify_conductor()
    {
        $driver = User::factory()->create(['user_type' => 'driver']);
        $driver->assignRole('driver');
        $conductor = Conductor::factory()->create(['user_id' => $driver->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->putJson("/api/conductores/{$conductor->id}/verificar", [
                        'estado_verificacion' => 'verificado',
                    ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('conductores', [
            'id' => $conductor->id,
            'estado_verificacion' => 'verificado',
        ]);
    }

    /** @test */
    public function non_admin_cannot_verify_conductor()
    {
        $client = User::factory()->create(['user_type' => 'client']);
        $client->assignRole('client');
        $clientToken = $client->createToken('auth_token')->plainTextToken;

        $driver = User::factory()->create(['user_type' => 'driver']);
        $conductor = Conductor::factory()->create(['user_id' => $driver->id]);

        $response = $this->withHeader('Authorization', "Bearer $clientToken")
                    ->putJson("/api/conductores/{$conductor->id}/verificar", [
                        'estado_verificacion' => 'verificado',
                    ]);

        $response->assertStatus(403);
    }
}