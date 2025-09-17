<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Testes de feature para o PasswordController
 * 
 * Testa todas as funcionalidades de alteração de senha,
 * incluindo validações e segurança.
 */
class PasswordControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Testa alteração de senha com sucesso
     */
    public function test_successful_password_update(): void
    {
        $user = $this->createAuthenticatedUser([
            'password' => Hash::make('senha-atual'),
        ]);

        $response = $this->postJson('/api/me/password', [
            'current_password' => 'senha-atual',
            'password' => 'nova-senha-123',
            'password_confirmation' => 'nova-senha-123',
        ]);

        $response->assertOk()
                ->assertJsonFragment([
                    'message' => 'Senha atualizada com sucesso.',
                ]);

        // Verifica se a nova senha funciona
        $user->refresh();
        $this->assertTrue(Hash::check('nova-senha-123', $user->password));
        $this->assertFalse(Hash::check('senha-atual', $user->password));
    }

    /**
     * Testa falha com senha atual incorreta
     */
    public function test_fails_with_wrong_current_password(): void
    {
        $this->createAuthenticatedUser([
            'password' => Hash::make('senha-correta'),
        ]);

        $response = $this->postJson('/api/me/password', [
            'current_password' => 'senha-incorreta',
            'password' => 'nova-senha-123',
            'password_confirmation' => 'nova-senha-123',
        ]);

        $response->assertUnprocessable()
                ->assertJsonFragment([
                    'message' => 'Senha atual incorreta.',
                ]);
    }

    /**
     * Testa validação de senha atual obrigatória
     */
    public function test_current_password_required(): void
    {
        $this->createAuthenticatedUser();

        $response = $this->postJson('/api/me/password', [
            'password' => 'nova-senha-123',
            'password_confirmation' => 'nova-senha-123',
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['current_password']);
    }

    /**
     * Testa validação de nova senha obrigatória
     */
    public function test_new_password_required(): void
    {
        $this->createAuthenticatedUser([
            'password' => Hash::make('senha-atual'),
        ]);

        $response = $this->postJson('/api/me/password', [
            'current_password' => 'senha-atual',
            'password_confirmation' => 'nova-senha-123',
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['password']);
    }

    /**
     * Testa validação de confirmação de senha
     */
    public function test_password_confirmation_required(): void
    {
        $this->createAuthenticatedUser([
            'password' => Hash::make('senha-atual'),
        ]);

        $response = $this->postJson('/api/me/password', [
            'current_password' => 'senha-atual',
            'password' => 'nova-senha-123',
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['password']);
    }

    /**
     * Testa validação de senhas não coincidentes
     */
    public function test_password_confirmation_must_match(): void
    {
        $this->createAuthenticatedUser([
            'password' => Hash::make('senha-atual'),
        ]);

        $response = $this->postJson('/api/me/password', [
            'current_password' => 'senha-atual',
            'password' => 'nova-senha-123',
            'password_confirmation' => 'senha-diferente',
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['password']);
    }

    /**
     * Testa validação de tamanho mínimo da senha
     */
    public function test_password_minimum_length(): void
    {
        $this->createAuthenticatedUser([
            'password' => Hash::make('senha-atual'),
        ]);

        $response = $this->postJson('/api/me/password', [
            'current_password' => 'senha-atual',
            'password' => '123',
            'password_confirmation' => '123',
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['password']);
    }

    /**
     * Testa senha com exatamente 8 caracteres (mínimo)
     */
    public function test_password_exactly_minimum_length(): void
    {
        $user = $this->createAuthenticatedUser([
            'password' => Hash::make('senha-atual'),
        ]);

        $response = $this->postJson('/api/me/password', [
            'current_password' => 'senha-atual',
            'password' => '12345678',
            'password_confirmation' => '12345678',
        ]);

        $response->assertOk();

        // Verifica se a senha foi atualizada
        $user->refresh();
        $this->assertTrue(Hash::check('12345678', $user->password));
    }

    /**
     * Testa que usuário não autenticado não pode alterar senha
     */
    public function test_unauthenticated_user_cannot_change_password(): void
    {
        $response = $this->postJson('/api/me/password', [
            'current_password' => 'qualquer-senha',
            'password' => 'nova-senha-123',
            'password_confirmation' => 'nova-senha-123',
        ]);

        $response->assertUnauthorized();
    }

    /**
     * Testa alteração para senha mais complexa
     */
    public function test_change_to_complex_password(): void
    {
        $user = $this->createAuthenticatedUser([
            'password' => Hash::make('senha-simples'),
        ]);

        $complexPassword = 'MinhaSenh@Compl3xa!2024';

        $response = $this->postJson('/api/me/password', [
            'current_password' => 'senha-simples',
            'password' => $complexPassword,
            'password_confirmation' => $complexPassword,
        ]);

        $response->assertOk();

        // Verifica se a senha complexa foi salva
        $user->refresh();
        $this->assertTrue(Hash::check($complexPassword, $user->password));
    }

    /**
     * Testa que senha atual vazia não é aceita
     */
    public function test_empty_current_password_fails(): void
    {
        $this->createAuthenticatedUser([
            'password' => Hash::make('senha-atual'),
        ]);

        $response = $this->postJson('/api/me/password', [
            'current_password' => '',
            'password' => 'nova-senha-123',
            'password_confirmation' => 'nova-senha-123',
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['current_password']);
    }

    /**
     * Testa que nova senha vazia não é aceita
     */
    public function test_empty_new_password_fails(): void
    {
        $this->createAuthenticatedUser([
            'password' => Hash::make('senha-atual'),
        ]);

        $response = $this->postJson('/api/me/password', [
            'current_password' => 'senha-atual',
            'password' => '',
            'password_confirmation' => '',
        ]);

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['password']);
    }

    /**
     * Testa múltiplas tentativas com senha incorreta
     */
    public function test_multiple_wrong_password_attempts(): void
    {
        $this->createAuthenticatedUser([
            'password' => Hash::make('senha-correta'),
        ]);

        // Primeira tentativa
        $response1 = $this->postJson('/api/me/password', [
            'current_password' => 'senha-errada-1',
            'password' => 'nova-senha-123',
            'password_confirmation' => 'nova-senha-123',
        ]);

        // Segunda tentativa
        $response2 = $this->postJson('/api/me/password', [
            'current_password' => 'senha-errada-2',
            'password' => 'nova-senha-123',
            'password_confirmation' => 'nova-senha-123',
        ]);

        $response1->assertUnprocessable()
                 ->assertJsonFragment(['message' => 'Senha atual incorreta.']);
        
        $response2->assertUnprocessable()
                 ->assertJsonFragment(['message' => 'Senha atual incorreta.']);
    }
}
