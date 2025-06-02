<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Conductor;
use App\Models\Pedido;
use App\Models\Ruta;
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
        $cliente = User::factory()->create(['user_type' => 'client']);
        $cliente->assignRole('client');
        Pedido::factory()->count(5)->create(['cliente_id' => $cliente->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->get('/api/reportes/pedidos?estado=completado&cliente_id=' . $cliente->id);

        $response->assertStatus(200)
                ->assertHeader('Content-Type', 'application/pdf');
    }

    /** @test */
    public function admin_can_generate_reporte_conductores()
    {
        $conductor = Conductor::factory()->create();
        $conductor->user->assignRole('driver');
        Pedido::factory()->count(3)->create(['conductor_id' => $conductor->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->get('/api/reportes/conductores?conductor_id=' . $conductor->id);

        $response->assertStatus(200)
                ->assertHeader('Content-Type', 'application/pdf');
    }

    /** @test */
    public function admin_can_generate_reporte_rutas()
    {
        $ruta = Ruta::factory()->create();
        $pedido = Pedido::factory()->create();
        \DB::table('pedido_ruta')->insert(['pedido_id' => $pedido->id, 'ruta_id' => $ruta->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->get('/api/reportes/rutas?ruta_id=' . $ruta->id);

        $response->assertStatus(200)
                ->assertHeader('Content-Type', 'application/pdf');
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