<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Testes de feature para o MeController
 * 
 * Testa todas as funcionalidades relacionadas ao usuário autenticado,
 * incluindo visualização e atualização de dados pessoais.
 */
class MeControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Testa exibição de dados do usuário autenticado
     */
    public function test_show_authenticated_user_data(): void
    {
        $user = $this->createAuthenticatedUser([
            'name' => 'João Silva',
            'email' => 'joao@example.com',
        ]);

        $response = $this->getJson('/api/me');

        $response->assertOk()
                ->assertJsonStructure([
                    'id',
                    'name',
                    'email',
                    'email_verified_at',
                    'created_at'
                ])
                ->assertJsonFragment([
                    'name' => 'João Silva',
                    'email' => 'joao@example.com',
                ]);

        // Verifica que dados sensíveis não são retornados
        $response->assertJsonMissing(['password']);
    }

    /**
     * Testa que usuário não autenticado não pode acessar /me
     */
    public function test_unauthenticated_user_cannot_access_me(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertUnauthorized();
    }

    /**
     * Testa atualização do nome do usuário
     */
    public function test_update_user_name(): void
    {
        $user = $this->createAuthenticatedUser([
            'name' => 'João Silva',
            'email' => 'joao@example.com',
        ]);

        $response = $this->putJson('/api/me', [
            'name' => 'João Santos',
        ]);

        $response->assertOk()
                ->assertJsonFragment([
                    'name' => 'João Santos',
                    'email' => 'joao@example.com',
                ]);

        // Verifica no banco de dados
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'João Santos',
            'email' => 'joao@example.com',
        ]);
    }

    /**
     * Testa atualização do email do usuário
     */
    public function test_update_user_email(): void
    {
        $user = $this->createAuthenticatedUser([
            'name' => 'João Silva',
            'email' => 'joao@example.com',
        ]);

        $response = $this->putJson('/api/me', [
            'email' => 'joao.novo@example.com',
        ]);

        $response->assertOk()
                ->assertJsonFragment([
                    'name' => 'João Silva',
                    'email' => 'joao.novo@example.com',
                ]);

        // Verifica no banco de dados
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'João Silva',
            'email' => 'joao.novo@example.com',
        ]);
    }

    /**
     * Testa atualização de nome e email simultaneamente
     */
    public function test_update_name_and_email_together(): void
    {
        $user = $this->createAuthenticatedUser([
            'name' => 'João Silva',
            'email' => 'joao@example.com',
        ]);

        $response = $this->putJson('/api/me', [
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
        ]);

        $response->assertOk()
                ->assertJsonFragment([
                    'name' => 'Maria Santos',
                    'email' => 'maria@example.com',
                ]);
    }

    /**
     * Testa validação de nome obrigatório
     */
    public function test_name_validation_required(): void
    {
        $this->createAuthenticatedUser();

        $response = $this->putJson('/api/me', [
            'name' => '',
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['name']);
    }

    /**
     * Testa validação de nome muito longo
     */
    public function test_name_validation_max_length(): void
    {
        $this->createAuthenticatedUser();

        $response = $this->putJson('/api/me', [
            'name' => str_repeat('a', 256), // 256 caracteres
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['name']);
    }

    /**
     * Testa validação de email obrigatório
     */
    public function test_email_validation_required(): void
    {
        $this->createAuthenticatedUser();

        $response = $this->putJson('/api/me', [
            'email' => '',
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
    }

    /**
     * Testa validação de formato de email
     */
    public function test_email_validation_format(): void
    {
        $this->createAuthenticatedUser();

        $response = $this->putJson('/api/me', [
            'email' => 'email-inválido',
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
    }

    /**
     * Testa validação de email único
     */
    public function test_email_validation_unique(): void
    {
        // Cria outro usuário com email específico
        User::factory()->create(['email' => 'existente@example.com']);
        
        // Cria usuário autenticado
        $this->createAuthenticatedUser(['email' => 'atual@example.com']);

        $response = $this->putJson('/api/me', [
            'email' => 'existente@example.com',
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
    }

    /**
     * Testa que o usuário pode manter seu próprio email
     */
    public function test_user_can_keep_own_email(): void
    {
        $user = $this->createAuthenticatedUser([
            'email' => 'joao@example.com',
        ]);

        $response = $this->putJson('/api/me', [
            'name' => 'João Atualizado',
            'email' => 'joao@example.com', // Mesmo email
        ]);

        $response->assertOk()
                ->assertJsonFragment([
                    'email' => 'joao@example.com',
                ]);
    }

    /**
     * Testa validação de email muito longo
     */
    public function test_email_validation_max_length(): void
    {
        $this->createAuthenticatedUser();

        // Criando um email que excede 255 caracteres garantidamente
        $longEmail = str_repeat('a', 250) . '@example.com'; // Aproximadamente 261 caracteres

        $response = $this->putJson('/api/me', [
            'email' => $longEmail,
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
    }

    /**
     * Testa que campos não permitidos são ignorados
     */
    public function test_non_fillable_fields_are_ignored(): void
    {
        $user = $this->createAuthenticatedUser();
        $originalPassword = $user->password;

        $response = $this->putJson('/api/me', [
            'name' => 'Nome Atualizado',
            'password' => 'nova-senha', // Não deve ser atualizada via /me
            'id' => 999, // Não deve ser atualizada
        ]);

        $response->assertOk();

        // Verifica que password não foi alterada
        $user->refresh();
        $this->assertEquals($originalPassword, $user->password);
        $this->assertNotEquals(999, $user->id);
    }
}
