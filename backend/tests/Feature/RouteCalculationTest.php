<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Conductor;
use App\Models\Pedido;
use App\Models\Ruta;
use Spatie\Permission\Models\Role;
use Mockery;

class RouteCalculationTest extends TestCase
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
    public function client_can_create_pedido_with_route_calculation()
    {
        $routeServiceMock = Mockery::mock(\App\Services\RouteService::class);
        $routeServiceMock->shouldReceive('calculateRoute')
            ->once()
            ->andReturn([
                'distancia_km' => 150.5,
                'duracion_min' => 120,
                'coordenadas' => '{"type":"LineString","coordinates":[[-68.15,-16.5],[-68.2,-16.6]]}',
            ]);

        $this->app->instance(\App\Services\RouteService::class, $routeServiceMock);

        $data = [
            'origen' => 'Ciudad A',
            'origen_coordenadas' => '{"lat":-16.5,"lng":-68.15}',
            'destino' => 'Ciudad B',
            'destino_coordenadas' => '{"lat":-16.6,"lng":-68.2}',
            'descripcion' => 'Carga de 2 toneladas',
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->clientToken")
                    ->postJson('/api/pedidos', $data);

        $response->assertStatus(201)
                ->assertJson([
                    'distancia_estimada_km' => 150.5,
                    'duracion_estimada_min' => 120,
                ]);

        $this->assertDatabaseHas('pedidos', [
            'cliente_id' => $this->client->id,
            'distancia_estimada_km' => 150.5,
            'duracion_estimada_min' => 120,
        ]);
    }

    /** @test */
    public function admin_can_create_ruta_with_geojson()
    {
        $routeServiceMock = Mockery::mock(\App\Services\RouteService::class);
        $routeServiceMock->shouldReceive('calculateRoute')
            ->once()
            ->andReturn([
                'distancia_km' => 150.5,
                'duracion_min' => 120,
                'coordenadas' => '{"type":"LineString","coordinates":[[-68.15,-16.5],[-68.2,-16.6]]}',
            ]);

        $this->app->instance(\App\Services\RouteService::class, $routeServiceMock);

        $data = [
            'nombre' => 'Ruta Norte',
            'origen' => 'Ciudad A',
            'origen_coordenadas' => '{"lat":-16.5,"lng":-68.15}',
            'destino' => 'Ciudad B',
            'destino_coordenadas' => '{"lat":-16.6,"lng":-68.2}',
            'distancia_km' => 150.5,
            'duracion_estimada_min' => 120,
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                    ->postJson('/api/rutas', $data);

        $response->assertStatus(201)
                ->assertJson([
                    'coordenadas' => '{"type":"LineString","coordinates":[[-68.15,-16.5],[-68.2,-16.6]]}',
                ]);

        $this->assertDatabaseHas('rutas', [
            'nombre' => 'Ruta Norte',
            'coordenadas' => '{"type":"LineString","coordinates":[[-68.15,-16.5],[-68.2,-16.6]]}',
        ]);
    }

    /** @test */
    public function admin_can_optimize_route()
    {
        $routeServiceMock = Mockery::mock(\App\Services\RouteService::class);
        $routeServiceMock->shouldReceive('calculateRoute')
            ->once()
            ->andReturn([
                'distancia_km' => 150.5,
                'duracion_min' => 120,
                'coordenadas' => '{"type":"LineString","coordinates":[[-68.15,-16.5],[-68.2,-16.6]]}',
            ]);

        $this->app->instance(\App\Services\RouteService::class, $routeServiceMock);

        $response = $this->withHeader('Authorization', "Bearer $this->adminToken")
                    ->getJson('/api/rutas/optimizar', [
                        'origen_coordenadas' => '{"lat":-16.5,"lng":-68.15}',
                        'destino_coordenadas' => '{"lat":-16.6,"lng":-68.2}',
                    ]);

        $response->assertStatus(200)
                ->assertJson([
                    'distancia_km' => 150.5,
                    'duracion_min' => 120,
                    'coordenadas' => '{"type":"LineString","coordinates":[[-68.15,-16.5],[-68.2,-16.6]]}',
                ]);
    }

    /** @test */
    public function non_admin_cannot_optimize_route()
    {
        $response = $this->withHeader('Authorization', "Bearer $this->clientToken")
                    ->getJson('/api/rutas/optimizar');

        $response->assertStatus(403);
    }
}