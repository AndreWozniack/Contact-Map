<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_returns_token_and_user(): void
    {
        $res = $this->postJson('/api/register', [
            'name' => 'Andre',
            'email' => 'andre@example.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $res->assertCreated()->assertJsonStructure(['token','user'=>['id','name','email']]);
        $this->assertDatabaseHas('users', ['email' => 'andre@example.com']);
    }

    public function test_login_returns_token(): void
    {
        $user = User::factory()->create(['email'=>'a@a.com','password'=>bcrypt('secret123')]);

        $res = $this->postJson('/api/login', ['email'=>'a@a.com','password'=>'secret123']);

        $res->assertOk()->assertJsonStructure(['token','user'=>['id','name','email']]);
    }

    public function test_contacts_requires_authentication(): void
    {
        $this->getJson('/api/contacts')->assertUnauthorized();

        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $this->getJson('/api/contacts')->assertOk();
    }
}
