<?php

namespace Tests\Unit;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

/**
 * Testes unitários para o modelo User
 * 
 * Testa funcionalidades específicas do modelo User,
 * incluindo relacionamentos, atributos e métodos.
 */
class UserTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Testa a criação básica de usuário
     */
    public function test_user_creation(): void
    {
        $userData = [
            'name' => 'João Silva',
            'email' => 'joao@example.com',
            'password' => 'password123',
        ];

        $user = User::create($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('João Silva', $user->name);
        $this->assertEquals('joao@example.com', $user->email);
        $this->assertNotEquals('password123', $user->password); // Deve estar hasheada
    }

    /**
     * Testa atributos fillable
     */
    public function test_fillable_attributes(): void
    {
        $fillable = ['name', 'email', 'password'];
        $user = new User();

        $this->assertEquals($fillable, $user->getFillable());
    }

    /**
     * Testa atributos hidden
     */
    public function test_hidden_attributes(): void
    {
        $user = User::factory()->create();
        $array = $user->toArray();

        $this->assertArrayNotHasKey('password', $array);
        $this->assertArrayNotHasKey('remember_token', $array);
    }

    /**
     * Testa casting de atributos
     */
    public function test_attribute_casting(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->assertInstanceOf(\Carbon\Carbon::class, $user->email_verified_at);
    }

    /**
     * Testa relacionamento com contatos
     */
    public function test_contacts_relationship(): void
    {
        $user = User::factory()->create();
        
        // Cria alguns contatos para o usuário
        Contact::factory()->count(3)->create(['user_id' => $user->id]);
        
        // Testa o relacionamento
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $user->contacts());
        $this->assertCount(3, $user->contacts);
        
        // Verifica se todos os contatos pertencem ao usuário
        $user->contacts->each(function ($contact) use ($user) {
            $this->assertEquals($user->id, $contact->user_id);
        });
    }

    /**
     * Testa criação de tokens de API
     */
    public function test_api_token_creation(): void
    {
        $user = User::factory()->create();
        
        $token = $user->createToken('test-token');
        
        $this->assertInstanceOf(\Laravel\Sanctum\NewAccessToken::class, $token);
        $this->assertEquals('test-token', $token->accessToken->name);
        $this->assertNotEmpty($token->plainTextToken);
    }

    /**
     * Testa exclusão de usuário e cascata de contatos
     */
    public function test_user_deletion_cascades_contacts(): void
    {
        $user = User::factory()->create();
        Contact::factory()->count(2)->create(['user_id' => $user->id]);
        
        $this->assertCount(2, $user->contacts);
        
        $user->delete();
        
        // Verifica se os contatos foram removidos
        $this->assertCount(0, Contact::where('user_id', $user->id)->get());
    }

    /**
     * Testa factory do usuário
     */
    public function test_user_factory(): void
    {
        $user = User::factory()->create();

        $this->assertNotEmpty($user->name);
        $this->assertNotEmpty($user->email);
        $this->assertNotEmpty($user->password);
        $this->assertTrue(str_contains($user->email, '@'));
    }

    /**
     * Testa factory com atributos customizados
     */
    public function test_user_factory_with_custom_attributes(): void
    {
        $user = User::factory()->create([
            'name' => 'Usuário Teste',
            'email' => 'teste@customizado.com',
        ]);

        $this->assertEquals('Usuário Teste', $user->name);
        $this->assertEquals('teste@customizado.com', $user->email);
    }

    /**
     * Testa método only para serialização
     */
    public function test_only_method_for_api_response(): void
    {
        $user = User::factory()->create([
            'name' => 'João',
            'email' => 'joao@test.com',
        ]);

        $only = $user->only(['id', 'name', 'email']);

        $this->assertArrayHasKey('id', $only);
        $this->assertArrayHasKey('name', $only);
        $this->assertArrayHasKey('email', $only);
        $this->assertArrayNotHasKey('password', $only);
        $this->assertEquals('João', $only['name']);
        $this->assertEquals('joao@test.com', $only['email']);
    }
}
