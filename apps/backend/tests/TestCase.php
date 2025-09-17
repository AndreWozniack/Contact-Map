<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Classe base para testes da aplicação
 * 
 * Fornece métodos auxiliares comuns para criação de usuários autenticados,
 * configuração de ambiente de teste e outras funcionalidades úteis.
 */
abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /**
     * Configura o ambiente de teste
     * 
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Configura o ambiente de teste
        config(['app.env' => 'testing']);
    }

    /**
     * Cria um usuário autenticado para testes
     * 
     * @param array $attributes Atributos personalizados para o usuário
     * @return User Usuário criado e autenticado
     */
    protected function createAuthenticatedUser(array $attributes = []): User
    {
        /** @var User $user */
        $user = User::factory()->create($attributes);
        $this->actingAs($user, 'sanctum');
        
        return $user;
    }

    /**
     * Cria um token de API para um usuário
     * 
     * @param User $user Usuário para criar o token
     * @param string $name Nome do token
     * @return string Token de acesso
     */
    protected function createTokenForUser(User $user, string $name = 'test-token'): string
    {
        return $user->createToken($name)->plainTextToken;
    }

    /**
     * Executa uma requisição autenticada usando token Bearer
     * 
     * @param string $method Método HTTP
     * @param string $uri URI da requisição
     * @param array $data Dados da requisição
     * @param string $token Token de autenticação
     * @return \Illuminate\Testing\TestResponse
     */
    protected function jsonWithToken(string $method, string $uri, array $data = [], string $token = null): \Illuminate\Testing\TestResponse
    {
        $headers = ['Accept' => 'application/json'];
        
        if ($token) {
            $headers['Authorization'] = "Bearer {$token}";
        }
        
        return $this->json($method, $uri, $data, $headers);
    }
}
