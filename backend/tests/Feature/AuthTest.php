<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Role;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');
    }

    /** @test */
    public function it_can_register_a_user()
    {
        $data = [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '123456789',
            'user_type' => 'client',
        ];

        $response = $this->postJson('/api/register', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'user_type'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'juan@example.com',
            'user_type' => 'client',
        ]);

        $user = User::where('email', 'juan@example.com')->first();
        $this->assertTrue($user->roles()->where('name', 'client')->exists());
    }

    /** @test */
    public function it_fails_to_register_with_invalid_data()
    {
        $data = [
            'name' => '',
            'email' => 'invalid-email',
            'password' => 'short',
            'password_confirmation' => 'different',
            'user_type' => 'invalid',
        ];

        $response = $this->postJson('/api/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'user_type']);
    }

    /** @test */
    public function it_can_login_a_user()
    {
        $user = User::factory()->create([
            'email' => 'juan@example.com',
            'password' => bcrypt('password123'),
            'user_type' => 'client',
        ]);

        $role = Role::where('name', 'client')->first();
        $user->roles()->attach($role);

        $data = [
            'email' => 'juan@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/login', $data);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'user_type'],
                'token',
            ]);
    }

    /** @test */
    public function it_fails_to_login_with_invalid_credentials()
    {
        $data = [
            'email' => 'juan@example.com',
            'password' => 'wrong-password',
        ];

        $response = $this->postJson('/api/login', $data);

        $response->assertStatus(401)
            ->assertJson(['message' => 'Credenciales inválidas']);
    }

    /** @test */
    public function it_can_logout_a_user()
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Sesión cerrada']);
    }
}