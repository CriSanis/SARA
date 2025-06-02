<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Conductor;
use App\Models\Pedido;
use Spatie\Permission\Models\Role;

class PedidoManagementTest extends TestCase
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
    public function client_can_create_pedido()
    {
        $data = [
            'origen' => 'Ciudad A',
            'destino' => 'Ciudad B',
            'descripcion' => 'Carga de 2 toneladas',
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->clientToken")
                    ->postJson('/api/pedidos', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('pedidos', ['origen' => 'Ciudad A', 'cliente_id' => $this->client->id]);
    }

    /** @test */
    public function client_can_list_own_pedidos()
    {
        Pedido::factory()->create(['cliente_id' => $this->client->id]);
        Pedido::factory()->create(['cliente_id' => User::factory()->create(['user_type' => 'client'])]);

        $response = $this->withHeader('Authorization', "Bearer $this->clientToken")
                    ->getJson('/api/pedidos');

        $response->assertStatus(200)
                ->assertJsonCount(1);
    }

    /** @test */
    public function driver_can_update_estado_pedido()
    {
        $pedido = Pedido::factory()->create(['conductor_id' => $this->conductor->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->driverToken")
                    ->putJson("/api/pedidos/{$pedido->id}", ['estado' => 'en_progreso']);

        $response->assertStatus(200);
        $this->assertDatabaseHas('pedidos', ['id' => $pedido->id, 'estado' => 'en_progreso']);
    }

    /** @test */
    public function admin_can_asignar_conductor()
    {
        $pedido = Pedido::factory()->create(['cliente_id' => $this->client->id]);

        $data = [
            'pedido_id' => $pedido->id,
            'conductor_id' => $this->conductor->id,
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                    ->postJson('/api/pedido-conductor', $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('pedidos', ['id' => $pedido->id, 'conductor_id' => $this->conductor->id]);
    }

    /** @test */
    public function client_can_delete_own_pedido()
    {
        $pedido = Pedido::factory()->create(['cliente_id' => $this->client->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->clientToken")
                    ->deleteJson("/api/pedidos/{$pedido->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('pedidos', ['id' => $pedido->id]);
    }

    /** @test */
    public function non_authorized_cannot_access_other_pedidos()
    {
        $pedido = Pedido::factory()->create(['cliente_id' => User::factory()->create(['user_type' => 'client'])]);

        $response = $this->withHeader('Authorization', "Bearer $this->clientToken")
                    ->putJson("/api/pedidos/{$pedido->id}", ['estado' => 'en_progreso']);

        $response->assertStatus(403);
    }
}