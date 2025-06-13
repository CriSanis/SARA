<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Conductor;
use App\Models\Pedido;
use App\Models\Ruta;
use App\Models\Audit;
use Spatie\Permission\Models\Role;

class AuditTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $client;
    protected $driver;
    protected $adminToken;
    protected $clientToken;
    protected $driverToken;
    protected $conductor;

    public function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');

        $this->admin = User::factory()->create(['user_type' => 'admin']);
        $this->admin->assignRole('admin');
        $this->adminToken = $this->admin->createToken('auth_token')->plainTextToken;

        $this->client = User::factory()->create(['user_type' => 'client']);
        $this->client->assignRole('client');
        $this->clientToken = $this->client->createToken('auth_token')->plainTextToken;

        $this->driver = User::factory()->create(['user_type' => 'driver']);
        $this->driver->assignRole('driver');
        $this->conductor = Conductor::factory()->create(['user_id' => $this->driver->id]);
        $this->driverToken = $this->driver->createToken('auth_token')->plainTextToken;
    }

    /** @test */
    public function audit_is_recorded_for_pedido_create()
    {
        $data = [
            'origen' => 'Ciudad A',
            'destino' => 'Ciudad B',
            'descripcion' => 'Carga de 2 toneladas',
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->clientToken")
                    ->postJson('/api/pedidos', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('audits', [
            'user_id' => $this->client->id,
            'action' => 'create',
            'model_type' => 'App\Models\Pedido',
            'model_id' => $response->json('id'),
        ]);
    }

    /** @test */
    public function audit_is_recorded_for_pedido_update()
    {
        $pedido = Pedido::factory()->create(['cliente_id' => $this->client->id]);

        $data = [
            'estado' => 'en_progreso',
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->clientToken")
                    ->putJson("/api/pedidos/{$pedido->id}", $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('audits', [
            'user_id' => $this->client->id,
            'action' => 'update',
            'model_type' => 'App\Models\Pedido',
            'model_id' => $pedido->id,
        ]);
    }

    /** @test */
    public function audit_is_recorded_for_pedido_delete()
    {
        $pedido = Pedido::factory()->create(['cliente_id' => $this->client->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->clientToken")
                    ->deleteJson("/api/pedidos/{$pedido->id}");

        $response->assertStatus(204);

        $this->assertDatabaseHas('audits', [
            'user_id' => $this->client->id,
            'action' => 'delete',
            'model_type' => 'App\Models\Pedido',
            'model_id' => $pedido->id,
        ]);
    }

    /** @test */
    public function audit_is_recorded_for_conductor_assignment()
    {
        $pedido = Pedido::factory()->create(['cliente_id' => $this->client->id]);

        $data = [
            'pedido_id' => $pedido->id,
            'conductor_id' => $this->conductor->id,
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                    ->postJson('/api/pedido-conductor', $data);

        $response->assertStatus(200);

        $this->assertDatabaseHas('audits', [
            'user_id' => $this->admin->id,
            'action' => 'assign_conductor',
            'model_type' => 'App\Models\Pedido',
            'model_id' => $pedido->id,
        ]);
    }

    /** @test */
    public function audit_is_recorded_for_ruta_create()
    {
        $data = [
            'nombre' => 'Ruta Norte',
            'origen' => 'Ciudad A',
            'destino' => 'Ciudad B',
            'distancia_km' => 150.5,
            'duracion_estimada_min' => 120,
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                    ->postJson('/api/rutas', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('audits', [
            'user_id' => $this->admin->id,
            'action' => 'create',
            'model_type' => 'App\Models\Ruta',
            'model_id' => $response->json('id'),
        ]);
    }

    /** @test */
    public function audit_is_recorded_for_ruta_assignment()
    {
        $pedido = Pedido::factory()->create(['cliente_id' => $this->client->id, 'conductor_id' => $this->conductor->id]);
        $ruta = Ruta::factory()->create();

        $data = [
            'pedido_id' => $pedido->id,
            'ruta_id' => $ruta->id,
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                    ->postJson('/api/pedido-ruta', $data);

        $response->assertStatus(201);

        $this->assertDatabaseHas('audits', [
            'user_id' => $this->admin->id,
            'action' => 'assign_ruta',
            'model_type' => 'App\Models\Pedido',
            'model_id' => $pedido->id,
        ]);
    }

    /** @test */
    public function admin_can_list_audits()
    {
        $pedido = Pedido::factory()->create(['cliente_id' => $this->client->id]);
        Audit::create([
            'user_id' => $this->client->id,
            'action' => 'create',
            'model_type' => 'App\Models\Pedido',
            'model_id' => $pedido->id,
            'changes' => [],
        ]);

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                    ->getJson('/api/audits');

        $response->assertStatus(200)
                ->assertJsonCount(1);
    }

    /** @test */
    public function non_admin_cannot_list_audits()
    {
        $response = $this->withHeader('Authorization', "Bearer $this->clientToken")
                    ->getJson('/api/audits');

        $response->assertStatus(403);
    }
}