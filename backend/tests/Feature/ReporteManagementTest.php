<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Conductor;
use App\Models\Pedido;
use App\Models\Ruta;
use App\Models\Asociacion;
use Spatie\Permission\Models\Role;

class ReporteManagementTest extends TestCase
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
    public function admin_can_generate_reporte_pedidos()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $pedido = Pedido::factory()->create();

        $response = $this->actingAs($admin)
            ->get('/api/reportes/pedidos?pedido_id=' . $pedido->id);

        $response->assertStatus(200);
    }

    /** @test */
    public function admin_can_generate_reporte_conductores()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $conductor = Conductor::factory()->create();

        $response = $this->actingAs($admin)
            ->get('/api/reportes/conductores?conductor_id=' . $conductor->id);

        $response->assertStatus(200);
    }

    /** @test */
    public function admin_can_generate_reporte_asociaciones()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $asociacion = Asociacion::factory()->create();

        $response = $this->actingAs($admin)
            ->get('/api/reportes/asociaciones?asociacion_id=' . $asociacion->id);

        $response->assertStatus(200);
    }

    /** @test */
    public function non_admin_cannot_generate_reportes()
    {
        $client = User::factory()->create(['user_type' => 'client']);
        $client->assignRole('client');
        $clientToken = $client->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $clientToken")
                    ->get('/api/reportes/pedidos');

        $response->assertStatus(403);
    }
}