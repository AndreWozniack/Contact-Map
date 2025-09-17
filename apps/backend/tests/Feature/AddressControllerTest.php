<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Testes para o AddressController
 * 
 * Valida a integração com a API ViaCEP para busca de endereços brasileiros
 */
class AddressControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Testa busca de endereço por CEP válido
     */
    public function test_search_by_valid_cep(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Http::fake([
            'viacep.com.br/*' => Http::response([
                'cep' => '80010-000',
                'logradouro' => 'Rua XV de Novembro',
                'complemento' => '',
                'bairro' => 'Centro',
                'localidade' => 'Curitiba',
                'uf' => 'PR',
                'ibge' => '4106902',
                'gia' => '',
                'ddd' => '41',
                'siafi' => '7535'
            ], 200),
        ]);

        $response = $this->getJson('/api/address/?cep=80010000');

        $response->assertOk()
                ->assertJsonStructure([
                    'address' => [
                        'cep',
                        'state',
                        'city',
                        'street',
                        'district'
                    ]
                ])
                ->assertJson([
                    'address' => [
                        'cep' => '80010000',
                        'street' => 'Rua XV de Novembro',
                        'city' => 'Curitiba',
                        'state' => 'PR'
                    ]
                ]);
    }

    /**
     * Testa busca de endereço por CEP inválido
     */
    public function test_search_by_invalid_cep(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Http::fake([
            'viacep.com.br/*' => Http::response([
                'erro' => true
            ], 200),
        ]);

        $response = $this->getJson('/api/address/?cep=00000000');

        $response->assertNotFound()
                ->assertJson([
                    'message' => 'CEP não encontrado'
                ]);
    }

    /**
     * Testa busca de endereço por cidade/estado/rua válidos
     */
    public function test_search_by_city_state_street(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Http::fake([
            'viacep.com.br/*' => Http::response([[
                'cep' => '80010-000',
                'logradouro' => 'Rua XV de Novembro',
                'complemento' => '',
                'bairro' => 'Centro',
                'localidade' => 'Curitiba',
                'uf' => 'PR',
                'ibge' => '4106902',
                'gia' => '',
                'ddd' => '41',
                'siafi' => '7535'
            ]], 200),
        ]);

        $response = $this->getJson('/api/address/search?uf=PR&city=Curitiba&q=XV+de+Novembro');

        $response->assertOk()
                ->assertJsonStructure([
                    'items' => [
                        '*' => [
                            'cep',
                            'state',
                            'city',
                            'street',
                            'district'
                        ]
                    ]
                ]);
        
        $items = $response->json('items');
        $this->assertCount(1, $items);
        $this->assertEquals('80010000', $items[0]['cep']);
    }

    /**
     * Testa busca que não retorna resultados
     */
    public function test_search_no_results(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Http::fake([
            'viacep.com.br/*' => Http::response([], 200),
        ]);

        $response = $this->getJson('/api/address/search?uf=XX&city=CidadeInexistente&q=RuaInexistente');

        $response->assertOk()
                ->assertJson(['items' => []]);
    }

    /**
     * Testa validação de parâmetros obrigatórios para busca por cidade/estado/rua
     */
    public function test_search_validation_missing_parameters(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/address/search?city=Curitiba');

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['uf', 'q']);
    }

    /**
     * Testa validação de tamanho de estado (deve ter 2 caracteres)
     */
    public function test_search_validation_state_size(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/address/search?uf=PRA&city=Curitiba&q=XV');

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['uf']);
    }

    /**
     * Testa validação de tamanho mínimo da rua
     */
    public function test_search_validation_street_min_length(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/address/search?uf=PR&city=Curitiba&q=');

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['q']);
    }

    /**
     * Testa validação de CEP com formato inválido
     */
    public function test_by_cep_validation_invalid_format(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/address/?cep=123');

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['cep']);
    }

    /**
     * Testa busca por CEP obrigatório
     */
    public function test_by_cep_validation_required(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/address/');

        $response->assertUnprocessable()
                ->assertJsonValidationErrors(['cep']);
    }

    /**
     * Testa erro de timeout/conexão com ViaCEP
     */
    public function test_viacep_connection_error(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        Http::fake([
            'viacep.com.br/*' => Http::response('', 500),
        ]);

        $response = $this->getJson('/api/address/?cep=80010000');

        $response->assertStatus(503)
                ->assertJson([
                    'message' => 'Erro ao consultar ViaCEP. Tente novamente.'
                ]);
    }

    /**
     * Testa que requisições não autenticadas são rejeitadas
     */
    public function test_requires_authentication(): void
    {
        $response = $this->getJson('/api/address/?cep=80010000');
        $response->assertUnauthorized();

        $response = $this->getJson('/api/address/search?uf=PR&city=Curitiba&q=XV');
        $response->assertUnauthorized();
    }
}
