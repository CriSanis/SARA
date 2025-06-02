<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Conductor;
use App\Models\Pedido;
use App\Models\Ruta;
use Spatie\Permission\Models\Role;

class RutaManagementTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $driver;
    protected $adminToken;
    protected $driverToken;
    protected $conductor;

    public function setUp(): void
{
    parent::setUp();
    $this->artisan('db:seed');

    $this->admin = User::factory()->create(['user_type' => 'admin']);
    $this->admin->assignRole('admin');
    $this->adminToken = $this->admin->createToken('auth_token')->plainTextToken;

    $this->driver = User::factory()->create(['user_type' => 'driver']);
    $this->driver->assignRole('driver');
    $this->conductor = Conductor::factory()->create(['user_id' => $this->driver->id]);
    $this->driverToken = $this->driver->createToken('auth_token')->plainTextToken;
}

  /** @test */
public function admin_can_list_rutas()
{
    // No crear rutas adicionales, confiar en el seeder
    // Asegurar que el usuario tiene el rol admin
    $this->assertTrue($this->admin->hasRole('admin'));

    $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                ->getJson('/api/rutas');

    $response->assertStatus(200)
            ->assertJsonCount(5); // Esperar las 5 rutas del seeder
}
    /** @test */
    public function driver_can_list_assigned_rutas()
    {
        $pedido = Pedido::factory()->create(['conductor_id' => $this->conductor->id]);
        $ruta = Ruta::factory()->create();
        $pedido->rutas()->attach($ruta->id);

        $response = $this->withHeader('Authorization', "Bearer $this->driverToken")
                    ->getJson('/api/rutas');

        $response->assertStatus(200)
                ->assertJsonCount(1);
    }

    /** @test */
    public function admin_can_create_ruta()
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
        $this->assertDatabaseHas('rutas', ['nombre' => 'Ruta Norte']);
    }

    /** @test */
    public function admin_can_update_ruta()
    {
        $ruta = Ruta::factory()->create();

        $data = [
            'nombre' => 'Ruta Sur',
            'origen' => 'Ciudad C',
            'destino' => 'Ciudad D',
            'distancia_km' => 200.0,
            'duracion_estimada_min' => 180,
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                    ->putJson("/api/rutas/{$ruta->id}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('rutas', ['nombre' => 'Ruta Sur']);
    }

    /** @test */
    public function admin_can_delete_ruta()
    {
        $ruta = Ruta::factory()->create();

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                    ->deleteJson("/api/rutas/{$ruta->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('rutas', ['id' => $ruta->id]);
    }

    /** @test */
    public function admin_can_asignar_ruta()
    {
        $pedido = Pedido::factory()->create();
        $ruta = Ruta::factory()->create();

        $data = [
            'pedido_id' => $pedido->id,
            'ruta_id' => $ruta->id,
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                    ->postJson('/api/pedido-ruta', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('pedido_ruta', [
            'pedido_id' => $pedido->id,
            'ruta_id' => $ruta->id,
        ]);
    }

    /** @test */
    public function admin_can_desasignar_ruta()
    {
        $pedido = Pedido::factory()->create();
        $ruta = Ruta::factory()->create();
        $pedido->rutas()->attach($ruta->id);
        $asignacionId = \DB::table('pedido_ruta')
            ->where('pedido_id', $pedido->id)
            ->where('ruta_id', $ruta->id)
            ->value('id');

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                    ->deleteJson("/api/pedido-ruta/$asignacionId");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('pedido_ruta', ['id' => $asignacionId]);
    }

    /** @test */
    public function non_admin_cannot_manage_rutas()
    {
        $response = $this->withHeader('Authorization', "Bearer $this->driverToken")
                    ->postJson('/api/rutas', [
                        'nombre' => 'Ruta Norte',
                        'origen' => 'Ciudad A',
                        'destino' => 'Ciudad B',
                        'distancia_km' => 150.5,
                        'duracion_estimada_min' => 120,
                    ]);

        $response->assertStatus(403);
    }
}