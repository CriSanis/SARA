<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Spatie\Permission\Models\Role;

class UserManagementTest extends TestCase
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
public function admin_can_list_users()
{
    $response = $this->withHeader('Authorization', "Bearer $this->token")
                ->getJson('/api/users');

    $response->assertStatus(200)
             ->assertJsonCount(23); // 1 admin (seeder) + 1 cliente (seeder) + 10 conductores (seeder) + 1 admin (setUp) + 10 clientes (pedidos)
}

    /** @test */
    public function admin_can_create_user()
    {
        $data = [
            'name' => 'Ana Pérez',
            'email' => 'ana@example.com',
            'password' => 'password123',
            'phone' => '123456789',
            'user_type' => 'client',
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->postJson('/api/users', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'ana@example.com']);
        $this->assertTrue(User::where('email', 'ana@example.com')->first()->hasRole('client'));
    }

    /** @test */
    public function admin_can_create_driver_with_licencia()
    {
        $data = [
            'name' => 'Carlos López',
            'email' => 'carlos@example.com',
            'password' => 'password123',
            'phone' => '123456789',
            'user_type' => 'driver',
            'licencia' => 'XYZ789',
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->postJson('/api/users', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('conductores', ['licencia' => 'XYZ789']);
    }

    /** @test */
    public function admin_can_view_user()
    {
        $user = User::factory()->create(['user_type' => 'client']);
        $user->assignRole('client');

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->getJson("/api/users/{$user->id}");

        $response->assertStatus(200)
                ->assertJson(['id' => $user->id, 'email' => $user->email]);
    }

    /** @test */
    public function admin_can_update_user()
    {
        $user = User::factory()->create(['user_type' => 'client']);
        $user->assignRole('client');

        $data = [
            'name' => 'Ana Actualizada',
            'email' => 'ana@updated.com',
            'phone' => '987654321',
            'user_type' => 'driver',
            'licencia' => 'ABC123',
        ];

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->putJson("/api/users/{$user->id}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['email' => 'ana@updated.com']);
        $this->assertDatabaseHas('conductores', ['licencia' => 'ABC123']);
    }

    /** @test */
    public function admin_can_delete_user()
    {
        $user = User::factory()->create(['user_type' => 'client']);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
                    ->deleteJson("/api/users/{$user->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    /** @test */
    public function non_admin_cannot_access_users()
    {
        $client = User::factory()->create(['user_type' => 'client']);
        $client->assignRole('client');
        $clientToken = $client->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $clientToken")
                    ->getJson('/api/users');

        $response->assertStatus(403);
    }
}