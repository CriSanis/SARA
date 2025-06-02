<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Conductor;
use App\Models\Asociacion;
use App\Models\AsociacionConductor;
use Spatie\Permission\Models\Role;

class AsociacionManagementTest extends TestCase
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
public function admin_can_list_asociaciones()
{
    // Limpiar la tabla de asociaciones antes de crear nuevas
    Asociacion::truncate();

    // Crear 2 asociaciones como en el seeder
    Asociacion::factory()->count(2)->create();

    $response = $this->withHeader('Authorization', "Bearer $this->token")
                ->getJson('/api/asociaciones');

    $response->assertStatus(200)
             ->assertJsonCount(2); // Cambiado de 3 a 2
}
    /** @test */
    public function admin_can_create_asociacion()
    {
        $data = [
            'nombre' => 'Asociación Norte',
            'descripcion' => 'Asociación de transporte del norte',
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->postJson('/api/asociaciones', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('asociaciones', ['nombre' => 'Asociación Norte']);
    }

    /** @test */
    public function admin_can_update_asociacion()
    {
        $asociacion = Asociacion::factory()->create();

        $data = [
            'nombre' => 'Asociación Sur',
            'descripcion' => 'Asociación actualizada',
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->putJson("/api/asociaciones/{$asociacion->id}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('asociaciones', ['nombre' => 'Asociación Sur']);
    }

    /** @test */
    public function admin_can_delete_asociacion()
    {
        $asociacion = Asociacion::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->deleteJson("/api/asociaciones/{$asociacion->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('asociaciones', ['id' => $asociacion->id]);
    }

    /** @test */
    public function admin_can_asignar_conductor()
    {
        $asociacion = Asociacion::factory()->create();

        $data = [
            'conductor_id' => $this->conductor->id,
            'asociacion_id' => $asociacion->id,
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->postJson('/api/asociacion-conductores', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('asociacion_conductores', [
            'conductor_id' => $this->conductor->id,
            'asociacion_id' => $asociacion->id,
        ]);
    }

    /** @test */
    public function admin_can_desasignar_conductor()
    {
        $asociacion = Asociacion::factory()->create();
        $asignacion = AsociacionConductor::factory()->create([
            'conductor_id' => $this->conductor->id,
            'asociacion_id' => $asociacion->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->deleteJson("/api/asociacion-conductores/{$asignacion->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('asociacion_conductores', ['id' => $asignacion->id]);
    }

    /** @test */
    public function non_admin_cannot_manage_asociaciones()
    {
        $client = User::factory()->create(['user_type' => 'client']);
        $client->assignRole('client');
        $clientToken = $client->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $clientToken")
                    ->getJson('/api/asociaciones');

        $response->assertStatus(403);
    }
}